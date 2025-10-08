# Database Schema Reference
**Date:** October 2, 2025
**Source:** Existing working queries + Documentation
**Purpose:** Reference for metrics dashboard SQL queries

---

## 📊 Key Tables

### builder_attendance_new
**Purpose:** Daily attendance tracking

**Columns (from working queries):**
```sql
user_id         INTEGER   -- FK to users.user_id
attendance_date DATE      -- The date of attendance (NOT day_id!)
check_in_time   TIMESTAMP -- When they checked in
status          VARCHAR   -- 'present', 'absent', etc.
```

**Important:**
- ❌ Does NOT have `day_id` column
- ✅ Join using `attendance_date` to `curriculum_days.day_date`

**Correct JOIN pattern:**
```sql
LEFT JOIN builder_attendance_new ba
  ON ba.user_id = u.user_id
  AND ba.attendance_date = cd.day_date
```

---

### curriculum_days
**Columns:**
```sql
id          INTEGER   -- Primary key
day_number  INTEGER   -- Sequential day number
day_date    DATE      -- Calendar date
day_type    VARCHAR   -- Type of day
cohort      VARCHAR   -- 'September 2025', etc.
```

---

### task_submissions
**Columns:**
```sql
id              INTEGER
task_id         INTEGER -- FK to tasks
user_id         INTEGER -- FK to users
thread_content  TEXT    -- Submission text
created_at      TIMESTAMP
```

---

### users
**Columns:**
```sql
user_id     INTEGER
first_name  VARCHAR
last_name   VARCHAR
email       VARCHAR
cohort      VARCHAR
active      BOOLEAN
role        VARCHAR
```

---

## 🔧 Correct Query Patterns

### Attendance Rate Query
```sql
SELECT
  COUNT(DISTINCT CASE WHEN ba.status = 'present' THEN ba.attendance_date END)::FLOAT
  / NULLIF(COUNT(DISTINCT cd.id), 0) * 100 as attendance_pct
FROM curriculum_days cd
CROSS JOIN users u
LEFT JOIN builder_attendance_new ba
  ON ba.user_id = u.user_id
  AND ba.attendance_date = cd.day_date  -- JOIN on date, not day_id!
WHERE cd.cohort = 'September 2025'
  AND u.cohort = 'September 2025'
  AND u.active = true
  AND EXTRACT(DOW FROM cd.day_date) NOT IN (4, 5) -- Exclude Thu/Fri
```

### Builder Stats with Attendance
```sql
SELECT
  u.user_id,
  u.first_name || ' ' || u.last_name as name,
  -- Attendance %
  COUNT(DISTINCT ba.attendance_date)::FLOAT
  / NULLIF((SELECT COUNT(*) FROM curriculum_days WHERE cohort = 'September 2025'), 0) * 100 as attendance_pct
FROM users u
LEFT JOIN builder_attendance_new ba
  ON ba.user_id = u.user_id  -- No day_id join!
WHERE u.cohort = 'September 2025'
  AND u.active = true
GROUP BY u.user_id, u.first_name, u.last_name
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ WRONG (What we had)
```sql
LEFT JOIN builder_attendance_new ba ON ba.day_id = cd.id
```
**Error:** `column ba.day_id does not exist`

### ✅ CORRECT
```sql
LEFT JOIN builder_attendance_new ba
  ON ba.user_id = u.user_id
  AND ba.attendance_date = cd.day_date
```

---

## 🔍 Files That Need Fixing

Based on errors, these files have incorrect JOIN syntax:

1. **lib/metrics-calculations.ts**
   - Line 137: `ba.day_id = cd.id` → Fix to `ba.attendance_date = cd.day_date`
   - Line 179: Missing attendance_date join
   - Line 218: Missing attendance_date join

2. **app/api/metrics/hypotheses/h1/route.ts**
   - Line 33: Attendance join needs date match

3. **app/api/metrics/hypotheses/h2/route.ts**
   - Line 24: GROUP BY issue with curriculum_days.day_date

4. **app/api/metrics/hypotheses/h4/route.ts**
   - Line 39: `ba.day_id` → `ba.attendance_date`

---

**Next:** Fixing all SQL queries with correct schema
