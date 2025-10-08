# Final System Rules - September 2025 Cohort

## Confirmed Business Rules

### 1. ✅ Attendance Tracking

**Late Arrival Rules:**
- **Mon-Wed**: Late = after 6:30 PM (18:30)
- **Sat-Sun**: Late = after 10:00 AM (10:00)

**Attendance Calculation:**
- **Present = 'present' OR 'late'** (late counts as attended!)
- **Formula**: (present + late days) / 17 total days
- **Display**: "X/17 days (Y%)"
- **Example**: 8 late arrivals + 9 on-time = 17/17 days (100% attendance)

**Punctuality Calculation (Separate Metric)**:
- **Formula**: (on-time days / attended days) * 100
- **Example**: 9 on-time / 17 attended = 52.94% punctuality

### 2. ✅ Task Completion Tracking

**Completion Definition:**
- **ANY interaction** with a task counts as completed
- **Not just submissions** - includes conversations, work sessions, etc.

**Data Sources (BOTH required)**:
- `task_submissions`: 258 formal deliverables
- `task_threads`: 5,959 interaction records

**Correct Formula:**
```sql
COUNT(DISTINCT COALESCE(
  task_submissions.task_id,
  task_threads.task_id
))
```

**Critical Filtering:**
- Must filter task_id to September 2025 curriculum (103 tasks)
- Use subquery: `WHERE task_id IN (SELECT t.id FROM tasks WHERE cohort = 'Sept 2025')`

**Results with Correct Tracking:**
- Joshua Viera: 96/103 tasks (93.20%) ✅
- Top performers: 50-90% range
- Much more accurate than submissions-only (which showed ~7%)

### 3. ✅ Engagement Score

**Formula (Equal Weight)**:
```
(attendance% + task_completion% + punctuality%) / 3
```

**Example Calculations:**
- **Ergash Ruzehaji**: (100% + 6.80% + 100%) / 3 = 68.93%
- **Manuel Roman**: (100% + 6.80% + 94.12%) / 3 = 66.97%
- **David Sanchez**: (47.06% + ??% + 100%) / 3 = lower score

### 4. ✅ Enrollment & Missing Data

**Enrollment Date**: September 6, 2025 (ALL builders)
- No late enrollments
- Everyone started on day 1
- 17/17 = 100% attendance is achievable for all

**Missing Days Context:**
- David Sanchez: 8/17 days (47%) = missed 9 days since enrollment
- This is concerning (not a late enrollment situation)

### 5. ✅ Time-Based Query Rules

**ALWAYS ask for time period when query mentions:**
- "trends"
- "over time"
- "history"
- "recent"
- "this week/month"
- Any temporal reference

**Clarification Options**:
1) All time (Sept 6-29, 2025 - full cohort to date)
2) Current week
3) Last 7 days
4) Specific date range (ask for start/end)

### 6. ✅ Cohort Filtering

**September 2025 Cohort**:
- Start date: September 6, 2025
- Current date: September 29, 2025
- Duration: 17 class days
- Schedule: Mon-Wed + Sat-Sun
- Total tasks: 103
- Active builders: 75 (after exclusions)

**Excluded User IDs**:
- 129: Afiya Augustine (staff)
- 5: Greg Hogue (staff)
- 240, 326: Carlos Godoy (staff/duplicate)
- 324: Farid Sofizada (duplicate account)
- 325: Aaron Glaser (inactive)
- 9: Laziah Bernstine (inactive)

---

## Database Table Relationships

### Task Completion Chain:
```
users (cohort = 'Sept 2025')
  ← task_submissions (formal deliverables)
  ← task_threads (conversations/interactions)

Both joined with:
  task_id IN (
    tasks → time_blocks → curriculum_days WHERE cohort = 'Sept 2025'
  )
```

### Attendance Chain:
```
users (cohort = 'Sept 2025')
  ← builder_attendance_new (check-ins)

Filter: status IN ('present', 'late')
Calculate: count / 17 days
```

### Engagement Chain:
```
Attendance % (from builder_attendance_new)
  + Task Completion % (from task_submissions + task_threads)
  + Punctuality % (from builder_attendance_new where status = 'present')
  / 3
```

---

## Query Examples with Correct Logic

### Example 1: Task Completion by Builder
```sql
SELECT
  u.first_name,
  u.last_name,
  COUNT(DISTINCT COALESCE(ts.task_id, tt.task_id)) as tasks_completed,
  ROUND((COUNT(DISTINCT COALESCE(ts.task_id, tt.task_id)) / 103.0) * 100, 2) as completion_percentage
FROM users u
LEFT JOIN task_submissions ts ON u.user_id = ts.user_id
  AND ts.task_id IN (
    SELECT t.id FROM tasks t
    JOIN time_blocks tb ON t.block_id = tb.id
    JOIN curriculum_days cd ON tb.day_id = cd.id
    WHERE cd.cohort = 'September 2025'
  )
LEFT JOIN task_threads tt ON u.user_id = tt.user_id
  AND tt.task_id IN (
    SELECT t.id FROM tasks t
    JOIN time_blocks tb ON t.block_id = tb.id
    JOIN curriculum_days cd ON tb.day_id = cd.id
    WHERE cd.cohort = 'September 2025'
  )
WHERE u.cohort = 'September 2025'
  AND u.active = true
  AND u.user_id NOT IN (129, 5, 240, 324, 325, 326, 9)
GROUP BY u.user_id, u.first_name, u.last_name
ORDER BY completion_percentage DESC
```

