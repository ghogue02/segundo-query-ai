# Agent Testing Protocol - Second Query AI
**Version:** 1.0
**Purpose:** Unbiased functional and UX/UI evaluation
**Target:** https://segundo-query-1vqpo543s-gregs-projects-61e51c01.vercel.app
**Approach:** Objective observation, data validation, user experience assessment

---

## Testing Instructions for AI Agent

You are conducting an **independent, unbiased evaluation** of the Second Query AI analytics dashboard. Your role is to:

1. **Test functionality** - Does each feature work as expected?
2. **Validate data** - Are numbers accurate and consistent?
3. **Assess UX/UI** - Is the interface intuitive and well-designed?
4. **Identify issues** - Document bugs, inconsistencies, and improvement opportunities
5. **Provide actionable feedback** - Specific, constructive recommendations

**Key Principle:** Report what you observe, not what you expect. Be critical but fair.

---

## Section 1: Initial Load & Landing Page

### Test 1.1: First Impressions (0-30 seconds)
**Actions:**
- Navigate to homepage
- Observe layout, design, messaging

**Evaluate:**
- [ ] Does the page load within 3 seconds?
- [ ] Is the purpose of the application immediately clear?
- [ ] Are the two main options (Natural Language vs Metrics Dashboard) easy to understand?
- [ ] Is the visual design professional and cohesive?
- [ ] Are there any layout issues (overlapping text, misaligned elements)?

**UX/UI Observations:**
- First impression (confusing, clear, overwhelming, etc.):
- Visual hierarchy effectiveness:
- Call-to-action clarity:
- Mobile responsiveness (if testable):

**Data to Record:**
- Stats shown (builders, days, tasks):
- Any discrepancies or errors:

---

### Test 1.2: Navigation & Information Architecture
**Actions:**
- Review navigation options
- Check for breadcrumbs or back buttons
- Test links to both main features

**Evaluate:**
- [ ] Can you easily navigate to Natural Language interface?
- [ ] Can you easily navigate to Metrics Dashboard?
- [ ] Is there a way to return to home from other pages?
- [ ] Are navigation patterns consistent across pages?

**UX/UI Observations:**
- Navigation clarity (1-5 scale, 5=excellent):
- Any confusing navigation patterns:
- Missing navigation elements:

---

## Section 2: Natural Language Query Interface

### Test 2.1: Basic Query Functionality
**Actions:**
- Navigate to `/query`
- Observe interface design
- Try 3 example queries from the template list

**Example Queries to Test:**
1. "What is today's attendance rate?"
2. "Show me task completion by builder"
3. "Which tasks have the lowest completion rates?"

**Evaluate for Each Query:**
- [ ] Does the query submit successfully?
- [ ] Is there a loading indicator?
- [ ] Does a response appear within 10 seconds?
- [ ] Is the response relevant to the question asked?
- [ ] Are visualizations generated (if applicable)?

**Data Validation:**
- Query 1 result:
- Query 2 result:
- Query 3 result:
- Any error messages:

**UX/UI Observations:**
- Interface clarity:
- Loading state design:
- Result presentation quality:
- Visual hierarchy of responses:

---

### Test 2.2: Custom Query Testing
**Actions:**
- Ask 3 custom questions (create your own based on cohort data)

**Suggested Custom Questions:**
1. "Who are the top 5 most engaged builders this week?"
2. "What percentage of builders completed more than 80% of tasks?"
3. "Show attendance trends over the last 2 weeks"

**Evaluate:**
- [ ] Does the AI understand varied question phrasings?
- [ ] Are responses accurate and data-driven?
- [ ] Do visualizations match the data in the response?
- [ ] Is the tone professional and helpful?

**Error Testing:**
- Ask an intentionally vague question: "Show me data"
- Ask an impossible question: "What will attendance be next week?"
- Document how the system handles these:

**UX/UI Observations:**
- Response formatting quality:
- Chart readability:
- Information density (too much/too little):

---

### Test 2.3: Interactive Elements
**Actions:**
- Look for clickable elements in responses
- Test any drill-down panels
- Test builder detail panels
- Test task detail panels

