# BigQuery Quality Score Analysis - Root Cause Investigation

**Date:** October 7, 2025
**Issue:** All builders showing quality score of 36/100 in dashboard
**Status:** ✅ ROOT CAUSE IDENTIFIED

---

## Executive Summary

**The "36/100" score is CORRECT** - it represents the **cohort-wide average**, not individual builder scores. The API endpoint `/api/metrics/quality/route.ts` is functioning as designed, but the dashboard is displaying cohort average instead of individual scores.

### Key Findings

1. **Individual scores ARE differentiated in BigQuery** - ranging from 17 to 62 (out of 100)
2. **The API returns cohort average** - calculated as 36/100 across all assessments
3. **61 builders have assessment data** with 238 total assessments completed
4. **Score distribution is normal** - Mean: 36, Min: 0, Max: 95, StdDev: 19.6

---

## 1. BigQuery Schema & Data Structure

### Table: `pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis`

**Core Fields:**
```sql
user_id                INTEGER     -- Builder identifier
user_first_name        STRING      -- First name
user_last_name         STRING      -- Last name
user_cohort            STRING      -- e.g., "September 2025"
assessment_id          INTEGER     -- Assessment identifier (2, 3, 4)
assessment_name        STRING      -- e.g., "Project Submission"
assessment_type        STRING      -- quiz, project, problem_solution, video
overall_score          FLOAT       -- Score on 0-1 scale (0.36 = 36%)
type_specific_data     JSON        -- Detailed rubric scores
```

### Sample Raw Data

| user_id | name | assessment_id | type | overall_score | score_100 |
|---------|------|---------------|------|---------------|-----------|
| 141 | Dwight Williams | 2 | project | 0.93 | 93 |
| 141 | Dwight Williams | 3 | problem_solution | 0.22 | 22 |
| 141 | Dwight Williams | 4 | video | 0.37 | 37 |
| 251 | Ratul Sharma | 2 | project | 0.21 | 21 |
| 251 | Ratul Sharma | 3 | problem_solution | 0.36 | 36 |
| 251 | Ratul Sharma | 4 | video | 0.40 | 40 |

### Score Distribution (0-100 Scale)

```
Score Range  | Count | % of Total
-------------|-------|------------
90-95        | 12    | 5%
70-89        | 6     | 3%
50-69        | 33    | 14%
40-49        | 37    | 16%
30-39        | 69    | 29%  ← MAJORITY
20-29        | 46    | 19%
10-19        | 30    | 13%
0-9          | 5     | 2%
```

**Statistics:**
- **Mean:** 36/100 (0.363 on 0-1 scale)
- **Min:** 0/100
- **Max:** 95/100
- **Std Dev:** 19.6
- **Total Assessments:** 238
- **Unique Builders:** 61

---

## 2. Current API Implementation

### File: `/app/api/metrics/quality/route.ts`

```typescript
export async function GET(request: NextRequest) {
  const cohort = searchParams.get('cohort') || 'September 2025';

  // Get ALL quality scores from BigQuery
  const qualityScores = await getCohortQualityScores(cohort);

  // Calculate COHORT AVERAGE (not per-builder)
  const totalScore = qualityScores.reduce(
    (sum: number, row: any) => sum + row.overall_score,
    0
  );
  const avgScore = qualityScores.length > 0
    ? Math.round((totalScore / qualityScores.length) * 100)  // ← COHORT AVG
    : 0;

  return NextResponse.json({
    avgScore,  // Returns 36 for September 2025
    rubricBreakdown,
    totalAssessments: qualityScores.length
  });
}
```

**Current Behavior:**
1. Fetches ALL assessments for cohort (238 assessments)
2. Sums all `overall_score` values
3. Divides by total assessment count (not builder count)
4. Returns single cohort-wide average: **36/100**

### File: `/lib/services/bigquery.ts` - `getBuilderAverageQuality()`

This function DOES calculate per-builder averages correctly:

