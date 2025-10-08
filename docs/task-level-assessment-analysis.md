# Task-Level Assessment Data Structure Analysis

**Database:** segundo-db
**Table:** task_analyses
**Analysis Date:** 2025-10-07

---

## Executive Summary

The `task_analyses` table contains **1,434 task assessments** across **199 unique tasks** and **170 unique builders**. All records include completion scores (0-100 scale), with an average quality score of **71.89**. Assessment coverage is currently at **16.0%** (199 assessed tasks out of 1,242 total tasks).

### Key Findings:
- ✅ **100% of records have completion_score** - no missing data
- ⚠️ **Multiple assessments per task/user pair** - many builders have 2+ assessments for same task
- 📊 **61.4% of assessments are "Strong" (80-100)** - indicates high overall quality
- 🎯 **Scores range from 0 to 100** - stored as integers, not decimals
- 🔄 **Two analysis types**: conversation (59.6%) and deliverable (40.4%)

---

## 1. Database Schema

### task_analyses Table Structure

```sql
Column              | Type                        | Nullable | Default
--------------------+-----------------------------+----------+------------------
id                  | integer                     | NOT NULL | nextval(...)
task_id             | integer                     | NULL     |
user_id             | integer                     | NOT NULL |
analysis_type       | varchar(20)                 | NOT NULL |
analysis_result     | jsonb                       | NOT NULL |
feedback            | text                        | NULL     |
created_at          | timestamp without time zone | NULL     | CURRENT_TIMESTAMP
updated_at          | timestamp without time zone | NULL     | CURRENT_TIMESTAMP
```

**Primary Key:** `id`
**Foreign Keys:**
- `task_id` → `tasks(id)` ON DELETE CASCADE
- No explicit foreign key on `user_id` (should reference users table)

**Indexes:**
- Primary key on `id`

---

## 2. Analysis Result JSONB Structure

The `analysis_result` JSONB field contains structured assessment data with consistent keys:

### Standard Keys (Present in ALL 1,434 records):
- `completion_score` (integer, 0-100)
- `criteria_met` (array of strings)
- `specific_findings` (object with nested scores)
- `areas_for_improvement` (array of strings)

### Typo Keys (Data Quality Issues):
- `areas_for_implementation` (187 records) - typo variant
- `areas_for_imovement` (27 records) - typo variant
- `areas_for_implement` (1 record) - typo variant

### Sample JSONB Structure:

```json
{
  "completion_score": 90,
  "criteria_met": [
    "Clearly defined problem and solution",
    "In-depth technical description",
    "Effective use of structured outline"
  ],
  "specific_findings": {
    "presentation": {
      "score": 85,
      "strengths": ["Well-structured outline format"],
      "weaknesses": ["No mention of visual aids"]
    },
    "content_quality": {
      "score": 95,
      "strengths": ["Highly accurate and factual content"],
      "weaknesses": ["Lacks specific real-world examples"]
    }
  },
  "areas_for_improvement": [
    "Incorporation of more specific case studies",
    "Enhance visual elements in the presentation"
  ]
}
```

---

## 3. Assessment Statistics

### Overall Coverage

| Metric | Count | Percentage |
|--------|-------|------------|
| Total tasks in system | 1,242 | 100% |
| Tasks with assessments | 199 | 16.0% |
| Total assessments recorded | 1,434 | - |
| Unique builders assessed | 170 | - |

### Score Distribution

| Score Range | Count | Percentage | Category |
|-------------|-------|------------|----------|
| 80-100 | 881 | 61.4% | Strong |
| 60-79 | 261 | 18.2% | Proficient |
| 40-59 | 156 | 10.9% | Developing |
| 0-39 | 136 | 9.5% | Needs Support |

**Statistical Summary:**
- **Minimum Score:** 0
- **Maximum Score:** 100
- **Average Score:** 71.89
- **Records with Score:** 1,434 (100%)

### Analysis Type Distribution

| Analysis Type | Count | Percentage |
|---------------|-------|------------|
| conversation | 854 | 59.6% |
| deliverable | 580 | 40.4% |

---

## 4. Data Granularity Analysis

### Question: One score per (task_id, user_id) pair?

**Answer: NO** - Multiple assessments exist for many task/user combinations.

**Evidence:**
- Task 1032: 64 assessments for 30 unique builders (2.13 avg per builder)
- Task 1020: 59 assessments for 30 unique builders (1.97 avg per builder)
- Task 1023: 62 assessments for 34 unique builders (1.82 avg per builder)

**Implications:**
- Some builders submitted/revised work multiple times
- System may store assessment history (versioning)
- Query logic must decide: use LATEST? use AVERAGE? use MAX?

### Recommended Approach for Scoring:

