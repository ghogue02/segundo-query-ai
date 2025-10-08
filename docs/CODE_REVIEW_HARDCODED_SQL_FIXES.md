# Code Review: Hardcoded SQL Denominator Fixes

**Reviewer**: Code Review Agent
**Date**: October 8, 2025
**Commit Reviewed**: b6a841f - "Fix all hardcoded metrics across platform - make everything dynamic"
**Review Status**: ⚠️ INCOMPLETE - Missing runtime SQL validator

---

## Executive Summary

The development team implemented fixes to eliminate hardcoded SQL denominators by:
1. ✅ Adding explicit AI instruction rules in `/lib/claude.ts`
2. ✅ Creating static code scanner for regression tests
3. ❌ **MISSING**: Runtime SQL validator to catch AI-generated queries with hardcoded values

**Critical Gap**: The current implementation relies ONLY on AI following instructions. There is NO safety net to catch violations if Claude generates SQL with literal denominators (e.g., `/ 24`, `/ 75`, `/ 107`).

---

## 1. Review of Implemented Changes

### 1.1 `/lib/claude.ts` - AI Instructions ✅ GOOD

**What was changed:**
- Added section at line 39-56 with explicit rules telling Claude to NEVER use hardcoded denominators
- Added template variables `${totalClassDays}`, `${totalTasks}`, `${activeBuilders}` for documentation
- Provided required patterns showing correct subquery syntax

**Strengths:**
- ✅ Clear, explicit instructions with ❌ and ✅ examples
- ✅ Explains WHY values are documentation-only
- ✅ Includes validation instruction: "Before outputting SQL, scan it for literal numbers in denominators"
- ✅ Shows correct subquery patterns for all three metric types

**Weaknesses:**
- ⚠️ Relies on AI compliance - no enforcement mechanism
- ⚠️ No validation of AI output before execution
- ⚠️ Documentation values could tempt AI to use them directly

**Example from code (lines 39-56):**
```typescript
**ABSOLUTELY FORBIDDEN IN GENERATED SQL**:
- ❌ NEVER write: / 24 or / 17 or / 18 (hardcoded class days)
- ❌ NEVER write: / 79 or / 75 (hardcoded builder count)
- ❌ NEVER write: / 143 or / 107 (hardcoded task count)

**REQUIRED PATTERN - ALWAYS USE DYNAMIC SUBQUERIES**:
- ✅ ALWAYS write: / (SELECT COUNT(*) FROM curriculum_days WHERE cohort = 'September 2025'...)
```

**Production Readiness**: 6/10 - Good instructions, but no enforcement

---

### 1.2 `/tests/utils/query-validator.ts` - Static Analysis ✅ GOOD

**What exists:**
- `detectHardcodedDenominators()` function finds patterns like `/17`, `/75`, `/107`
- `hasDynamicSubqueries()` function checks for proper subquery usage
- `validateSQLQuery()` function combines checks with cohort filtering and exclusions

**Strengths:**
- ✅ Comprehensive pattern detection for 2-3 digit divisions
- ✅ Checks for dynamic subqueries
- ✅ Validates cohort filtering
- ✅ Returns structured validation results with errors/warnings

**Weaknesses:**
- ⚠️ ONLY used in Jest tests - NOT in runtime API route
- ⚠️ Cannot catch bad SQL before it's executed against database
- ⚠️ Tests run AFTER deployment, not during query generation

**Code snippet (lines 24-45):**
```typescript
export function detectHardcodedDenominators(sql: string): string[] {
  const hardcoded: string[] = [];
  const patterns = [
    /\/\s*1[78]\b/g,        // /17 or /18 (curriculum days)
    /\/\s*75\b/g,           // /75 (active builders)
    /\/\s*107\b/g,          // /107 (total tasks)
    /\/\s*\d{2,3}\b/g,      // Any two or three digit division
  ];
  // ... pattern matching logic
}
```

**Production Readiness**: 7/10 - Solid testing tool, but not integrated into runtime

---

### 1.3 `/app/api/query/route.ts` - API Endpoint ❌ CRITICAL GAP

