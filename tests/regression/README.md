# Hardcoded Values Regression Test Suite

## Overview

This regression test suite prevents hardcoded metric values from being re-introduced into the codebase. It automatically detects patterns like:

- Hardcoded denominators in JSX: `{value / 75}`
- Hardcoded max props: `max={17}`
- Hardcoded useState defaults: `useState({ activeBuilders: 75 })`
- SQL queries with hardcoded divisors: `... / 75`
- Hardcoded variable assignments

## Quick Start

### Run Locally

```bash
# Basic run
./tests/run-regression.sh

# Verbose output
./tests/run-regression.sh -v

# Open HTML report automatically
./tests/run-regression.sh --open-report

# Watch mode for development
./tests/run-regression.sh -w
```

### Run with npm

```bash
# Run regression tests only
npm test -- tests/regression/hardcoded-values.test.ts

# Run with coverage
npm test -- tests/regression/hardcoded-values.test.ts --coverage

# Verbose output
npm test -- tests/regression/hardcoded-values.test.ts --verbose
```

## Test Categories

### A. Static Code Analysis Tests

Scans TypeScript/TSX files for hardcoded values in:
- **JSX expressions**: `{attendance / 75}` ❌
- **Component props**: `max={18}` ❌
- **State initialization**: `useState({ classDays: 17 })` ❌
- **Variable assignments**: `const total = 107` ❌

**Expected behavior**: Use dynamic values from API or state.

### B. SQL Query Validation Tests

Checks SQL queries in `lib/queries/*.ts` for:
- **Hardcoded divisors**: `COUNT(...) / 75` ❌
- **ROUND with literals**: `ROUND(x / 107, 2)` ❌

**Expected behavior**: Use subqueries or parameters.

```sql
-- ❌ Bad
ROUND(COUNT(*) / 75, 2)

-- ✅ Good
ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM users WHERE active = true), 0), 2)
```

### C. API Response Schema Tests

Validates that API endpoints return dynamic values:
- `/api/stats` → `{ activeBuilders, classDays, totalTasks }`
- `/api/builder/[id]` → `{ total_days, total_tasks }`
- `/api/task/[id]` → `{ active_builder_count }`

**Expected behavior**: Values calculated from database queries, not hardcoded.

### D. Component Props Validation Tests

Ensures TypeScript interfaces include required fields:
- `BuilderProfile` → `total_days`, `total_tasks`
- `TaskDetail` → `active_builder_count`

**Expected behavior**: Interfaces match API responses with dynamic fields.

## Understanding Test Results

### Success ✅

```
✅ All regression tests passed!
No hardcoded values detected in the codebase.
```

All tests passed. Code is ready for commit.

### Failure ❌

```
❌ Regression tests failed!
Hardcoded values detected in the codebase.

components/MetricCard.tsx:42
  Hardcoded denominator in JSX expression
  Code: {value / 75}
  Fix: Use dynamic value: {value / stats.activeBuilders}
```

Critical issues found. Must fix before merging.

## HTML Report

After running tests, an HTML report is generated at:
```
tests/results/hardcoded-values-report.html
```

The report includes:
- **Summary statistics**: Files scanned, issues found
- **Detailed issues**: File, line, code snippet, severity
- **Fix suggestions**: How to resolve each issue

Open in browser:
```bash
open tests/results/hardcoded-values-report.html
```

## Whitelist Configuration

Some files legitimately need hardcoded values (tests, mocks, examples). Add them to:
```
tests/config/hardcoded-values-whitelist.json
```

Example:
```json
{
  "whitelist": [
    {
      "file": "tests/mocks/data.ts",
      "reason": "Mock data for testing purposes"
    },
    {
      "file": "docs/examples/calculations.ts",
      "line": 42,
      "pattern": "jsx-denominator",
      "reason": "Documentation example showing sample calculation"
    }
  ]
}
```

### Whitelist Fields

- `file` (required): File path or pattern (supports partial matches)
- `line` (optional): Specific line number to whitelist
- `pattern` (optional): Specific pattern name to allow
- `reason` (required): Explanation for why this is whitelisted

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- ✅ Push to `main` or `develop`
- ✅ Pull requests to `main` or `develop`