```sql
-- Option 1: Use LATEST assessment per task/user
WITH latest_assessments AS (
  SELECT DISTINCT ON (task_id, user_id)
    task_id, user_id,
    CAST(analysis_result->>'completion_score' AS NUMERIC) as score,
    created_at
  FROM task_analyses
  WHERE analysis_result ? 'completion_score'
  ORDER BY task_id, user_id, created_at DESC
)
SELECT AVG(score) as cohort_avg FROM latest_assessments;

-- Option 2: Use MAX score per task/user (most generous)
SELECT
  task_id, user_id,
  MAX(CAST(analysis_result->>'completion_score' AS NUMERIC)) as best_score
FROM task_analyses
WHERE analysis_result ? 'completion_score'
GROUP BY task_id, user_id;
```

---

## 5. Sample Data Queries

### Query 1: Cohort Average Quality Score

```sql
-- Cohort average (using latest assessment per builder per task)
WITH latest_assessments AS (
  SELECT DISTINCT ON (task_id, user_id)
    task_id, user_id,
    CAST(analysis_result->>'completion_score' AS NUMERIC) as score,
    created_at
  FROM task_analyses
  WHERE analysis_result ? 'completion_score'
  ORDER BY task_id, user_id, created_at DESC
)
SELECT
  COUNT(*) as total_assessments,
  COUNT(DISTINCT user_id) as unique_builders,
  COUNT(DISTINCT task_id) as unique_tasks,
  ROUND(AVG(score), 1) as cohort_avg_quality,
  ROUND(MIN(score), 1) as min_score,
  ROUND(MAX(score), 1) as max_score
FROM latest_assessments;
```

### Query 2: Task-Level Quality Averages (Hardest Tasks)

```sql
-- Tasks where builders struggle most (min 5 builders assessed)
WITH latest_assessments AS (
  SELECT DISTINCT ON (ta.task_id, ta.user_id)
    ta.task_id, ta.user_id,
    CAST(ta.analysis_result->>'completion_score' AS NUMERIC) as score,
    ta.created_at
  FROM task_analyses ta
  WHERE ta.analysis_result ? 'completion_score'
  ORDER BY ta.task_id, ta.user_id, ta.created_at DESC
)
SELECT
  la.task_id,
  LEFT(t.intro, 100) as task_intro_preview,
  COUNT(DISTINCT la.user_id) as builders_assessed,
  ROUND(AVG(la.score), 1) as avg_quality_score,
  ROUND(MIN(la.score), 1) as min_score,
  ROUND(MAX(la.score), 1) as max_score
FROM latest_assessments la
JOIN tasks t ON la.task_id = t.id
GROUP BY la.task_id, t.intro
HAVING COUNT(DISTINCT la.user_id) >= 5
ORDER BY avg_quality_score ASC
LIMIT 20;
```

**Sample Results (Lowest Scoring Tasks):**

| task_id | task_intro_preview | builders_assessed | avg_quality_score |
|---------|-------------------|-------------------|-------------------|
| 566 | "Time to master problem definition and problem statements..." | 18 | 33.8 |
| 523 | "Welcome to Week 3! Time to level up your AI skills..." | 14 | 38.6 |
| 592 | "Time to showcase your workflow automation projects!" | 5 | 39.0 |
| 527 | "Time to analyze how LLMs like ChatGPT learn..." | 7 | 40.7 |

### Query 3: Builder-Level Quality Scores (Drill-Down)

```sql
-- Individual builder performance across all tasks
WITH latest_assessments AS (
  SELECT DISTINCT ON (task_id, user_id)
    task_id, user_id,
    CAST(analysis_result->>'completion_score' AS NUMERIC) as score,
    created_at
  FROM task_analyses
  WHERE analysis_result ? 'completion_score'
  ORDER BY task_id, user_id, created_at DESC
)
SELECT
  user_id,
  COUNT(DISTINCT task_id) as tasks_completed,
  ROUND(AVG(score), 1) as avg_quality_score,
  ROUND(MIN(score), 1) as min_score,
  ROUND(MAX(score), 1) as max_score,
  CASE
    WHEN AVG(score) >= 80 THEN 'Strong'
    WHEN AVG(score) >= 60 THEN 'Proficient'
    WHEN AVG(score) >= 40 THEN 'Developing'
    ELSE 'Needs Support'
  END as performance_category
FROM latest_assessments
GROUP BY user_id
HAVING COUNT(DISTINCT task_id) >= 5
ORDER BY avg_quality_score DESC;
```

**Sample Results (Top Performers):**

| user_id | tasks_completed | avg_quality_score | performance_category |
|---------|----------------|-------------------|---------------------|
| 245 | 13 | 90.5 | Strong |
| 282 | 5 | 86.8 | Strong |
| 265 | 9 | 86.4 | Strong |
| 83 | 10 | 86.2 | Strong |

**Sample Results (Needs Support):**