**Evaluate:**
- [ ] Are interactive elements visually indicated (hover states, cursor changes)?
- [ ] Do drill-downs open smoothly?
- [ ] Is detail panel information accurate?
- [ ] Can you easily close panels/modals?

**UX/UI Observations:**
- Interaction feedback quality:
- Modal/panel design:
- Data presentation in details:

---

## Section 3: Metrics Dashboard - Overview

### Test 3.1: Initial Dashboard Load
**Actions:**
- Navigate to `/metrics`
- Observe layout and organization

**Evaluate:**
- [ ] Does the dashboard load within 5 seconds?
- [ ] Are all sections visible without excessive scrolling?
- [ ] Is the three-tab structure clear (Defined Metrics, Terminology)?
- [ ] Are KPI cards, charts, and filters logically organized?

**Performance Check:**
- Time to interactive:
- Any loading errors:
- Any visual glitches:

**UX/UI Observations:**
- Information architecture effectiveness:
- Visual grouping clarity:
- Color scheme consistency:
- Typography readability:

---

### Test 3.2: Filter Sidebar Functionality
**Actions:**
- Test each filter type:
  - Time range (7/14/30 days, all time, custom)
  - Week selection (Week 1-4)
  - Builder segments (All, Top, Struggling)
  - Activity categories
  - Task types & modes

**Evaluate:**
- [ ] Do filters apply immediately?
- [ ] Is there visual feedback when a filter is active?
- [ ] Do multiple filters work together correctly?
- [ ] Can you easily reset filters?
- [ ] Do filters update KPIs, charts, and quality metrics?

**Data Validation:**
- Apply "Week 1" filter → Record KPI changes:
- Apply "Top Performers" filter → Record KPI changes:
- Apply "Reflection" activity category → Record changes:
- Reset filters → Confirm return to baseline:

**UX/UI Observations:**
- Filter discoverability:
- Active filter indication:
- Filter interaction speed:
- Any confusing filter behaviors:

---

## Section 4: KPI Cards Testing

### Test 4.1: KPI Card - Attendance Today
**Actions:**
- Locate "Attendance Today" card
- Note the value displayed
- Click the card to open drill-down

**Evaluate:**
- [ ] Is the KPI value clearly displayed?
- [ ] Is there context (e.g., "out of 76 builders")?
- [ ] Does clicking open a drill-down modal?
- [ ] Does the drill-down show detailed data?
- [ ] Can you export data to CSV?

**Data Validation:**
- KPI value shown:
- Date context:
- Drill-down row count:
- Any discrepancies between card and drill-down:

**UX/UI Observations:**
- Card design clarity:
- Clickability indication:
- Drill-down modal usability:
- Export button placement/visibility:

**Special Note:**
- If today is Thursday or Friday, expect 0 attendance (no class)
- Does the interface explain this context?

---

### Test 4.2: KPI Card - Attendance Prior Day
**Actions:**
- Locate "Attendance Prior Day" card
- Click to drill down

**Evaluate:**
- [ ] Does it show yesterday's date clearly?
- [ ] Is the count accurate for a class day?
- [ ] Does drill-down list all present builders?
- [ ] Are builder names clickable (link to profiles)?

**Data Validation:**
- Prior day value:
- Date shown:
- Builder count in drill-down:
- Test 3 builder name links → Do profiles load?

---

### Test 4.3: KPI Card - Task Completion This Week
**Actions:**
- Click "Task Completion This Week" card

**Evaluate:**
- [ ] Is the percentage clear and prominent?
- [ ] Does drill-down show task-level completion data?
- [ ] Are task names listed?
- [ ] Can you see completion counts per task?

**Data Validation:**
- Percentage shown:
- Number of tasks in drill-down:
- Spot-check 5 random tasks → Do completion numbers seem reasonable?

---

### Test 4.4: KPI Card - 7-Day Attendance Rate
**Actions:**
- Click "7-Day Attendance Rate" card

**Evaluate:**
- [ ] Is the calculation method clear (class days, not calendar days)?
- [ ] Does drill-down explain which days are included?
- [ ] Are Thu/Fri excluded from calculation?

**Data Validation:**
- 7-day rate shown:
- Date range in drill-down:
- Verify Thu/Fri are NOT in the 7 class days:

