# Metrics Dashboard Proposal
**Based on:** Database schema analysis + Transcript feedback
**Date:** October 2, 2025
**Status:** Recommendations & Questions for Approval

---

## 📊 Overview: Three-Tab System

### Tab 1: Natural Language Query (EXISTING - Keep As Is)
✅ **Current state is good, no changes needed**
- Users ask questions in plain English
- AI generates visualizations
- Interactive drill-down

### Tab 2: Defined Metrics Dashboard (NEW - Needs Your Approval)
🆕 **Snapshot view with filters + always-visible charts**
- Filter panel (time, builders, tasks, categories)
- Pre-defined metric cards
- Always-visible charts testing key hypotheses
- Export functionality

### Tab 3: Terminology Legend (NEW - Needs Definitions)
📖 **Common language for all stakeholders**
- Define each metric clearly
- Show calculation methods
- Document exclusions
- Explain grading rubrics

---

## 🔍 SECTION 1: Filter Design

Based on your data structure, here are the filters I recommend:

### Time Filters
```
┌─────────────────────────────────┐
│ TIME RANGE                      │
├─────────────────────────────────┤
│ ○ Last 7 days                   │
│ ○ Last 14 days                  │
│ ○ Last 30 days                  │
│ ● All time (Sept 6 - present)   │
│ ○ Custom range: [___] to [___]  │
│                                  │
│ WEEK SELECTION                  │
│ ☑ Week 1 (Sept 6-12)            │
│ ☑ Week 2 (Sept 13-19)           │
│ ☑ Week 3 (Sept 20-26)           │
│ ☑ Week 4 (Sept 27 - Oct 1)      │
│                                  │
│ DAY OF WEEK                     │
│ ☑ Monday ☑ Tuesday ☑ Wednesday  │
│ ☐ Thursday ☐ Friday (no class)  │
│ ☑ Saturday ☑ Sunday             │
└─────────────────────────────────┘
```

### Builder Filters
```
┌─────────────────────────────────┐
│ BUILDER SEGMENTS                │
├─────────────────────────────────┤
│ ○ All Builders (76 active)      │
│ ○ Top Performers (need def)     │
│ ○ Struggling (need definition)  │
│ ○ Custom Selection:             │
│   [Search builders...]          │
│   ☑ Dwight Williams             │
│   ☐ Letisha Gary                │
│   ☐ Beatrice Alexander          │
│   ... (multi-select list)       │
│                                  │
│ ENGAGEMENT LEVEL                │
│ ○ All                           │
│ ○ High (>15 submissions)        │
│ ○ Medium (5-15 submissions)     │
│ ○ Low (<5 submissions)          │
└─────────────────────────────────┘
```

### Task/Activity Filters
```
┌─────────────────────────────────┐
│ ACTIVITY CATEGORY               │
├─────────────────────────────────┤
│ ☑ Learning                      │
│ ☑ Building/Build                │
│ ☑ Reflection                    │
│ ☑ Practice                      │
│ ☑ Research                      │
│ ☑ Assessment                    │
│ ☑ Group Activity                │
│ ☑ Presentation                  │
│ ☐ Break (exclude)               │
│ ☐ Celebration (exclude)         │
│ ☐ Networking (exclude)          │
│                                  │
│ TASK TYPE                       │
│ ☑ Individual tasks              │
│ ☑ Group tasks                   │
│ ☐ Break                         │
│                                  │
│ TASK MODE                       │
│ ☑ Conversation (AI-assisted)    │
│ ☑ Basic (independent)           │
└─────────────────────────────────┘
```

---

## ❓ QUESTIONS FOR YOU (Section 1: Filters)

### Q1: Time Range Defaults
**What should the default time range be when users open this dashboard?**

**Options:**
- A) Last 7 days (current week view)
- B) Last 14 days (two-week view)
- C) All time (entire cohort to date)
- D) Current week only (Monday-Sunday)

**My Recommendation:** Last 7 days (most actionable for facilitators)

---

### Q2: Builder Segmentation Definitions
**How should we define "Top Performers" and "Struggling Builders"?**

**Option A: Absolute Thresholds**
- Top: >90% task completion AND >90% attendance
- Struggling: <50% task completion OR <70% attendance

**Option B: Relative (Percentile)**
- Top: Top 20% of cohort by engagement score
- Struggling: Bottom 20% of cohort

**Option C: Composite Score**
- Create engagement score: (Attendance × 0.3) + (Task Completion × 0.5) + (Quality × 0.2)
- Top: Score >80
- Struggling: Score <40

**Option D: Let you define custom thresholds**

**My Recommendation:** Option A (absolute thresholds) - easier to explain and consistent across cohorts

**Your Answer:** _____________________

---

### Q3: Block Category Grouping
**I found 21 different block categories. Should we group them?**

