# Builder Profile Enhancement Plan
**Date:** October 7, 2025
**Mission:** Comprehensive enhancement of individual builder profile page
**Current Profile:** `/app/builder/[id]/page.tsx`

---

## Executive Summary

The current builder profile provides basic metrics (task completion, attendance, quality score, status) but lacks depth in assessment insights, engagement trends, and actionable analytics. This plan prioritizes enhancements across three tiers (P0, P1, P2) based on implementation complexity and user value.

**Key Findings:**
- ✅ **Recently Fixed:** Attendance history now shows all statuses (present, late, absent, excused)
- ✅ **Recently Fixed:** Individual quality scores now pulled from PostgreSQL task_analyses
- ⚠️ **Still Using:** Hardcoded quality score (36) in engagement calculation needs update
- 🚫 **Missing:** Quality assessment timeline, rubric breakdown, task category analysis
- 🚫 **Missing:** Peer comparison context, strengths/weaknesses from AI assessments

---

## Current Implementation Analysis

### Data Sources Available

#### 1. PostgreSQL Tables
```sql
-- builder_attendance_new
user_id, attendance_date, check_in_time, status, late_arrival_minutes

-- task_analyses (NEW - Quality Scores)
user_id, task_id, created_at, analysis_result->>'completion_score'
analysis_result->>'analysis_type', analysis_result->>'feedback'

-- tasks
id, task_title, category, type, task_type, block_id

-- task_submissions
user_id, task_id, thread_content, created_at

-- task_threads
user_id, task_id, created_at

-- curriculum_days
id, day_number, day_date, day_type, cohort

-- builder_feedback
user_id, day_number, referral_likelihood, what_we_did_well, what_to_improve
```

#### 2. BigQuery Tables (Already Integrated)
```sql
-- comprehensive_assessment_analysis
user_id, assessment_id, overall_score, assessment_type, user_cohort
type_specific_data (JSON with rubric scores)

-- holistic_learner_assessments (Strengths/Weaknesses)
user_id, strengths_summary, growth_areas_summary, included_assessments
assessment_scores, analysis_timestamp
```

#### 3. Existing Services
- ✅ `/lib/services/task-quality.ts` - PostgreSQL quality scores (~71.9 cohort avg)
- ✅ `/lib/services/bigquery-individual.ts` - Rubric breakdown by builder
- ✅ `/lib/queries/builderQueries.ts` - Profile, attendance, tasks, feedback
- ✅ `/app/api/builder/[id]/route.ts` - Builder API endpoint

### What's Currently Shown

#### KPI Cards (Top Row)
1. **Task Completion**: 62% (88/141 tasks) ✅
2. **Attendance**: 58% (14/19 days) ⚠️ *Shows total days incorrectly*
3. **Quality Score**: 36/100 ⚠️ *Hardcoded cohort average, not individual*
4. **Status**: Struggling, Engagement: 56 ⚠️ *Uses hardcoded 36 in calculation*

#### Details Section (Bottom)
1. **Attendance History**: Shows present/late/absent/excused ✅ *Recently fixed*
2. **Completed Tasks**: List with timestamps ✅

### Critical Data Gaps

#### Missing from Current Profile
1. **Quality Assessment Timeline**
   - No score progression over time
   - No trend analysis (improving/declining)
   - No assessment type breakdown

2. **Rubric Category Breakdown**
   - Technical Skills, Business Value, Critical Thinking, Professional Skills, Project Mgmt
   - Individual scores available in BigQuery but not displayed
   - No radar chart visualization

3. **Task Completion by Category**
   - Tasks table has `category` and `type` fields
   - No breakdown showing: Learning vs Building vs Collaboration
   - No difficulty preference analysis

4. **Engagement Trends**
   - Engagement score calculation explanation missing
   - No week-by-week trends
   - No correlation analysis (attendance vs quality)

5. **Peer Comparison**
   - No percentile rank displayed
   - No comparison to cohort averages
   - Individual rubric scores vs cohort missing

6. **AI Assessment Insights**
   - Strengths/weaknesses available in BigQuery holistic table
   - Not currently displayed
   - No drill-down to individual assessment feedback

