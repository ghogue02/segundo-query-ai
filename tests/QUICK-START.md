# Query Interface Tests - Quick Start Guide

## 🚀 Run Tests (3 Options)

### Option 1: Shell Script (Recommended)
```bash
./tests/run-query-tests.sh
```
**Best for:** Complete validation with both Jest tests + manual checks

### Option 2: NPM Script
```bash
npm run test:query
```
**Best for:** Quick Jest-only test run during development

### Option 3: Direct Jest
```bash
npx jest tests/frontend/query-interface.test.ts --verbose
```
**Best for:** Custom Jest options (watch mode, specific tests, etc.)

## ✅ Prerequisites

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Verify database connection:**
   ```bash
   PGPASSWORD=Pursuit1234! psql -h 34.57.101.141 -p 5432 -U postgres -d segundo-db -c "SELECT 1"
   ```

3. **Install jq (optional, enhances output):**
   ```bash
   brew install jq  # macOS
   ```

## 📋 What Gets Tested

### 25+ Automated Tests Covering:

- ✅ **Attendance Queries** (5 tests)
  - Individual/all builder attendance
  - Perfect attendance detection
  - Trends over time
  - Duplicate check-in handling

- ✅ **Task Completion** (4 tests)
  - Overall completion rates
  - Low-completion identification
  - Per-builder completion
  - Break task exclusion

- ✅ **Performance Queries** (3 tests)
  - Top performers
  - At-risk builders
  - Engagement scores

- ✅ **Multi-Metric Queries** (2 tests)
  - Combined metrics
  - Comparative analysis

- ✅ **SQL Quality** (5 tests)
  - No hardcoded values (17, 18, 75, 107)
  - Dynamic subqueries
  - Cohort filtering
  - User exclusions
  - Attendance caps

- ✅ **Response Quality** (4 tests)
  - Chart types
  - Insights
  - Explanations
  - Results validation

- ✅ **Error Handling** (2 tests)
  - Ambiguous queries
  - Typo tolerance

## 🎯 Key Validations

### Dynamic Value Detection

Tests ensure SQL uses **dynamic subqueries** instead of hardcoded values:

✅ **PASS:**
```sql
COUNT(*) / (SELECT COUNT(*) FROM curriculum_days WHERE cohort = 'September 2025')
```

❌ **FAIL:**
```sql
COUNT(*) / 17  -- Hardcoded!
```

### Critical Rules Checked

1. **No Hardcoded Denominators**
   - `/17` or `/18` (days)
   - `/75` or `/78` (builders)
   - `/107` (tasks)

2. **Required Filters**
   - `cohort = 'September 2025'`
   - `user_id NOT IN (129, 5, 240, ...)`

3. **Data Integrity**
   - Attendance ≤ 100%
   - Completion 0-100%
   - DISTINCT for duplicates

## 📊 Output

### Console Output
```
╔════════════════════════════════════════════════════╗
║   Query Interface Test Suite                      ║
╚════════════════════════════════════════════════════╝

✅ PASS: Individual attendance rate (234ms)
✅ PASS: All builders attendance (189ms)
✅ PASS: Perfect attendance detection (156ms)
...

═══════════════════════════════════════════════════
TEST SUMMARY
═══════════════════════════════════════════════════
✅ Passed:  23
❌ Failed:  0
📊 Pass Rate: 100.0%
⏱️  Duration: 3456ms
```

### JSON Results
```
tests/results/query-test-results.json
tests/results/test-run-20251008-173045.log
```

## 🔍 Run Specific Tests

```bash
# Attendance only
npx jest tests/frontend/query-interface.test.ts -t "Attendance"

# Task completion only
npx jest tests/frontend/query-interface.test.ts -t "Task Completion"

# SQL quality checks only
npx jest tests/frontend/query-interface.test.ts -t "SQL Quality"

# Multi-metric only
npx jest tests/frontend/query-interface.test.ts -t "Multi-Metric"
```

## 🐛 Troubleshooting

### Server Not Running
```bash
npm run dev  # Start server first
```

### Database Connection Failed
```bash
# Test connection
PGPASSWORD=Pursuit1234! psql -h 34.57.101.141 -p 5432 -U postgres -d segundo-db -c "SELECT 1"
```

### Test Timeout
```bash
# Increase timeout
JEST_TIMEOUT=10000 npm run test:query
```

### Hardcoded Value Detected
Check SQL generation in `/lib/claude.ts` - ensure dynamic subqueries are used.

## 📁 File Locations

```
tests/
├── frontend/
│   └── query-interface.test.ts     # Main test suite
├── utils/
│   └── query-validator.ts          # Validation utilities
├── types/
│   └── query-test-types.ts         # Type definitions
├── results/
│   └── *.json, *.log               # Test outputs
├── run-query-tests.sh              # Shell runner
├── README.md                       # Full documentation
└── QUICK-START.md                  # This file
```

## 💡 Quick Tips

1. **Always start server first** - Tests require live API
2. **Check results JSON** - Detailed breakdown in `tests/results/`
3. **Use shell script** - Best for comprehensive validation
4. **Watch mode available** - `npm run test:query -- --watch`
5. **Debug with verbose** - `npm run test:query -- --verbose`

## 📚 Full Documentation

See `tests/README.md` for:
- Complete test descriptions
- Adding new tests
- CI/CD integration
- Advanced usage
- Type definitions

---

**Quick Command Reference:**
```bash
# Run all query tests
npm run test:query

# Run with shell validation
./tests/run-query-tests.sh

# Run specific category
npx jest tests/frontend/query-interface.test.ts -t "Attendance"

# Watch mode
npm run test:query -- --watch

# Coverage report
npm run test:query -- --coverage
```