**What should be there but ISN'T:**
```typescript
import { validateAndFixSQL } from '@/lib/sql-validator'; // ❌ DOES NOT EXIST

// After Claude generates SQL but BEFORE execution:
const { sql: fixedSQL, hadIssues, fixes } = validateAndFixSQL(sqlResponse.sql);
if (hadIssues) {
  console.warn('⚠️ Fixed AI-generated SQL:', fixes);
}
results = await executeQuery(fixedSQL); // Use fixed SQL, not original
```

**Current code (lines 78-87):**
```typescript
// Handle single query (EXISTING)
let results: Record<string, unknown>[] = [];
let executionError: string | null = null;

try {
  results = await executeQuery(sqlResponse.sql!); // ❌ No validation!
} catch (error) {
  console.error('SQL execution error:', error);
  executionError = error instanceof Error ? error.message : 'Unknown error';
}
```

**Issues:**
- ❌ SQL from Claude is executed immediately without validation
- ❌ No check for hardcoded denominators
- ❌ No automatic fixing before execution
- ❌ Multi-query path (lines 29-76) also lacks validation

**Production Readiness**: 3/10 - **CRITICAL**: Missing safety net

---

## 2. Missing Implementation: Runtime SQL Validator

### 2.1 What Should Exist: `/lib/sql-validator.ts`

**Required Functions:**

```typescript
export interface SQLFixResult {
  sql: string;              // Fixed SQL
  hadIssues: boolean;       // Were fixes needed?
  fixes: string[];          // Description of what was fixed
  originalSQL: string;      // Original SQL for debugging
}

/**
 * Validate and automatically fix hardcoded denominators in SQL
 * MUST run on all AI-generated SQL before execution
 */
export function validateAndFixSQL(sql: string): SQLFixResult {
  const fixes: string[] = [];
  let fixedSQL = sql;

  // Fix 1: Replace /24, /17, /18 with curriculum_days subquery
  const dayPattern = /\/\s*(24|17|18)\b/g;
  if (dayPattern.test(sql)) {
    fixedSQL = fixedSQL.replace(
      dayPattern,
      "/ (SELECT COUNT(*) FROM curriculum_days WHERE cohort = 'September 2025' AND EXTRACT(DOW FROM day_date) NOT IN (4, 5) AND day_date <= CURRENT_DATE)"
    );
    fixes.push('Replaced hardcoded day count with dynamic curriculum_days subquery');
  }

  // Fix 2: Replace /79, /75 with users subquery
  const builderPattern = /\/\s*(79|75)\b/g;
  if (builderPattern.test(sql)) {
    fixedSQL = fixedSQL.replace(
      builderPattern,
      "/ (SELECT COUNT(*) FROM users WHERE cohort = 'September 2025' AND active = true AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332))"
    );
    fixes.push('Replaced hardcoded builder count with dynamic users subquery');
  }

  // Fix 3: Replace /143, /107 with tasks subquery
  const taskPattern = /\/\s*(143|107)\b/g;
  if (taskPattern.test(sql)) {
    fixedSQL = fixedSQL.replace(
      taskPattern,
      "/ (SELECT COUNT(*) FROM tasks t JOIN time_blocks tb ON t.block_id = tb.id JOIN curriculum_days cd ON tb.day_id = cd.id WHERE cd.cohort = 'September 2025')"
    );
    fixes.push('Replaced hardcoded task count with dynamic tasks subquery');
  }

  return {
    sql: fixedSQL,
    hadIssues: fixes.length > 0,
    fixes,
    originalSQL: sql
  };
}

/**
 * Validate SQL has proper edge case handling
 */
export function validateEdgeCases(sql: string): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Should NOT modify WHERE day_number = 24
  if (/WHERE\s+day_number\s*=\s*24/i.test(sql) && /\/\s*24/.test(sql)) {
    warnings.push('⚠️ Check if /24 is for day_number comparison (should not be modified)');
  }

  // Should NOT modify LIMIT 24
  if (/LIMIT\s+24/i.test(sql) && /\/\s*24/.test(sql)) {
    warnings.push('⚠️ Check if /24 is for LIMIT clause (should not be modified)');
  }

  // Should NOT modify / 100 (percentage conversion)
  if (/\/\s*100\b/.test(sql)) {
    warnings.push('ℹ️ Division by 100 detected (percentage conversion - OK)');
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
}
```