Workflow: `.github/workflows/regression-tests.yml`

### PR Comments

When tests run on a PR, GitHub Actions posts a comment:

**Success:**
```
🔍 Hardcoded Values Regression Test Results

✅ All tests passed!
No hardcoded values detected in the codebase.

Node Version: 20.x
Commit: abc1234
```

**Failure:**
```
🔍 Hardcoded Values Regression Test Results

❌ Issues detected

- Critical Issues: 3
- Total Issues: 5

Action Required: Please review and fix the hardcoded values before merging.

📊 Download the detailed HTML report from the workflow artifacts.
```

### Workflow Artifacts

Failed test runs upload the HTML report as a workflow artifact:
- Retention: 30 days
- Name: `regression-report-{node-version}`

Download from GitHub Actions → Workflow Run → Artifacts

## Common Patterns and Fixes

### 1. JSX Denominators

❌ **Bad:**
```tsx
<ProgressBar value={completed / 75} />
```

✅ **Good:**
```tsx
<ProgressBar value={completed / stats.activeBuilders} />
```

### 2. Max Props

❌ **Bad:**
```tsx
<ProgressBar value={days} max={18} />
```

✅ **Good:**
```tsx
<ProgressBar value={days} max={stats.classDays} />
```

### 3. useState Defaults

❌ **Bad:**
```tsx
const [stats, setStats] = useState({
  activeBuilders: 75,
  classDays: 18,
  totalTasks: 107
});
```

✅ **Good:**
```tsx
const [stats, setStats] = useState({
  activeBuilders: 0,
  classDays: 0,
  totalTasks: 0
});

useEffect(() => {
  fetch('/api/stats')
    .then(res => res.json())
    .then(setStats);
}, []);
```

### 4. SQL Divisions

❌ **Bad:**
```sql
SELECT
  ROUND(COUNT(DISTINCT user_id)::numeric / 75 * 100, 2) as percentage
FROM ...
```

✅ **Good:**
```sql
WITH active_count AS (
  SELECT COUNT(*) as total
  FROM users
  WHERE active = true AND cohort = 'September 2025'
)
SELECT
  ROUND(COUNT(DISTINCT user_id)::numeric / NULLIF((SELECT total FROM active_count), 0) * 100, 2) as percentage
FROM ...
```

### 5. Component Props

❌ **Bad:**
```typescript
interface BuilderProfile {
  attendance_percentage: number;
  // Missing total_days, total_tasks
}
```

✅ **Good:**
```typescript
interface BuilderProfile {
  attendance_percentage: number;
  total_days: number;      // Dynamic from database
  total_tasks: number;     // Dynamic from database
}
```

## Troubleshooting

### Tests fail but I don't see hardcoded values

Check the HTML report for detailed line numbers and code snippets. The issue might be in a nested expression.

### False positive - my code is correct

Add the file to the whitelist with a clear reason:

```json
{
  "file": "components/ExampleComponent.tsx",
  "line": 42,
  "reason": "This is example documentation code"
}
```

### Tests pass locally but fail in CI

Ensure you've committed all changes:
```bash
git status
git add .
git commit -m "Fix hardcoded values"
```

### Need to temporarily disable tests

**Not recommended**, but if absolutely necessary:

```bash
# In GitHub Actions workflow, comment out the regression test job
# Or add skip condition to specific tests
```

Better approach: Add to whitelist with time-limited reason.

## Development Workflow

### Before Committing

```bash
# Run regression tests
./tests/run-regression.sh -v

# If issues found, fix them
# Then re-run tests
./tests/run-regression.sh --open-report

# When all pass, commit
git add .
git commit -m "Your changes"
```

### In CI/CD Pipeline

1. Push code to branch
2. Open pull request
3. GitHub Actions runs regression tests
4. Review PR comment with results
5. If failed, download HTML report from artifacts
6. Fix issues and push again
7. When passed, merge PR

## Architecture