7. **Total vs Attended Days**
   - Currently shows "14/19 days" - confusing
   - Should show total curriculum days (not just attended)
   - Need to calculate from curriculum_days table

---

## Enhancement Priorities

## P0: Critical Fixes (Must Have)
*Complexity: Low | Impact: High | Timeline: 1-2 days*

### P0.1: Fix Total Days Display ✅ PARTIALLY FIXED
**Current Issue:** Shows "14/19 days" where 19 is incorrect
**Root Cause:** Query counts attended days, not total curriculum days
**Fix:** Update query to get total from curriculum_days table

**SQL Query:**
```sql
SELECT COUNT(*) as total_class_days
FROM curriculum_days
WHERE cohort = 'September 2025'
  AND EXTRACT(DOW FROM day_date) NOT IN (4, 5)
  AND day_date <= CURRENT_DATE
```

**Files to Update:**
- `/app/builder/[id]/page.tsx` line 69-72 (update denominator)

**Status:** ✅ Fixed in attendance query (line 197-209), but KPI card still shows hardcoded `/19`

---

### P0.2: Display Individual Quality Score ✅ PARTIALLY FIXED
**Current Issue:** Shows hardcoded 36 (cohort average) instead of individual score
**Root Cause:** Line 175 hardcodes quality_score to 36
**Fix:** Use individual score from task_analyses (already available via API)

**SQL Query (Already Implemented in task-quality.ts):**
```sql
SELECT
  u.user_id,
  CONCAT(u.first_name, ' ', u.last_name) as builder_name,
  COUNT(DISTINCT ta.task_id) as tasks_assessed,
  ROUND(AVG(CAST(ta.analysis_result->>'completion_score' AS NUMERIC)), 1) as avg_quality,
  COUNT(ta.id) as total_assessments
FROM users u
JOIN task_analyses ta ON u.user_id = ta.user_id
WHERE u.cohort = 'September 2025'
  AND u.user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332)
  AND ta.analysis_result->>'completion_score' IS NOT NULL
  AND CAST(ta.analysis_result->>'completion_score' AS NUMERIC) BETWEEN 0 AND 100
GROUP BY u.user_id, u.first_name, u.last_name
```

**Files to Update:**
- `/app/builder/[id]/page.tsx` line 175: Remove hardcoded `36 as quality_score`
- Use score from API route which already fetches individual quality

**Status:** ✅ API route fixed, but page.tsx still shows hardcoded 36 in engagement calculation

---

### P0.3: Fix Engagement Score Calculation
**Current Issue:** Uses hardcoded 36 in engagement formula (line 179)
**Formula:** `attendance% * 0.3 + completion% * 0.5 + 36 * 0.2`
**Fix:** Use individual quality score in calculation

**Updated Formula:**
```sql
ROUND(
  attendance_pct * 0.3 +
  completion_pct * 0.5 +
  individual_quality_score * 0.2
) as engagement_score
```

**Files to Update:**
- `/app/builder/[id]/page.tsx` line 176-180

---

### P0.4: Add Absent Status Legend
**Current Issue:** Attendance history shows absent but needs visual clarity
**Fix:** Add color-coded legend above attendance list

**UI Enhancement:**
```tsx
<div className="flex gap-2 text-xs mb-3">
  <Badge className="bg-green-100 text-green-800">Present</Badge>
  <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>
  <Badge className="bg-red-100 text-red-800">Absent</Badge>
  <Badge className="bg-gray-100 text-gray-600">Excused</Badge>
</div>
```

**Files to Update:**
- `/app/builder/[id]/page.tsx` line 106 (add legend before list)

---

## P1: High-Value Additions (Should Have)
*Complexity: Medium | Impact: High | Timeline: 3-5 days*

### P1.1: Quality Assessment Timeline
**Value:** Shows score progression, identifies trends
**Data Source:** task_analyses table (PostgreSQL)

**SQL Query:**
```sql
SELECT
  DATE(ta.created_at) as assessment_date,
  COUNT(*) as assessments_count,
  ROUND(AVG(CAST(ta.analysis_result->>'completion_score' AS NUMERIC)), 1) as avg_score
FROM task_analyses ta
WHERE ta.user_id = $1
  AND ta.analysis_result->>'completion_score' IS NOT NULL
  AND CAST(ta.analysis_result->>'completion_score' AS NUMERIC) BETWEEN 0 AND 100
GROUP BY DATE(ta.created_at)
ORDER BY assessment_date ASC
```