**Result**: Joshua Viera 96/103 (93.20%) ✅

### Example 2: Attendance with Punctuality
```sql
SELECT
  u.first_name,
  u.last_name,
  COUNT(DISTINCT CASE WHEN ba.status IN ('present', 'late') THEN ba.attendance_date END) as days_attended,
  CONCAT(
    COUNT(DISTINCT CASE WHEN ba.status IN ('present', 'late') THEN ba.attendance_date END),
    '/17 days (',
    ROUND((COUNT(DISTINCT CASE WHEN ba.status IN ('present', 'late') THEN ba.attendance_date END)::numeric / 17) * 100, 2),
    '%)'
  ) as attendance_rate,
  ROUND((COUNT(CASE WHEN ba.status = 'present' THEN 1 END)::numeric / NULLIF(COUNT(CASE WHEN ba.status IN ('present', 'late') THEN 1 END), 0)) * 100, 2) as punctuality_percentage
FROM users u
LEFT JOIN builder_attendance_new ba ON u.user_id = ba.user_id
WHERE u.cohort = 'September 2025'
  AND u.active = true
  AND u.user_id NOT IN (129, 5, 240, 324, 325, 326, 9)
GROUP BY u.user_id, u.first_name, u.last_name
ORDER BY days_attended DESC, punctuality_percentage DESC
```

**Result**: "17/17 days (100%)" format ✅

### Example 3: Engagement Score
```sql
WITH metrics AS (
  SELECT
    u.user_id,
    u.first_name,
    u.last_name,
    -- Attendance %
    ROUND((COUNT(DISTINCT CASE WHEN ba.status IN ('present', 'late') THEN ba.attendance_date END)::numeric / 17) * 100, 2) as attendance_pct,
    -- Punctuality %
    ROUND((COUNT(CASE WHEN ba.status = 'present' THEN 1 END)::numeric / NULLIF(COUNT(CASE WHEN ba.status IN ('present', 'late') THEN 1 END), 0)) * 100, 2) as punctuality_pct,
    -- Task completion %
    ROUND((COUNT(DISTINCT COALESCE(ts.task_id, tt.task_id))::numeric / 103) * 100, 2) as task_completion_pct
  FROM users u
  LEFT JOIN builder_attendance_new ba ON u.user_id = ba.user_id
  LEFT JOIN task_submissions ts ON u.user_id = ts.user_id AND ts.task_id IN (sept_tasks)
  LEFT JOIN task_threads tt ON u.user_id = tt.user_id AND tt.task_id IN (sept_tasks)
  WHERE u.cohort = 'September 2025'
  GROUP BY u.user_id, u.first_name, u.last_name
)
SELECT
  first_name,
  last_name,
  attendance_pct,
  task_completion_pct,
  punctuality_pct,
  ROUND((attendance_pct + task_completion_pct + COALESCE(punctuality_pct, 0)) / 3, 2) as engagement_score
FROM metrics
ORDER BY engagement_score DESC
```

---

## Critical Differences (Before vs After)

### Task Completion:
| Metric | Before (Wrong) | After (Correct) |
|--------|---------------|----------------|
| Data Source | task_submissions only | submissions + threads |
| Joshua Viera | 7 tasks (6.80%) | 96 tasks (93.20%) |
| Records Used | 258 | 6,217 combined |
| Accuracy | ❌ Severely underreported | ✅ Accurate |

### Attendance:
| Metric | Before | After |
|--------|--------|-------|
| Late Status | Might count as absent | ✅ Counts as present |
| Format | Raw count | "X/17 days (Y%)" |
| All Enrolled | Unknown | ✅ Sept 6, 2025 |

---

## Display Guidelines

### Use Table Format For:
- Builder lists with multiple columns
- Detailed data (>10 rows)
- Task completion by builder
- Engagement scores

### Use Bar Chart For:
- Comparing categories (tasks by type)
- Attendance by day of week
- Count comparisons

### Use Line Chart For:
- Trends over time
- Daily/weekly patterns
- Progress tracking

---

## Validation Checklist for AI

Before generating SQL, verify:
- ✅ Uses BOTH task_submissions AND task_threads (for completion)
- ✅ Filters task_id to Sept 2025 curriculum (subquery)
- ✅ Status IN ('present', 'late') for attendance
- ✅ Denominator = 17 for attendance
- ✅ Denominator = 103 for task completion
- ✅ Excludes specified user IDs
- ✅ Filters users by cohort = 'September 2025'
- ✅ Asks for time period if query is time-based

---

## Status

**All rules confirmed and implemented** ✅
- Accurate completion tracking (submissions + threads)
- Correct attendance logic (late = present)
- Proper punctuality calculation (separate from attendance)
- Equal-weight engagement score
- Universal enrollment date (Sept 6, 2025)
- Time-based queries require clarification

**Ready for production use!**
