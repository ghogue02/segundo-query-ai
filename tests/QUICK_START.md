# Regression Tests Quick Start Guide

## 🚀 TL;DR

```bash
# Run tests before committing
npm run test:regression-shell

# If issues found, view report
open tests/results/hardcoded-values-report.html
```

## What This Tests

Prevents hardcoded values from being re-introduced:
- ❌ `{value / 75}` → ✅ `{value / stats.activeBuilders}`
- ❌ `max={18}` → ✅ `max={stats.classDays}`
- ❌ `useState({ total: 107 })` → ✅ `useState({ total: 0 })`

## Quick Commands

### Run Tests

```bash
# Basic
npm run test:regression

# With shell script (recommended)
npm run test:regression-shell

# Verbose output
npm run test:regression-shell -- -v

# Auto-open report
npm run test:regression-shell -- --open-report
```

### Watch Mode (Development)

```bash
./tests/run-regression.sh -w
```

## Understanding Results

### ✅ Success
```
✅ All regression tests passed!
No hardcoded values detected in the codebase.
```
**Action**: You're good to commit!

### ❌ Failure
```
❌ Regression tests failed!
Hardcoded values detected in the codebase.

components/MetricCard.tsx:42
  Hardcoded denominator in JSX expression
  Code: {value / 75}
  Fix: Use dynamic value: {value / stats.activeBuilders}
```
**Action**: Fix the issues and re-run tests

## Common Fixes

### 1. JSX Denominator
```tsx
// ❌ Bad
<ProgressBar value={completed / 75} />

// ✅ Good
<ProgressBar value={completed / stats.activeBuilders} />
```

### 2. Max Props
```tsx
// ❌ Bad
<ProgressBar max={18} />

// ✅ Good
<ProgressBar max={stats.classDays} />
```

### 3. useState
```tsx
// ❌ Bad
const [stats, setStats] = useState({ activeBuilders: 75 });

// ✅ Good
const [stats, setStats] = useState({ activeBuilders: 0 });
useEffect(() => {
  fetch('/api/stats').then(res => res.json()).then(setStats);
}, []);
```

### 4. SQL Queries
```sql
-- ❌ Bad
SELECT COUNT(*) / 75 as percentage

-- ✅ Good
SELECT COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM users WHERE active = true), 0) as percentage
```

## Files

- **Tests**: `tests/regression/hardcoded-values.test.ts`
- **Scanner**: `tests/utils/code-scanner.ts`
- **Config**: `tests/config/hardcoded-values-whitelist.json`
- **Report**: `tests/results/hardcoded-values-report.html`
- **Docs**: `tests/regression/README.md`

## CI/CD

Tests run automatically on:
- Push to `main`/`develop`
- Pull requests

Check PR comments for results.

## Need Help?

1. Read full docs: `tests/regression/README.md`
2. View HTML report: `open tests/results/hardcoded-values-report.html`
3. Run with verbose: `./tests/run-regression.sh -v`

## Whitelist a False Positive

Edit `tests/config/hardcoded-values-whitelist.json`:

```json
{
  "whitelist": [
    {
      "file": "path/to/file.ts",
      "line": 42,
      "reason": "This is a legitimate constant"
    }
  ]
}
```

## Best Practice

```bash
# Before committing
./tests/run-regression.sh -v

# Fix any issues
# Then commit
git add .
git commit -m "Your changes"
```

---

**Full Documentation**: `tests/regression/README.md`