**UI Component:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Quality Score Progression</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={qualityTimeline}>
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} />
        <ReferenceLine y={71.9} stroke="#94a3b8" strokeDasharray="3 3" label="Cohort Avg" />
      </LineChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

**Files to Create:**
- `/components/builder/QualityTimeline.tsx` (new)

**Files to Update:**
- `/app/builder/[id]/page.tsx` (add timeline component)
- `/lib/queries/builderQueries.ts` (add getBuilderQualityTimeline function)

---

### P1.2: Rubric Category Breakdown (Radar Chart)
**Value:** Visual breakdown of skills, identifies strengths/weaknesses
**Data Source:** BigQuery comprehensive_assessment_analysis (already fetched)

**SQL Query (Already Implemented in bigquery-individual.ts):**
```typescript
// Already available via getIndividualRubricBreakdown()
{
  technical_skills: 74,
  business_value: 78,
  project_mgmt: 0,
  critical_thinking: 68,
  professional_skills: 33
}
```

**UI Component:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Skills Radar</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={rubricData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="category" />
        <PolarRadiusAxis domain={[0, 100]} />
        <Radar name="Builder" dataKey="builder_score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.5} />
        <Radar name="Cohort Avg" dataKey="cohort_avg" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>

    <div className="mt-4 text-sm">
      <p className="font-medium mb-2">vs Cohort Average:</p>
      <div className="grid grid-cols-2 gap-2">
        {comparison.map(c => (
          <div key={c.category} className="flex justify-between">
            <span>{c.category}:</span>
            <span className={c.diff > 0 ? 'text-green-600' : 'text-red-600'}>
              {c.diff > 0 ? '+' : ''}{c.diff}
            </span>
          </div>
        ))}
      </div>
    </div>
  </CardContent>
</Card>
```

**Files to Create:**
- `/components/builder/RubricRadarChart.tsx` (new)

**Files to Update:**
- `/app/builder/[id]/page.tsx` (add radar chart component)
- API route already fetches rubric data

---

### P1.3: Task Completion by Category
**Value:** Shows learning style, identifies gaps
**Data Source:** tasks table (category, type fields)

**SQL Query:**
```sql
SELECT
  t.category,
  t.type,
  COUNT(DISTINCT t.id) as total_tasks,
  COUNT(DISTINCT CASE WHEN ts.id IS NOT NULL OR tt.id IS NOT NULL THEN t.id END) as completed,
  ROUND(
    COUNT(DISTINCT CASE WHEN ts.id IS NOT NULL OR tt.id IS NOT NULL THEN t.id END)::FLOAT
    / NULLIF(COUNT(DISTINCT t.id), 0) * 100
  ) as completion_pct
FROM tasks t
JOIN time_blocks tb ON t.block_id = tb.id
JOIN curriculum_days cd ON tb.day_id = cd.id
LEFT JOIN task_submissions ts ON t.id = ts.task_id AND ts.user_id = $1
LEFT JOIN task_threads tt ON t.id = tt.task_id AND tt.user_id = $1
WHERE cd.cohort = 'September 2025'
  AND t.category IS NOT NULL
GROUP BY t.category, t.type
ORDER BY t.category, t.type
```

**UI Component:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Task Completion by Type</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {categoryBreakdown.map(cat => (
        <div key={cat.category}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">{cat.category}</span>
            <span>{cat.completed}/{cat.total} ({cat.completion_pct}%)</span>
          </div>
          <Progress value={cat.completion_pct} className="h-2" />
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

**Files to Create:**
- `/components/builder/TaskCategoryBreakdown.tsx` (new)

**Files to Update:**
- `/lib/queries/builderQueries.ts` (add getBuilderTaskCategories function)
- `/app/builder/[id]/page.tsx` (add category breakdown component)

---

### P1.4: Peer Comparison Context
**Value:** Shows builder's rank, provides context
**Data Source:** Calculate from all builders' quality scores

**SQL Query:**
```sql
WITH builder_ranks AS (
  SELECT
    user_id,
    avg_quality,
    PERCENT_RANK() OVER (ORDER BY avg_quality) * 100 as percentile_rank
  FROM (
    SELECT
      u.user_id,
      ROUND(AVG(CAST(ta.analysis_result->>'completion_score' AS NUMERIC)), 1) as avg_quality
    FROM users u
    JOIN task_analyses ta ON u.user_id = ta.user_id
    WHERE u.cohort = 'September 2025'
      AND u.user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332)
      AND ta.analysis_result->>'completion_score' IS NOT NULL
    GROUP BY u.user_id
  ) scores
)
SELECT percentile_rank
FROM builder_ranks
WHERE user_id = $1
```

**UI Component:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Cohort Ranking</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-center">
      <div className="text-4xl font-bold mb-2">{Math.round(percentile)}th</div>
      <div className="text-sm text-gray-600">Percentile</div>
      <div className="mt-4">
        <Progress value={percentile} className="h-3" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Bottom</span>
          <span>Top</span>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

**Files to Update:**
- `/lib/queries/builderQueries.ts` (add getBuilderPercentile function)
- `/app/builder/[id]/page.tsx` (add percentile card)

---

### P1.5: AI Assessment Strengths/Weaknesses
**Value:** Actionable feedback, identifies growth areas
**Data Source:** BigQuery holistic_learner_assessments (already available)

**SQL Query (Already fetched via API):**
```typescript
// From comprehensive_assessment_analysis type_specific_data
{
  strengths: [
    "Strong technical implementation skills",
    "Good business intuition",
    "Shows improvement over time"
  ],
  improvements: [
    "Presentation skills",
    "Professional communication",
    "Critical thinking depth"
  ]
}
```

**UI Component:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>AI Assessment Insights</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-sm mb-2 flex items-center">
          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          Strengths
        </h4>
        <ul className="text-sm space-y-1 text-gray-700">
          {strengths.map((s, i) => (
            <li key={i} className="flex items-start">
              <span className="text-green-600 mr-2">•</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium text-sm mb-2 flex items-center">
          <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
          Growth Areas
        </h4>
        <ul className="text-sm space-y-1 text-gray-700">
          {improvements.map((i, idx) => (
            <li key={idx} className="flex items-start">
              <span className="text-blue-600 mr-2">↑</span>
              {i}
            </li>
          ))}
        </ul>
      </div>
    </div>

    <p className="text-xs text-gray-500 mt-4">
      Based on {assessmentCount} assessments
    </p>
  </CardContent>
</Card>
```

