# Product Requirements Document (PRD)
**Project Name:** Cohort Analytics Dashboard (Natural Language + Visual KPIs)
**Document Owner:** Greg Hogue
**Date Created:** October 2, 2025
**Last Updated:** October 2, 2025
**Status:** Draft - Based on Prototype Feedback Session

---

## 1. Executive Summary

**What:** An AI-powered analytics dashboard that combines natural language querying, static KPI visualizations, and proactive insights to provide real-time answers about cohort performance.

**Why:** Teams consistently ask questions about cohort data that remain unanswered due to lack of easy-to-use analytics tools. Current manual reporting is time-intensive and creates delays in decision-making.

**Impact:** Enable facilitators, program managers, and leadership to get instant, trustworthy answers about builder performance, attendance, task completion, and learning outcomes without waiting for manual reports.

---

## 2. Problem Statement

### Current State
- Questions about cohort data frequently go unanswered
- Manual report generation is time-consuming
- Historical lack of trust in organizational data accuracy
- No unified view of builder performance, attendance, and task completion
- Each stakeholder has different questions, requiring custom queries

### Problem
Teams need immediate access to cohort analytics but lack:
1. Easy query interface (currently requires SQL knowledge)
2. Validated, trustworthy metric definitions
3. Ability to drill down from high-level insights to individual details
4. Proactive identification of outliers and patterns

### Why Now?
- September 2025 cohort has cleaner data than previous cohorts
- Growing need for data-driven program improvements
- Teams are asking more sophisticated questions
- Opportunity to leverage AI for natural language querying

---

## 3. Goals & Success Metrics

### Primary Goal
Reduce time to answer cohort performance questions from hours/days to seconds, while ensuring data trustworthiness.

### Success Metrics
1. **Response Time**: 95% of queries answered in < 5 seconds
2. **Adoption**: 80% of team members use dashboard weekly
3. **Trust**: 90% confidence score in data accuracy (validated through metric definition sessions)
4. **Coverage**: Top 10 metrics (attendance, task completion, grades, etc.) fully validated and trusted

### Key Results Timeline
- **30 days post-launch**: MVP with 10 validated metrics operational
- **90 days post-launch**: 50+ metrics available, cross-cohort comparisons enabled

---

## 4. Target Users

### Primary Users
- **Facilitators**: Need daily/weekly performance insights for intervention
- **Program Managers** (Joanna, Jac): Need QDR/reporting data and trend analysis
- **Instructional Team**: Need builder progress tracking

### Secondary Users
- **Leadership**: Need high-level KPIs and cohort comparisons
- **External Partners**: May need white-labeled version for their cohorts

### User Needs
- **As a facilitator**, I need to quickly identify struggling builders so that I can intervene early
- **As a program manager**, I need validated attendance and completion metrics so that I can report accurate outcomes
- **As leadership**, I need cross-cohort comparisons so that I can measure program improvement over time

---

## 5. Solution Overview

### Core Functionality
Three-part hybrid system combining the best of AI querying, static dashboards, and proactive insights:

1. **Natural Language Query Interface**
   - Ask questions in plain English
   - AI translates to SQL and visualizes results
   - Drill-down capability on any data point

2. **Static KPI Dashboard**
   - Consistent visual layout for frequently tracked metrics
   - Easy pattern recognition and outlier detection
   - Pre-defined views for weekly/daily operations

3. **Proactive Insights Panel**
   - AI automatically identifies outliers and patterns
   - "Here's what you should act on" recommendations
   - Automated alerts for concerning trends

### User Experience
1. User selects query mode (natural language, static dashboard, or insights)
2. For natural language: types question → sees chart/table → clicks to drill down
3. For static dashboard: views KPIs → clicks outliers → sees details
4. For insights: reviews AI-identified patterns → clicks to investigate → takes action

### Key Features
- **Natural Language Processing**: Claude AI interprets questions and generates SQL
- **Interactive Visualizations**: Click any chart element to drill down
- **Builder Profiles**: Comprehensive view of individual builder performance
- **Task Analytics**: Completion rates, quality metrics, submission patterns
- **Attendance Tracking**: Daily/weekly trends with outlier detection
- **Cross-Cohort Comparison** (Future): Compare September vs June vs March
- **Educational Tooltips**: Explain how metrics are calculated and graded

---

