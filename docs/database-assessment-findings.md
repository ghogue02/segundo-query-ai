# PostgreSQL Assessment/Quality Scoring Data - Investigation Report

**Date:** October 7, 2025
**Database:** segundo-db (34.57.101.141:5432)
**Investigation:** Quality scoring and assessment data structure

---

## Executive Summary

✅ **INDIVIDUAL BUILDER QUALITY SCORES EXIST**

The PostgreSQL database contains comprehensive per-builder quality scoring data in the `task_analyses` table. Each builder has individual scores for each task they complete, with detailed rubric-based assessments.

---

## Key Findings

### 1. Primary Scoring Table: `task_analyses`

**Location:** `task_analyses` table in PostgreSQL database

**Schema:**
```sql
id                    INTEGER      (Primary key)
task_id               INTEGER      (Links to tasks table)
user_id               INTEGER      (Links to users table)
analysis_type         VARCHAR      (Type: 'conversation', 'deliverable')
analysis_result       JSONB        (Contains all scoring data)
feedback              TEXT         (Text feedback for builder)
created_at            TIMESTAMP    (When analysis was created)
updated_at            TIMESTAMP    (Last update time)
```

### 2. Scoring Structure (JSONB)

The `analysis_result` column contains:

```json
{
  "completion_score": 85,           // Overall score (0-100)
  "criteria_met": [                 // Array of criteria passed
    "Technical Skills",
    "Business Value",
    "Completeness"
  ],
  "specific_findings": {            // Detailed rubric scores
    "Technical Skills": {
      "score": 90,
      "strengths": ["..."],
      "weaknesses": ["..."]
    },
    "Business Value": {
      "score": 85,
      "strengths": ["..."],
      "weaknesses": ["..."]
    }
  }
}
```

### 3. Database Statistics

- **Total Quality Analyses:** 1,428 records
- **Unique Users Scored:** 167 builders
- **Unique Tasks Scored:** 199 tasks
- **Average Score:** 72.0 (out of 100)
- **Score Range:** 0-100
- **Excluded Staff IDs:** 129, 5, 240, 324, 325, 326, 9

### 4. Evaluation Criteria

The system tracks **hundreds of different criteria**, including:

**Core Rubric Categories:**
- Technical Skills
- Business Value
- Innovation
- Problem Clarity
- User Value
- Market Fit
- Scalability/Extensibility
- Robustness
- Completeness
- Technical Difficulty

**Per-Criterion Metrics:**
- Individual score (0-100)
- Strengths (array of strings)
- Weaknesses (array of strings)

### 5. Top Performers (Sample)

| User ID | Name              | Tasks Scored | Avg Score |
|---------|-------------------|--------------|-----------|
| 252     | Joey Mejias       | 1            | 95.00     |
| 245     | Mamoudou Keita    | 20           | 90.50     |
| 146     | William Ortega    | 2            | 90.00     |
| 283     | Triane Peart      | 2            | 90.00     |
| 251     | Ratul Sharma      | 2            | 90.00     |
| 278     | Kevin Natera      | 4            | 89.25     |
| 260     | Paula Lawton      | 3            | 88.67     |
| 255     | Shaibdeep Atwal   | 7            | 87.57     |

---

## Data Availability for Dashboard

### ✅ Available Individual Metrics

1. **Per-Builder Scores:**
   - Average quality score per builder
   - Score distribution per builder
   - Task completion count per builder
   - Criterion-level breakdown per builder

2. **Per-Task Scores:**
   - Average score per task
   - Score distribution per task
   - Submission count per task

3. **Detailed Rubric Data:**
   - Individual scores for each rubric criterion
   - Strengths and weaknesses per criterion
   - Criteria met/not met arrays

4. **Time-Series Data:**
   - Scores over time (via `created_at`)
   - Progress tracking per builder
   - Cohort trends

5. **Qualitative Feedback:**
   - Text feedback per submission
   - Specific findings per criterion
   - Areas for improvement

### ✅ Available for Quality Metrics Dashboard

**Individual Builder View:**
```sql
-- Get builder's average quality score
SELECT
  user_id,
  COUNT(*) as task_count,
  ROUND(AVG(CAST(analysis_result->>'completion_score' AS NUMERIC)), 2) as avg_score
FROM task_analyses
WHERE user_id = $1
  AND analysis_result ? 'completion_score'
GROUP BY user_id;
```

**Criterion Breakdown:**
```sql
-- Get builder's scores by criterion
SELECT
  user_id,
  analysis_result->'specific_findings' as criterion_scores
FROM task_analyses
WHERE user_id = $1
  AND analysis_result ? 'specific_findings';
```