---

### Test 4.5: KPI Card - Need Intervention
**Actions:**
- Click "Need Intervention" card

**Evaluate:**
- [ ] Is "intervention" criteria explained?
- [ ] Does drill-down show builder names?
- [ ] Can you see why each builder needs intervention (low completion/attendance)?

**Data Validation:**
- Number of builders flagged:
- Criteria shown (completion < X%, attendance < Y%):
- Spot-check 3 builders → Do their stats justify "intervention" flag?

---

## Section 5: Quality Metrics Testing

### Test 5.1: Overall Quality Score Card
**Actions:**
- Locate "Overall Quality Score" card
- Click to drill down

**Evaluate:**
- [ ] Is the score prominently displayed?
- [ ] Is there context (e.g., "based on X assessments")?
- [ ] Does drill-down show BigQuery assessment data?
- [ ] Can you see individual builder scores?

**Data Validation:**
- Overall score:
- Number of assessments:
- Assessment date range:
- Do individual scores average to overall score?

**UX/UI Observations:**
- Score presentation (color coding, icons):
- Context clarity:
- Drill-down table usability:

---

### Test 5.2: Quality by Category Card
**Actions:**
- Locate "Quality by Category" card (radar chart)
- Click to drill down

**Evaluate:**
- [ ] Is the radar chart readable?
- [ ] Are category labels clear?
- [ ] Does drill-down show category breakdowns?

**Data Validation:**
- Categories shown (Technical, Business, Professional):
- Scores per category:
- Any empty/missing categories:

**UX/UI Observations:**
- Chart design effectiveness:
- Label readability:
- Color differentiation:

---

## Section 6: Hypothesis Charts Testing

### Test 6.1: H1 - Attendance Drives Completion
**Actions:**
- Locate H1 scatter chart
- Click to open drill-down

**Evaluate:**
- [ ] Is the correlation coefficient (r value) displayed?
- [ ] Are axes labeled clearly?
- [ ] Does drill-down show raw data table?
- [ ] Are builders identifiable in the data?

**Data Validation:**
- Correlation value (r=?):
- Number of data points:
- Do outliers make sense?

**UX/UI Observations:**
- Chart readability:
- Axis scaling appropriateness:
- Interactive elements (hover, tooltips):

---

### Test 6.2: H2 - Early Engagement Predicts Success
**Actions:**
- Locate H2 chart (Week 1 vs Total)
- Click to drill down

**Evaluate:**
- [ ] Is the hypothesis clearly stated?
- [ ] Does the chart show Week 1 vs overall correlation?
- [ ] Does drill-down provide builder-level data?

**Data Validation:**
- Correlation shown:
- Data points match builder count:

---

### Test 6.3: H3 - Activity Type Preference
**Actions:**
- Locate H3 radar chart
- Click to drill down

**Evaluate:**
- [ ] Are activity categories labeled?
- [ ] Is the chart shape meaningful?
- [ ] Does drill-down show category breakdowns?

**Data Validation:**
- Activity categories:
- Completion rates per category:

---

### Test 6.4: H4 - Improvement Trajectory
**Actions:**
- Locate H4 line chart
- Click to drill down

**Evaluate:**
- [ ] Does the chart show trend over weeks?
- [ ] Is improvement/decline visible?
- [ ] Does drill-down provide week-by-week data?

**Data Validation:**
- Week count:
- Trend direction (improving/declining):

---

### Test 6.5: H5 - Weekend Patterns
**Actions:**
- Locate H5 bar chart
- Click to drill down

**Evaluate:**
- [ ] Are weekend vs weekday patterns clear?
- [ ] Does drill-down show day-of-week breakdown?

**Data Validation:**
- Sat/Sun completion rates:
- Mon/Tue/Wed completion rates:

---

### Test 6.6: H6 - Peer Influence
**Actions:**
- Locate H6 chart

**Evaluate:**
- [ ] Is there a placeholder message if data unavailable?
- [ ] Is the missing data explained?

**Expected Behavior:**
- Should indicate "table group data not yet available"

---

