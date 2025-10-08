# Implementation Plan - Cohort Analytics Dashboard
**Based on:** Jac-Carlos-Greg Feedback Session
**Date:** October 2, 2025
**Status:** Action Items from Transcript

---

## 🎯 Immediate Action Items (This Week)

### 1. Documentation & Alignment
- [x] **Create PRD** - Draft completed (see `PRD-Cohort-Analytics-Dashboard.md`)
- [ ] **Share PRD with Jac & Carlos** for review
- [ ] **Schedule Wednesday meeting with Dave** for approval
- [ ] **Meet with Joanna** to align on metrics and get sign-off on data outputs
- [ ] **Get Carlos's development standards document** for React component guidelines

### 2. Technical Evaluation
- [ ] **Postgres vs BigQuery Comparison**
  - Create duplicate implementation using BigQuery
  - Compare query performance (speed, reliability)
  - Compare cost implications
  - Document pros/cons
  - Make recommendation
  - **Owner:** Greg
  - **Timeline:** 1 week

### 3. Metric Definition Sessions
- [ ] **Schedule sessions with team** (Jac to coordinate)
- [ ] **Define Top 10 Metrics** with clear calculations:
  1. Attendance
  2. Task Completion
  3. Task Quality
  4. Grades interpretation
  5. Submission Timing
  6. Builder Engagement
  7. Cohort Completion Rate
  8. Daily Active Builders
  9. Struggling Builders (needs criteria)
  10. Top Performers (needs criteria)
- [ ] **Create keyword mapping document** for AI context
- [ ] **Document excluded users and why** (staff, volunteers, duplicates)

---

## 📊 Phase 1: MVP Development (Weeks 2-4)

### Core Features to Build

#### 1. Enhanced Natural Language Interface
**Current State:** Basic query works
**Improvements Needed:**
- [ ] Add schema context to AI prompts
- [ ] Implement keyword mapping for common terms
- [ ] Show SQL query for transparency (optional view)
- [ ] Add "Did this answer your question?" feedback
- [ ] Handle edge cases (unanswerable questions)

#### 2. Improved Drill-Down System
**Current State:** Click builder name opens profile
**Enhancements:**
- [ ] Fix task click-through (currently broken)
- [ ] Add breadcrumb navigation (Query → Chart → Details)
- [ ] Enable back/forward navigation
- [ ] Add "related insights" suggestions
- [ ] Implement deep linking (shareable URLs)

#### 3. Builder Profile Enhancement
**Current State:** Shows basic builder info
**Add:**
- [ ] Complete attendance history (calendar view)
- [ ] All task submissions with status
- [ ] Grade breakdown by category
- [ ] Trend line (improving/declining)
- [ ] Comparison to cohort average

#### 4. Task Analytics View
**Current State:** Not fully implemented
**Build:**
- [ ] Task completion rate (cohort-wide)
- [ ] Individual submission details
- [ ] Quality distribution (when metric defined)
- [ ] Time-to-completion metrics
- [ ] Click submission to see full thread

#### 5. Educational Components
**New Feature:**
- [ ] Tooltip on each metric explaining calculation
- [ ] "How is this calculated?" expandable sections
- [ ] Link to grading rubric guide
- [ ] Data freshness indicator ("Updated 5 min ago")
- [ ] FAQ section for common questions

---

## 🏗️ Architecture Changes

### Database Integration
**Current:** Direct Postgres connection
**Decision Needed:** Migrate to BigQuery or stay with Postgres

**If BigQuery:**
- [ ] Get credentials from Jac/Carlos
- [ ] Test connection and query performance
- [ ] Update all queries to BigQuery syntax
- [ ] Implement service account authentication
- [ ] Test with assessment/grades data

**If Postgres:**
- [ ] Optimize existing queries
- [ ] Add connection pooling
- [ ] Implement query caching
- [ ] Monitor performance

### Integration with Main Tool
**Critical Change:** NO iframe approach
- [ ] Get Carlos's development standards doc
- [ ] Refactor as React components
- [ ] Follow existing tool structure
- [ ] Use shared authentication
- [ ] Match UI/UX patterns
- [ ] Integrate into main navigation
- [ ] Test in tool development environment

### AI Context Enhancement
**Goal:** Improve query accuracy
- [ ] Document full database schema
- [ ] Create field → user-term mapping:
  ```
  "submissions" → submissions.created_at field
  "completed task" → EXISTS(SELECT 1 FROM submissions WHERE...)
  "attendance" → attendance.status = 'present'
  "grades" → assessment_feedback.score
  ```
- [ ] Add cohort filter context (September 2025)
- [ ] Add excluded users list to context
- [ ] Implement prompt engineering best practices

---

## 🎨 Phase 2: Hybrid Dashboard (Weeks 5-8)

### Static KPI Dashboard
**Purpose:** Consistent view for daily operations

**Layout:**
```
┌─────────────────────────────────────────┐
│  Today's Snapshot                       │
│  ┌─────────┬─────────┬─────────┐       │
│  │Attendance│Tasks    │Active   │       │
│  │68/75    │92%      │71       │       │
│  └─────────┴─────────┴─────────┘       │
│                                         │
│  This Week's Trends                     │
│  ┌────────────────────────────┐        │
│  │  [Line Chart]              │        │
│  └────────────────────────────┘        │
│                                         │
│  Outliers Detected                      │
│  🔴 5 builders below 50% completion     │
│  🟡 3 tasks with <70% completion rate   │
└─────────────────────────────────────────┘
```