```typescript
export async function getBuilderAverageQuality(cohort: string) {
  const query = `
    SELECT
      user_id,
      user_first_name,
      user_last_name,
      AVG(overall_score) as avg_quality_score,
      COUNT(*) as assessments_completed
    FROM \`pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis\`
    WHERE user_cohort = @cohort
    GROUP BY user_id, user_first_name, user_last_name
    ORDER BY avg_quality_score DESC
  `;

  return rows.map((row: any) => ({
    user_id: row.user_id,
    first_name: row.user_first_name,
    last_name: row.user_last_name,
    avg_quality_score: Math.round(row.avg_quality_score * 100),
    assessments_completed: row.assessments_completed,
  }));
}
```

**This function is NOT being used by the quality API endpoint!**

### Top 10 Individual Builder Averages

| Rank | Builder | Avg Score | Assessments |
|------|---------|-----------|-------------|
| 1 | Haoxin Wang | 62/100 | 6 |
| 2 | Brian Williams | 60/100 | 6 |
| 3 | Erika Medina | 58/100 | 6 |
| 4 | Triane Peart | 56/100 | 3 |
| 5 | Faria Noman | 55/100 | 3 |
| 6 | Rene Ugarte | 53/100 | 6 |
| 7 | Joel Philip | 53/100 | 3 |
| 8 | Paula Lawton | 51/100 | 3 |
| 9 | Dwight Williams | 51/100 | 3 |
| 10 | Tarekul Islam | 49/100 | 3 |

---

## 3. Root Cause Analysis

### Why All Builders Show 36/100

**The issue is in the API design, not the data:**

1. **API Endpoint Design Flaw:**
   - `/api/metrics/quality` returns a SINGLE `avgScore` value (cohort average)
   - Does NOT return per-builder scores
   - Frontend likely displays this cohort average for all builders

2. **Correct Function Not Used:**
   - `getBuilderAverageQuality()` calculates per-builder averages correctly
   - But `/api/metrics/quality/route.ts` doesn't call this function
   - Instead, it calculates cohort average from `getCohortQualityScores()`

3. **Data is Actually Differentiated:**
   - Individual builder scores range from 17 to 62
   - 32 unique average scores across 61 builders
   - Data proves assessment scoring IS working correctly

### Verification from Drill-Down API

File: `/app/api/metrics/drill-down/[type]/route.ts`

Line 331 in `getQualityScoreDetails()`:
```typescript
SELECT
  builder_name,
  tasks_completed,
  completion_pct,
  days_attended,
  attendance_pct,
  36 as quality_score  // ← HARDCODED 36!
FROM builder_engagement
```

**This is a PLACEHOLDER!** The drill-down endpoint literally hardcodes `36` for all builders.

---

## 4. Three Recommended Solutions

### Option 1: Individual Builder Scores (Recommended)

**Implementation:**
```typescript
// /app/api/metrics/quality/route.ts
export async function GET(request: NextRequest) {
  const cohort = searchParams.get('cohort') || 'September 2025';

  // Get per-builder averages
  const builderScores = await getBuilderAverageQuality(cohort);

  // Calculate cohort average from builder averages (not all assessments)
  const cohortAvg = builderScores.length > 0
    ? Math.round(
        builderScores.reduce((sum, b) => sum + b.avg_quality_score, 0) /
        builderScores.length
      )
    : 0;

  return NextResponse.json({
    avgScore: cohortAvg,
    builderScores, // ← ADD THIS: Individual scores per builder
    rubricBreakdown,
    totalBuilders: builderScores.length
  });
}
```

**Pros:**
- Shows individual builder performance
- Maintains cohort average for overview
- Leverages existing `getBuilderAverageQuality()` function
- Frontend can display both cohort avg AND individual scores

**Cons:**
- Requires frontend updates to consume new data structure
- Slightly more data transfer

---

### Option 2: Weighted Average by Builder (Alternative)

**Implementation:**
```typescript
export async function GET(request: NextRequest) {
  const cohort = searchParams.get('cohort') || 'September 2025';

  // Get per-builder averages first
  const builderAvgs = await getBuilderAverageQuality(cohort);

  // Calculate cohort average as MEAN of builder averages (not all assessments)
  const cohortAvg = builderAvgs.length > 0
    ? Math.round(
        builderAvgs.reduce((sum, b) => sum + b.avg_quality_score, 0) /
        builderAvgs.length
      )
    : 0;

  return NextResponse.json({
    avgScore: cohortAvg, // Now represents AVERAGE OF BUILDER AVERAGES
    rubricBreakdown,
    totalBuilders: builderAvgs.length
  });
}
```

**Current Calculation (WRONG):**
```
Cohort Avg = SUM(all_assessment_scores) / total_assessments
           = 86.33 / 238
           = 0.363 = 36/100