### Test 6.7: H7 - Task Difficulty Distribution
**Actions:**
- Locate H7 histogram
- Click to drill down

**Evaluate:**
- [ ] Are difficulty buckets clear (Easy, Medium, Hard, Very Hard)?
- [ ] Does drill-down list specific tasks in each bucket?
- [ ] Can you identify "tasks needing redesign" (<70% completion)?

**Data Validation:**
- Easy task count (>90%):
- Medium task count (70-90%):
- Hard task count (50-70%):
- Very hard task count (<50%):
- Tasks flagged for redesign (<70%):

---

## Section 7: Builder Profile Pages

### Test 7.1: Profile Navigation
**Actions:**
- From any drill-down, click a builder name
- Navigate to builder profile page

**Evaluate:**
- [ ] Does the profile page load without errors?
- [ ] Is the builder's name displayed prominently?
- [ ] Is there a way to return to the dashboard?

**UX/UI Observations:**
- Page layout quality:
- Information hierarchy:
- Navigation clarity:

---

### Test 7.2: Profile KPI Cards
**Actions:**
- Review the 4 KPI cards on builder profile

**Evaluate:**
- [ ] Total tasks completed (number)
- [ ] Attendance rate (percentage)
- [ ] Engagement score (0-100)
- [ ] Status (Top Performer / On Track / Struggling)

**Data Validation:**
- Do the KPIs seem internally consistent?
- Does the status match the KPIs (e.g., Top Performer has >90% completion)?

**UX/UI Observations:**
- Card design consistency with dashboard:
- Metric presentation clarity:

---

### Test 7.3: Attendance History
**Actions:**
- Review attendance history section

**Evaluate:**
- [ ] Are dates listed chronologically?
- [ ] Is status indicated (Present, Late, Absent)?
- [ ] Are late arrivals noted (minutes)?

**Data Validation:**
- Date range coverage:
- Any Thursday/Friday entries (should not be class days):

---

### Test 7.4: Completed Tasks List
**Actions:**
- Review completed tasks section

**Evaluate:**
- [ ] Are task names listed?
- [ ] Are completion dates shown?
- [ ] Is the list sortable or filterable?

**Data Validation:**
- Task count matches KPI card:
- Dates are within cohort timeframe:

---

## Section 8: Terminology Legend Tab

### Test 8.1: Metric Definitions
**Actions:**
- Navigate to "Terminology Legend" tab
- Review all 9 metric definitions

**Evaluate:**
- [ ] Are definitions clear and non-technical?
- [ ] Are examples provided for each metric?
- [ ] Are calculation methods explained?
- [ ] Is the "excluded users" list documented?

**UX/UI Observations:**
- Content organization:
- Expandable section usability:
- Readability and clarity:

**Accuracy Check:**
- Do definitions match how metrics are actually calculated (based on drill-downs)?
- Are there any contradictions between legend and dashboard behavior?

---

## Section 9: Auto-Refresh & Real-Time Features

### Test 9.1: Auto-Refresh Indicator
**Actions:**
- Stay on Metrics Dashboard for 6+ minutes
- Observe refresh indicator

**Evaluate:**
- [ ] Does "Last refreshed: X minutes ago" update?
- [ ] Does the dashboard auto-refresh every 5 minutes?
- [ ] Is there a manual refresh button?
- [ ] Does refresh work without page reload?

**UX/UI Observations:**
- Refresh indicator visibility:
- Loading state during refresh:

---

## Section 10: Cross-Feature Data Consistency

### Test 10.1: Natural Language vs Dashboard Comparison
**Actions:**
- Ask in Natural Language: "How many builders attended yesterday?"
- Compare to "Attendance Prior Day" KPI card on dashboard

**Evaluate:**
- [ ] Do both sources show the same number?
- [ ] If different, is the difference explainable (timezone, date cutoff)?

**Data Validation:**
- NL query result:
- Dashboard KPI result:
- Difference (if any):
- Explanation:

---

### Test 10.2: KPI Card vs Drill-Down Consistency
**Actions:**
- For 3 different KPI cards, compare the card value to the drill-down sum

**Example:**
- "Task Completion This Week" card shows 93%
- Drill-down should have task completion rates that average to ~93%

