# Implementation Specification - Defined Metrics Dashboard
**Based on:** Greg's Answers (Oct 2, 2025)
**Status:** APPROVED - Ready to Build

---

## 📋 Approved Specifications

### 1. Default View & Filters
✅ **Default Time Range:** All time (entire cohort)
✅ **Real-time Updates:** Dashboard updates as filters change
✅ **Filter Categories:**
- Time: All time, Last 7/14/30 days, Custom range, Week selection
- Builders: All (76), Top Performers, Struggling (show BOTH threshold & composite score)
- Activities: 5 meta-categories (Core Learning & Applied Work = priority)
- Tasks: Individual/Group, Conversation/Basic

### 2. Builder Segmentation (Dual Display)
**Show BOTH approaches side-by-side for comparison:**

#### Approach A: Threshold-Based
```
Struggling Builder:
- Task completion < 50% OR Attendance < 70%

Top Performer:
- Task completion > 90% AND Attendance > 90%
```

#### Approach B: Composite Score
```
Engagement Score = (Attendance × 0.3) + (Task Completion × 0.5) + (Quality × 0.2)

Struggling: Score < 40
Top Performer: Score > 80
```

**UI:** Toggle between views or show both in separate cards

### 3. Activity Categories (5 Meta-Groups)
**Priority Order:**
1. **Core Learning** ⭐ (Learning, Practice, Research, Self learning)
2. **Applied Work** ⭐ (Building/Build, Testing, Assessment)
3. **Collaboration** (Group Activity, Team Building, Presentation)
4. **Reflection** (Reflection/Reflecton, Individual)
5. **Other** (Break, Celebration, Networking, Planning, Preparation, Professional Development)

### 4. Hypothesis Charts (All 7)
Build all 7, can delete/modify later:

**H1: Attendance Drives Task Completion**
- Chart: Scatter plot (Attendance % vs Completion %)
- Show: Correlation coefficient

**H2: Early Engagement Predicts Success**
- Chart: Scatter plot (Week 1 submissions vs Total submissions)
- Show: Trend line

**H3: Activity Type Preference**
- Chart: Radar chart per builder segment
- Show: Completion % by category

**H4: Improvement Trajectory**
- Chart: Line chart (Week-over-week completion %)
- Show: Trend direction (improving/declining)

**H5: Weekend Work Patterns**
- Chart: Bar chart (Sat/Sun submissions vs Mon-Wed)
- Show: Completion rate difference

**H6: Peer Influence**
- Chart: TBD (need table group data - explore if available)
- Show: Group performance correlation

**H7: Task Difficulty Analysis**
- Chart: Histogram (Task completion rate distribution)
- Show: Tasks with <70% completion (redesign candidates)