### File Structure

```
tests/
├── regression/
│   ├── hardcoded-values.test.ts    # Main test suite
│   └── README.md                   # This file
├── utils/
│   └── code-scanner.ts             # Static analysis utilities
├── config/
│   └── hardcoded-values-whitelist.json  # Whitelist config
├── results/
│   ├── hardcoded-values-report.html     # HTML report (generated)
│   └── hardcoded-values-report.json     # JSON report (generated)
└── run-regression.sh               # CLI test runner

.github/
└── workflows/
    └── regression-tests.yml        # CI/CD workflow
```

### Scanner Patterns

The `CodeScanner` class in `tests/utils/code-scanner.ts` defines detection patterns:

1. **jsx-denominator**: `{x / 75}`
2. **jsx-max-prop**: `max={18}`
3. **useState-default**: `useState({ activeBuilders: 75 })`
4. **sql-division**: `... / 75`
5. **sql-round-division**: `ROUND(x / 107, 2)`
6. **variable-assignment**: `const total = 107`
7. **object-literal**: `{ totalTasks: 107 }`

Each pattern has:
- **regex**: Detection pattern
- **severity**: 'error' or 'warning'
- **message**: Description of issue
- **suggestion**: How to fix

## Extending the Tests

### Add New Pattern

Edit `tests/utils/code-scanner.ts`:

```typescript
private readonly PATTERNS = [
  // ... existing patterns
  {
    name: 'my-new-pattern',
    regex: /your-regex-here/g,
    severity: 'error' as const,
    message: 'Description of issue',
    suggestion: 'How to fix it',
  },
];
```

### Add New Test Category

Edit `tests/regression/hardcoded-values.test.ts`:

```typescript
describe('F. My New Test Category', () => {
  it('should validate something new', () => {
    // Your test logic
  });
});
```

### Customize Severity

Some violations may be warnings instead of errors:

```typescript
{
  severity: 'warning' as const,  // Won't fail CI
}
```

## Best Practices

### 1. Run Tests Early and Often

```bash
# Before starting work
./tests/run-regression.sh

# During development (watch mode)
./tests/run-regression.sh -w

# Before committing
./tests/run-regression.sh --open-report
```

### 2. Keep Whitelist Minimal

Only whitelist when absolutely necessary. Prefer fixing the code.

### 3. Document Whitelisted Items

Always provide a clear, specific reason for whitelisting.

### 4. Review HTML Reports

The HTML report provides context. Use it to understand issues.

### 5. Use Subqueries, Not Constants

In SQL, always prefer subqueries over hardcoded values:

```sql
-- Calculate denominators dynamically
(SELECT COUNT(*) FROM users WHERE active = true)
```

### 6. Fetch API Data, Don't Hardcode

In components, always fetch from API:

```typescript
// Fetch once, use everywhere
const { data: stats } = useSWR('/api/stats');
```

## FAQ

**Q: Why can't I use 75 as a magic number?**
A: The value 75 represents the current count of active builders, which changes over time. Hardcoding it will cause bugs as the cohort grows or shrinks.

**Q: What if I need a constant for something else?**
A: If you need `75` for an unrelated purpose (e.g., percentage threshold, font size), rename the variable to make it clear: `const THRESHOLD = 75`.

**Q: How do I debug a failing test?**
A: Run with verbose mode and check the HTML report:
```bash
./tests/run-regression.sh -v --open-report
```

**Q: Can I disable tests temporarily?**
A: Not recommended. Instead, fix the issues or add to whitelist with a clear explanation.

**Q: How do I add a new hardcoded value to detect?**
A: Update the `HARDCODED_VALUES` object in `code-scanner.ts` and add patterns to detect it.

## Contributing

When adding new metric values to the codebase:

1. Ensure they're fetched from API/database
2. Add validation tests if needed
3. Update this documentation
4. Run regression tests before committing

## Support

For issues or questions:
1. Check this README
2. Review HTML report for detailed diagnostics
3. Check whitelist configuration
4. Review PR comments from CI/CD

## License

Same as project license.