**Evaluate:**
- [ ] Do card and drill-down values match?
- [ ] Are there rounding differences (acceptable)?
- [ ] Are there formula inconsistencies (problematic)?

**Data Validation:**
- KPI 1: Card ___ vs Drill-down ___
- KPI 2: Card ___ vs Drill-down ___
- KPI 3: Card ___ vs Drill-down ___

---

### Test 10.3: Cross-Chart Data Validation
**Actions:**
- Compare H1 (Attendance vs Completion) with H4 (Improvement Trajectory)
- Do builders who improved in H4 show higher attendance in H1?

**Evaluate:**
- [ ] Are data stories consistent across charts?
- [ ] Do outliers appear in multiple charts as expected?

---

## Section 11: Error Handling & Edge Cases

### Test 11.1: Invalid Inputs
**Actions:**
- In Natural Language, submit empty query
- Try special characters: `<script>alert('test')</script>`
- Try very long query (500+ characters)

**Evaluate:**
- [ ] Are errors handled gracefully?
- [ ] Are there helpful error messages?
- [ ] Is the interface still usable after an error?

---

### Test 11.2: No Data Scenarios
**Actions:**
- Apply filters that should return no data (e.g., "Week 10" if only 4 weeks exist)

**Evaluate:**
- [ ] Is there a "no data" message?
- [ ] Does the UI remain stable?
- [ ] Is it clear how to remove filters?

---

### Test 11.3: Network Issues (if testable)
**Actions:**
- Simulate slow network (throttling)
- Test behavior during loading

**Evaluate:**
- [ ] Are loading states clear?
- [ ] Does the app handle timeouts gracefully?

---

## Section 12: Accessibility & Usability

### Test 12.1: Keyboard Navigation
**Actions:**
- Try navigating with Tab key
- Try activating buttons with Enter/Space

**Evaluate:**
- [ ] Are interactive elements keyboard accessible?
- [ ] Is focus visible?
- [ ] Is tab order logical?

---

### Test 12.2: Color & Contrast
**Actions:**
- Review color usage across the site

**Evaluate:**
- [ ] Is text readable against backgrounds?
- [ ] Are color-coded elements also labeled (not just color)?
- [ ] Is the color scheme consistent?

---

### Test 12.3: Mobile Responsiveness (if testable)
**Actions:**
- Resize browser to mobile width (375px)
- Test on actual mobile device if available

**Evaluate:**
- [ ] Does layout adapt to small screens?
- [ ] Are charts readable on mobile?
- [ ] Are buttons/links large enough to tap?
- [ ] Is horizontal scrolling avoided?

---

## Section 13: Performance & Technical

### Test 13.1: Page Load Times
**Actions:**
- Measure load times for each major page

**Record:**
- Landing page:
- Natural Language interface:
- Metrics Dashboard:
- Builder profile:

**Evaluate:**
- [ ] Are all pages under 5 seconds?
- [ ] Are there any unusually slow loads?

---

### Test 13.2: Browser Console Errors
**Actions:**
- Open browser developer console (F12)
- Navigate through the site
- Check for errors, warnings

**Record:**
- Any JavaScript errors:
- Any failed network requests:
- Any console warnings:

---

## Section 14: Export Functionality

### Test 14.1: CSV Export
**Actions:**
- From 3 different drill-down modals, click "Export to CSV"

**Evaluate:**
- [ ] Does a CSV file download?
- [ ] Does the filename make sense?
- [ ] Does the CSV contain the expected data?
- [ ] Are headers included?

**Data Validation:**
- CSV 1 (KPI drill-down): Row count ___
- CSV 2 (Hypothesis drill-down): Row count ___
- CSV 3 (Quality drill-down): Row count ___

---

## Section 15: Design System Consistency

### Test 15.1: Component Consistency
**Actions:**
- Review buttons, cards, modals across the site

**Evaluate:**
- [ ] Are button styles consistent?
- [ ] Are card layouts uniform?
- [ ] Are modal designs similar?
- [ ] Is spacing/padding consistent?

**UX/UI Observations:**
- Design system maturity:
- Any visual inconsistencies:

---