**Features:**
- [ ] Pre-defined KPI cards (top 10 metrics)
- [ ] Auto-refresh (every 5 minutes)
- [ ] Color-coded thresholds (red/yellow/green)
- [ ] Click any KPI to drill down
- [ ] Export to PDF for reporting

### Proactive Insights Panel
**Purpose:** AI identifies patterns automatically

**Features:**
- [ ] Auto-scan data for outliers
- [ ] "Here's what needs attention" cards
- [ ] Trend detection (improving/declining)
- [ ] Predictive alerts (based on patterns)
- [ ] Recommended actions

---

## 🧪 Testing & Validation

### Metric Validation
- [ ] Create test queries for each of top 10 metrics
- [ ] Manual verification against known data
- [ ] Cross-check with Joanna's reports
- [ ] Document any discrepancies
- [ ] Get team sign-off on accuracy

### User Acceptance Testing
- [ ] Test with 3-5 facilitators
- [ ] Test with program managers
- [ ] Collect feedback on:
  - Query interpretation accuracy
  - Visualization clarity
  - Drill-down usefulness
  - Educational value
  - Trust in metrics

### Performance Testing
- [ ] Test with 20 concurrent users
- [ ] Measure query response times
- [ ] Test complex drill-down scenarios
- [ ] Monitor database load
- [ ] Optimize slow queries

---

## 📋 Success Criteria

### MVP Launch Checklist
- [ ] All top 10 metrics validated and accurate
- [ ] Postgres vs BigQuery decision made and implemented
- [ ] Integrated into main tool (no iframe)
- [ ] Educational tooltips on all metrics
- [ ] Drill-down works on all visualizations
- [ ] Dave approval received
- [ ] Joanna sign-off on data outputs
- [ ] User testing completed with positive feedback
- [ ] Documentation complete (user guide + technical)

### Key Metrics to Track Post-Launch
- Weekly active users (target: 80% of team)
- Average queries per user per week
- Query success rate (answered vs failed)
- User trust score (survey after 30 days)
- Time to answer vs manual reporting

---

## 🚧 Known Blockers & Dependencies

### Blockers
1. **Metric definitions not finalized** → Cannot validate accuracy
   - **Mitigation:** Schedule sessions ASAP, use current definitions temporarily

2. **BigQuery access/credentials** → Cannot test alternative approach
   - **Mitigation:** Get from Jac/Carlos this week

3. **Carlos's development standards** → Cannot start React refactor
   - **Mitigation:** Request document, start with prototype architecture

4. **Dave's approval** → Cannot commit resources
   - **Mitigation:** Present PRD Wednesday, have backup plan

### Dependencies
- **Jac:** Metric definition session scheduling, BigQuery access
- **Carlos:** Development standards, code review, integration support
- **Joanna:** Data validation, metric sign-off, QDR alignment
- **Dave:** Budget/resource approval

---

## 🔄 Iteration & Feedback Loop

### Weekly Check-ins
- **Mondays:** Progress update with Jac/Carlos
- **Wednesdays:** Demo new features to team
- **Fridays:** Collect feedback, prioritize next week

### Feedback Channels
- Slack channel for bug reports
- Weekly survey on metric trust
- Monthly user interviews
- Analytics on query patterns

### Continuous Improvement
- Track which queries fail → improve AI context
- Track which metrics are questioned → improve definitions
- Track which drill-downs are unused → remove or improve
- Track performance issues → optimize

---

## 📅 Timeline Summary

**Week 1 (Current):**
- Create PRD ✅
- Get approvals from Dave & Joanna
- Evaluate Postgres vs BigQuery
- Begin metric definition sessions

**Week 2-3:**
- Complete metric definitions
- Build enhanced drill-down
- Add educational components
- Refactor as React components

**Week 4:**
- Testing & validation
- Performance optimization
- Documentation

**Week 5-6:**
- Launch MVP
- User onboarding
- Collect feedback

**Week 7-8 (Phase 2):**
- Build static KPI dashboard
- Add proactive insights panel
- Cross-cohort comparison (if data ready)

---

## 🎓 Lessons from Feedback Session

### What Resonated
✅ Drill-down is essential (users always want details)
✅ Trust is the hardest problem (not technical complexity)
✅ Hybrid approach addresses different user preferences
✅ Educational components reduce support burden

### What to Avoid
❌ No iframes (creates maintenance nightmare)
❌ Don't skip metric definition sessions (trust is paramount)
❌ Don't build everything at once (MVP focus)
❌ Don't ignore data quality issues (September only for MVP)

### Key Quotes
> "The issue with the org's data historically has been lack of trust" - Jac

> "Whenever you have an issue with the admin dashboard, I'm always pointing you to Jack because she maintains that" - Carlos (on why no iframes)

> "I think there's also like an educational component to this for anyone who's stepping into it" - Greg

> "Everything has to be one package if we want to white label this" - Greg

---

**Last Updated:** October 2, 2025
**Next Review:** After Wednesday meeting with Dave
