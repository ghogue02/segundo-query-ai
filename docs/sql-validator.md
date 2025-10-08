# SQL Validator - Auto-Fix Hardcoded Denominators

## Overview

The SQL Validator automatically detects and fixes hardcoded denominators in AI-generated SQL queries before they're executed. This prevents incorrect percentage calculations when data changes over time.

## Problem

AI models sometimes generate SQL with hardcoded numbers for percentage calculations:

```sql
-- INCORRECT: Hardcoded denominator
SELECT COUNT(*) / 75 * 100 AS completion_rate FROM tasks;
```

**Issues with this approach:**
- Breaks when number of active builders changes (75 → 78)
- Requires manual updates when cohort size changes
- Fails when class days are added/removed
- Not reusable across cohorts

## Solution

The validator automatically replaces hardcoded denominators with dynamic subqueries:

```sql
-- CORRECT: Dynamic subquery
SELECT COUNT(*) / (
  SELECT COUNT(*)
  FROM users
  WHERE cohort = 'September 2025'
    AND active = true
    AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332)
) * 100 AS completion_rate
FROM tasks;
```

## Detected Patterns

The validator detects three types of hardcoded denominators:

### 1. Class Day Counts
**Patterns:** `/ 24`, `/ 17`, `/ 18`

**Replaced with:**
```sql
(SELECT COUNT(*)
 FROM curriculum_days
 WHERE cohort = 'September 2025'
   AND EXTRACT(DOW FROM day_date) NOT IN (4, 5)
   AND day_date <= CURRENT_DATE)
```

### 2. Active Builder Counts
**Patterns:** `/ 75`, `/ 79`

**Replaced with:**
```sql
(SELECT COUNT(*)
 FROM users
 WHERE cohort = 'September 2025'
   AND active = true
   AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332))
```

### 3. Task Counts
**Patterns:** `/ 143`, `/ 107`

**Replaced with:**
```sql
(SELECT COUNT(*)
 FROM tasks t
 JOIN time_blocks tb ON t.block_id = tb.id
 JOIN curriculum_days cd ON tb.day_id = cd.id
 WHERE cd.cohort = 'September 2025')
```

## How It Works

### 1. Detection Phase
The validator scans SQL using regex patterns to find division operations with 2-3 digit numbers:

```typescript
/\/\s*(24|17|18)(?=\s*\)|\s*\*|\s*$|\s*,|\s+AS|\s+as|\s+\/)/gi
```

### 2. Context Analysis
It examines the SQL context to determine the correct replacement:

- **Attendance context** → Class day count subquery
- **User/builder context** → Active builder count subquery
- **Task context** → Task count subquery

### 3. Safe Replacement
The validator only replaces numbers in:
- Division operations for percentage calculations
- Expressions followed by multiplication (`* 100`)
- Expressions with AS aliases

**It NEVER replaces numbers in:**
- WHERE clauses (`WHERE day_number = 24`)
- LIMIT clauses (`LIMIT 75`)
- Comparison operations

### 4. Multi-Query Support
For queries returning multiple metrics, it validates each query independently:

```typescript
sqlResponse.queries = sqlResponse.queries.map(q => {
  const { sql: fixedSQL, hadIssues, fixes } = validateAndFixSQL(q.sql);
  if (hadIssues) {
    console.warn(`Fixed hardcoded SQL in ${q.id}:`, fixes);
    return { ...q, sql: fixedSQL };
  }
  return q;
});
```

## Usage

### In API Route (Automatic)

The validator is automatically applied in `/app/api/query/route.ts`:

```typescript
// Generate SQL using Claude
const sqlResponse = await generateSQLFromQuestion(question, conversationHistory);

// VALIDATE AND FIX HARDCODED DENOMINATORS
if (sqlResponse.sql) {
  const { sql: fixedSQL, hadIssues, fixes } = validateAndFixSQL(sqlResponse.sql);

  if (hadIssues) {
    console.warn('Fixed hardcoded SQL denominators:', fixes);
    sqlResponse.sql = fixedSQL;
  }
}
```

### Programmatic Usage