### 2.2 Integration Point: Updated `/app/api/query/route.ts`

**Required changes:**

```typescript
import { validateAndFixSQL } from '@/lib/sql-validator';

// Line 83 - BEFORE executeQuery:
try {
  // VALIDATE AND FIX SQL BEFORE EXECUTION
  const { sql: validatedSQL, hadIssues, fixes } = validateAndFixSQL(sqlResponse.sql!);

  if (hadIssues) {
    console.warn('🔧 SQL Validator fixed AI-generated query:', {
      fixes,
      originalSQL: sqlResponse.sql,
      fixedSQL: validatedSQL
    });
  }

  results = await executeQuery(validatedSQL); // Use fixed SQL
} catch (error) {
  console.error('SQL execution error:', error);
  executionError = error instanceof Error ? error.message : 'Unknown error';
}
```

**Also needed for multi-query path (lines 32-42):**

```typescript
// Inside Promise.all map function:
const { sql: validatedSQL, hadIssues, fixes } = validateAndFixSQL(queryMetric.sql);

if (hadIssues) {
  console.warn(`🔧 Fixed SQL for metric ${queryMetric.id}:`, fixes);
}

try {
  results = await executeQuery(validatedSQL); // Use fixed SQL
} catch (error) {
  // ... error handling
}
```

---

## 3. Edge Case Testing

### Test Case 1: Attendance with /24 ✅ SHOULD FIX

**Input SQL:**
```sql
SELECT
  COUNT(DISTINCT attendance_date) / 24 * 100 as attendance_percentage
FROM builder_attendance_new
WHERE cohort = 'September 2025';
```

**Expected Output:**
```sql
SELECT
  COUNT(DISTINCT attendance_date) / (SELECT COUNT(*) FROM curriculum_days WHERE cohort = 'September 2025' AND EXTRACT(DOW FROM day_date) NOT IN (4, 5) AND day_date <= CURRENT_DATE) * 100 as attendance_percentage
FROM builder_attendance_new
WHERE cohort = 'September 2025';
```

**Expected Fix Log:**
```
🔧 SQL Validator fixed AI-generated query:
  - Replaced hardcoded day count with dynamic curriculum_days subquery
```

---

### Test Case 2: Builder count with /79 ✅ SHOULD FIX

**Input SQL:**
```sql
SELECT
  task_id,
  COUNT(DISTINCT user_id) / 79 * 100 as completion_rate
FROM task_submissions
GROUP BY task_id;
```

**Expected Output:**
```sql
SELECT
  task_id,
  COUNT(DISTINCT user_id) / (SELECT COUNT(*) FROM users WHERE cohort = 'September 2025' AND active = true AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332)) * 100 as completion_rate
FROM task_submissions
GROUP BY task_id;
```

**Expected Fix Log:**
```
🔧 SQL Validator fixed AI-generated query:
  - Replaced hardcoded builder count with dynamic users subquery
```

---

### Test Case 3: Task count with /143 ✅ SHOULD FIX

**Input SQL:**
```sql
SELECT
  user_id,
  COUNT(DISTINCT task_id) / 143 * 100 as completion_percentage
FROM task_submissions
GROUP BY user_id;
```

**Expected Output:**
```sql
SELECT
  user_id,
  COUNT(DISTINCT task_id) / (SELECT COUNT(*) FROM tasks t JOIN time_blocks tb ON t.block_id = tb.id JOIN curriculum_days cd ON tb.day_id = cd.id WHERE cd.cohort = 'September 2025') * 100 as completion_percentage
FROM task_submissions
GROUP BY user_id;
```

**Expected Fix Log:**
```
🔧 SQL Validator fixed AI-generated query:
  - Replaced hardcoded task count with dynamic tasks subquery
```

---

### Test Case 4: WHERE day_number = 24 ❌ SHOULD NOT FIX

**Input SQL:**
```sql
SELECT * FROM curriculum_days WHERE day_number = 24;
```

**Expected Output:**
```sql
SELECT * FROM curriculum_days WHERE day_number = 24;
```

**Expected Behavior:**
- NO fixes applied
- `hadIssues: false`
- Edge case validator warns: "Check if /24 is for day_number comparison"