## 6. Scope & Constraints

### In Scope (MVP - Phase 1)
- ✅ Top 10 validated metrics (attendance, task completion, grades, etc.)
- ✅ Natural language query interface
- ✅ Interactive drill-down panels
- ✅ September 2025 cohort data
- ✅ Builder and task detail views
- ✅ Integration with existing tool (React components, not iframe)

### Out of Scope (Future Phases)
- ❌ Cross-cohort comparisons (Phase 2)
- ❌ Proactive insights panel (Phase 2)
- ❌ Static KPI dashboard (Phase 2)
- ❌ Automated alerting/notifications (Phase 3)
- ❌ White-label version for external partners (Phase 3)
- ❌ March/June cohort data (data quality issues)

### Constraints
- **Technical**: Must integrate into main tool (no iframes), follow Carlos's development standards
- **Data Quality**: September 2025 only for MVP (cleanest data)
- **Database**: Must evaluate Postgres vs BigQuery for performance
- **Trust**: All metrics must be validated through metric definition sessions with team
- **Timeline**: Need approval from Dave (Wednesday meeting), sign-off from Joanna on data outputs

---

## 7. Dependencies & Risks

### Dependencies
1. **Metric Definition Sessions** (Jac): Need team alignment on how each metric is calculated
2. **BigQuery Access** (Jac/Carlos): Credentials and schema mapping
3. **Database Schema Documentation**: Clear mapping of field names to user-friendly terms
4. **Approval from Dave**: PRD review in Wednesday meeting
5. **Joanna Sign-off**: Validation of data outputs and metrics

### Risks & Mitigation
- **Risk**: Lack of trust in AI-generated outputs
  **Mitigation**: Metric definition sessions, validation testing, show SQL queries for transparency

- **Risk**: AI misinterprets questions or uses wrong fields
  **Mitigation**: Keyword mapping, schema context in prompts, user feedback loop

- **Risk**: Performance issues with large queries
  **Mitigation**: Evaluate BigQuery vs Postgres, implement query optimization

- **Risk**: Iframe approach creates maintenance burden
  **Mitigation**: Build as React components in main tool from start

---

## 8. Timeline & Milestones

### High-Level Timeline
- **Metric Definition Sessions**: 1-2 weeks
- **BigQuery Evaluation**: 1 week (parallel)
- **MVP Development**: 2-3 weeks
- **Testing & Validation**: 1 week
- **Launch**: Target 4-6 weeks from approval

### Key Milestones
- **Week 1**: PRD approval, metric definition sessions begin
- **Week 2**: Postgres vs BigQuery comparison complete, top 10 metrics defined
- **Week 3**: MVP development complete, testing begins
- **Week 4**: Validation complete, Joanna sign-off
- **Week 5-6**: Launch and user onboarding

---

## 9. Detailed Requirements

### Functional Requirements (From Transcript Feedback)

#### Natural Language Query System
1. User types question in plain English
2. AI (Claude) interprets intent and identifies required data
3. System generates SQL query (show query for transparency)
4. Results displayed as appropriate visualization (chart, table, etc.)
5. Every element is clickable for drill-down

#### Metric Definitions (Top 10 MVP Metrics)
**To be validated in metric definition sessions:**
1. **Attendance**: Daily check-in status (present/absent)
2. **Task Completion**: Any interaction with task = completed (NOT quality-based for MVP)
3. **Task Quality**: TBD - needs rubric alignment
4. **Grades**: From BigQuery, need interpretation guide
5. **Submission Timing**: On-time vs late submissions
6. **Builder Engagement**: Frequency of task interactions
7. **Cohort Completion Rate**: % of tasks completed across all builders
8. **Daily Active Builders**: Unique builders with activity per day
9. **Struggling Builders**: TBD - needs definition of "struggling"
10. **Top Performers**: TBD - needs definition of success criteria

#### Drill-Down Functionality
- Click builder name → Full builder profile (all tasks, attendance history, grades)
- Click task → Task details (completion rate, submissions, quality metrics)
- Click attendance metric → Daily breakdown with builder names
- Click chart element → Filtered view of underlying data

#### Data Source Integration
- **Primary**: Postgres database (current implementation)
- **Evaluate**: BigQuery for analytics layer (better for complex queries)
- **Assessment Data**: BigQuery for grades and feedback

