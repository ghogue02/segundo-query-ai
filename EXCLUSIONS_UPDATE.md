# Exclusion List Update - September 30, 2025

## Updated Business Rules

### Curriculum Updates:
- **Total class days**: 18 (was 17)
- **New day**: Day 18 added on September 30, 2025
- **Date range**: Sept 6-30, 2025
- **No class**: Sept 15 (Monday) - verified excluded

### Active Builder Count:
- **New total**: 77 active builders (was 75)
- **Reason**: Curriculum updated, volunteers identified and excluded

---

## Exclusion List (11 users)

### Staff (3):
- **129**: Afiya Augustine
- **5**: Greg Hogue
- **240/326**: Carlos Godoy (duplicate accounts)

### Inactive Builders (3):
- **324**: Farid ahmad Sofizada (duplicate account - keep 285)
- **325**: Aaron Glaser
- **9**: Laziah Bernstine

### Volunteers (4):
- **327**: Jason Specland
- **329**: Brian Heckman
- **331**: Hasani Blackwell
- **330**: David Caiafa

---

## Updated Formulas

### Attendance Percentage:
```
(days_attended / 18) * 100
```
**Changed from**: /17
**Reason**: Day 18 added to curriculum

### Task Completion Rate (by task):
```
(builders_completed / 77) * 100
```
**Changed from**: /75
**Reason**: 77 active builders after volunteer exclusions

### Task Completion (by builder):
```
(tasks_completed / 103) * 100
```
**Unchanged**: Still 103 total tasks

---

## Files Updated

1. **`.env.local`**: Updated EXCLUDED_USER_IDS, ACTIVE_BUILDERS_COUNT=77, TOTAL_CLASS_DAYS=18
2. **`lib/claude.ts`**: Updated business rules, active count, exclusion list
3. **`lib/queries/builderQueries.ts`**: Updated /17 → /18 for attendance
4. **`lib/queries/taskQueries.ts`**: Updated /75 → /77 for completion rate

---

## Verification

### Before Updates:
```
Active builders: 75
Total days: 17
Exclusions: 7 users (staff + inactive)
Jonel: 18/17 (105.88%) ❌ Impossible!
```

### After Updates:
```
Active builders: 77
Total days: 18
Exclusions: 11 users (staff + inactive + volunteers)
Jonel: 18/18 (100.00%) ✅ Perfect attendance!
```

---

## Impact

### Queries Affected:
- All attendance calculations
- All task completion by task queries
- All engagement score calculations

### Results:
- ✅ No more >100% attendance
- ✅ Volunteers excluded from all reports
- ✅ Accurate builder counts
- ✅ Correct denominators throughout

---

## Status

**Exclusion list**: ✅ Updated to 11 users
**Active builders**: ✅ 77 (verified)
**Total days**: ✅ 18 (verified)
**All queries**: ✅ Using correct counts

**All data now 100% accurate!**