### Test 15.2: Typography & Hierarchy
**Actions:**
- Review text sizing, weights, and hierarchy

**Evaluate:**
- [ ] Are headings clearly distinguishable from body text?
- [ ] Is there a clear visual hierarchy?
- [ ] Are font sizes readable?

---

### Test 15.3: Color Palette
**Actions:**
- Review color usage

**Evaluate:**
- [ ] Is the black/white/grey scheme applied consistently?
- [ ] Are accent colors (if any) used purposefully?
- [ ] Are emojis/icons avoided (per design spec)?

**Note Any:**
- Remaining emojis in interface:
- Inconsistent icon usage:

---

## Section 16: Content Quality

### Test 16.1: Copywriting
**Actions:**
- Review all text labels, headings, descriptions

**Evaluate:**
- [ ] Is language clear and professional?
- [ ] Are there typos or grammatical errors?
- [ ] Is terminology consistent (e.g., "builders" vs "students")?

**Record Any Issues:**
- Typos found:
- Unclear labels:
- Terminology inconsistencies:

---

### Test 16.2: Help & Guidance
**Actions:**
- Look for tooltips, help text, onboarding

**Evaluate:**
- [ ] Is there contextual help where needed?
- [ ] Are complex features explained?
- [ ] Is there guidance for first-time users?

**UX/UI Observations:**
- Onboarding experience:
- Help text quality:
- Missing guidance opportunities:

---

## Section 17: Business Logic Validation

### Test 17.1: Excluded Users
**Actions:**
- Check if excluded users (IDs: 129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332) appear in results

**Evaluate:**
- [ ] Are they excluded from KPI calculations?
- [ ] Do they appear in drill-downs?
- [ ] Are they excluded from builder lists?

**Data Validation:**
- Search for user ID 129 in drill-downs:
- Search for user ID 5:
- Are 76 builders counted (not 89)?

---

### Test 17.2: Class Day Logic
**Actions:**
- Check if Thursday/Friday are treated as non-class days

**Evaluate:**
- [ ] Is attendance 0 on Thu/Fri?
- [ ] Are Thu/Fri excluded from 7-day averages?
- [ ] Is there UI messaging about Thu/Fri?

---

### Test 17.3: Task Completion Logic
**Actions:**
- Verify task completion counts both submissions AND threads

**Evaluate:**
- [ ] Are completion rates above 90% (indicating threads counted)?
- [ ] Do drill-downs show engagement, not just formal submissions?

---

## Section 18: Integration Points

### Test 18.1: BigQuery Integration
**Actions:**
- Review quality scores
- Check if data is recent

**Evaluate:**
- [ ] Are quality scores populated?
- [ ] Is assessment count shown (238 expected)?
- [ ] Are scores in reasonable range (0-100)?

**Data Validation:**
- Quality score:
- Assessment count:
- Date of most recent assessment:

---

### Test 18.2: Pattern Analysis (if available)
**Actions:**
- Check if pattern analysis has run (should start Oct 3, 8am EST)

**Evaluate:**
- [ ] Is pattern data populated?
- [ ] Are insights displayed somewhere?
- [ ] Is the analysis date shown?

**Note:**
- As of testing date, has pattern analysis run yet?

---

## Section 19: User Workflow Testing

### Test 19.1: Facilitator Use Case
**Scenario:** A facilitator wants to identify struggling builders

**Actions:**
1. Go to dashboard
2. Click "Need Intervention" KPI card
3. Review list of builders
4. Click a builder's name to see profile
5. Review their attendance and completion history

**Evaluate:**
- [ ] Is this workflow intuitive?
- [ ] Is the information actionable?
- [ ] Are there any friction points?

**Time to Complete Workflow:**
**UX Observations:**

---

### Test 19.2: Program Manager Use Case
**Scenario:** A PM wants to identify tasks needing redesign

**Actions:**
1. Go to dashboard
2. Navigate to H7 (Task Difficulty) chart
3. Click to drill down
4. Identify tasks with <70% completion
5. Export list to CSV

**Evaluate:**
- [ ] Is this workflow intuitive?
- [ ] Is the CSV export useful?
- [ ] Are task names clear enough to take action?