| user_id | tasks_completed | avg_quality_score | performance_category |
|---------|----------------|-------------------|---------------------|
| 6 | 5 | 12.0 | Needs Support |
| 147 | 5 | 42.9 | Developing |
| 314 | 5 | 44.0 | Developing |
| 264 | 5 | 49.0 | Developing |

### Query 4: Task Completion vs Assessment Coverage

```sql
-- Compare task submissions to assessments
SELECT
  t.id as task_id,
  LEFT(t.intro, 80) as task_preview,
  COUNT(DISTINCT ts.user_id) as total_submissions,
  COUNT(DISTINCT ta.user_id) as assessed_submissions,
  CASE
    WHEN COUNT(DISTINCT ts.user_id) > 0 THEN
      ROUND((COUNT(DISTINCT ta.user_id)::NUMERIC /
             COUNT(DISTINCT ts.user_id)::NUMERIC) * 100, 1)
    ELSE 0
  END as assessment_coverage_pct
FROM tasks t
LEFT JOIN task_submissions ts ON t.id = ts.task_id
LEFT JOIN task_analyses ta ON t.id = ta.task_id
GROUP BY t.id, t.intro
HAVING COUNT(DISTINCT ts.user_id) > 0
ORDER BY assessment_coverage_pct ASC
LIMIT 20;
```

### Query 5: Builder Task-Level Detail (Specific Drill-Down)

```sql
-- Get all task scores for a specific builder
WITH latest_assessments AS (
  SELECT DISTINCT ON (task_id, user_id)
    task_id, user_id,
    CAST(analysis_result->>'completion_score' AS NUMERIC) as score,
    analysis_type,
    created_at
  FROM task_analyses
  WHERE analysis_result ? 'completion_score'
  ORDER BY task_id, user_id, created_at DESC
)
SELECT
  la.task_id,
  LEFT(t.intro, 100) as task_intro,
  la.score,
  la.analysis_type,
  la.created_at::date as assessed_date
FROM latest_assessments la
JOIN tasks t ON la.task_id = t.id
WHERE la.user_id = 245  -- Replace with specific user_id
ORDER BY la.created_at DESC;
```

---

## 6. Data Quality Issues

### Issue 1: Duplicate Assessments

**Problem:** Many task/user combinations have 2-10+ assessments.

**Impact:** Queries must handle duplicates explicitly.

**Recommendation:**
- Add UNIQUE constraint on (task_id, user_id) if only latest matters
- OR add `is_latest` boolean flag
- OR add `version_number` field

### Issue 2: Typos in JSONB Keys

**Problem:** Multiple variations of "areas_for_improvement":
- `areas_for_improvement` (correct, most common)
- `areas_for_implementation` (187 records)
- `areas_for_imovement` (27 records)
- `areas_for_implement` (1 record)

**Recommendation:**
```sql
-- Cleanup query to standardize keys
UPDATE task_analyses
SET analysis_result = analysis_result
  - 'areas_for_implementation'
  - 'areas_for_imovement'
  - 'areas_for_implement'
  || jsonb_build_object(
    'areas_for_improvement',
    COALESCE(
      analysis_result->'areas_for_improvement',
      analysis_result->'areas_for_implementation',
      analysis_result->'areas_for_imovement',
      analysis_result->'areas_for_implement',
      '[]'::jsonb
    )
  )
WHERE analysis_result ? 'areas_for_implementation'
   OR analysis_result ? 'areas_for_imovement'
   OR analysis_result ? 'areas_for_implement';
```

### Issue 3: Missing Task Titles

**Problem:** `tasks` table has `task_title` field, but queries show very long intro text. Task titles would be more readable in reports.

**Recommendation:** Use `t.task_title` instead of `t.intro` in reporting queries.

### Issue 4: Zero Scores

**Problem:** Many assessments have score = 0, which may indicate:
- Technical failures (as seen in "Technical issue with analysis" feedback)
- Incomplete submissions
- Actual zero performance

**Recommendation:**
- Filter WHERE score > 0 for quality analysis
- OR add `is_valid_assessment` flag to distinguish errors from real zeros

---

## 7. Recommended Query Templates

### Template 1: Cohort Average (Latest Assessments Only)

```sql
WITH latest_assessments AS (
  SELECT DISTINCT ON (task_id, user_id)
    task_id, user_id,
    CAST(analysis_result->>'completion_score' AS NUMERIC) as score,
    created_at
  FROM task_analyses
  WHERE analysis_result ? 'completion_score'
    AND CAST(analysis_result->>'completion_score' AS NUMERIC) > 0  -- Exclude errors
  ORDER BY task_id, user_id, created_at DESC
)
SELECT
  ROUND(AVG(score), 1) as cohort_avg_quality_score
FROM latest_assessments;
```

### Template 2: Task Performance Heatmap

