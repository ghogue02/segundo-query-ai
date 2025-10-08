# Testing Guide 04: KPI Cards Testing
**Version:** 2.0 (CRITICAL TESTING MODE)
**Focus:** 5 main KPI cards, drill-down functionality, data accuracy
**Time Required:** 20-25 minutes
**Test Environment:** Local (http://localhost:3000/metrics)

---

## ⚠️ CRITICAL TESTING INSTRUCTIONS

**READ FIRST:** `/docs/testing/CRITICAL-TESTING-FRAMEWORK.md`

This test follows CRITICAL TESTING MODE:
- Test for FAILURE first (assume broken until proven otherwise)
- Verify data accuracy against database
- Test edge cases and error states
- Document ALL issues (even minor ones)
- Scoring: Most production software = 3.5-4.5/5 (not 5/5)

**Mandatory for EVERY test:**
- ✅ Functional verification
- 📊 Data accuracy (compare to database)
- 🐛 Issues found (minimum 1 or state "No issues")
- 💡 Improvements (minimum 2 suggestions)
- 🎯 Score with justification

---

## Overview

This guide tests the 5 KPI cards on the Metrics Dashboard, their clickability, drill-down modals, and data accuracy.

---

## Test 4.1: KPI Card - Attendance Today

### Actions
1. Locate "Attendance Today" card
2. Read the value and context
3. Click the card to open drill-down

### Functionality Checks
- [ ] Card displays a number
- [ ] Context shows "out of X builders"
- [ ] Card is visually clickable (hover effect)
- [ ] Clicking opens a modal/drill-down
- [ ] Modal shows detailed attendance data
- [ ] Modal can be closed (X button, click outside, ESC key)

### Data Accuracy Validation (MANDATORY)

**Database Verification:**
```sql
-- Verify attendance count
SELECT COUNT(*) FROM builder_attendance_new
WHERE status IN ('present', 'late')
AND DATE(attendance_date) = CURRENT_DATE
AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332)
AND cohort = 'September 2025';
```

**Card Display:**
- Attendance count: ___
- Database result: ___
- ✅ Match? [ ] Yes [ ] No
- Total builders: ___
- Percentage: ___%
- Date shown: ___

**Expected for Thu/Fri:** 0 (no class)
**Expected for Mon/Tue/Wed/Sat/Sun:** 30-60

**Is value reasonable?** [ ] Yes [ ] No

**Drill-Down Modal:**
- Number of rows: ___
- Does row count match card value: [ ] Yes [ ] No
- Builder names shown: [ ] Yes [ ] No
- Timestamps shown: [ ] Yes [ ] No

**Spot Check 3 Builders:**
1. _______________ | Check-in time: _______
2. _______________ | Check-in time: _______
3. _______________ | Check-in time: _______

### Edge Case Testing (NEW - MANDATORY)

**Test Scenario: Thursday/Friday (no class days)**
- Navigate on Thursday or Friday
- Card should show: 0 attendance OR explanatory message
- Actual behavior: ___
- Score: ___/5

**Test Scenario: Future Date**
- If time filter allows future dates
- Expected: Error message or "no data"
- Actual: ___

**Test Scenario: All Builders Present (100%)**
- Simulate or find day with full attendance
- Card displays correctly: [ ] Yes [ ] No
- Drill-down shows all 76 builders: [ ] Yes [ ] No

### Performance Testing (NEW)

**Card Load Time:**
- Initial render: ___ ms (use DevTools Performance)
- Expected: <500ms
- Pass: [ ] Yes [ ] No

**Drill-Down Open Time:**
- Click to modal visible: ___ ms
- Expected: <1s
- Pass: [ ] Yes [ ] No

### Accessibility Check (NEW)

**Keyboard Navigation:**
- Tab to card: [ ] Yes [ ] No
- Enter/Space to open drill-down: [ ] Yes [ ] No
- Score: ___/5

**ARIA Labels:**
- Inspect element for `aria-label` or `role="button"`: [ ] Present [ ] Missing
- Screen reader friendly: [ ] Yes [ ] No [ ] Unknown

**Color Contrast (DevTools):**
- Text contrast ratio: ___:1 (WCAG AA requires 4.5:1)
- Pass WCAG AA: [ ] Yes [ ] No

### UX/UI Evaluation

**Card Design (1-5):**
- Visual prominence: ___/5
- Readability: ___/5
- Clickability indication: ___/5

**Drill-Down Modal (1-5):**
- Layout clarity: ___/5
- Data presentation: ___/5
- Close/dismiss ease: ___/5

**Observations:**
- Any confusing elements:
- Data presentation quality:
- Modal design quality:

### 🐛 Issues Found (MANDATORY)

**Critical Issues:**
1. [SEVERITY: HIGH/MEDIUM/LOW] ___

**UX Issues:**
1. [SEVERITY: HIGH/MEDIUM/LOW] ___

**Performance Issues:**
1. [SEVERITY: HIGH/MEDIUM/LOW] ___

**If NO issues:** State "No issues found. Verified data accuracy, performance, and accessibility."

### 💡 Improvement Suggestions (MINIMUM 2)

1. ___
2. ___
3. ___

### 🎯 Score with Justification

**Test 4.1 Score: ___/5**

**Breakdown:**
- Functionality: ___/5
- Data accuracy: ___/5
- Performance: ___/5
- Accessibility: ___/5
- UX: ___/5

**Weighted Score:** (Func × 0.20) + (Data × 0.25) + (Perf × 0.15) + (Access × 0.10) + (UX × 0.30) = ___/5

**Justification:** ___

---

## Test 4.2: KPI Card - Attendance Prior Day

### Actions
1. Locate "Attendance Prior Day" card
2. Click to drill down
3. Test builder name links

### Functionality Checks
- [ ] Card shows yesterday's date clearly
- [ ] Attendance count is displayed
- [ ] Drill-down opens successfully
- [ ] Builder names are listed
- [ ] Builder names are clickable links
- [ ] Export to CSV button exists

### Data Validation

**Card Display:**
- Prior day attendance: ___
- Date: ___
- Percentage: ___%

**Expected:** 30-60 builders for class days

**Drill-Down Data:**
- Row count: ___
- Matches card value: [ ] Yes [ ] No

**Test Builder Links:**
- Click 3 builder names
- Do they navigate to builder profiles: [ ] Yes [ ] No
- Builder profile URLs: `/builder/[ID]`

**Builder 1:** _______________ → Profile loads: [ ] Yes [ ] No
**Builder 2:** _______________ → Profile loads: [ ] Yes [ ] No
**Builder 3:** _______________ → Profile loads: [ ] Yes [ ] No

### UX/UI Evaluation

**Card Quality (1-5):**
- Date clarity: ___/5
- Value prominence: ___/5

**Drill-Down Quality (1-5):**
- Table readability: ___/5
- Link visibility: ___/5
- Export button placement: ___/5

**Observations:**

---

## Test 4.3: KPI Card - Task Completion This Week

### Actions
1. Click "Task Completion This Week" card
2. Review drill-down data
3. Test export functionality

### Functionality Checks
- [ ] Card shows percentage
- [ ] Week date range is indicated
- [ ] Drill-down shows task-level data
- [ ] Task names are listed
- [ ] Completion counts/percentages shown
- [ ] Export to CSV works

### Data Validation

**Card Display:**
- Completion percentage: ___%
- Week range: ___ to ___

**Drill-Down Data:**
- Number of tasks: ___
- Expected: ~100-120 tasks

**Task Completion Spot Check (5 random tasks):**
1. Task: _______________ | Completion: ___%
2. Task: _______________ | Completion: ___%
3. Task: _______________ | Completion: ___%
4. Task: _______________ | Completion: ___%
5. Task: _______________ | Completion: ___%

**Do completion rates vary reasonably?** [ ] Yes [ ] No

**Export Test:**
- Click "Export to CSV"
- File downloads: [ ] Yes [ ] No
- Filename is descriptive: [ ] Yes [ ] No
- CSV contains expected data: [ ] Yes [ ] No

### UX/UI Evaluation

**Card (1-5):**
- Percentage prominence: ___/5
- Context clarity: ___/5

**Drill-Down (1-5):**
- Data organization: ___/5
- Sortability: ___/5
- Export ease: ___/5

---

## Test 4.4: KPI Card - 7-Day Attendance Rate

### Actions
1. Click "7-Day Attendance Rate" card
2. Review calculation methodology
3. Verify date range

### Functionality Checks
- [ ] Card shows percentage
- [ ] Calculation method is explained (class days only)
- [ ] Drill-down shows day-by-day data
- [ ] Thursday/Friday are excluded
- [ ] Date range is clear

### Data Validation

**Card Display:**
- 7-day rate: ___%

**Expected:** 30-70% (varies by week)

**Drill-Down Data:**
- Shows last 7 CLASS days (not calendar days): [ ] Yes [ ] No
- Thursday present: [ ] Yes [ ] No (should be No)
- Friday present: [ ] Yes [ ] No (should be No)

**Day-by-Day Breakdown:**
1. ___ (day) | ___ date | ___%
2. ___ (day) | ___ date | ___%
3. ___ (day) | ___ date | ___%
4. ___ (day) | ___ date | ___%
5. ___ (day) | ___ date | ___%
6. ___ (day) | ___ date | ___%
7. ___ (day) | ___ date | ___%

**Days should be: Mon, Tue, Wed, Sat, Sun only**

**Calculate Average Manually:**
- Manual calculation: ___%
- Card value: ___%
- Match: [ ] Yes [ ] No

### UX/UI Evaluation

**Calculation Clarity (1-5):**
- Methodology explanation: ___/5
- "Class days only" indication: ___/5

**Drill-Down (1-5):**
- Day-by-day clarity: ___/5
- Date formatting: ___/5

---

## Test 4.5: KPI Card - Need Intervention

### Actions
1. Click "Need Intervention" card
2. Review criteria for intervention
3. Spot-check flagged builders

### Functionality Checks
- [ ] Card shows number of builders
- [ ] Criteria is explained (completion <50% OR attendance <70%)
- [ ] Drill-down lists flagged builders
- [ ] Each builder's stats are shown
- [ ] Builder names link to profiles

### Data Validation

**Card Display:**
- Builders needing intervention: ___

**Expected:** 15-30 builders

**Drill-Down Data:**
- Number of rows: ___
- Matches card: [ ] Yes [ ] No

**Criteria Check (5 random builders):**

For each, note completion % and attendance %:
1. _______________ | Comp: ___% | Att: ___% | Meets criteria: [ ] Yes [ ] No
2. _______________ | Comp: ___% | Att: ___% | Meets criteria: [ ] Yes [ ] No
3. _______________ | Comp: ___% | Att: ___% | Meets criteria: [ ] Yes [ ] No
4. _______________ | Comp: ___% | Att: ___% | Meets criteria: [ ] Yes [ ] No
5. _______________ | Comp: ___% | Att: ___% | Meets criteria: [ ] Yes [ ] No

**Criteria Met:** Should be <50% completion OR <70% attendance

**All flagged builders meet criteria?** [ ] Yes [ ] No

### UX/UI Evaluation

**Card Design (1-5):**
- Urgency indication (color, icon): ___/5
- Criteria clarity: ___/5

**Drill-Down (1-5):**
- Builder data presentation: ___/5
- Actionability: ___/5
- Explanation quality: ___/5

**Observations:**
- Is "intervention" criteria clear:
- Are stats easy to interpret:
- Any suggestions for improvement:

---

## Test 4.6: Cross-KPI Consistency

### Actions
1. Note values from all 5 KPI cards
2. Check for logical relationships

### Data Validation

**Record All KPI Values:**
- Attendance Today: ___
- Attendance Prior Day: ___
- Task Completion This Week: ___%
- 7-Day Attendance Rate: ___%
- Need Intervention: ___

**Logical Consistency Checks:**

**If today is Thu/Fri:**
- Attendance Today should be 0: [ ] Yes [ ] No

**If 7-day attendance is low (<40%):**
- Need Intervention count should be higher (>20): [ ] Yes [ ] No

**If Task Completion is high (>85%):**
- Need Intervention should be lower (<25): [ ] Yes [ ] No

**Any contradictions found?**

---

## Test 4.7: Modal/Drill-Down Usability

### Actions
1. Open 3 different KPI drill-downs
2. Test all interaction methods

### Functionality Checks

**For Each Modal:**
- [ ] Opens smoothly (no lag)
- [ ] Can be closed with X button
- [ ] Can be closed by clicking outside modal
- [ ] Can be closed with ESC key
- [ ] Scrollable if content overflows
- [ ] Export button works (if present)

### UX/UI Evaluation

**Modal Design Consistency (1-5):**
- All modals have similar design: ___/5
- Close methods are consistent: ___/5
- Header/title clarity: ___/5
- Content layout: ___/5

**Observations:**
- Any modals that differ from others:
- Any usability issues:

---

## Test 4.8: KPI Card Hover States

### Actions
1. Hover over each of the 5 KPI cards
2. Observe visual feedback

### Functionality Checks
- [ ] Cursor changes to pointer
- [ ] Card has hover effect (color change, shadow, etc.)
- [ ] Hover state is smooth (no flicker)
- [ ] Clear indication card is clickable

### UX/UI Evaluation

**Hover States (1-5):**
- Visual feedback quality: ___/5
- Consistency across cards: ___/5
- Affordance clarity: ___/5

---

## Test 4.9: KPI Card Loading States

### Actions
1. Refresh page or apply filter
2. Observe KPI cards during loading

### Functionality Checks
- [ ] Loading skeleton/spinner appears
- [ ] Cards don't show stale data during load
- [ ] Loading state is visually clear
- [ ] Transition to loaded state is smooth

### UX/UI Evaluation

**Loading States (1-5):**
- Loading indicator clarity: ___/5
- Transition smoothness: ___/5

---

## Test 4.10: Export Data Quality

### Actions
1. Export CSV from 2 different KPI drill-downs
2. Open CSV files
3. Review data structure

### Data Validation

**CSV 1 (_____________ KPI):**
- Filename: _______________
- Rows: ___
- Columns: ___
- Headers present: [ ] Yes [ ] No
- Data matches drill-down: [ ] Yes [ ] No

**CSV 2 (_____________ KPI):**
- Filename: _______________
- Rows: ___
- Columns: ___
- Headers present: [ ] Yes [ ] No
- Data matches drill-down: [ ] Yes [ ] No

### UX/UI Evaluation

**Export Quality (1-5):**
- Filename descriptiveness: ___/5
- Data completeness: ___/5
- CSV formatting: ___/5

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

### Drill-Down Usability Issues
1.
2.
3.

### Strengths
1.
2.
3.

### Overall KPI Cards Score
- Functionality: ___/5
- Data Accuracy: ___/5
- Drill-Down Quality: ___/5
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

### Ready for Next Test?
- [ ] Yes, proceed to Test 05: Quality Metrics & Charts
- [ ] No, issues must be addressed first

---

## For AI Agent Testers: Completion Checklist

- [ ] Completed ALL tests in this guide (4.1-4.10)
- [ ] Found minimum 5 issues total (or stated "No issues")
- [ ] Verified data accuracy with database queries
- [ ] Tested edge cases (Thu/Fri, future dates, 100% attendance)
- [ ] Checked accessibility (keyboard nav, ARIA, contrast)
- [ ] NO score is 5/5 without exceptional justification
- [ ] Provided improvement suggestions for each test
- [ ] Made production readiness assessment

---

**Tester:** _______________
**Date:** _______________
**Time Spent:** ___ minutes