**Current categories:**
- Learning, Building/Build, Reflection/Reflecton
- Practice, Research, Assessment, Testing
- Group Activity, Individual, Presentation
- Break, Celebration, Networking
- Team Building, Professional Development
- Planning, Preparation, Self learning

**Option A: Keep all 21 (might be overwhelming)**

**Option B: Group into 5 meta-categories**
1. **Core Learning**: Learning, Practice, Research, Self learning
2. **Applied Work**: Building/Build, Testing, Assessment
3. **Collaboration**: Group Activity, Team Building, Presentation
4. **Reflection**: Reflection/Reflecton, Individual
5. **Other**: Break, Celebration, Networking, Planning, Preparation, Professional Development

**Option C: Let users create custom groupings**

**My Recommendation:** Option B (5 meta-categories) with ability to expand to see sub-categories

**Your Answer:** _____________________

---

### Q4: Filter Presets
**Should we allow users to save filter combinations as presets?**

**Example Presets:**
- "My Weekly Check-in" (Last 7 days, All builders, Learning+Building only)
- "QDR Report" (Last 30 days, All builders, All categories)
- "Struggling Builders Focus" (Last 14 days, Bottom 20%, Learning tasks)

**Options:**
- A) Yes, with 3-5 system presets + custom user presets
- B) Yes, but only system presets (no custom)
- C) No, keep it simple

**My Recommendation:** Option A (system + custom presets)

**Your Answer:** _____________________

---

## 📈 SECTION 2: Always-Visible Charts & Key Hypotheses

Based on what facilitators and program managers need, here are the hypotheses to test:

### Dashboard Layout (4 Rows)

```
┌─────────────────────────────────────────────────────────────┐
│  ROW 1: CURRENT STATE SNAPSHOT (KPI Cards)                  │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ 🟢 Active    │ 📊 Tasks     │ 👥 Attendance│ 🔴 Need Help   │
│   Builders   │   Completed  │   Rate       │   (Flagged)    │
│              │              │              │                │
│   68/76      │   92%        │   87%        │   5 builders   │
│   (89%)      │  (vs 88%     │  (vs 91%     │   (see list)   │
│              │   last week) │   last week) │                │
└──────────────┴──────────────┴──────────────┴────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ROW 2: ENGAGEMENT TRENDS                                    │
├─────────────────────────┬───────────────────────────────────┤
│  Daily Active Builders  │  Task Completion by Week          │
│  (Line chart, 30 days)  │  (Bar chart, Weeks 1-4)           │
│                         │                                   │
│        📈               │        ██ ██ ██ █                 │
└─────────────────────────┴───────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ROW 3: HYPOTHESIS TESTING                                   │
├──────────────────────────┬──────────────────────────────────┤
│  H1: Attendance drives   │  H2: Activity type patterns      │
│      task completion     │      (Category breakdown)        │
│  (Scatter: Att vs Comp)  │  (Radar chart)                   │
│                          │                                  │
│     ●    ●  ●            │      Learning ▬▬▬▬▬             │
│   ●   ●  ●  ●            │      Building ▬▬▬               │
│  ●  ●  ●                 │      Reflection ▬▬▬▬            │
└──────────────────────────┴──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ROW 4: DISTRIBUTION & OUTLIERS                              │
├─────────────────────────┬────────────────────────────────────┤
│  Builder Performance    │  Top 10 / Bottom 10                │
│  Distribution           │  (Comparative bar)                 │
│  (Histogram)            │                                    │
│                         │  Dwight W.     ████████ 21        │
│      ██                 │  Letisha G.    ████ 8             │
│    ████                 │  ...                               │
│  ██████                 │  [Bottom 10]                       │
│ ████████                │  Builder X     ▌ 1                │
└─────────────────────────┴────────────────────────────────────┘
```

---

## ❓ QUESTIONS FOR YOU (Section 2: Hypotheses)

### Q5: Key Hypotheses to Test
**Which of these hypotheses matter most to your team?** (Rank 1-7)

Hypothesis | Description | Your Rank
-----------|-------------|----------
**H1: Attendance drives performance** | Builders with high attendance complete more tasks | _____
**H2: Early engagement predicts success** | Week 1 activity correlates with overall success | _____
**H3: Activity type preference exists** | Builders excel at certain categories (Learning vs Building) | _____
**H4: Improvement trajectory is measurable** | Can track week-over-week improvement | _____
**H5: Weekend work patterns matter** | Builders who work weekends perform differently | _____
**H6: Peer influence is real** | Table group performance affects individuals | _____
**H7: Task difficulty varies** | Some tasks have consistently low completion rates | _____

**My Recommendation:** Focus on H1, H2, H4, H7 for MVP (most actionable)

**Your Top 4:** _____, _____, _____, _____