### 5. KPI Cards (5 Cards)
```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Active       │ Active       │ Task         │ Attendance   │ Need         │
│ Builders     │ Builders     │ Completion   │ Rate         │ Intervention │
│ TODAY        │ PRIOR DAY    │ This Week    │ (7 class avg)│              │
│              │              │              │              │              │
│ 68/76        │ 71/76        │ 92%          │ 87%          │ 5 builders   │
│ (89%)        │ (93%)        │ ↑ 4% vs last │ ↓ 4% vs last │ (see list)   │
│              │              │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

**Critical:** 7-day average = 7 CLASS days only (Sat-Wed, excluding Thu/Fri)

### 6. Quality Metrics (Both A & B)
**Show BOTH:**

**A) Average Quality Score (Top KPI or Card)**
```
Overall Quality: 78/100
(Based on rubric scoring from BigQuery)
```

**B) Quality Breakdown (Radar Chart)**
```
Technical Skills:     ████████ 82%
Business Value:       ██████   65%
Project Management:   ███████  75%
Research Skills:      ████████ 80%
Critical Thinking:    ███████  72%
Risk Assessment:      ██████   68%
```

### 7. Task Difficulty Scoring
❌ **Not implemented** - Do not label task difficulty

### 8. Chart Refresh
✅ **Every 5 minutes**
✅ **Display:** "Last refreshed: 2 minutes ago" (timestamp in top-right corner)
✅ **Manual refresh button:** "↻ Refresh Now"

### 9. Export Features
❌ **Skip for MVP** - Will add in Phase 2

---

## 🔍 CRITICAL: Task Completion vs Submissions

**Two Different Metrics:**

### 1. Submission Count
```sql
-- Simple: Did they submit anything?
SELECT COUNT(*) FROM task_submissions
WHERE task_id = X AND user_id = Y
```

### 2. Task Completion (Interaction + Quality)
**Dual criteria:**
- **a) Did they interact?** (EXISTS check)
- **b) Quality of text interactions** (analyze submission content)

---

## 🧠 Quality Analysis at Scale - Proposed Solution

### The Challenge
Need to measure quality of text submissions WITHOUT manual review at scale.

### Proposed Approach: AI-Powered Quality Scoring

#### Option 1: Real-time Analysis (As Submitted)
```javascript
// When builder submits task
async function analyzeSubmission(submission) {
  const prompt = `
    Analyze this task submission quality on a scale of 0-100:

    Task: ${task.description}
    Submission: ${submission.text}

    Evaluate:
    1. Completeness: Did they address the task requirements?
    2. Depth: Is there evidence of critical thinking?
    3. Effort: Does it show genuine engagement vs minimal effort?

    Return JSON: { score: 0-100, reasoning: "brief explanation" }
  `;

  const analysis = await claude.analyze(prompt);

  return {
    interaction: true, // They submitted
    quality_score: analysis.score,
    completion_status: analysis.score >= 60 ? 'completed' : 'incomplete'
  };
}
```

**Pros:**
- ✅ Real-time feedback
- ✅ Scales automatically
- ✅ Nuanced quality assessment

**Cons:**
- ⚠️ API costs (1 call per submission)
- ⚠️ Need to validate AI scoring accuracy

---

#### Option 2: Batch Analysis (Nightly)
```javascript
// Run nightly on all submissions from past 24 hours
async function batchAnalyzeSubmissions() {
  const submissions = await getRecentSubmissions(24); // hours

  const results = await Promise.all(
    submissions.map(async (sub) => {
      // Use same prompt as Option 1
      const analysis = await claude.analyze(buildPrompt(sub));

      // Update database
      await updateSubmissionQuality(sub.id, {
        quality_score: analysis.score,
        analyzed_at: new Date()
      });
    })
  );
}
```

**Pros:**
- ✅ Lower cost (batch processing)
- ✅ Can review/validate before showing to users

**Cons:**
- ⚠️ Not real-time (up to 24h delay)

---

#### Option 3: Hybrid (Smart Triggers)
```javascript
// Analyze immediately if:
// 1. Task is marked "should_analyze: true"
// 2. Submission length > 100 chars
// Otherwise, batch process

async function smartAnalysis(submission, task) {
  if (task.should_analyze || submission.text.length > 100) {
    // Real-time analysis
    return await analyzeSubmission(submission);
  } else {
    // Queue for batch processing
    await queueForBatchAnalysis(submission.id);
    return { interaction: true, quality_score: null }; // Pending
  }
}
```

**Pros:**
- ✅ Best of both worlds
- ✅ Cost-effective
- ✅ Real-time for important tasks

**Cons:**
- ⚠️ More complex logic

---

### Quality Scoring Rubric (For AI Analysis)

```javascript
const qualityCriteria = {
  completeness: {
    weight: 0.4,
    scale: [
      { score: 0-20, desc: "Did not address task requirements" },
      { score: 21-40, desc: "Partially addressed requirements" },
      { score: 41-60, desc: "Addressed most requirements" },
      { score: 61-80, desc: "Fully addressed requirements" },
      { score: 81-100, desc: "Exceeded requirements with extras" }
    ]
  },
  depth: {
    weight: 0.3,
    scale: [
      { score: 0-20, desc: "Surface-level response, no critical thinking" },
      { score: 21-40, desc: "Basic understanding shown" },
      { score: 41-60, desc: "Demonstrates understanding and some analysis" },
      { score: 61-80, desc: "Deep analysis with examples" },
      { score: 81-100, desc: "Exceptional insight and original thinking" }
    ]
  },
  effort: {
    weight: 0.3,
    scale: [
      { score: 0-20, desc: "Minimal effort (e.g., 'I don't know')" },
      { score: 21-40, desc: "Some effort but incomplete" },
      { score: 41-60, desc: "Genuine engagement evident" },
      { score: 61-80, desc: "Significant effort and care" },
      { score: 81-100, desc: "Exceptional effort and polish" }
    ]
  }
};