**Files to Create:**
- `/components/builder/AssessmentInsights.tsx` (new)

**Files to Update:**
- `/app/builder/[id]/page.tsx` (add insights component)
- API route already provides this data in quality_assessments

---

### P1.6: Week-by-Week Performance Trends
**Value:** Shows consistency, identifies patterns
**Data Source:** task_analyses grouped by week

**SQL Query:**
```sql
WITH weekly_scores AS (
  SELECT
    DATE_TRUNC('week', ta.created_at) as week_start,
    EXTRACT(WEEK FROM ta.created_at) as week_number,
    COUNT(*) as assessments,
    ROUND(AVG(CAST(ta.analysis_result->>'completion_score' AS NUMERIC)), 1) as avg_score
  FROM task_analyses ta
  WHERE ta.user_id = $1
    AND ta.analysis_result->>'completion_score' IS NOT NULL
  GROUP BY DATE_TRUNC('week', ta.created_at), EXTRACT(WEEK FROM ta.created_at)
  ORDER BY week_start ASC
)
SELECT
  week_number,
  week_start,
  assessments,
  avg_score,
  LAG(avg_score) OVER (ORDER BY week_start) as prev_week_score,
  avg_score - LAG(avg_score) OVER (ORDER BY week_start) as week_over_week_change
FROM weekly_scores
```

