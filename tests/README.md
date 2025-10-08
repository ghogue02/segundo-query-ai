# Query Interface Test Suite

Comprehensive automated testing for the natural language query interface in segundo-query-ai.

## Overview

This test suite validates that the query API:
- ✅ Returns dynamic (not hardcoded) values
- ✅ Generates valid SQL with proper subqueries
- ✅ Filters by cohort correctly
- ✅ Excludes test/admin accounts
- ✅ Handles duplicate check-ins
- ✅ Caps attendance at 100%
- ✅ Returns appropriate chart types
- ✅ Generates meaningful insights

## Quick Start

### Prerequisites

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Ensure database is accessible:**
   ```bash
   PGPASSWORD=Pursuit1234! psql -h 34.57.101.141 -p 5432 -U postgres -d segundo-db -c "SELECT 1"
   ```

3. **Install jq (optional, for enhanced output):**
   ```bash
   brew install jq  # macOS
   # or
   sudo apt-get install jq  # Linux
   ```

### Run All Tests

```bash
# Using the shell script (recommended)
./tests/run-query-tests.sh

# Using npm
npm run test -- tests/frontend/query-interface.test.ts

# Using Jest directly
npx jest tests/frontend/query-interface.test.ts --verbose
```

### Run Specific Test Categories

```bash
# Attendance queries only
npx jest tests/frontend/query-interface.test.ts -t "Attendance Queries"

# Task completion queries only
npx jest tests/frontend/query-interface.test.ts -t "Task Completion Queries"

# SQL quality checks only
npx jest tests/frontend/query-interface.test.ts -t "SQL Quality Checks"

# Multi-metric queries only
npx jest tests/frontend/query-interface.test.ts -t "Multi-Metric Queries"
```

## Test Structure

### Directory Layout

```
tests/
├── frontend/
│   └── query-interface.test.ts     # Main test suite
├── utils/
│   └── query-validator.ts          # SQL validation utilities
├── types/
│   └── query-test-types.ts         # TypeScript type definitions
├── results/
│   ├── query-test-results.json     # JSON test results
│   └── test-run-*.log              # Test run logs
├── run-query-tests.sh              # Shell script runner
└── README.md                       # This file
```

### Test Categories

#### A. Attendance Queries (5 tests)
- Individual builder attendance rate
- All builders attendance
- Perfect attendance identification
- Attendance trends over time
- Duplicate check-in handling

#### B. Task Completion Queries (4 tests)
- Overall task completion rate
- Low completion task identification
- Task completion by builder
- Break task exclusion

#### C. Builder Performance Queries (3 tests)
- Top performers identification
- At-risk builder identification
- Engagement score calculation

#### D. Multi-Metric Queries (2 tests)
- Attendance and task completion together
- Attendance vs performance comparison

#### E. SQL Quality Checks (5 tests)
- No hardcoded day counts (17/18)
- No hardcoded builder counts (75/78)
- No hardcoded task counts (107)
- Cohort filtering validation
- Test account exclusions

#### F. Response Quality (4 tests)
- Chart type appropriateness
- Insight generation
- SQL explanations
- Non-empty results

#### G. Error Handling (2 tests)
- Ambiguous query handling
- Typo tolerance

**Total: 25+ automated tests**

## Validation Rules

### Dynamic Value Detection

The tests validate that SQL queries use **dynamic subqueries** instead of hardcoded values:

✅ **CORRECT:**
```sql
SELECT
  COUNT(DISTINCT attendance_date)::FLOAT /
  (SELECT COUNT(*) FROM curriculum_days WHERE cohort = 'September 2025') * 100
```

❌ **INCORRECT:**
```sql
SELECT
  COUNT(DISTINCT attendance_date)::FLOAT / 17 * 100  -- Hardcoded!
```

### Critical Validations

Each query is checked for:

1. **Hardcoded Denominators**
   - `/17` or `/18` (curriculum days)
   - `/75` or `/78` (active builders)
   - `/107` (total tasks)

2. **Required Filters**
   - `cohort = 'September 2025'`
   - `user_id NOT IN (129, 5, 240, ...)`
   - `EXTRACT(DOW FROM date) NOT IN (4, 5)` (exclude Thu/Fri)

3. **Data Integrity**
   - Attendance ≤ 100%
   - Task completion 0-100%
   - DISTINCT for duplicate handling

4. **Response Quality**
   - Valid JSON structure
   - Non-null SQL field
   - Non-empty results array
   - Appropriate chart type
   - Meaningful insights

## Output Format

### Console Output

