# Testing Guide 08: Cross-Feature Validation
**Version:** 2.0 (CRITICAL TESTING MODE)
**Focus:** Data consistency, business logic, integration testing, system reliability
**Time Required:** 20-25 minutes
**Test Environment:** Local (http://localhost:3000)

---

## ⚠️ CRITICAL TESTING INSTRUCTIONS

**READ FIRST:** `/docs/testing/CRITICAL-TESTING-FRAMEWORK.md`

This test follows CRITICAL TESTING MODE:
- Test for FAILURE first (assume broken until proven otherwise)
- Verify data consistency across ALL features
- Test business logic accuracy (excluded users, Thu/Fri, formulas)
- Document ALL issues (even minor ones)
- Scoring: Most production software = 3.5-4.5/5 (not 5/5)

**Mandatory for EVERY test:**
- ✅ Functional verification
- 📊 Data consistency (same values across features)
- 🐛 Issues found (minimum 1 or state "No issues")
- 💡 Improvements (minimum 2 suggestions)
- 🎯 Score with justification

**Expected Critical Issues (from framework):**
- Stats differ between pages (NL vs Dashboard vs Profile)
- Filters don't persist across navigation
- Excluded builders appearing in some features
- Thursday/Friday data inconsistency

---

## Overview

This guide tests data consistency across different features, validates business logic, and ensures the entire system works cohesively.

---

## Test 8.1: Natural Language vs Dashboard - Attendance

### Actions
1. Ask in Natural Language: "How many builders attended yesterday?"
2. Note the response
3. Check "Attendance Prior Day" KPI on Dashboard
4. Compare results

### Data Validation

**Natural Language Response:**
- Builders attended: ___
- Date: ___
- Percentage: ___%

**Dashboard KPI Card:**
- Builders attended: ___
- Date: ___
- Percentage: ___%

**Comparison:**
- Values match exactly: [ ] Yes [ ] No
- If different, variance: ___
- Difference explainable: [ ] Yes [ ] No

**Explanation (if different):**
- [ ] Different dates (yesterday vs specific date)
- [ ] Timezone differences
- [ ] Calculation method differences
- [ ] Data staleness
- [ ] Bug/error

### Database Verification (MANDATORY)

**Verify BOTH sources against database:**
```sql
SELECT COUNT(*) FROM builder_attendance_new
WHERE status IN ('present', 'late')
AND DATE(attendance_date) = CURRENT_DATE - INTERVAL '1 day'
AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332)
AND cohort = 'September 2025';
```

**Database result:** ___
- NL matches DB: [ ] Yes [ ] No
- Dashboard matches DB: [ ] Yes [ ] No
- Both match DB: [ ] Yes [ ] No (If no: CRITICAL INCONSISTENCY)

### 🐛 Issues Found (MANDATORY)

**Critical Issues:**
1. [SEVERITY: HIGH] Data inconsistency between NL and Dashboard: [ ] Yes [ ] No
2. [SEVERITY: HIGH] Neither matches database: [ ] Yes [ ] No

**If NO issues:** State "No issues found. NL and Dashboard data consistent."

### 💡 Improvement Suggestions (MINIMUM 2)

1. Add "last updated" timestamp to both interfaces
2. Implement real-time sync between NL and Dashboard
3. ___

### Consistency Score (1-5): ___/5

**Justification:** ___

---

## Test 8.2: Natural Language vs Dashboard - Task Completion

### Actions
1. Ask in NL: "What is the overall task completion rate?"
2. Note the response
3. Check "Task Completion This Week" KPI (or apply "All Time" filter)
4. Compare

### Data Validation

**Natural Language Response:**
- Completion rate: ___%
- Number of tasks: ___
- Context: ___

**Dashboard KPI:**
- Completion rate: ___%
- Context: ___

**Match:** [ ] Yes [ ] No
**Variance:** ___%

**If Different:**
- Time range difference: [ ] Yes [ ] No
- Calculation difference: [ ] Yes [ ] No
- Data source difference: [ ] Yes [ ] No

### Consistency Score (1-5):** ___/5

---

## Test 8.3: Natural Language vs Dashboard - Builder List

### Actions
1. Ask in NL: "Who are the struggling builders?"
2. Note the list
3. Check "Need Intervention" KPI drill-down on Dashboard
4. Compare lists

### Data Validation

**Natural Language Response:**
- Number of builders: ___
- Names listed: _______________

**Dashboard Drill-Down:**
- Number of builders: ___
- Names listed: _______________

**Comparison:**
- Same count: [ ] Yes [ ] No
- Same builders: [ ] Yes [ ] No [ ] Mostly

**Differences Found:**

### Consistency Score (1-5):** ___/5

---

## Test 8.4: KPI Card vs Drill-Down - Attendance Today

### Actions
1. Note "Attendance Today" KPI value
2. Open drill-down
3. Count rows manually (or check row count)
4. Compare

### Data Validation

**KPI Card:** ___ builders

**Drill-Down:**
- Row count: ___
- Manual count: ___

**Match:** [ ] Yes [ ] No

**If No Match:**
- Difference: ___
- Likely cause: ___

### Consistency Score (1-5):** ___/5

---

## Test 8.5: KPI Card vs Drill-Down - Task Completion

### Actions
1. Note "Task Completion This Week" percentage
2. Open drill-down
3. Calculate average manually from 5-10 tasks
4. Compare

### Data Validation

**KPI Card:** ___%

**Drill-Down Manual Calculation:**
- Task 1: ___%
- Task 2: ___%
- Task 3: ___%
- Task 4: ___%
- Task 5: ___%
- Average: ___%

**Match KPI:** [ ] Yes [ ] No [ ] Approximately

**Acceptable Variance:** ±2%

### Consistency Score (1-5):** ___/5

---

## Test 8.6: KPI Card vs Drill-Down - 7-Day Attendance

### Actions
1. Note "7-Day Attendance Rate" percentage
2. Open drill-down
3. Calculate average manually from day-by-day data
4. Compare

### Data Validation

**KPI Card:** ___%

**Drill-Down Data:**
- Day 1: ___%
- Day 2: ___%
- Day 3: ___%
- Day 4: ___%
- Day 5: ___%
- Day 6: ___%
- Day 7: ___%
- Average: ___%

**Match KPI:** [ ] Yes [ ] No

**Calculation Method:**
- Simple average: ___% (matches: [ ] Yes [ ] No)
- Weighted average: ___% (matches: [ ] Yes [ ] No)

### Consistency Score (1-5):** ___/5

---

## Test 8.7: H1 Chart vs Drill-Down Data

### Actions
1. Note correlation coefficient from H1 chart (r value)
2. Open drill-down
3. Spot-check 5 data points on chart against table
4. Verify correlation makes sense

### Data Validation

**Chart Correlation:** r = ___

**Spot Check Data Points:**
1. Builder: ___ | Chart position: ~(__%, __%) | Table: (__%, ___) | Match: [ ] Yes [ ] No
2. Builder: ___ | Chart position: ~(__%, __%) | Table: (__%, ___) | Match: [ ] Yes [ ] No
3. Builder: ___ | Chart position: ~(__%, __%) | Table: (__%, ___) | Match: [ ] Yes [ ] No
4. Builder: ___ | Chart position: ~(__%, __%) | Table: (__%, ___) | Match: [ ] Yes [ ] No
5. Builder: ___ | Chart position: ~(__%, __%) | Table: (__%, ___) | Match: [ ] Yes [ ] No

**Visual Correlation Matches r Value:** [ ] Yes [ ] No

### Consistency Score (1-5):** ___/5

---

## Test 8.8: Builder Profile vs Dashboard KPIs

### Actions
1. Note "Need Intervention" count from dashboard (e.g., 22 builders)
2. Pick one builder from that list
3. Navigate to their profile
4. Verify their stats justify "intervention" flag

### Data Validation

**Dashboard:** 22 builders need intervention

**Builder: _______________**

**Profile Stats:**
- Completion: ___%
- Attendance: ___%
- Engagement: ___

**Intervention Criteria:**
- Threshold: <50% completion OR <70% attendance
- Composite: Engagement <40

**Meets Criteria:**
- Threshold method: [ ] Yes [ ] No
- Composite method: [ ] Yes [ ] No

**Correctly Flagged:** [ ] Yes [ ] No

**Test 2 More Builders:**

**Builder 2:** ___ | Meets criteria: [ ] Yes [ ] No
**Builder 3:** ___ | Meets criteria: [ ] Yes [ ] No

### Consistency Score (1-5):** ___/5

---

## Test 8.9: Builder Profile vs H1 Chart

### Actions
1. Pick a builder from H1 chart (attendance vs completion)
2. Note their approximate position on scatter plot
3. Navigate to their profile
4. Compare stats

### Data Validation

**Builder: _______________**

**H1 Chart Position:**
- Attendance: ~___%
- Completion: ~___%

**Profile Page:**
- Attendance: ___%
- Completion: ___%

**Match:** [ ] Yes [ ] No [ ] Approximately

**Variance:** Attendance ±___% | Completion ±___%

### Consistency Score (1-5):** ___/5

---

## Test 8.10: Excluded Users - Across All Features

### Actions
1. Check if excluded users (IDs: 129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332) appear anywhere
2. Test in:
   - Natural Language queries
   - Dashboard KPI drill-downs
   - H1 chart drill-down
   - Quality metrics drill-down

### Data Validation

**Excluded User IDs:** 129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332

**Test Each Feature:**

**Natural Language:**
- Ask: "Show all builders"
- Excluded users present: [ ] Yes (bug) [ ] No (correct)

**KPI Drill-Downs:**
- Search for user ID 129: [ ] Found (bug) [ ] Not found (correct)
- Search for user ID 5: [ ] Found (bug) [ ] Not found (correct)

**H1 Chart Drill-Down:**
- Excluded users in table: [ ] Yes (bug) [ ] No (correct)

**Quality Metrics Drill-Down:**
- Excluded users in list: [ ] Yes (bug) [ ] No (correct)

**Total Builder Count Shown:**
- Expected: 76
- Actual: ___
- Match: [ ] Yes [ ] No

### Exclusion Logic Score (1-5):** ___/5

---

## Test 8.11: Thursday/Friday Exclusion Logic

### Actions
1. Check if Thursday/Friday are excluded from attendance calculations
2. Test in multiple places

### Data Validation

**7-Day Attendance Drill-Down:**
- Thursday present: [ ] Yes (bug) [ ] No (correct)
- Friday present: [ ] Yes (bug) [ ] No (correct)
- Only Mon/Tue/Wed/Sat/Sun: [ ] Yes (correct) [ ] No

**Natural Language Query:**
- Ask: "Show attendance for the last 7 days"
- Thursday/Friday in results: [ ] Yes [ ] No

**Builder Profile Attendance History:**
- Thursday records: [ ] Yes (bug) [ ] No (correct)
- Friday records: [ ] Yes (bug) [ ] No (correct)

**If Today is Thursday/Friday:**
- "Attendance Today" shows 0: [ ] Yes (correct) [ ] No (bug)
- UI explains no class: [ ] Yes [ ] No

### Thursday/Friday Logic Score (1-5):** ___/5

---

## Test 8.12: Task Completion Logic - Submissions + Threads

### Actions
1. Verify task completion uses BOTH submissions AND threads
2. Check if completion rates are high (>80%)

### Data Validation

**Overall Task Completion:** ___%

**Expected:** >80% (indicates threads are counted, not just submissions)

**If <20%:** Likely bug - only counting submissions

**Natural Language Test:**
- Ask: "How is task completion calculated?"
- Response mentions threads/interactions: [ ] Yes [ ] No

**Terminology Legend:**
- Definition mentions submissions AND threads: [ ] Yes [ ] No

**Logic Correct:** [ ] Yes [ ] No [ ] Unclear

### Completion Logic Score (1-5):** ___/5

---

## Test 8.13: Engagement Score Formula Consistency

### Actions
1. Check formula in Terminology Legend
2. Pick a builder
3. Calculate engagement manually
4. Compare to their profile

### Data Validation

**Formula:** (Attendance × 30%) + (Completion × 50%) + (Quality × 20%)

**Builder: _______________**

**Stats:**
- Attendance: ___%
- Completion: ___%
- Quality: ___

**Manual Calculation:**
- Attendance × 0.30 = ___
- Completion × 0.50 = ___
- Quality × 0.20 = ___
- **Total:** ___

**Profile Engagement Score:** ___

**Match:** [ ] Yes [ ] No [ ] Approximately (±2)

### Formula Consistency Score (1-5):** ___/5

---

## Test 8.14: Quality Score - BigQuery Integration

### Actions
1. Check "Overall Quality Score" on dashboard
2. Note assessment count
3. Verify it's pulling from BigQuery (not mocked)

### Data Validation

**Dashboard Quality Score:** ___/100
**Assessment Count:** ___

**Expected:** 238 assessments, score ~36/100

**Drill-Down Data:**
- Shows individual assessments: [ ] Yes [ ] No
- Assessment dates are realistic: [ ] Yes [ ] No
- Score distribution is reasonable: [ ] Yes [ ] No

**Quality by Category:**
- Technical score: ___
- Business score: ___
- Professional score: ___
- All categories populated: [ ] Yes [ ] No [ ] Some empty

**BigQuery Integration Working:** [ ] Yes [ ] No [ ] Uncertain

### Quality Data Score (1-5):** ___/5

---

## Test 8.15: Filter Impact - Cross-Feature

### Actions
1. Apply "Week 1" filter on dashboard
2. Note changes across all sections
3. Verify all sections respect the filter

### Data Validation

**Filter Applied:** Week 1

**Sections Updated:**
- [ ] KPI cards
- [ ] Quality metrics
- [ ] Hypothesis charts (H1-H7)
- [ ] Drill-downs (when opened)

**Test 3 KPIs:**

**KPI 1 (No Filter):** ___
**KPI 1 (Week 1):** ___
**Changed:** [ ] Yes [ ] No

**KPI 2 (No Filter):** ___
**KPI 2 (Week 1):** ___
**Changed:** [ ] Yes [ ] No

**KPI 3 (No Filter):** ___
**KPI 3 (Week 1):** ___
**Changed:** [ ] Yes [ ] No

**All Sections Respect Filter:** [ ] Yes [ ] No

### Filter Consistency Score (1-5):** ___/5

---

## Test 8.16: Status Assignment Consistency

### Actions
1. Review status assignments across features
2. Verify "Top Performer" and "Struggling" criteria are consistent

### Data Validation

**Pick 2 "Top Performers":**

**Builder 1:**
- Completion: ___% (should be >90%)
- Attendance: ___% (should be >90%)
- Engagement: ___ (should be >80)
- Criteria met: [ ] Yes [ ] No

**Builder 2:**
- Completion: ___% (should be >90%)
- Attendance: ___% (should be >90%)
- Engagement: ___ (should be >80)
- Criteria met: [ ] Yes [ ] No

**Pick 2 "Struggling" Builders:**

**Builder 3:**
- Completion: ___% (should be <50% OR attendance <70%)
- Attendance: ___%
- Engagement: ___ (should be <40)
- Criteria met: [ ] Yes [ ] No

**Builder 4:**
- Completion: ___% (should be <50% OR attendance <70%)
- Attendance: ___%
- Engagement: ___ (should be <40)
- Criteria met: [ ] Yes [ ] No

**Status Logic Consistent:** [ ] Yes [ ] No

### Status Assignment Score (1-5):** ___/5

---

## Test 8.17: Date Range Consistency

### Actions
1. Check date ranges across features
2. Verify all use same cohort timeframe

### Data Validation

**Expected Cohort Range:** Sept 6, 2025 - Oct 1, 2025 (ongoing)

**Features to Check:**

**Dashboard KPIs:**
- Date range: ___ to ___
- Matches expected: [ ] Yes [ ] No

**Builder Profile Attendance:**
- Earliest: ___
- Latest: ___
- Within expected: [ ] Yes [ ] No

**Builder Profile Tasks:**
- Earliest completion: ___
- Latest completion: ___
- Within expected: [ ] Yes [ ] No

**H4 Chart (Improvement Trajectory):**
- Week range: Week ___ to Week ___
- Aligns with cohort: [ ] Yes [ ] No

**All Date Ranges Consistent:** [ ] Yes [ ] No

### Date Consistency Score (1-5):** ___/5

---

## Test 8.18: Export Data Consistency

### Actions
1. Export CSV from 3 different drill-downs
2. Compare exported data to on-screen data
3. Verify CSV matches drill-down

### Data Validation

**Export 1: _____________**
- CSV rows: ___
- Drill-down rows: ___
- Match: [ ] Yes [ ] No

**Export 2: _____________**
- CSV rows: ___
- Drill-down rows: ___
- Match: [ ] Yes [ ] No

**Export 3: _____________**
- CSV rows: ___
- Drill-down rows: ___
- Match: [ ] Yes [ ] No

**Spot Check Data Values:**
- Pick 3 rows from CSV
- Verify values match drill-down: [ ] Yes [ ] No

### Export Consistency Score (1-5):** ___/5

---

## Test 8.19: Real-Time Data Updates

### Actions
1. Note "Last refreshed" timestamp
2. Wait for auto-refresh (5 minutes) OR click manual refresh
3. Check if data updates across all sections

### Data Validation

**Before Refresh:**
- Attendance Today: ___
- Task Completion: ___%
- Last refreshed: ___

**After Refresh:**
- Attendance Today: ___
- Task Completion: ___%
- Last refreshed: ___

**Sections Updated:**
- [ ] KPI cards
- [ ] Charts
- [ ] Quality metrics
- [ ] Timestamp updated

**Refresh Works Correctly:** [ ] Yes [ ] No

### Refresh Consistency Score (1-5):** ___/5

---

## Test 8.20: Overall System Integration

### Actions
1. Perform end-to-end workflow
2. Test full user journey

### Workflow Test

**User Journey:**
1. Land on homepage
2. Go to Metrics Dashboard
3. Apply filters (Week 2, Top Performers)
4. Click "Need Intervention" drill-down
5. Click a builder name
6. View builder profile
7. Return to dashboard
8. Go to Natural Language
9. Ask about the same builder
10. Compare results

**Journey Successful:** [ ] Yes [ ] No

**Data Consistent Across Journey:** [ ] Yes [ ] No

**Any Broken Links/Errors:** [ ] Yes [ ] No

### Overall Integration Score (1-5):** ___/5

---

## Summary & Recommendations

### Critical Data Inconsistencies (P1)
1.
2.
3.

### Important Inconsistencies (P2)
1.
2.
3.

### Business Logic Issues
1.
2.
3.

### Integration Issues
1.
2.
3.

### Strengths
1.
2.
3.

### Overall Cross-Feature Validation Score
- Natural Language vs Dashboard: ___/5
- KPI vs Drill-Down Consistency: ___/5
- Chart vs Data Consistency: ___/5
- Business Logic Accuracy: ___/5 (excluded users, Thu/Fri)
- Filter/Exclusion Logic: ___/5
- Integration & Workflow: ___/5
- **Overall: ___/5**

### Production Readiness Assessment

**Score Interpretation:**
- 4.5-5.0: READY FOR PRODUCTION - Excellent data consistency
- 4.0-4.4: READY WITH MINOR FIXES - Some inconsistencies tolerable
- 3.5-3.9: NOT READY - Significant data integrity issues
- <3.5: NOT READY - Critical inconsistencies, major rework required

**Verdict:** ___
**Justification:** ___

**Critical Consistency Checks:**
- [ ] Same data across NL, Dashboard, and Profiles
- [ ] Excluded builders (13 users) filtered everywhere
- [ ] Thursday/Friday excluded from all attendance calculations
- [ ] Formulas consistent (engagement score, quality score)
- [ ] Filters work correctly across all features

**If ANY critical check fails:** System is NOT READY for production.

### System Ready for Production?
- [ ] Yes, data is consistent and reliable across all features
- [ ] Yes, with minor inconsistencies documented (specify which)
- [ ] No, critical data integrity issues must be fixed first

**Justification:** ___

---

## For AI Agent Testers: Completion Checklist

- [ ] Completed ALL tests in this guide (8.1-8.20)
- [ ] Found minimum 5 issues total (or stated "No issues")
- [ ] Verified data consistency with database queries
- [ ] Tested cross-feature consistency (NL vs Dashboard vs Profiles)
- [ ] Verified business logic (excluded users, Thu/Fri, formulas)
- [ ] Tested filter persistence and system integration
- [ ] NO score is 5/5 without exceptional justification
- [ ] Provided improvement suggestions for each test
- [ ] Made production readiness assessment

---

**Tester:** _______________
**Date:** _______________
**Time Spent:** ___ minutes

---

## Final Testing Completion

**All 8 Testing Guides Completed:** [ ] Yes [ ] No

**Total Testing Time:** ___ hours

**Overall System Assessment:** ___/5

**Final Production Verdict:**
- [ ] READY FOR PRODUCTION (Score: 4.5-5.0)
- [ ] READY WITH FIXES (Score: 4.0-4.4) - List fixes: ___
- [ ] NOT READY (Score: 3.5-3.9) - Significant improvements needed
- [ ] NOT READY (Score: <3.5) - Major rework required

**Critical Issues That MUST Be Fixed Before Production:**
1.
2.
3.

**Ready for Presentation:** [ ] Yes [ ] Yes with fixes [ ] No