**UI Component:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Weekly Performance Trends</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={weeklyTrends}>
        <XAxis dataKey="week" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Bar dataKey="avg_score" fill="#2563eb" />
        <ReferenceLine y={71.9} stroke="#94a3b8" strokeDasharray="3 3" />
      </BarChart>
    </ResponsiveContainer>

    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
      <div>
        <p className="text-gray-500">Trend</p>
        <p className="font-medium">{trend}</p>
      </div>
      <div>
        <p className="text-gray-500">Best Week</p>
        <p className="font-medium">Week {bestWeek}</p>
      </div>
      <div>
        <p className="text-gray-500">Consistency</p>
        <p className="font-medium">{consistencyScore}%</p>
      </div>
    </div>
  </CardContent>
</Card>
```

**Files to Create:**
- `/components/builder/WeeklyTrends.tsx` (new)

**Files to Update:**
- `/lib/queries/builderQueries.ts` (add getBuilderWeeklyTrends function)
- `/app/builder/[id]/page.tsx` (add weekly trends component)

---

## P2: Nice-to-Have Features (Could Have)
*Complexity: Medium-High | Impact: Medium | Timeline: 5-7 days*

### P2.1: Export Builder Report (PDF)
**Value:** Shareable performance report for 1:1s
**Implementation:** Use react-pdf or similar library

**Features:**
- Summary page with key metrics
- Charts exported as images
- Assessment history table
- Strengths/weaknesses summary

**Files to Create:**
- `/lib/pdf/builder-report.ts` (PDF generator)
- `/components/builder/ExportButton.tsx` (trigger button)

---

### P2.2: Share Profile Link
**Value:** Enables builders to share progress
**Implementation:** Add shareable UUID to users table

**Features:**
- Public view with limited data (no cohort comparison)
- Toggle visibility on/off
- Expiring share links (optional)

**Files to Create:**
- `/app/profile/[uuid]/page.tsx` (public view)
- `/lib/queries/shareQueries.ts` (share link management)

---

### P2.3: Historical Comparison
**Value:** Shows improvement over time periods
**Implementation:** Compare current month vs previous months

**UI Component:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Historical Comparison</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <p className="text-sm text-gray-500">This Month</p>
        <p className="text-2xl font-bold">{currentMonth}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Last Month</p>
        <p className="text-2xl font-bold">{lastMonth}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Change</p>
        <p className={`text-2xl font-bold ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? '+' : ''}{change}
        </p>
      </div>
    </div>
  </CardContent>
</Card>
```

---

### P2.4: Task Difficulty Preference Analysis
**Value:** Identifies learning style preferences
**Implementation:** Correlate task complexity with completion rate

**SQL Query:**
```sql
SELECT
  t.task_type,
  COUNT(*) as attempts,
  COUNT(CASE WHEN ts.id IS NOT NULL THEN 1 END) as completed,
  AVG(CAST(ta.analysis_result->>'completion_score' AS NUMERIC)) as avg_score
FROM tasks t
LEFT JOIN task_submissions ts ON t.id = ts.task_id AND ts.user_id = $1
LEFT JOIN task_analyses ta ON t.id = ta.task_id AND ta.user_id = $1
WHERE t.task_type IN ('project', 'quiz', 'video', 'problem_solution')
GROUP BY t.task_type
```

---

### P2.5: Attendance Correlation Analysis
**Value:** Shows how attendance affects quality
**Implementation:** Scatter plot of attendance vs quality scores

**UI Component:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Attendance Impact on Quality</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={200}>
      <ScatterChart data={attendanceQualityData}>
        <XAxis dataKey="attendance_pct" label="Attendance %" />
        <YAxis dataKey="quality_score" label="Quality Score" />
        <Tooltip />
        <Scatter data={attendanceQualityData} fill="#2563eb" />
      </ScatterChart>
    </ResponsiveContainer>

    <p className="text-sm text-gray-600 mt-4">
      Correlation: <strong>{correlation > 0 ? 'Positive' : 'Negative'}</strong>
      ({Math.abs(correlation).toFixed(2)})
    </p>
  </CardContent>
</Card>
```

---

## Implementation Complexity Estimates