---

### Test Case 5: LIMIT 24 ❌ SHOULD NOT FIX

**Input SQL:**
```sql
SELECT * FROM tasks ORDER BY task_title LIMIT 24;
```

**Expected Output:**
```sql
SELECT * FROM tasks ORDER BY task_title LIMIT 24;
```

**Expected Behavior:**
- NO fixes applied
- Edge case validator warns: "Check if /24 is for LIMIT clause"

---

### Test Case 6: Percentage conversion / 100 ❌ SHOULD NOT FIX

**Input SQL:**
```sql
SELECT
  SUM(late_arrivals) / 100 as late_percentage
FROM attendance;
```

**Expected Output:**
```sql
SELECT
  SUM(late_arrivals) / 100 as late_percentage
FROM attendance;
```

**Expected Behavior:**
- NO fixes applied
- Edge case validator notes: "Division by 100 detected (percentage conversion - OK)"

---

## 4. Integration Verification

### 4.1 Route.ts Integration Checklist

- [ ] Import `validateAndFixSQL` from `/lib/sql-validator`
- [ ] Call validator BEFORE `executeQuery()` in single query path (line 83)
- [ ] Call validator BEFORE `executeQuery()` in multi-query path (line 37)
- [ ] Log fixes to console with `console.warn()` for monitoring
- [ ] Pass fixed SQL to `executeQuery()`, not original SQL
- [ ] Preserve original SQL in logs for debugging

### 4.2 Logging Requirements

**Console output when fixes are applied:**
```typescript
console.warn('🔧 SQL Validator fixed AI-generated query:', {
  question: question,
  fixes: [
    'Replaced hardcoded day count with dynamic curriculum_days subquery',
    'Replaced hardcoded builder count with dynamic users subquery'
  ],
  originalSQL: 'SELECT ... / 24 ... / 75 ...',
  fixedSQL: 'SELECT ... / (SELECT COUNT(*) ...'
});
```

**Why logging is critical:**
- Monitors AI compliance with instructions
- Helps identify when AI ignores system prompt rules
- Provides audit trail for production debugging
- Shows if validator is catching issues

---

## 5. Test Validation Plan

### 5.1 Unit Tests (in `/lib/sql-validator.test.ts`)

```typescript
import { validateAndFixSQL, validateEdgeCases } from '@/lib/sql-validator';

describe('SQL Validator', () => {
  it('should fix hardcoded /24 with curriculum_days subquery', () => {
    const input = 'SELECT COUNT(*) / 24 * 100 FROM attendance';
    const result = validateAndFixSQL(input);

    expect(result.hadIssues).toBe(true);
    expect(result.fixes).toContain('Replaced hardcoded day count');
    expect(result.sql).toContain('SELECT COUNT(*) FROM curriculum_days');
  });

  it('should fix hardcoded /75 with users subquery', () => {
    const input = 'SELECT task_id, COUNT(*) / 75 * 100 FROM submissions';
    const result = validateAndFixSQL(input);

    expect(result.hadIssues).toBe(true);
    expect(result.fixes).toContain('Replaced hardcoded builder count');
    expect(result.sql).toContain('SELECT COUNT(*) FROM users');
  });

  it('should fix hardcoded /107 with tasks subquery', () => {
    const input = 'SELECT user_id, COUNT(*) / 107 * 100 FROM progress';
    const result = validateAndFixSQL(input);

    expect(result.hadIssues).toBe(true);
    expect(result.fixes).toContain('Replaced hardcoded task count');
    expect(result.sql).toContain('SELECT COUNT(*) FROM tasks');
  });

  it('should NOT modify WHERE day_number = 24', () => {
    const input = 'SELECT * FROM curriculum_days WHERE day_number = 24';
    const result = validateAndFixSQL(input);

    expect(result.hadIssues).toBe(false);
    expect(result.sql).toBe(input);
  });

  it('should NOT modify LIMIT 24', () => {
    const input = 'SELECT * FROM tasks ORDER BY id LIMIT 24';
    const result = validateAndFixSQL(input);

    expect(result.hadIssues).toBe(false);
    expect(result.sql).toBe(input);
  });

  it('should NOT modify / 100 percentage conversions', () => {
    const input = 'SELECT COUNT(*) / 100 as percentage FROM data';
    const result = validateAndFixSQL(input);

    expect(result.hadIssues).toBe(false);
    expect(result.sql).toBe(input);
  });

  it('should handle multiple fixes in one query', () => {
    const input = 'SELECT COUNT(*) / 24, COUNT(*) / 75, COUNT(*) / 107 FROM data';
    const result = validateAndFixSQL(input);

    expect(result.hadIssues).toBe(true);
    expect(result.fixes).toHaveLength(3);
    expect(result.sql).not.toContain('/ 24');
    expect(result.sql).not.toContain('/ 75');
    expect(result.sql).not.toContain('/ 107');
  });
});
```