**Time to Complete Workflow:**
**UX Observations:**

---

### Test 19.3: Ad-Hoc Analysis Use Case
**Scenario:** Someone wants to answer "Which builders improved the most in Week 3?"

**Actions:**
1. Go to Natural Language interface
2. Ask: "Which builders improved the most in Week 3?"
3. Review response

**Evaluate:**
- [ ] Does the AI understand the question?
- [ ] Is the response accurate?
- [ ] Is a visualization provided?

**Quality of Response (1-5):**
**Improvements Needed:**

---

## Section 20: Final Evaluation & Recommendations

### Overall Functionality Assessment
**Scale: 1 (broken) to 5 (excellent)**

- Natural Language Interface: ___/5
- Metrics Dashboard: ___/5
- KPI Cards & Drill-Downs: ___/5
- Quality Metrics: ___/5
- Hypothesis Charts: ___/5
- Builder Profiles: ___/5
- Filter Functionality: ___/5
- Export Features: ___/5

**Overall System: ___/5**

---

### UX/UI Assessment
**Scale: 1 (poor) to 5 (excellent)**

- Visual Design: ___/5
- Information Architecture: ___/5
- Navigation: ___/5
- Responsiveness: ___/5
- Consistency: ___/5
- Accessibility: ___/5
- Performance: ___/5
- Content Quality: ___/5

**Overall UX/UI: ___/5**

---

### Critical Issues Found
**Priority 1 (Blocking - must fix before launch):**
1.
2.
3.

**Priority 2 (Important - should fix before presentation):**
1.
2.
3.

**Priority 3 (Nice to have - can address later):**
1.
2.
3.

---

### Top 5 UX/UI Improvements
1.
2.
3.
4.
5.

---

### Top 5 Functional Improvements
1.
2.
3.
4.
5.

---

### Data Accuracy Issues
**List any inconsistencies, incorrect calculations, or data quality concerns:**
1.
2.
3.

---

### Strengths
**What works well:**
1.
2.
3.
4.
5.

---

### Weaknesses
**What needs improvement:**
1.
2.
3.
4.
5.

---

### Recommendations for Wednesday Presentation

**What to showcase:**
1.
2.
3.

**What to acknowledge as work-in-progress:**
1.
2.
3.

**What to avoid demonstrating:**
1.
2.
3.

---

### Recommendation: Ready for Presentation?
**[ ] Yes, ready to present**
**[ ] Yes, with minor fixes**
**[ ] No, critical issues must be addressed first**

**Justification:**

---

## Testing Completion Checklist

- [ ] All 20 sections completed
- [ ] Critical issues documented with screenshots/details
- [ ] UX/UI feedback is specific and actionable
- [ ] Data validation completed for key metrics
- [ ] User workflows tested end-to-end
- [ ] Final recommendations provided
- [ ] Report ready for development team review

---

**Testing Agent:** [Your name/ID]
**Testing Date:** [Date]
**Testing Duration:** [Time spent]
**Environment:** [Browser, OS, Device]
**Dashboard Version:** [If versioned]

---

## Appendix A: Data Validation Reference

**Expected Baseline Metrics (as of Oct 2, 2025):**
- Total Builders: 76
- Class Days: 19
- Total Tasks: 112
- Attendance Today: 0 (Thursday - no class)
- Attendance Yesterday: 50 builders
- Task Completion This Week: 93%
- 7-Day Attendance Rate: 38%
- Need Intervention: 22 builders
- Quality Score: 36/100 (238 assessments)

Use these to validate if metrics are in expected ranges.

---

## Appendix B: Excluded User IDs

**Staff:** 129, 5, 240, 326
**Volunteers:** 327, 329, 331, 330, 328, 332
**Inactive:** 324, 325, 9

If any of these appear in results, flag as data filtering issue.

---

## Appendix C: Screenshot Guidelines

**Capture screenshots for:**
- Any visual bugs (layout issues, overlapping elements)
- Any error messages
- Any data inconsistencies (show the comparison)
- Excellent UX examples (to preserve)
- Poor UX examples (to improve)

**Name screenshots:** `[section]_[issue]_[timestamp].png`

---

**End of Testing Protocol**