### P0: Critical Fixes
| Task | Lines of Code | Files Changed | Est. Time |
|------|---------------|---------------|-----------|
| P0.1 Fix Total Days | ~10 | 1 file | 30 min |
| P0.2 Individual Quality | ~20 | 1 file | 1 hour |
| P0.3 Engagement Calc | ~5 | 1 file | 15 min |
| P0.4 Status Legend | ~15 | 1 file | 30 min |
| **Total** | **~50** | **1 file** | **2.25 hours** |

### P1: High-Value Additions
| Task | Lines of Code | Files Changed | Est. Time |
|------|---------------|---------------|-----------|
| P1.1 Quality Timeline | ~150 | 3 files | 4 hours |
| P1.2 Rubric Radar | ~200 | 2 files | 5 hours |
| P1.3 Task Categories | ~120 | 3 files | 3 hours |
| P1.4 Peer Comparison | ~80 | 2 files | 2 hours |
| P1.5 AI Insights | ~150 | 2 files | 3 hours |
| P1.6 Weekly Trends | ~180 | 3 files | 4 hours |
| **Total** | **~880** | **6 files** | **21 hours** |

### P2: Nice-to-Have
| Task | Lines of Code | Files Changed | Est. Time |
|------|---------------|---------------|-----------|
| P2.1 PDF Export | ~300 | 3 files | 6 hours |
| P2.2 Share Link | ~200 | 4 files | 5 hours |
| P2.3 Historical Compare | ~100 | 2 files | 3 hours |
| P2.4 Task Difficulty | ~120 | 2 files | 3 hours |
| P2.5 Attendance Corr | ~150 | 2 files | 4 hours |
| **Total** | **~870** | **7 files** | **21 hours** |

---

## Proposed UI Layout (Updated)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  Builder Profile: Haoxin Wang                                  ┃
┃  September 2025 Cohort                  [Export] [Back]        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌─────────────┬─────────────┬─────────────┬─────────────┬─────────┐
│ Task Comp   │ Attendance  │ Quality     │ Status      │ Rank    │
│ 85%         │ 92%         │ 72/100      │ Top         │ 75th    │
│ 120/141     │ 18/19       │ (↑ +8)      │ Performer   │ %ile    │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────┘

┌────────────────────────────────────────────────────────────────┐
│  📈 Quality Score Progression                                   │
│  [Line chart showing improvement over time]                     │
│  Trend: ↑ Improving (+15 pts since start)                      │
└────────────────────────────────────────────────────────────────┘

┌──────────────────────────┬─────────────────────────────────────┐
│  📊 Skills Breakdown      │  💡 AI Insights                     │
│  [Radar chart]            │  ✓ Strengths: [list]                │
│                           │  ↑ Growth Areas: [list]             │
│  vs Cohort Avg:           │                                     │
│  Tech: +42                │  Based on 6 assessments             │
│  Business: +19            │                                     │
└──────────────────────────┴─────────────────────────────────────┘

┌──────────────────────────┬─────────────────────────────────────┐
│  📋 Task Categories       │  📅 Weekly Trends                   │
│  Learning: 85%            │  [Bar chart by week]                │
│  Building: 88%            │  Best: Week 4 (78)                  │
│  Collaboration: 75%       │  Consistency: 85%                   │
└──────────────────────────┴─────────────────────────────────────┘

┌──────────────────────────┬─────────────────────────────────────┐
│  📆 Attendance History    │  ✅ Completed Tasks                 │
│  [Present/Late/Absent]    │  [Task list with dates]             │
└──────────────────────────┴─────────────────────────────────────┘
```

---

## SQL Queries Summary

### New Queries Needed

#### 1. Builder Quality Timeline
```sql
SELECT
  DATE(ta.created_at) as assessment_date,
  COUNT(*) as assessments_count,
  ROUND(AVG(CAST(ta.analysis_result->>'completion_score' AS NUMERIC)), 1) as avg_score
FROM task_analyses ta
WHERE ta.user_id = $1
  AND ta.analysis_result->>'completion_score' IS NOT NULL
GROUP BY DATE(ta.created_at)
ORDER BY assessment_date ASC
```

#### 2. Task Category Breakdown
```sql
SELECT
  t.category,
  COUNT(DISTINCT t.id) as total,
  COUNT(DISTINCT CASE WHEN ts.id IS NOT NULL OR tt.id IS NOT NULL THEN t.id END) as completed,
  ROUND(COUNT(DISTINCT CASE WHEN ts.id IS NOT NULL OR tt.id IS NOT NULL THEN t.id END)::FLOAT / COUNT(DISTINCT t.id) * 100) as pct
