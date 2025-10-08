# Dynamic Week Ranges Implementation

## Overview

The system now automatically calculates week ranges based on cohort configuration. No more hardcoded dates!

## Cohort Configuration

**Location:** `/lib/utils/cohort-dates.ts`

**September 2025 Cohort:**
- Start Date: **Saturday, Sept 6, 2025**
- End Date: **Wednesday, Oct 29, 2025**
- Total Weeks: **8 weeks**
- Class Days: Mon/Tue/Wed/Sat/Sun (Thu/Fri excluded)

## Week Calculation Logic

**Weeks run Saturday to Friday (7 days):**

| Week | Start Date | End Date | Date Range Label |
|------|-----------|----------|------------------|
| Week 1 | Sept 6 | Sept 12 | Sept 6-12 |
| Week 2 | Sept 13 | Sept 19 | Sept 13-19 |
| Week 3 | Sept 20 | Sept 26 | Sept 20-26 |
| Week 4 | Sept 27 | Oct 3 | Sept 27-Oct 3 |
| Week 5 | Oct 4 | Oct 10 | Oct 4-10 |
| Week 6 | Oct 11 | Oct 17 | Oct 11-17 |
| Week 7 | Oct 18 | Oct 24 | Oct 18-24 |
| Week 8 | Oct 25 | Oct 29 | Oct 25-29 |

**Today (Oct 4, 2025) = Week 5 - Automatically detected!**

## Features

### 1. Dynamic Week Generation
```typescript
import { calculateWeekRanges } from '@/lib/utils/cohort-dates';

const weeks = calculateWeekRanges('September 2025');
// Returns all 8 weeks with start/end dates
```

### 2. Current Week Detection
```typescript
import { getCurrentWeek } from '@/lib/utils/cohort-dates';

const currentWeek = getCurrentWeek('September 2025');
// Returns: 5 (as of Oct 4, 2025)
```

### 3. Class Day Validation
```typescript
import { isClassDay } from '@/lib/utils/cohort-dates';

isClassDay(new Date('2025-10-04')); // Saturday = true
isClassDay(new Date('2025-10-03')); // Thursday = false
```

### 4. SQL Date Range Helper
```typescript
import { getSQLDateRange } from '@/lib/utils/cohort-dates';

// Get date range for Week 5
const range = getSQLDateRange('September 2025', 5);
// Returns: { startDate: '2025-10-04', endDate: '2025-10-10' }
```

## Updated Components

### FilterSidebar
**Location:** `/components/metrics-dashboard/FilterSidebar.tsx`

**Changes:**
- ✅ Now dynamically generates all 8 weeks
- ✅ Automatically shows current week with "Current" badge
- ✅ Highlights current week in bold
- ✅ Shows actual date ranges for each week
- ✅ Defaults to selecting weeks 1-5 (up to current week)

### API Endpoint
**New Endpoint:** `/api/cohort/weeks`

**Usage:**
```bash
curl http://localhost:3000/api/cohort/weeks?cohort=September%202025
```

**Response:**
```json
{
  "cohort": "September 2025",
  "startDate": "2025-09-06",
  "endDate": "2025-10-29",
  "totalWeeks": 8,
  "currentWeek": 5,
  "weeks": [
    {
      "weekNumber": 1,
      "startDate": "2025-09-06",
      "endDate": "2025-09-12",
      "label": "Week 1",
      "dateRange": "Sept 6-12",
      "isCurrent": false
    },
    ...
  ]
}
```

## Benefits

1. **No Manual Updates** - Weeks automatically calculate from cohort start date
2. **Current Week Highlighting** - System knows which week it is
3. **Accurate Date Ranges** - Handles month transitions automatically
4. **Scalable** - Easy to add new cohorts with different schedules
5. **Class Day Aware** - Knows Thu/Fri are not class days

## Adding New Cohorts

Edit `/lib/utils/cohort-dates.ts`:

```typescript
export const COHORTS: Record<string, CohortConfig> = {
  'September 2025': {
    name: 'September 2025',
    startDate: new Date('2025-09-06'),
    endDate: new Date('2025-10-29'),
    totalWeeks: 8,
  },
  'January 2026': {  // Add new cohort
    name: 'January 2026',
    startDate: new Date('2026-01-10'),
    endDate: new Date('2026-03-15'),
    totalWeeks: 10,
  },
};
```

## Visual Changes

**Before:**
```
☑ Week 1 (Sept 6-12)
☑ Week 2 (Sept 13-19)
☑ Week 3 (Sept 20-26)
☑ Week 4 (Sept 27-Oct 1)
```

**After:**
```
☑ Week 1 (Sept 6-12)
☑ Week 2 (Sept 13-19)
☑ Week 3 (Sept 20-26)
☑ Week 4 (Sept 27-Oct 3)
☑ Week 5 (Oct 4-10)         [Current]  ← Bold, highlighted
☐ Week 6 (Oct 11-17)
☐ Week 7 (Oct 18-24)
☐ Week 8 (Oct 25-29)
```

## Notes

- **Week 4 End Date:** Corrected from Oct 1 → Oct 3 (proper 7-day week)
- **Default Selection:** Weeks 1-5 (all past + current week)
- **Future Weeks:** Shown but unchecked by default
- **Current Week Badge:** Blue "Current" badge appears next to active week

## Testing

**Verify current week:**
```bash
curl http://localhost:3000/api/cohort/weeks | jq '.currentWeek'
# Should return: 5 (as of Oct 4, 2025)
```

**Verify week count:**
```bash
curl http://localhost:3000/api/cohort/weeks | jq '.weeks | length'
# Should return: 8
```

---

**Status:** ✅ IMPLEMENTED
**Impact:** All week selections now dynamically calculate from cohort config
**Future-Proof:** System automatically adjusts as cohort progresses
