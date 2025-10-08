# Testing Guide 05: Quality Metrics & Hypothesis Charts
**Version:** 2.0 (CRITICAL TESTING MODE)
**Focus:** Quality scores, hypothesis charts (H1-H7), drill-downs, BigQuery data accuracy
**Time Required:** 25-30 minutes
**Test Environment:** Local (http://localhost:3000/metrics)

---

## ⚠️ CRITICAL TESTING INSTRUCTIONS

**READ FIRST:** `/docs/testing/CRITICAL-TESTING-FRAMEWORK.md`

This test follows CRITICAL TESTING MODE:
- Test for FAILURE first (assume broken until proven otherwise)
- Verify data accuracy against database (BigQuery)
- Test edge cases and error states
- Document ALL issues (even minor ones)
- Scoring: Most production software = 3.5-4.5/5 (not 5/5)

**Mandatory for EVERY test:**
- ✅ Functional verification
- 📊 Data accuracy (compare to database/BigQuery)
- 🐛 Issues found (minimum 1 or state "No issues")
- 💡 Improvements (minimum 2 suggestions)
- 🎯 Score with justification

**Expected Critical Issues (from framework):**
- Long load times (BigQuery is slow)
- Chart labels may overlap
- Score methodology may not be explained
- Chart rendering issues (Recharts library)

---

## Overview

This guide tests the Quality Metrics section and all 7 hypothesis charts, including their visualizations, drill-downs, and data accuracy.

---

## Test 5.1: Overall Quality Score Card

### Actions
1. Locate "Overall Quality Score" card
2. Note the score and context
3. Click the card to open drill-down

### Functionality Checks
- [ ] Score is prominently displayed (0-100 range)
- [ ] Assessment count is shown (e.g., "based on X assessments")
- [ ] Card is clickable
- [ ] Drill-down modal opens
- [ ] Modal shows BigQuery assessment data
- [ ] Individual builder scores are listed

### Data Accuracy Validation (MANDATORY)

**BigQuery Verification:**
```sql
-- Verify quality score calculation
SELECT
  AVG(overall_score) as avg_quality,
  COUNT(*) as assessment_count
FROM `pursuit-ai.segundo_data.builder_assessments`
WHERE cohort = 'September 2025'
AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332);
```

**Card Display:**
- Overall quality score: ___/100
- Database result: ___/100
- ✅ Match? [ ] Yes [ ] No (If no: CRITICAL BUG)
- Number of assessments: ___
- Database count: ___
- ✅ Match? [ ] Yes [ ] No
- Date range: ___

**Expected:** 36/100 (based on 238 assessments as of Oct 2, 2025)

**Drill-Down Data:**
- Number of builders with scores: ___
- Score range: ___ to ___
- Average calculation check: ___

**Spot Check 5 Builders:**
1. _______________ | Score: ___/100
2. _______________ | Score: ___/100
3. _______________ | Score: ___/100
4. _______________ | Score: ___/100
5. _______________ | Score: ___/100

**Do individual scores average to overall?** [ ] Yes [ ] No [ ] Approximately

### Edge Case Testing (NEW - MANDATORY)

**Test Scenario: Builder with No Assessments**
- Find builder with 0 assessments (if any)
- How is it displayed: ___
- Handled gracefully: [ ] Yes [ ] No

**Test Scenario: Filter by Week 1**
- Apply Week 1 filter
- Quality score updates: [ ] Yes [ ] No
- Fewer assessments shown: [ ] Yes [ ] No

**Test Scenario: Empty State**
- If possible, simulate no assessment data
- Shows placeholder: [ ] Yes [ ] No
- Error handling: ___/5

### Performance Testing (NEW)

**API Load Time (BigQuery is SLOW):**
```
GET /api/metrics/quality?cohort=September%202025 → ___ ms
```
- Expected: 2-5s (BigQuery queries are slow)
- Actual: ___ ms
- Shows loading indicator: [ ] Yes [ ] No
- Timeout after 10s: [ ] Yes [ ] No

**Chart Render Time:**
- Data fetch to chart visible: ___ ms
- Expected: <3s total
- Pass: [ ] Yes [ ] No

### Accessibility Check (NEW)

**Color Contrast (Critical for low scores):**
- Low score (red): Contrast ___:1 (need 4.5:1)
- Medium score (yellow): Contrast ___:1
- High score (green): Contrast ___:1
- All pass WCAG AA: [ ] Yes [ ] No

**Chart Accessibility:**
- Chart has ARIA labels: [ ] Yes [ ] No
- Data table alternative provided: [ ] Yes [ ] No

### UX/UI Evaluation

**Card Design (1-5):**
- Score prominence: ___/5
- Context clarity: ___/5
- Visual design (color coding): ___/5

**Drill-Down Quality (1-5):**
- Table layout: ___/5
- Data completeness: ___/5
- Export functionality: ___/5

**Observations:**
- Is low score (36/100) explained with context:
- Are builders clickable to view profiles:
- Any data presentation issues:

### 🐛 Issues Found (MANDATORY)

**Critical Issues:**
1. [SEVERITY: HIGH/MEDIUM/LOW] ___

**Performance Issues:**
1. [SEVERITY: HIGH/MEDIUM/LOW] BigQuery load time: ___ ms (expected issue)

**UX Issues:**
1. [SEVERITY: HIGH/MEDIUM/LOW] ___

**If NO issues:** State "No issues found. Verified BigQuery data accuracy and performance."

### 💡 Improvement Suggestions (MINIMUM 2)

1. Add loading skeleton during BigQuery fetch
2. Cache quality scores for faster subsequent loads
3. ___

### 🎯 Score with Justification

**Test 5.1 Score: ___/5**

**Breakdown:**
- Functionality: ___/5
- Data accuracy: ___/5 (BigQuery verification)
- Performance: ___/5 (expect 3-4/5 due to BigQuery)
- UX: ___/5

**Justification:** ___

---

## Test 5.2: Quality by Category Card

### Actions
1. Locate "Quality by Category" card (radar chart)
2. Review the visualization
3. Click to drill down

### Functionality Checks
- [ ] Radar chart is displayed
- [ ] Categories are labeled (Technical, Business, Professional)
- [ ] Chart is readable
- [ ] Card is clickable
- [ ] Drill-down shows category breakdowns

### Data Validation

**Radar Chart:**
- Categories shown: _______________
- Score range: 0-100
- Visual shape indicates strengths/weaknesses: [ ] Yes [ ] No

**Category Scores:**
- Technical Skills: ___/100
- Business Skills: ___/100
- Professional Skills: ___/100

**Drill-Down Data:**
- Shows per-category breakdown: [ ] Yes [ ] No
- Shows individual builder scores per category: [ ] Yes [ ] No
- Any empty/missing categories: ___

### UX/UI Evaluation

**Radar Chart Design (1-5):**
- Readability: ___/5
- Label clarity: ___/5
- Color differentiation: ___/5
- Chart sizing: ___/5

**Drill-Down Quality (1-5):**
- Category breakdown clarity: ___/5
- Data organization: ___/5

**Observations:**
- Is radar chart effective for this data:
- Any suggested improvements:

---

## Test 5.3: H1 - Attendance Drives Completion (Scatter Chart)

### Actions
1. Locate H1 chart (scatter plot)
2. Review the visualization
3. Note the correlation coefficient
4. Click to drill down

### Functionality Checks
- [ ] Scatter chart is displayed
- [ ] X-axis: Attendance rate
- [ ] Y-axis: Completion rate
- [ ] Correlation coefficient (r value) is shown
- [ ] Chart is clickable
- [ ] Drill-down shows raw data table

### Data Validation

**Chart Display:**
- Correlation coefficient (r): ___
- Expected: ~0.73 (strong positive correlation)
- Number of data points: ___
- Expected: ~76 (one per builder)

**Visual Assessment:**
- Trend line/direction: [ ] Positive [ ] Negative [ ] Neutral
- Outliers visible: [ ] Yes [ ] No
- Outliers make sense: [ ] Yes [ ] No [ ] N/A

**Drill-Down Data:**
- Shows builder names: [ ] Yes [ ] No
- Shows attendance %: [ ] Yes [ ] No
- Shows completion %: [ ] Yes [ ] No

**Spot Check 3 Data Points:**
1. _______________ | Attendance: ___% | Completion: ___%
2. _______________ | Attendance: ___% | Completion: ___%
3. _______________ | Attendance: ___% | Completion: ___%

**Do points on chart match drill-down data?** [ ] Yes [ ] No

### UX/UI Evaluation

**Chart Quality (1-5):**
- Scatter plot readability: ___/5
- Axis labels: ___/5
- Correlation visibility: ___/5
- Interactive elements (hover, tooltips): ___/5

**Drill-Down Quality (1-5):**
- Data table clarity: ___/5
- Sortability: ___/5

**Observations:**
- Is the hypothesis clear from the chart:
- Any data presentation improvements:

---

## Test 5.4: H2 - Early Engagement Predicts Success

### Actions
1. Locate H2 chart (Week 1 vs Total correlation)
2. Review the hypothesis statement
3. Click to drill down

### Functionality Checks
- [ ] Chart displays Week 1 engagement vs overall
- [ ] Hypothesis is clearly stated
- [ ] Correlation value is shown
- [ ] Chart is clickable
- [ ] Drill-down provides builder-level data

### Data Validation

**Chart Display:**
- Chart type: _______________
- Correlation shown: ___
- Number of builders: ___

**Visual Assessment:**
- Does early engagement correlate with success: [ ] Yes [ ] No [ ] Unclear

**Drill-Down Data:**
- Shows Week 1 metrics: [ ] Yes [ ] No
- Shows overall metrics: [ ] Yes [ ] No
- Shows builder names: [ ] Yes [ ] No

**Spot Check 3 Builders:**
1. _______________ | Week 1: ___% | Overall: ___%
2. _______________ | Week 1: ___% | Overall: ___%
3. _______________ | Week 1: ___% | Overall: ___%

### UX/UI Evaluation

**Chart Quality (1-5):**
- Hypothesis clarity: ___/5
- Visualization effectiveness: ___/5
- Data presentation: ___/5

**Observations:**

---

## Test 5.5: H3 - Activity Type Preference (Radar Chart)

### Actions
1. Locate H3 radar chart
2. Review activity categories
3. Click to drill down

### Functionality Checks
- [ ] Radar chart displays activity categories
- [ ] Categories are labeled
- [ ] Completion rates per category shown
- [ ] Chart is clickable
- [ ] Drill-down shows category breakdowns

### Data Validation

**Activity Categories Shown:**
- [ ] Reflection
- [ ] Technical
- [ ] Business
- [ ] Collaboration
- [ ] Other: _______________

**Completion Rates:**
- Category 1: _______________ | Rate: ___%
- Category 2: _______________ | Rate: ___%
- Category 3: _______________ | Rate: ___%
- Category 4: _______________ | Rate: ___%
- Category 5: _______________ | Rate: ___%

**Drill-Down Data:**
- Shows task count per category: [ ] Yes [ ] No
- Shows completion rates: [ ] Yes [ ] No

### UX/UI Evaluation

**Radar Chart Quality (1-5):**
- Category label clarity: ___/5
- Shape meaningfulness: ___/5
- Color scheme: ___/5

**Drill-Down Quality (1-5):**
- Category breakdown clarity: ___/5

**Observations:**
- Does the chart reveal preference patterns:
- Are categories well-defined:

---

## Test 5.6: H4 - Improvement Trajectory (Line Chart)

### Actions
1. Locate H4 line chart (week-over-week improvement)
2. Review the trend
3. Click to drill down

### Functionality Checks
- [ ] Line chart displays week-by-week data
- [ ] X-axis: Weeks
- [ ] Y-axis: Completion/engagement rate
- [ ] Trend is visible (improving/declining)
- [ ] Chart is clickable
- [ ] Drill-down shows week-by-week data

### Data Validation

**Chart Display:**
- Number of weeks shown: ___
- Expected: 4-5 weeks
- Trend direction: [ ] Improving [ ] Declining [ ] Stable [ ] Variable

**Week-by-Week Values:**
- Week 1: ___%
- Week 2: ___%
- Week 3: ___%
- Week 4: ___%

**Drill-Down Data:**
- Shows weekly breakdown: [ ] Yes [ ] No
- Shows builder-level trends: [ ] Yes [ ] No
- Shows improvement metrics: [ ] Yes [ ] No

### UX/UI Evaluation

**Line Chart Quality (1-5):**
- Trend visibility: ___/5
- Axis labeling: ___/5
- Line styling: ___/5

**Drill-Down Quality (1-5):**
- Week-by-week clarity: ___/5

**Observations:**
- Is improvement/decline clear:
- Any data gaps or inconsistencies:

---

## Test 5.7: H5 - Weekend Patterns (Bar Chart)

### Actions
1. Locate H5 bar chart (weekend vs weekday)
2. Review the comparison
3. Click to drill down

### Functionality Checks
- [ ] Bar chart displays day-of-week patterns
- [ ] Weekdays (Mon/Tue/Wed) shown
- [ ] Weekends (Sat/Sun) shown
- [ ] Completion rates per day type shown
- [ ] Chart is clickable
- [ ] Drill-down shows day breakdown

### Data Validation

**Chart Display:**
- Weekday average: ___%
- Weekend average: ___%
- Pattern observed: [ ] Higher weekday [ ] Higher weekend [ ] Similar

**Day-of-Week Breakdown (if shown):**
- Monday: ___%
- Tuesday: ___%
- Wednesday: ___%
- Saturday: ___%
- Sunday: ___%

**Drill-Down Data:**
- Shows per-day breakdown: [ ] Yes [ ] No
- Shows task counts: [ ] Yes [ ] No

### UX/UI Evaluation

**Bar Chart Quality (1-5):**
- Day labels: ___/5
- Value visibility: ___/5
- Pattern clarity: ___/5

**Observations:**
- Is weekend pattern meaningful:
- Any surprising findings:

---

## Test 5.8: H6 - Peer Influence

### Actions
1. Locate H6 chart/section
2. Review the content

### Functionality Checks
- [ ] H6 section exists
- [ ] If no data: Placeholder message shown
- [ ] If no data: Explanation provided
- [ ] If data exists: Chart displays peer influence

### Data Validation

**Status:**
- [ ] Chart with data displayed
- [ ] Placeholder shown (expected - no table group data)
- [ ] Section missing entirely

**If Placeholder:**
- Message clarity: ___/5
- Explains missing data: [ ] Yes [ ] No

**If Data Present:**
- Chart type: _______________
- Data shown: _______________

### UX/UI Evaluation

**Section Quality (1-5):**
- Handling of missing data: ___/5
- Placeholder design: ___/5

**Observations:**
- Is it clear why H6 data is unavailable:
- Does placeholder suggest when data will be available:

---

## Test 5.9: H7 - Task Difficulty Distribution (Histogram)

### Actions
1. Locate H7 histogram
2. Review difficulty buckets
3. Click to drill down

### Functionality Checks
- [ ] Histogram displays task difficulty distribution
- [ ] Difficulty buckets are labeled (Easy, Medium, Hard, Very Hard)
- [ ] Task counts per bucket shown
- [ ] Chart is clickable
- [ ] Drill-down lists specific tasks per bucket

### Data Validation

**Chart Display:**
- Easy (>90% completion): ___ tasks
- Medium (70-90%): ___ tasks
- Hard (50-70%): ___ tasks
- Very Hard (<50%): ___ tasks

**Expected Ranges:**
- Easy: 5-15 tasks
- Medium: 60-80 tasks
- Hard: 20-30 tasks
- Very Hard: 10-20 tasks

**Tasks Needing Redesign (<70%):**
- Count flagged: ___
- Expected: ~40 tasks

**Drill-Down Data:**
- Shows task names per bucket: [ ] Yes [ ] No
- Shows exact completion rates: [ ] Yes [ ] No
- Tasks are identifiable: [ ] Yes [ ] No

**Spot Check 3 "Very Hard" Tasks:**
1. Task: _______________ | Completion: ___%
2. Task: _______________ | Completion: ___%
3. Task: _______________ | Completion: ___%

**All under 50%?** [ ] Yes [ ] No

### UX/UI Evaluation

**Histogram Quality (1-5):**
- Bucket labeling: ___/5
- Distribution visibility: ___/5
- Color coding: ___/5

**Drill-Down Quality (1-5):**
- Task list organization: ___/5
- Actionability: ___/5

**Observations:**
- Is "redesign" threshold (<70%) clear:
- Are task names actionable:

---

## Test 5.10: Chart Interactivity

### Actions
1. Hover over 3 different charts
2. Test tooltips and interactive elements

### Functionality Checks

**For Each Chart:**
- [ ] Hover triggers tooltip/data label
- [ ] Tooltip shows relevant data
- [ ] Tooltip is readable (not cut off)
- [ ] Hover state is smooth (no lag)
- [ ] Click triggers drill-down

### UX/UI Evaluation

**Interactivity Quality (1-5):**
- Hover feedback: ___/5
- Tooltip design: ___/5
- Click affordance: ___/5

**Observations:**

---

## Test 5.11: Chart Consistency

### Actions
1. Review all hypothesis charts
2. Compare design elements

### UX/UI Evaluation

**Design Consistency Check:**
- [ ] Similar color schemes across charts
- [ ] Consistent axis labeling style
- [ ] Uniform chart sizing
- [ ] Consistent legend placement
- [ ] Similar drill-down modal designs

**Consistency Score (1-5):** ___/5

**Inconsistencies Found:**

---

## Test 5.12: Quality Metrics with Filters

### Actions
1. Apply "Week 1" filter
2. Observe quality metric and chart changes
3. Apply "Top Performers" filter
4. Reset filters

### Functionality Checks
- [ ] Quality scores update with filters
- [ ] Hypothesis charts update with filters
- [ ] Filter changes are smooth
- [ ] Data remains accurate after filtering

### Data Validation

**No Filters:**
- Overall Quality Score: ___
- H1 Correlation: ___

**Week 1 Filter Applied:**
- Overall Quality Score: ___
- H1 Correlation: ___

**Do scores change logically?** [ ] Yes [ ] No

---

## Test 5.13: Export from Charts

### Actions
1. Open drill-downs for 3 different hypothesis charts
2. Export CSV from each
3. Review CSV data

### Functionality Checks
- [ ] Export button present in drill-downs
- [ ] CSV downloads successfully
- [ ] Filename is descriptive
- [ ] Data matches drill-down

### Data Validation

**CSV 1 (H___):**
- Rows: ___
- Columns: ___
- Data accuracy: [ ] Good [ ] Issues found

**CSV 2 (H___):**
- Rows: ___
- Columns: ___
- Data accuracy: [ ] Good [ ] Issues found

**CSV 3 (H___):**
- Rows: ___
- Columns: ___
- Data accuracy: [ ] Good [ ] Issues found

---

## Test 5.14: Chart Responsiveness

### Actions
1. Resize browser to different widths
2. Observe chart adaptations

### Functionality Checks
- [ ] Charts resize proportionally
- [ ] Labels remain readable at smaller sizes
- [ ] Charts don't overflow containers
- [ ] Mobile view shows charts appropriately

### UX/UI Evaluation

**Responsiveness (1-5):**
- Desktop (>1200px): ___/5
- Tablet (768-1200px): ___/5
- Mobile (<768px): ___/5

**Observations:**

---

## Summary & Recommendations

### Critical Issues (Must Fix)
1.
2.
3.

### Data Accuracy Issues
1.
2.
3.

### UX/UI Improvements
1.
2.
3.

### Chart Design Issues
1.
2.
3.

### Strengths
1.
2.
3.

### Overall Quality Metrics & Charts Score
- Quality Cards: ___/5
- Hypothesis Charts: ___/5
- Data Accuracy: ___/5 (BigQuery verification)
- Interactivity: ___/5
- Performance: ___/5 (expect 3-4/5 due to BigQuery)
- UX/UI: ___/5
- **Overall: ___/5**

### Production Readiness Assessment

**Score Interpretation:**
- 4.5-5.0: READY FOR PRODUCTION
- 4.0-4.4: READY WITH MINOR FIXES
- 3.5-3.9: NOT READY - Significant improvements needed
- <3.5: NOT READY - Major rework required

**Verdict:** ___
**Justification:** ___

**BigQuery Performance Note:**
If overall score is 3.5-4.0 due to BigQuery performance (expected), system may still be production-ready with caching strategy.

### Ready for Next Test?
- [ ] Yes, proceed to Test 06: Builder Profiles
- [ ] No, issues must be addressed first

---

## For AI Agent Testers: Completion Checklist

- [ ] Completed ALL tests in this guide (5.1-5.14)
- [ ] Found minimum 5 issues total (or stated "No issues")
- [ ] Verified data accuracy with BigQuery queries
- [ ] Tested edge cases (no data, filters, chart rendering)
- [ ] Checked chart accessibility (ARIA, contrast, labels)
- [ ] Documented BigQuery performance issues (expected)
- [ ] NO score is 5/5 without exceptional justification
- [ ] Provided improvement suggestions for each test
- [ ] Made production readiness assessment

---

**Tester:** _______________
**Date:** _______________
**Time Spent:** ___ minutes