```
╔════════════════════════════════════════════════════╗
║   Query Interface Test Suite                      ║
║   Segundo Query AI                                ║
╚════════════════════════════════════════════════════╝

🔍 Checking if server is running...
✅ Server is running at http://localhost:3000

═══════════════════════════════════════════════════
Running Jest Test Suite...
═══════════════════════════════════════════════════

PASS tests/frontend/query-interface.test.ts
  Query Interface Tests
    A. Attendance Queries
      ✓ should return dynamic attendance rate for specific builder (234ms)
      ✓ should show attendance for all builders (189ms)
      ✓ should find builders with perfect attendance (156ms)
      ✓ should show attendance trends over time (198ms)
      ✓ should handle same-day duplicate check-ins correctly (145ms)
    B. Task Completion Queries
      ✓ should return overall task completion rate (167ms)
      ...

═══════════════════════════════════════════════════
TEST SUMMARY
═══════════════════════════════════════════════════
✅ Passed:  23
❌ Failed:  0
⚠️  Warnings: 2
📊 Pass Rate: 100.0%
⏱️  Duration: 3456ms
═══════════════════════════════════════════════════

🎉 All tests passed successfully!
```

### JSON Output

Results are saved to `tests/results/query-test-results.json`:

```json
{
  "timestamp": "2025-10-08T17:30:45.123Z",
  "summary": {
    "total": 25,
    "passed": 23,
    "failed": 0,
    "warnings": 2,
    "duration": 3456,
    "passRate": 100.0
  },
  "results": [
    {
      "name": "Individual attendance rate with dynamic values",
      "category": "attendance",
      "passed": true,
      "duration": 234,
      "timestamp": "2025-10-08T17:30:42.456Z"
    },
    ...
  ]
}
```

## Adding New Tests

### 1. Add Test Case

```typescript
it('should validate new query type', async () => {
  const testStart = Date.now();
  const response = await executeQueryAPI("your test query");

  // Add validations
  expect(response.sql).toBeDefined();
  expect(response.results!.length).toBeGreaterThan(0);

  // Validate SQL quality
  const sqlValidation = validateSQLQuery(response.sql!);
  expect(sqlValidation.isValid).toBe(true);

  // Track result
  testResults.push({
    name: 'Your test name',
    passed: true,
    duration: Date.now() - testStart,
  });
});
```

### 2. Add Validation Rule

In `tests/utils/query-validator.ts`:

```typescript
export function validateCustomRule(sql: string): boolean {
  // Your validation logic
  return sql.toLowerCase().includes('your_pattern');
}
```

### 3. Add Type Definition

In `tests/types/query-test-types.ts`:

```typescript
export interface YourCustomResult {
  field1: string;
  field2: number;
}
```

## Troubleshooting

### Server Not Running

```
❌ Server is not running at http://localhost:3000
⚠️  Please start the server with: npm run dev
```

**Solution:** Start the dev server before running tests.

### Test Timeout

```
Timeout - Async callback was not invoked within the 5000 ms timeout
```

**Solution:** Increase Jest timeout in test file:
```typescript
jest.setTimeout(10000); // 10 seconds
```

### Database Connection Failed

```
❌ FAIL: Database connection error
```

**Solution:** Check database credentials and network access:
```bash
PGPASSWORD=Pursuit1234! psql -h 34.57.101.141 -p 5432 -U postgres -d segundo-db
```

### Hardcoded Value Detected

```
❌ FAIL: Hardcoded denominators found: /17
```

**Solution:** Update SQL generation prompt to use dynamic subqueries:
```sql
-- Replace this:
COUNT(*) / 17

-- With this:
COUNT(*) / (SELECT COUNT(*) FROM curriculum_days WHERE cohort = 'September 2025')
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Query Interface Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run dev &
      - run: sleep 10
      - run: ./tests/run-query-tests.sh
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: tests/results/
```

## Best Practices

1. **Always test against live server** - Mocked responses don't catch real SQL issues
2. **Check for dynamic values** - Use validators to detect hardcoded denominators
3. **Validate data ranges** - Attendance ≤ 100%, completion 0-100%
4. **Test edge cases** - Empty results, ambiguous queries, typos
5. **Track performance** - Monitor query execution time
6. **Save results** - JSON output for historical comparison

## Related Documentation

- [Database Schema](/SHADCN-TAILWIND-V4-RULES.md) - Database structure and rules
- [API Documentation](/app/api/query/route.ts) - Query API implementation
- [Integration Tests](/tests/integration/) - Other test suites

## Support

For issues or questions:
1. Check test logs in `tests/results/`
2. Review SQL validation errors
3. Verify database connection
4. Ensure server is running
5. Check API endpoint configuration

---

**Last Updated:** 2025-10-08
**Test Suite Version:** 1.0.0