FROM tasks t
JOIN time_blocks tb ON t.block_id = tb.id
JOIN curriculum_days cd ON tb.day_id = cd.id
LEFT JOIN task_submissions ts ON t.id = ts.task_id AND ts.user_id = $1
LEFT JOIN task_threads tt ON t.id = tt.task_id AND tt.user_id = $1
WHERE cd.cohort = 'September 2025'
GROUP BY t.category
```

#### 3. Builder Percentile Rank
```sql
WITH builder_ranks AS (
  SELECT
    user_id,
    avg_quality,
    PERCENT_RANK() OVER (ORDER BY avg_quality) * 100 as percentile
  FROM (
    SELECT
      u.user_id,
      AVG(CAST(ta.analysis_result->>'completion_score' AS NUMERIC)) as avg_quality
    FROM users u
    JOIN task_analyses ta ON u.user_id = ta.user_id
    WHERE u.cohort = 'September 2025'
    GROUP BY u.user_id
  ) scores
)
SELECT percentile FROM builder_ranks WHERE user_id = $1
```

#### 4. Weekly Performance Trends
```sql
SELECT
  EXTRACT(WEEK FROM ta.created_at) as week_number,
  COUNT(*) as assessments,
  ROUND(AVG(CAST(ta.analysis_result->>'completion_score' AS NUMERIC)), 1) as avg_score
FROM task_analyses ta
WHERE ta.user_id = $1
  AND ta.analysis_result->>'completion_score' IS NOT NULL
GROUP BY EXTRACT(WEEK FROM ta.created_at)
ORDER BY week_number ASC
```

#### 5. Total Curriculum Days
```sql
SELECT COUNT(*) as total_class_days
FROM curriculum_days
WHERE cohort = 'September 2025'
  AND EXTRACT(DOW FROM day_date) NOT IN (4, 5)
  AND day_date <= CURRENT_DATE