```sql
WITH latest_assessments AS (
  SELECT DISTINCT ON (task_id, user_id)
    task_id, user_id,
    CAST(analysis_result->>'completion_score' AS NUMERIC) as score,
    created_at
  FROM task_analyses
  WHERE analysis_result ? 'completion_score'
    AND CAST(analysis_result->>'completion_score' AS NUMERIC) > 0
  ORDER BY task_id, user_id, created_at DESC
)
SELECT
  la.task_id,
  t.task_title,
  COUNT(DISTINCT la.user_id) as builders_assessed,
  ROUND(AVG(la.score), 1) as avg_score,
  CASE
    WHEN AVG(la.score) >= 80 THEN 'Strong'
    WHEN AVG(la.score) >= 60 THEN 'Proficient'
    WHEN AVG(la.score) >= 40 THEN 'Developing'
    ELSE 'Needs Support'
  END as task_difficulty
FROM latest_assessments la
JOIN tasks t ON la.task_id = t.id
GROUP BY la.task_id, t.task_title
HAVING COUNT(DISTINCT la.user_id) >= 5
ORDER BY avg_score DESC;
```

### Template 3: Builder Progress Over Time

```sql
WITH latest_assessments AS (
  SELECT DISTINCT ON (task_id, user_id)
    task_id, user_id,
    CAST(analysis_result->>'completion_score' AS NUMERIC) as score,
    created_at
  FROM task_analyses
  WHERE analysis_result ? 'completion_score'
    AND CAST(analysis_result->>'completion_score' AS NUMERIC) > 0
    AND user_id = $1  -- Parameter: specific builder
  ORDER BY task_id, user_id, created_at DESC
)
SELECT
  DATE_TRUNC('week', la.created_at) as week_start,
  COUNT(DISTINCT la.task_id) as tasks_completed,
  ROUND(AVG(la.score), 1) as avg_weekly_score
FROM latest_assessments la
GROUP BY DATE_TRUNC('week', la.created_at)
ORDER BY week_start;
```

### Template 4: Rubric Breakdown

```sql
-- Extract specific_findings scores for detailed rubric analysis
WITH latest_assessments AS (
  SELECT DISTINCT ON (task_id, user_id)
    task_id, user_id,
    analysis_result,
    created_at
  FROM task_analyses
  WHERE jsonb_typeof(analysis_result->'specific_findings') = 'object'
  ORDER BY task_id, user_id, created_at DESC
),
rubric_scores AS (
  SELECT
    la.task_id,
    la.user_id,
    sf.key as rubric_criterion,
    CAST(sf.value->>'score' AS NUMERIC) as criterion_score
  FROM latest_assessments la,
  LATERAL jsonb_each(la.analysis_result->'specific_findings') sf
  WHERE sf.value ? 'score'
)
SELECT
  rubric_criterion,
  COUNT(*) as assessments_with_criterion,
  ROUND(AVG(criterion_score), 1) as avg_criterion_score,
  ROUND(MIN(criterion_score), 1) as min_score,
  ROUND(MAX(criterion_score), 1) as max_score
FROM rubric_scores
GROUP BY rubric_criterion
ORDER BY avg_criterion_score DESC;
```

---

## 8. Key Takeaways

1. **Data Structure is Robust:** All 1,434 records have completion_score, no nulls.

2. **Score Scale:** Integer values 0-100 (not decimals like 0.0-1.0).

3. **Multiple Assessments:** Many tasks have 2+ assessments per builder. Queries MUST use DISTINCT ON or GROUP BY to avoid double-counting.

4. **High Overall Quality:** 61.4% of assessments score 80+, suggesting strong builder performance or lenient grading.

5. **Low Coverage:** Only 16% of tasks have assessment data. Coverage analysis is important.

6. **Rich Rubric Data:** The `specific_findings` JSONB contains nested rubric scores with strengths/weaknesses per criterion.

7. **Data Quality Needs Attention:** Typos in JSONB keys and zero-score records indicate areas for data cleanup.

---

## 9. Next Steps

1. **Data Cleanup:**
   - Standardize JSONB key typos
   - Flag/remove erroneous zero-score assessments
   - Add unique constraints or version tracking

2. **Analysis Enhancement:**
   - Implement "latest assessment" logic in application layer
   - Build rubric-specific reports from `specific_findings`
   - Create time-series views for builder progress tracking

3. **Coverage Expansion:**
   - Prioritize assessment of high-enrollment tasks
   - Automate assessment generation where possible
   - Track assessment completion rate as KPI

4. **Reporting Dashboard:**
   - Cohort average quality score (overall)
   - Task difficulty rankings (identify struggling areas)
   - Builder performance profiles (individual progress)
   - Assessment coverage tracking (operational metric)

---

**Report Generated:** 2025-10-07
**Database:** segundo-db (PostgreSQL)
**Analyst:** Claude Code