**Cohort Comparison:**
```sql
-- Compare builder to cohort average
SELECT
  AVG(CAST(analysis_result->>'completion_score' AS NUMERIC)) as cohort_avg
FROM task_analyses
WHERE user_id NOT IN (129, 5, 240, 324, 325, 326, 9)
  AND analysis_result ? 'completion_score';
```

---

## Related Tables

### `assessment_submissions`
- Contains raw submission data
- Links to user_id and assessment_id
- Has submission_data (JSONB) with deliverables
- 256 records total

### `assessment_templates`
- Defines assessment structures
- Not directly related to quality scoring

### `application_analysis`
- Contains application screening scores (separate from task quality)
- Used for admissions, not curriculum quality tracking

### `task_pattern_analysis`
- Contains pattern analysis data (separate system)
- Different from quality scoring

---

## Sample Query for Dashboard

```sql
-- Get comprehensive quality metrics for a builder
SELECT
  u.user_id,
  u.first_name,
  u.last_name,
  u.email,
  COUNT(ta.id) as total_scored_tasks,
  ROUND(AVG(CAST(ta.analysis_result->>'completion_score' AS NUMERIC)), 2) as avg_quality_score,
  MIN(CAST(ta.analysis_result->>'completion_score' AS INTEGER)) as min_score,
  MAX(CAST(ta.analysis_result->>'completion_score' AS INTEGER)) as max_score,
  jsonb_agg(
    jsonb_build_object(
      'task_id', ta.task_id,
      'score', ta.analysis_result->>'completion_score',
      'criteria_met', ta.analysis_result->'criteria_met',
      'date', ta.created_at
    )
    ORDER BY ta.created_at DESC
  ) as score_history
FROM users u
LEFT JOIN task_analyses ta ON u.user_id = ta.user_id
WHERE u.user_id = $1
  AND ta.analysis_result ? 'completion_score'
GROUP BY u.user_id, u.first_name, u.last_name, u.email;
```

---

## Recommendations for Dashboard Implementation

### 1. Quality Metrics Component

**Individual Builder Card:**
- Display average quality score (0-100)
- Show score trend line over time
- Display top 3 strengths from criterion analysis
- Show areas for improvement

**Criterion Breakdown:**
- Radar chart showing scores across all rubric criteria
- Bar chart comparing builder to cohort average per criterion
- List of criteria met vs. not met

**Task Quality Distribution:**
- Histogram of builder's scores across all tasks
- Comparison to cohort distribution

### 2. API Endpoints Needed

```typescript
// Get builder quality summary
GET /api/quality/builder/:userId/summary

// Get builder criterion breakdown
GET /api/quality/builder/:userId/criteria

// Get builder score history
GET /api/quality/builder/:userId/history

// Get cohort comparison
GET /api/quality/cohort/comparison?userId=:userId
```

### 3. Database Views (Recommended)

Create materialized views for performance:

```sql
-- Builder quality summary view
CREATE MATERIALIZED VIEW builder_quality_summary AS
SELECT
  user_id,
  COUNT(*) as task_count,
  ROUND(AVG(CAST(analysis_result->>'completion_score' AS NUMERIC)), 2) as avg_score,
  MIN(CAST(analysis_result->>'completion_score' AS INTEGER)) as min_score,
  MAX(CAST(analysis_result->>'completion_score' AS INTEGER)) as max_score
FROM task_analyses
WHERE analysis_result ? 'completion_score'
  AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9)
GROUP BY user_id;

-- Refresh periodically
REFRESH MATERIALIZED VIEW builder_quality_summary;
```

---

## Conclusion

✅ **Individual builder quality scores exist and are comprehensive**

The PostgreSQL `task_analyses` table contains all necessary data for building a detailed quality metrics dashboard. Each builder has:

1. Overall quality scores per task (0-100)
2. Detailed rubric criterion scores
3. Strengths and weaknesses per criterion
4. Text feedback
5. Time-series data for tracking progress

**Next Steps:**
1. Create API endpoints to query quality data
2. Build dashboard components to visualize scores
3. Add filtering by date range, cohort, and task type
4. Implement caching/materialized views for performance

---

## Files Generated

- `/scripts/explore-assessment-tables.ts` - Initial exploration script
- `/scripts/explore-task-scoring.ts` - Task scoring analysis
- `/scripts/analyze-quality-scores.ts` - Detailed quality score analysis
- `/docs/database-assessment-findings.md` - This report