```

---

## Risk Assessment

### Low Risk (P0)
- ✅ Data already available
- ✅ Simple query updates
- ✅ No new dependencies
- ⚠️ Must coordinate with existing attendance fix

### Medium Risk (P1)
- ⚠️ Requires chart libraries (Recharts already installed)
- ⚠️ BigQuery data already fetched but needs UI integration
- ⚠️ Performance: Multiple queries need optimization
- ✅ Can be rolled out incrementally

### Higher Risk (P2)
- ⚠️ PDF export requires new dependency
- ⚠️ Share links require schema changes (add UUID to users)
- ⚠️ Public profile page security considerations
- ✅ All optional, can defer

---

## Dependencies

### Existing (Already Installed)
- ✅ Recharts (for charts)
- ✅ shadcn/ui components
- ✅ BigQuery client
- ✅ PostgreSQL client

### New (May Need)
- react-pdf (for P2.1 PDF export)
- uuid (for P2.2 share links) - may already be available

---

## Testing Strategy

### Unit Tests
- Query functions return expected data structures
- Calculation functions (percentile, trends) produce correct results
- Component rendering with various data states

### Integration Tests
- API endpoint returns all expected fields
- Charts render with real data
- Error handling for missing data

### Manual Testing
- Test with multiple builder profiles (high/low performers)
- Test with edge cases (no assessments, single assessment)
- Mobile responsiveness checks
- Performance testing with large datasets

---

## Rollout Plan

### Phase 1: P0 Fixes (Week 1)
- Day 1: Fix total days display
- Day 1: Update quality score to individual
- Day 1: Fix engagement calculation
- Day 2: Add status legend, testing

### Phase 2: P1 Core Features (Week 2-3)
- Days 3-4: Quality timeline component
- Days 5-6: Rubric radar chart
- Days 7-8: Task category breakdown
- Days 9-10: Peer comparison + AI insights
- Days 11-12: Weekly trends + testing

### Phase 3: P2 Advanced Features (Week 4-5)
- Optional, based on user feedback from P1
- Prioritize based on actual usage patterns

---

## Success Metrics

### P0 Success Criteria
- ✅ All builders show correct total days denominator
- ✅ Individual quality scores displayed (not 36)
- ✅ Engagement score reflects individual quality
- ✅ Attendance legend improves clarity (user feedback)

### P1 Success Criteria
- ✅ 90% of builders have quality timeline data
- ✅ Rubric radar chart loads in <1 second
- ✅ Task categories show meaningful breakdown
- ✅ Percentile rank calculated for all builders
- ✅ AI insights displayed for builders with assessments

### P2 Success Criteria
- ✅ PDF export generates complete report
- ✅ Share links work without authentication
- ✅ Historical comparison shows month-over-month trends

---

## Open Questions

1. **Quality Score Display**
   - Should we show "N/A" for builders with no assessments?
   - Or hide quality card entirely?
   - Current plan: Show 0 with note "No assessments yet"

2. **Rubric Categories**
   - Some builders have 0 for Project Mgmt (not assessed yet)
   - Should we hide 0 categories or show them grayed out?
   - Current plan: Show with "(Not assessed)" label

3. **Timeline Date Range**
   - Show all-time or limit to current cohort dates?
   - Current plan: Cohort dates only (Sept 2025 - present)

4. **Peer Comparison**
   - Compare within entire cohort or similar-performing peers?
   - Current plan: Entire cohort percentile

5. **Export Format**
   - PDF only or also support JSON/CSV for data analysis?
   - Current plan: Start with PDF, add formats later if requested

---

## Files to Modify/Create

### P0: Critical Fixes
**Modify:**
- `/app/builder/[id]/page.tsx` (KPI cards, attendance legend)

### P1: High-Value Additions
**Create:**
- `/components/builder/QualityTimeline.tsx`
- `/components/builder/RubricRadarChart.tsx`
- `/components/builder/TaskCategoryBreakdown.tsx`
- `/components/builder/AssessmentInsights.tsx`
- `/components/builder/WeeklyTrends.tsx`

**Modify:**
- `/app/builder/[id]/page.tsx` (integrate new components)
- `/lib/queries/builderQueries.ts` (add new query functions)

### P2: Nice-to-Have
**Create:**
- `/lib/pdf/builder-report.ts`
- `/components/builder/ExportButton.tsx`
- `/app/profile/[uuid]/page.tsx`
- `/lib/queries/shareQueries.ts`

---

## Appendix: Data Availability Matrix

| Data Point | Source | Available | Notes |
|------------|--------|-----------|-------|
| Task completion % | PostgreSQL | ✅ | tasks, task_submissions, task_threads |
| Attendance % | PostgreSQL | ✅ | builder_attendance_new, curriculum_days |
| Individual quality score | PostgreSQL | ✅ | task_analyses.completion_score |
| Rubric breakdown | BigQuery | ✅ | comprehensive_assessment_analysis |
| Assessment timeline | PostgreSQL | ✅ | task_analyses.created_at + score |
| Task categories | PostgreSQL | ✅ | tasks.category, tasks.type |
| Strengths/weaknesses | BigQuery | ✅ | holistic_learner_assessments |
| Percentile rank | PostgreSQL | ✅ | Calculate from all builder scores |
| Weekly trends | PostgreSQL | ✅ | task_analyses grouped by week |
| Total curriculum days | PostgreSQL | ✅ | curriculum_days WHERE cohort |
| Feedback history | PostgreSQL | ✅ | builder_feedback table |

**Legend:**
- ✅ = Data exists and is queryable
- ⚠️ = Data exists but needs transformation
- ❌ = Data does not exist, feature blocked

---

## Next Steps

1. **Approval:** Review plan with stakeholders
2. **P0 Implementation:** Start with critical fixes (2-3 hours)
3. **P1 Scoping:** Prioritize P1 features based on feedback
4. **Incremental Rollout:** Deploy P1 features one at a time
5. **User Feedback:** Gather feedback before P2 implementation
6. **P2 Decision:** Decide which P2 features to implement based on usage

---

**Status:** Ready for review and approval
**Last Updated:** October 7, 2025
**Author:** Claude Code Enhancement Analysis