```typescript
import { validateAndFixSQL } from '@/lib/sql-validator';

const sql = "SELECT COUNT(*) / 75 * 100 AS rate FROM users";
const result = validateAndFixSQL(sql);

console.log(result.hadIssues); // true
console.log(result.fixes);
// ['Replaced hardcoded active builder count (75) with dynamic subquery']
console.log(result.sql);
// "SELECT COUNT(*) / (SELECT COUNT(*) FROM users WHERE...) * 100 AS rate FROM users"
```

### Batch Validation

```typescript
import { validateSQLBatch } from '@/lib/sql-validator';

const queries = [
  { id: 'metric-1', sql: 'SELECT COUNT(*) / 24 FROM days' },
  { id: 'metric-2', sql: 'SELECT COUNT(*) / 75 FROM users' }
];

const results = validateSQLBatch(queries);
results.forEach(result => {
  if (result.hadIssues) {
    console.log(`Fixed ${result.id}:`, result.fixes);
  }
});
```

### Check Without Fixing

```typescript
import { hasHardcodedDenominators } from '@/lib/sql-validator';

if (hasHardcodedDenominators(sql)) {
  console.warn('SQL contains hardcoded denominators');
}
```

## Return Type

```typescript
interface SQLValidationResult {
  sql: string;           // Fixed SQL query
  hadIssues: boolean;    // True if fixes were applied
  fixes: string[];       // Array of fix descriptions
}
```

## Example Transformations

### Example 1: Simple Percentage
**Before:**
```sql
SELECT COUNT(*) / 75 * 100 AS completion_rate FROM tasks;
```

**After:**
```sql
SELECT COUNT(*) / (SELECT COUNT(*) FROM users WHERE cohort = 'September 2025' AND active = true AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332)) * 100 AS completion_rate FROM tasks;
```

### Example 2: Multiple Denominators
**Before:**
```sql
SELECT
  COUNT(*) / 24 AS avg_daily,
  COUNT(*) / 75 AS per_builder
FROM attendance;
```

**After:**
```sql
SELECT
  COUNT(*) / (SELECT COUNT(*) FROM curriculum_days WHERE cohort = 'September 2025' AND EXTRACT(DOW FROM day_date) NOT IN (4, 5) AND day_date <= CURRENT_DATE) AS avg_daily,
  COUNT(*) / (SELECT COUNT(*) FROM users WHERE cohort = 'September 2025' AND active = true AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332)) AS per_builder
FROM attendance;
```

### Example 3: Safe - No Changes
**Before:**
```sql
SELECT * FROM users WHERE day_number = 24 LIMIT 75;
```

**After:**
```sql
SELECT * FROM users WHERE day_number = 24 LIMIT 75;
-- No changes - numbers in WHERE and LIMIT are preserved
```

## Testing

Run the test suite:

```bash
npm test -- sql-validator.test.ts
```

**Test coverage includes:**
- Detection of all three denominator types (24, 75, 143)
- Context-aware replacement
- Multiple denominators in one query
- Exclusion of WHERE/LIMIT clauses
- Various spacing patterns
- Nested subqueries
- CTEs (Common Table Expressions)
- Window functions
- UNION queries
- SQL comments
- Batch validation

## Monitoring

The validator logs warnings when it fixes hardcoded denominators:

```javascript
console.warn('Fixed hardcoded SQL denominators:', [
  'Replaced hardcoded active builder count (75) with dynamic subquery',
  'Replaced hardcoded class day count (24) with dynamic subquery'
]);
```

These logs help track:
- How often the AI generates hardcoded values
- Which patterns are most common
- Potential AI prompt improvements

## Performance

- **Minimal overhead:** Regex-based detection is fast (~0.1ms per query)
- **No database impact:** Subqueries are efficiently planned by PostgreSQL
- **Cached subqueries:** PostgreSQL query planner often evaluates subqueries once

## Future Enhancements

Potential improvements:
- [ ] Support for decimal denominators (143.0 → 143)
- [ ] Cohort parameter support (currently hardcoded to 'September 2025')
- [ ] Additional patterns (e.g., weekend-only day counts)
- [ ] AI feedback loop (teach AI to generate correct queries)

## Related Files

- **Implementation:** `/lib/sql-validator.ts`
- **Integration:** `/app/api/query/route.ts`
- **Tests:** `/tests/unit/sql-validator.test.ts`
- **Documentation:** `/docs/sql-validator.md` (this file)