---

### Q6: KPI Card Metrics
**Which 4 metrics should be in the "Current State Snapshot" cards?**

**Current Proposal:**
1. Active Builders Today (vs 7-day average)
2. Task Completion Rate This Week (vs last week)
3. Attendance Rate (7-day average)
4. Builders Needing Intervention (flagged count)

**Alternative Options:**
- Average submissions per builder
- Tasks behind schedule (late submissions)
- Quality score average (when defined)
- On-time submission rate
- Group vs individual task balance
- Week-over-week improvement rate

**Keep my 4 or suggest changes:** _____________________

---

### Q7: Chart Update Frequency
**How often should these charts refresh?**

**Options:**
- A) Real-time (updates every time a builder submits)
- B) Every 5 minutes (auto-refresh)
- C) Every hour (batch update)
- D) Manual refresh only (user clicks button)

**My Recommendation:** Option B (every 5 minutes) - balance between freshness and performance

**Your Answer:** _____________________

---

## 📖 SECTION 3: Terminology Legend

Here's what I propose for the legend. **This needs your validation:**

### Core Metrics (Your Team Must Agree on These)

#### 1. Attendance
```
DEFINITION:
Builder checked in during scheduled class time (M-W only)

CALCULATION:
COUNT(attendance.status = 'present')
÷ COUNT(curriculum_days WHERE cohort = 'September 2025')

EXCLUSIONS:
- No class on Thu/Fri
- No class on 9/15/2025 (holiday)
- Staff users excluded (IDs: 129, 5, 240, 326)
- Volunteer users excluded (IDs: 327, 329, 331, 330, 328, 332)

DATA SOURCE: attendance table
UPDATED: Real-time

EXAMPLE: If there are 19 class days and builder attended 17:
  Attendance Rate = 17 ÷ 19 = 89.5%
```

#### 2. Task Completion
```
DEFINITION:
Builder had ANY interaction with the task (not quality-based)

CALCULATION:
EXISTS(SELECT 1 FROM task_submissions
       WHERE task_id = X AND user_id = Y)

WHAT COUNTS:
✅ Any submission (even "I need help")
✅ Conversation with AI
✅ Deliverable upload
❌ Just viewing the task (no interaction)

DATA SOURCE: task_submissions table
UPDATED: Real-time

EXAMPLE: If builder submits "I'm stuck" → counts as completed
```

#### 3. Active Builder
```
DEFINITION:
Builder with at least 1 submission in the specified time period

CALCULATION:
COUNT(DISTINCT user_id)
FROM task_submissions
WHERE created_at BETWEEN [start] AND [end]

TIME PERIOD: Configurable (default: last 7 days)

DATA SOURCE: task_submissions table
UPDATED: Real-time

EXAMPLE: "68 active builders today" = 68 builders submitted something today
```

#### 4. Struggling Builder ⚠️ NEEDS DEFINITION
```
PROPOSED DEFINITION:
Builder meeting ANY of these criteria:
- Task completion rate < 50%
- Attendance rate < 70%
- Zero submissions in last 3 class days

ALTERNATIVE DEFINITIONS:
A) Bottom 20% of cohort by engagement score
B) Flagged by facilitator manually
C) Predictive model based on multiple factors

👉 YOUR INPUT NEEDED 👈
```

#### 5. Top Performer ⚠️ NEEDS DEFINITION
```
PROPOSED DEFINITION:
Builder meeting ALL of these criteria:
- Task completion rate > 90%
- Attendance rate > 90%
- Quality score > 80% (when available)

ALTERNATIVE DEFINITIONS:
A) Top 20% of cohort by engagement score
B) Nominated by facilitators
C) Meets specific learning objectives

👉 YOUR INPUT NEEDED 👈
```

---

## ❓ QUESTIONS FOR YOU (Section 3: Definitions)

### Q8: Struggling Builder Definition
**How should we define a "struggling builder"?**

**Option A: Thresholds (Strict)**
- <50% task completion OR <70% attendance OR no submissions in 3 days

**Option B: Relative (Percentile)**
- Bottom 20% of cohort

**Option C: Composite Score**
- Engagement score <40 (weighted formula)

**Option D: Multi-factor Model**
- Attendance + Completion + Quality + Trend (improving/declining)

**Option E: Let me define custom criteria per your needs**

**My Recommendation:** Start with Option A (simple, actionable), evolve to Option D

**Your Answer:** _____________________

---

### Q9: Quality Metrics (BigQuery Data)
**Your BigQuery has assessment_feedback with rubric scores. How should we display this?**

**I found these rubric categories:**
- Technical Skills
- Business Value
- Project Management
- Risk Assessment
- Research Skills
- Critical Thinking