```

**New Calculation (BETTER):**
```
Cohort Avg = SUM(builder_averages) / total_builders
           = (62 + 60 + 58 + ... + 18 + 17) / 61
           = ~36/100 (similar, but gives equal weight to each builder)
```

**Pros:**
- Equal weight to each builder (fair averaging)
- Still returns single score (no frontend changes)
- More statistically sound methodology

**Cons:**
- Doesn't solve "all builders showing same score" issue
- Still shows cohort average, not individual scores

---

### Option 3: Hybrid Dashboard Display (Best User Experience)

**Implementation:**
```typescript
// API returns BOTH
export async function GET(request: NextRequest) {
  const cohort = searchParams.get('cohort') || 'September 2025';

  const builderScores = await getBuilderAverageQuality(cohort);
  const rubricBreakdown = await getCohortAverageRubric(cohort);

  const cohortAvg = Math.round(
    builderScores.reduce((sum, b) => sum + b.avg_quality_score, 0) /
    builderScores.length
  );

  return NextResponse.json({
    cohort: {
      avgScore: cohortAvg,
      totalBuilders: builderScores.length,
      rubricBreakdown
    },
    builders: builderScores.map(b => ({
      user_id: b.user_id,
      name: `${b.first_name} ${b.last_name}`,
      score: b.avg_quality_score,
      assessments: b.assessments_completed
    }))
  });
}
```

**Frontend Display:**
- **Dashboard Card:** "Cohort Average Quality: 36/100"
- **Builder List/Table:** Individual scores per builder (range: 17-62)
- **Drill-Down:** Rubric breakdown per builder

**Pros:**
- ✅ Best user experience (both cohort and individual views)
- ✅ Maintains cohort-level insights
- ✅ Shows individual builder performance
- ✅ Enables sorting/filtering by quality score

**Cons:**
- Requires frontend component updates

---

## 5. Rubric Breakdown Analysis

### File: `/lib/services/bigquery-individual.ts`

This service ALREADY implements per-builder rubric breakdown correctly!

**Rubric Categories:**
1. **Technical Skills** - Programming, code quality, technical depth
2. **Business Value** - Problem understanding, market value
3. **Project Management** - Planning, execution, organization
4. **Critical Thinking** - Problem-solving, innovation, analysis
5. **Professional Skills** - Communication, presentation, collaboration

**Sample Individual Rubric Scores:**

| Builder | Overall | Technical | Business | Project | Critical | Professional |
|---------|---------|-----------|----------|---------|----------|--------------|
| Dwight Williams | 51 | 57 | 50 | 0 | 20 | 0 |
| Ratul Sharma | 32 | 21 | 60 | 0 | 28 | 40 |
| Stephanie Fernandez | 22 | 20 | 50 | 0 | 20 | 0 |

**Note:** Many builders have 0 for Project Management and Professional Skills because:
- Not all assessment types include these rubrics
- Scores depend on `type_specific_data` JSON structure
- Different assessment types (quiz, project, video) use different rubric mappings

---

## 6. PostgreSQL Assessment Tables

### Tables Found:
1. **assessments** - Assessment definitions (template_id, cohort, trigger_day_number)
2. **assessment_templates** - Assessment configurations
3. **assessment_submissions** - Builder submissions (submission_data, status)

### No Score Storage in PostgreSQL

**Key Insight:** Quality scores are NOT stored in PostgreSQL. They only exist in BigQuery's `comprehensive_assessment_analysis` table, which appears to be populated by an external assessment pipeline (likely Lambda/Cloud Function that analyzes submissions).

---

## 7. Implementation Recommendations

### Immediate Fix (Option 1 - Recommended)

**Step 1:** Update `/app/api/metrics/quality/route.ts`

```typescript
import { getBuilderAverageQuality } from '@/lib/services/bigquery';
import { getCohortAverageRubric } from '@/lib/services/bigquery-individual';