### 5.2 Integration Tests (API endpoint)

**Test queries to submit via UI after deployment:**

1. **"Show me attendance rate for all builders"**
   - Expected: Should generate SQL with attendance percentage
   - Verify: Check console for "🔧 SQL Validator fixed" message
   - Check: SQL should use curriculum_days subquery, not /24

2. **"What's the task completion rate?"**
   - Expected: Should generate SQL with completion percentage
   - Verify: Check console for validator fixes
   - Check: SQL should use tasks subquery, not /107

3. **"Show me builders with attendance over 80%"**
   - Expected: Should generate SQL with attendance filter
   - Verify: Check console for validator fixes
   - Check: SQL should use curriculum_days subquery, not /24

4. **"What tasks on day 24 have low completion?"**
   - Expected: Should generate SQL with `WHERE day_number = 24`
   - Verify: NO validator fixes (day_number comparison is OK)
   - Check: `day_number = 24` should remain unchanged

---

## 6. Post-Deployment Verification Steps

### Step 1: Verify Validator File Exists
```bash
ls -la /lib/sql-validator.ts
# Should exist with validateAndFixSQL function
```

### Step 2: Verify Route Integration
```bash
grep -n "validateAndFixSQL" /app/api/query/route.ts
# Should find imports and 2 call sites (single + multi query)
```

### Step 3: Test in Production

**Terminal 1: Watch logs**
```bash
npm run dev | grep "SQL Validator"
```

**Terminal 2: Submit test queries**
```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Show me attendance rate"}'
```

**Expected in Terminal 1:**
```
🔧 SQL Validator fixed AI-generated query: {
  fixes: ['Replaced hardcoded day count with dynamic curriculum_days subquery'],
  originalSQL: '... / 24 ...',
  fixedSQL: '... / (SELECT COUNT(*) FROM curriculum_days ...)'
}
```

### Step 4: Verify Database Execution

**Check PostgreSQL logs to confirm dynamic subqueries are running:**
```sql
-- This is what should execute (with subquery):
SELECT
  COUNT(*) / (SELECT COUNT(*) FROM curriculum_days ...) * 100
FROM attendance;

-- NOT this (with literal):
SELECT
  COUNT(*) / 24 * 100
FROM attendance;
```

---

## 7. Production Deployment Checklist

### Pre-Deployment
- [ ] Create `/lib/sql-validator.ts` with `validateAndFixSQL()` function
- [ ] Add unit tests in `/lib/sql-validator.test.ts`
- [ ] Run `npm test` and verify all tests pass
- [ ] Update `/app/api/query/route.ts` with validator integration
- [ ] Test locally with `npm run dev`
- [ ] Submit 10+ test queries and verify console logs show fixes

### Deployment
- [ ] Commit changes with message: "Add runtime SQL validator for hardcoded denominators"
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Monitor Vercel logs for validator activity

### Post-Deployment
- [ ] Submit test query: "Show attendance rate"
- [ ] Check Vercel logs for "🔧 SQL Validator fixed" messages
- [ ] Verify query returns correct results
- [ ] Submit query: "Show day 24 tasks" (should NOT trigger validator)
- [ ] Run regression test suite: `npm run test:regression`
- [ ] Verify no new hardcoded values introduced

---

## 8. Risk Assessment

### High Risk (Blockers)

1. **Missing Runtime Validator** ⚠️ CRITICAL
   - **Impact**: AI can generate SQL with hardcoded values that execute without correction
   - **Probability**: Medium (AI usually follows instructions, but not guaranteed)
   - **Mitigation**: Implement `/lib/sql-validator.ts` immediately