#### Educational Components
- Tooltip on each metric explaining calculation
- Link to grading rubric interpretation guide
- Documentation of data sources and update frequency

### Technical Requirements

#### Database Connection
- [ ] **Decision needed**: Postgres vs BigQuery
  - Test both implementations
  - Compare query performance
  - Evaluate cost implications
  - Document pros/cons

#### Schema Context for AI
- [ ] Provide full schema to AI in query context
- [ ] Create keyword mapping document:
  - "submissions" → specific field name
  - "completed task" → interaction check
  - "attendance" → check-in field
- [ ] Document excluded users (staff, volunteers, duplicates)

#### Integration Architecture
- [ ] Build as React components (NOT iframe)
- [ ] Follow Carlos's development standards document
- [ ] Integrate into main tool navigation
- [ ] Single authentication flow

#### Performance Requirements
- Query response time: < 5 seconds for 95% of queries
- Drill-down loading: < 2 seconds
- Support concurrent users: 20+ simultaneous queries

### Design Requirements

#### Visual Design
- Consistent with main tool UI/UX
- Responsive (desktop primary, mobile future)
- Color-coded metrics (green/yellow/red for quick scanning)
- Clear hierarchy: Overview → Detail → Individual

#### Accessibility
- Screen reader compatible
- Keyboard navigation
- High contrast mode support

---

## 10. Open Questions

### Data & Metrics
- [ ] How do we define "struggling builder" quantitatively?
- [ ] What threshold determines "top performer"?
- [ ] Should task completion consider quality or just interaction?
- [ ] How do we weight different task types in overall scoring?

### Technical
- [ ] Postgres or BigQuery for analytics queries?
- [ ] How do we handle real-time vs batch updates?
- [ ] What's the caching strategy for frequently asked questions?
- [ ] How do we version control metric definitions?

### Product
- [ ] Should we show SQL queries to users for transparency?
- [ ] How do we handle queries that can't be answered with available data?
- [ ] What's the educational onboarding for new users?
- [ ] How do we collect feedback on metric trustworthiness?

### Future Phases
- [ ] When do we add static KPI dashboard (Phase 2)?
- [ ] When do we add proactive insights panel (Phase 2)?
- [ ] What triggers expansion to March/June cohorts?
- [ ] What's the white-labeling strategy for external partners?

---

## Appendix

### Supporting Materials
- **Prototype**: https://segundo-query-pepbok4ox-gregs-projects-61e51c01.vercel.app
- **System Diagram**: `/docs/system-diagram.html`
- **Transcript**: `/Jac-Carlos-Greg-Cohort-Data-PRD-Chat-b62831ed-cdbc.json`

### Key Feedback from Prototype Review
1. **Trust is critical**: Metric definition sessions are mandatory before launch
2. **Hybrid approach**: Combine natural language, static dashboard, and proactive insights
3. **No iframes**: Must be integrated into main tool as React components
4. **MVP focus**: Top 10 metrics only, September cohort only
5. **Drill-down is essential**: Users always want to see underlying details
6. **Educational value**: Users need to understand how metrics are calculated

### Current Prototype Capabilities
- ✅ Natural language query interface
- ✅ Interactive visualizations
- ✅ Builder drill-down panels
- ✅ Task detail views
- ✅ Attendance tracking
- ✅ September 2025 cohort data
- ⚠️ Task completion (interaction-based, not quality-based)
- ⚠️ Direct Postgres connection (need to evaluate BigQuery)

### Phase 2 Features (Post-MVP)
- Static KPI dashboard with consistent layout
- Proactive insights panel (AI-identified outliers)
- Cross-cohort comparisons (September vs June vs March)
- Automated alerting for concerning trends
- Enhanced drill-down with historical trends

### Phase 3 Features (Future)
- White-label version for external partners
- Mobile-optimized interface
- Automated weekly reports
- Integration with external tools (Slack, email)
- Predictive analytics (builder success predictions)

---

**Next Steps:**
1. ✅ Create PRD (this document)
2. [ ] Share with Jac and Carlos for feedback
3. [ ] Present to Dave in Wednesday meeting
4. [ ] Schedule metric definition sessions with team
5. [ ] Get Joanna's sign-off on data outputs
6. [ ] Evaluate Postgres vs BigQuery
7. [ ] Begin MVP development with validated metrics