// Final Score = (Completeness × 0.4) + (Depth × 0.3) + (Effort × 0.3)
```

---

### UI Display: Task Completion with Quality

```
┌─────────────────────────────────────────────┐
│ Task Completion Breakdown                    │
├─────────────────────────────────────────────┤
│                                              │
│ ✅ Completed (High Quality)      62 tasks   │
│    └─ Quality Score ≥ 70         (82%)      │
│                                              │
│ ⚠️  Completed (Low Quality)       10 tasks   │
│    └─ Quality Score < 70         (13%)      │
│                                              │
│ 📝 Interacted (Pending Analysis)  3 tasks    │
│    └─ Awaiting quality review    (4%)       │
│                                              │
│ ❌ Not Started                    1 task     │
│    └─ No submissions              (1%)      │
│                                              │
├─────────────────────────────────────────────┤
│ Overall Completion Rate: 99% (75/76 tasks)  │
│ High-Quality Completion: 82% (62/76 tasks)  │
└─────────────────────────────────────────────┘
```

---

## ❓ Decision Needed: Which Quality Analysis Option?

**Greg, which approach do you prefer?**

**A) Option 1:** Real-time analysis (every submission)
- Immediate feedback, higher cost

**B) Option 2:** Batch nightly analysis
- Delayed feedback, lower cost

**C) Option 3:** Hybrid (smart triggers)
- Best balance, more complex

**D) Something else:** (describe)

**My Recommendation:** Option C (Hybrid) - analyze important tasks real-time, batch process the rest

**Your Answer:** _____

---

## 📊 Database Schema Updates Needed

### New Table: `submission_quality_analysis`
```sql
CREATE TABLE submission_quality_analysis (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES task_submissions(id),
  quality_score INTEGER, -- 0-100
  completeness_score INTEGER, -- 0-100
  depth_score INTEGER, -- 0-100
  effort_score INTEGER, -- 0-100
  analysis_reasoning TEXT,
  analyzed_at TIMESTAMP,
  analysis_version VARCHAR(50), -- Track which AI model/prompt version
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_submission_quality ON submission_quality_analysis(submission_id);
CREATE INDEX idx_quality_score ON submission_quality_analysis(quality_score);
```

### Update `task_submissions` Table
```sql
-- Add quality flag
ALTER TABLE task_submissions
ADD COLUMN has_quality_analysis BOOLEAN DEFAULT FALSE,
ADD COLUMN quality_score INTEGER; -- Cache for performance
```

---

## 🏗️ Component Architecture

### New Components to Build

```
src/
├── components/
│   ├── metrics-dashboard/
│   │   ├── MetricsTab.tsx (main container)
│   │   ├── FilterSidebar.tsx
│   │   ├── KPICards.tsx
│   │   ├── HypothesisCharts/
│   │   │   ├── H1_AttendanceVsCompletion.tsx
│   │   │   ├── H2_EarlyEngagement.tsx
│   │   │   ├── H3_ActivityPreference.tsx
│   │   │   ├── H4_ImprovementTrajectory.tsx
│   │   │   ├── H5_WeekendPatterns.tsx
│   │   │   ├── H6_PeerInfluence.tsx
│   │   │   └── H7_TaskDifficulty.tsx
│   │   ├── QualityMetrics/
│   │   │   ├── QualityOverview.tsx (avg score)
│   │   │   └── QualityRadarChart.tsx (by rubric)
│   │   └── RefreshIndicator.tsx (last updated timestamp)
│   │
│   └── terminology-legend/
│       ├── LegendTab.tsx
│       └── MetricDefinition.tsx
│
├── lib/
│   ├── quality-analysis.ts (AI scoring logic)
│   └── metrics-calculations.ts (composite scores, etc.)
│
└── api/
    ├── metrics/
    │   ├── kpis.ts
    │   ├── hypotheses.ts
    │   └── quality-scores.ts
    └── quality/
        ├── analyze.ts (real-time analysis endpoint)
        └── batch.ts (batch processing)
```

---

## ⏱️ Implementation Timeline

### Week 1: Foundation
- [ ] Database schema updates (submission_quality_analysis table)
- [ ] Quality analysis system (pick Option A/B/C)
- [ ] Filter sidebar component
- [ ] KPI cards with 7-day class average fix

### Week 2: Hypothesis Charts
- [ ] H1: Attendance vs Completion (scatter)
- [ ] H2: Early engagement (scatter)
- [ ] H4: Improvement trajectory (line)
- [ ] H7: Task difficulty (histogram)

### Week 3: Quality & Advanced
- [ ] Quality overview card
- [ ] Quality radar chart (rubric breakdown)
- [ ] H3, H5, H6 charts
- [ ] Dual segmentation (threshold vs composite)

### Week 4: Polish & Test
- [ ] Refresh indicator (5 min auto + manual)
- [ ] Real-time filter updates
- [ ] Terminology legend tab
- [ ] Testing with facilitators

---

## 🚨 Blockers to Resolve

1. **Quality Analysis Approach** → Need your decision (A/B/C/D)
2. **Composite Score Weights** → Confirm: Attendance (0.3) + Completion (0.5) + Quality (0.2)
3. **Table Group Data** → Do we have this for H6? (Check database)
4. **BigQuery Integration** → Get credentials for quality rubric data

---

## ✅ Ready to Start?

**Answer the quality analysis question above and I'll begin building immediately.**

Which option: **A / B / C / D**

Also confirm:
- [ ] Composite score weights look good (0.3 / 0.5 / 0.2)?
- [ ] Okay to analyze submission text content with AI?
- [ ] Any privacy concerns with quality scoring?