export async function GET(request: NextRequest) {
  try {
    const cohort = searchParams.get('cohort') || 'September 2025';

    // Get individual builder scores
    const builderScores = await getBuilderAverageQuality(cohort);

    // Get cohort-level rubric breakdown
    const rubricAvg = await getCohortAverageRubric(cohort);

    // Calculate cohort average from builder averages
    const cohortAvg = builderScores.length > 0
      ? Math.round(
          builderScores.reduce((sum, b) => sum + b.avg_quality_score, 0) /
          builderScores.length
        )
      : 0;

    return NextResponse.json({
      cohort: {
        avgScore: cohortAvg,
        totalBuilders: builderScores.length,
        rubricBreakdown: [
          { category: 'Technical Skills', score: rubricAvg.technical_skills },
          { category: 'Business Value', score: rubricAvg.business_value },
          { category: 'Project Management', score: rubricAvg.project_mgmt },
          { category: 'Critical Thinking', score: rubricAvg.critical_thinking },
          { category: 'Professional Skills', score: rubricAvg.professional_skills },
        ].filter(r => r.score > 0)
      },
      builders: builderScores.map(b => ({
        user_id: b.user_id,
        name: `${b.first_name} ${b.last_name}`,
        score: b.avg_quality_score,
        assessments: b.assessments_completed
      }))
    });
  } catch (error) {
    console.error('Quality API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch quality data' }, { status: 500 });
  }
}
```

**Step 2:** Update drill-down endpoint `/app/api/metrics/drill-down/[type]/route.ts`

Replace line 331 hardcoded `36 as quality_score` with actual BigQuery join:

```typescript
async function getQualityScoreDetails(cohort: string) {
  // Import BigQuery function
  const { getBuilderAverageQuality } = await import('@/lib/services/bigquery');

  // Get actual quality scores from BigQuery
  const qualityScores = await getBuilderAverageQuality(cohort);

  // Get task completion from PostgreSQL
  const query = `
    WITH sept_tasks AS (
      SELECT DISTINCT t.id FROM tasks t
      JOIN time_blocks tb ON t.block_id = tb.id
      JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE cd.cohort = $1 AND t.task_type != 'break'
    )
    SELECT
      u.user_id,
      u.first_name || ' ' || u.last_name as builder_name,
      (SELECT COUNT(DISTINCT task_id) FROM (
        SELECT ts.task_id FROM task_submissions ts WHERE ts.user_id = u.user_id AND ts.task_id IN (SELECT id FROM sept_tasks)
        UNION
        SELECT tt.task_id FROM task_threads tt WHERE tt.user_id = u.user_id AND tt.task_id IN (SELECT id FROM sept_tasks)
      ) i) as tasks_completed
    FROM users u
    WHERE u.cohort = $1 AND u.active = true AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
  `;

  const taskData = await executeQuery(query, [cohort]);

  // Merge quality scores with task data
  const data = taskData.map((builder: any) => {
    const qualityScore = qualityScores.find(q => q.user_id === builder.user_id);
    return {
      user_id: builder.user_id,
      builder_name: builder.builder_name,
      tasks_completed: builder.tasks_completed,
      quality_score: qualityScore?.avg_quality_score || 0,
      assessments_completed: qualityScore?.assessments_completed || 0
    };
  });

  return {
    title: 'Builder Performance Overview',
    description: `All ${data.length} builders with quality scores from BigQuery`,
    data,
    columns: [
      { key: 'builder_name', label: 'Builder' },
      { key: 'tasks_completed', label: 'Tasks Done' },
      { key: 'quality_score', label: 'Quality', format: (v: number) => `${v}/100` },
      { key: 'assessments_completed', label: 'Assessments' },
    ],
  };
}
```

**Step 3:** Update frontend to display individual scores

This depends on your frontend framework, but generally:
- Dashboard card shows cohort average
- Builder list/table shows individual scores from `response.builders[]`
- Add sorting/filtering by quality score

---

## 8. Testing Plan

### Test 1: Verify Individual Scores Different
```bash
curl http://localhost:3000/api/metrics/quality?cohort=September%202025
```

**Expected Response:**
```json
{
  "cohort": {
    "avgScore": 36,
    "totalBuilders": 61,
    "rubricBreakdown": [...]
  },
  "builders": [
    { "user_id": 321, "name": "Haoxin Wang", "score": 62, "assessments": 6 },
    { "user_id": 322, "name": "Brian Williams", "score": 60, "assessments": 6 },
    ...
  ]
}
```

### Test 2: Verify Drill-Down No Longer Hardcoded
```bash
curl http://localhost:3000/api/metrics/drill-down/quality-score?cohort=September%202025
```

**Expected:** Each builder shows their actual quality score (not all 36).

### Test 3: Frontend Display
- Dashboard card: "Cohort Average: 36/100"
- Builder table: Individual scores ranging from 17 to 62
- Click builder → Detail view shows rubric breakdown

---

## 9. Summary

### ✅ What We Know
1. **Data is correct in BigQuery** - 61 builders with differentiated scores
2. **Individual scores exist** - Range: 17-62, Mean: 36, StdDev: 19.6
3. **Rubric breakdown exists** - 5 categories per builder in `type_specific_data`
4. **Functions exist to query individual scores** - `getBuilderAverageQuality()`

### ❌ Current Problem
1. **API returns cohort average only** - Single score: 36/100
2. **Drill-down hardcodes 36** - Line 331 in drill-down route
3. **Frontend displays cohort avg for all builders** - No individual differentiation

### ✅ Recommended Solution
**Implement Option 3 (Hybrid Dashboard):**
- API returns both cohort average AND individual builder scores
- Dashboard card shows cohort average
- Builder list shows individual scores
- Drill-down shows rubric breakdown per builder
- Enables sorting, filtering, and individual tracking

### 📊 Expected Outcome
- **Cohort Overview:** "September 2025 Average Quality: 36/100"
- **Top Performers:** Haoxin Wang (62), Brian Williams (60), Erika Medina (58)
- **Need Support:** Bottom 10 builders (17-23 range)
- **Data-Driven Decisions:** Identify high performers and struggling builders

---

## Appendix: Code Snippets

### A. Complete API Endpoint Rewrite

See Section 7 for full implementation.

### B. Frontend TypeScript Interface

```typescript
interface QualityMetrics {
  cohort: {
    avgScore: number;
    totalBuilders: number;
    rubricBreakdown: Array<{
      category: string;
      score: number;
    }>;
  };
  builders: Array<{
    user_id: number;
    name: string;
    score: number;
    assessments: number;
  }>;
}
```

### C. SQL Query for PostgreSQL Integration

```sql
-- Join PostgreSQL builder data with BigQuery quality scores
SELECT
  u.user_id,
  u.first_name || ' ' || u.last_name as builder_name,
  u.email,
  u.cohort,
  COUNT(DISTINCT ba.attendance_date) as days_attended,
  COUNT(DISTINCT ts.task_id) as tasks_completed
FROM users u
LEFT JOIN builder_attendance_new ba ON u.user_id = ba.user_id
LEFT JOIN task_submissions ts ON u.user_id = ts.user_id
WHERE u.cohort = 'September 2025'
  AND u.active = true
GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.cohort
ORDER BY u.user_id;
```

Then merge with BigQuery `getBuilderAverageQuality()` results by `user_id`.

---

**Document Version:** 1.0
**Author:** Claude Code Agent
**Last Updated:** October 7, 2025