**Options:**
- A) Show average score across all rubrics
- B) Break down by rubric category (radar chart)
- C) Weight categories differently (Technical × 0.5 + Business × 0.3 + Other × 0.2)
- D) Don't show quality yet (Phase 2)

**My Recommendation:** Option D for MVP (focus on completion first), Option B for Phase 2

**Your Answer:** _____________________

---

### Q10: Task Difficulty Scoring
**Should we auto-calculate task difficulty based on completion rates?**

**Proposal:**
- **Easy**: >90% completion
- **Medium**: 70-90% completion
- **Hard**: 50-70% completion
- **Very Hard**: <50% completion

**Use case:**
- Identify tasks that need redesign
- Help facilitators prepare better support
- Balance weekly workload

**Should we implement this?**
- A) Yes, show difficulty badges on tasks
- B) Yes, but only for internal analysis (not visible to builders)
- C) No, not needed

**My Recommendation:** Option B (internal analysis, inform curriculum design)

**Your Answer:** _____________________

---

### Q11: Time-Based Patterns
**Should we track and display work pattern insights?**

**Examples:**
- "68% of submissions happen on weekends"
- "Most active time: 7-9 PM EST"
- "Builders who work weekends complete 23% more tasks"

**Options:**
- A) Yes, include in proactive insights panel (Phase 2)
- B) Yes, show in "Insights" tab on metrics dashboard
- C) Yes, but only in natural language queries
- D) No, not relevant

**My Recommendation:** Option A (Phase 2 feature - interesting but not critical for MVP)

**Your Answer:** _____________________

---

## 🎨 SECTION 4: Additional Recommendations

### Export Functionality
**Every view should be exportable:**
- PDF for sharing with leadership
- CSV for Excel analysis
- PNG image for presentations
- Shareable link (with filter state preserved)

**Agree?** Y / N

---

### Mobile Responsiveness
**Should this work on mobile/tablet?**

Current design is desktop-first. Mobile considerations:
- Filters collapse to drawer
- Charts stack vertically
- Touch-friendly interactions
- Simplified views on small screens

**Priority:**
- A) Must have for MVP (many facilitators use tablets)
- B) Nice to have for Phase 2
- C) Desktop only (facilitators primarily use laptops)

**My Recommendation:** Option B (Phase 2)

**Your Answer:** _____________________

---

### Real-Time Collaboration
**Should multiple users see the same filtered view?**

**Use case:** In a meeting, someone shares screen with specific filters applied. Others want to see same view.

**Options:**
- A) Shareable filter URLs (click link → see same view)
- B) "Broadcast mode" (facilitator controls what everyone sees)
- C) Not needed

**My Recommendation:** Option A (shareable URLs)

**Your Answer:** _____________________

---

## 📋 Implementation Priority Summary

Based on your answers, here's my recommended build order:

### Phase 1 (MVP - Weeks 1-4)
1. ✅ Natural language query (existing)
2. 🆕 Defined metrics dashboard with filters
3. 🆕 Top 4 hypotheses charts (from your Q5 rankings)
4. 🆕 Terminology legend with validated definitions
5. 🆕 Export to PDF/CSV
6. 🆕 Shareable filter URLs

### Phase 2 (Weeks 5-8)
1. Proactive insights panel
2. Quality metrics from BigQuery
3. Cross-cohort comparisons (when June/March data clean)
4. Advanced hypotheses (remaining from Q5)
5. Mobile responsiveness
6. Saved filter presets

### Phase 3 (Future)
1. Automated alerting
2. Predictive analytics
3. White-label version
4. API for external integrations

---

## ✅ YOUR ACTION ITEMS

Please review and answer:
- [ ] **Q1**: Default time range → _____
- [ ] **Q2**: Top/Struggling builder definition → _____
- [ ] **Q3**: Block category grouping → _____
- [ ] **Q4**: Filter presets → _____
- [ ] **Q5**: Top 4 hypotheses to test → _____, _____, _____, _____
- [ ] **Q6**: KPI card metrics (keep or change) → _____
- [ ] **Q7**: Chart refresh frequency → _____
- [ ] **Q8**: Struggling builder criteria → _____
- [ ] **Q9**: Quality metrics display → _____
- [ ] **Q10**: Task difficulty scoring → _____
- [ ] **Q11**: Time-based patterns → _____
- [ ] **Export functionality**: Agree? → Y / N
- [ ] **Mobile priority**: → A / B / C
- [ ] **Shareable URLs**: → A / B / C

---

## 🚀 Next Steps After Your Approval

1. **You answer questions above**
2. **I create detailed mockups** for each dashboard tab
3. **We validate with Jac/Joanna/Dave**
4. **I build Phase 1 features**
5. **We test with facilitators**
6. **Launch!**

---

**Questions or need clarification on anything?** Let me know and I'll provide more details or alternative options.