2. **No Validation in Multi-Query Path** ⚠️ HIGH
   - **Impact**: Multi-metric queries bypass validation entirely
   - **Probability**: High (every multi-query request is vulnerable)
   - **Mitigation**: Add validator to both code paths in route.ts

### Medium Risk

3. **Edge Case False Positives** ⚠️ MEDIUM
   - **Impact**: Validator might incorrectly fix legitimate uses of 24, 75, 107
   - **Probability**: Low (edge cases like `WHERE day_number = 24` are rare)
   - **Mitigation**: Add context-aware pattern matching (check surrounding SQL)

4. **Performance Overhead** ⚠️ LOW
   - **Impact**: Validator adds ~5-10ms to query generation time
   - **Probability**: High (validator runs on every query)
   - **Mitigation**: Acceptable for correctness guarantee

---

## 9. Recommendations

### Immediate Actions (P0 - Critical)

1. **Implement `/lib/sql-validator.ts`**
   - Use regex patterns to detect and fix hardcoded denominators
   - Return structured result with original SQL, fixed SQL, and fix descriptions
   - Add edge case detection for WHERE/LIMIT clauses

2. **Integrate Validator into Route.ts**
   - Add validation before executeQuery() in BOTH single and multi-query paths
   - Log all fixes with console.warn() for monitoring
   - Preserve original SQL in logs for debugging

3. **Add Unit Tests**
   - Test all 6 test cases from Section 3
   - Verify fixes are applied correctly
   - Verify edge cases are NOT modified

### Short-term Actions (P1 - High Priority)

4. **Add Monitoring Dashboard**
   - Track frequency of validator fixes (how often AI violates rules)
   - Alert if fix rate > 10% (indicates AI instruction problem)
   - Log which types of queries trigger fixes most often

5. **Enhance AI Instructions**
   - Add more examples of correct vs incorrect SQL
   - Include explanation of why hardcoded values fail in production
   - Show specific error messages that occur without subqueries

### Long-term Actions (P2 - Enhancement)

6. **Add SQL Complexity Analyzer**
   - Detect overly complex subqueries (performance impact)
   - Suggest CTE refactoring for readability
   - Warn if query might be slow (missing indexes, cartesian joins)

7. **Create SQL Template Library**
   - Pre-validated SQL templates for common queries
   - AI can select from templates instead of generating from scratch
   - Reduces validation overhead and improves consistency

---

## 10. Conclusion

### Summary of Findings

**✅ What's Working:**
- AI instructions in `/lib/claude.ts` are comprehensive and clear
- Static code scanner catches hardcoded values in source files
- Regression test suite prevents re-introduction of issues

**❌ What's Missing:**
- **CRITICAL**: Runtime SQL validator at API route level
- No validation before SQL execution
- No automatic fixing of AI-generated queries

**⚠️ Risk Level: HIGH**

Without runtime validation, the system depends entirely on AI compliance with instructions. While Claude generally follows system prompts, there's no guarantee, especially with:
- Complex queries requiring multiple subqueries
- Edge cases the AI hasn't seen in training
- Updates to Claude's model that change behavior

### Recommendation: BLOCK DEPLOYMENT until runtime validator is implemented

The static analysis and AI instructions are excellent preventive measures, but production systems need defensive programming. The validator acts as a safety net, ensuring that even if the AI makes a mistake, the SQL is corrected before execution.

**Estimated Implementation Time**: 2-4 hours
- 1 hour: Write `/lib/sql-validator.ts`
- 30 min: Integrate into route.ts
- 1 hour: Write unit tests
- 30 min: Test locally with UI
- 1 hour: Deploy and verify in production

---

## Appendix: Code Snippets for Implementation

### A. Complete `/lib/sql-validator.ts`

*(See Section 2.1 for full implementation)*

### B. Route.ts Integration Points

*(See Section 2.2 for integration code)*

### C. Unit Test Suite

*(See Section 5.1 for complete test cases)*

---

**End of Code Review**

**Status**: ⚠️ INCOMPLETE - Runtime validator required
**Reviewer**: Code Review Agent
**Date**: October 8, 2025
