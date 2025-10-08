# Testing Guide 06: Builder Profiles
**Version:** 2.0 (CRITICAL TESTING MODE)
**Focus:** Individual builder profile pages, navigation, data accuracy, privacy
**Time Required:** 15-20 minutes
**Test Environment:** Local (http://localhost:3000/builder/[id])

---

## ⚠️ CRITICAL TESTING INSTRUCTIONS

**READ FIRST:** `/docs/testing/CRITICAL-TESTING-FRAMEWORK.md`

This test follows CRITICAL TESTING MODE:
- Test for FAILURE first (assume broken until proven otherwise)
- Verify data accuracy against database
- Test edge cases and error states (invalid IDs, excluded builders)
- Document ALL issues (even minor ones)
- Scoring: Most production software = 3.5-4.5/5 (not 5/5)

**Mandatory for EVERY test:**
- ✅ Functional verification
- 📊 Data accuracy (compare to database)
- 🐛 Issues found (minimum 1 or state "No issues")
- 💡 Improvements (minimum 2 suggestions)
- 🎯 Score with justification

**Expected Critical Issues (from framework):**
- Excluded builders (129, 5, 240, etc.) appearing
- Missing builder data handling
- Navigation back from profile
- Data inconsistency with dashboard

---

## Overview

This guide tests the individual builder profile pages accessed from drill-downs and direct URLs.

---

## Test 6.1: Profile Navigation from Drill-Down

### Actions
1. From Metrics Dashboard, click any KPI card drill-down
2. Find a builder name in the list
3. Click the builder name
4. Observe navigation to profile page

### Functionality Checks
- [ ] Builder name is clickable (hover state visible)
- [ ] Click navigates to `/builder/[id]` URL
- [ ] Profile page loads without errors
- [ ] Builder name is displayed on profile
- [ ] Can navigate back to dashboard

### UX/UI Evaluation

**Navigation Quality (1-5):**
- Link visibility: ___/5
- Transition smoothness: ___/5
- Back navigation clarity: ___/5

**Observations:**
- Is it clear builder names are clickable:
- Does URL change appropriately:

---

## Test 6.2: Direct URL Access

### Actions
1. Navigate directly to a builder profile (e.g., `/builder/309`)
2. Test with 3 different builder IDs
3. Test with invalid ID (e.g., `/builder/99999`)

### Functionality Checks

**Valid Builder IDs:**
- [ ] Profile loads successfully
- [ ] Correct builder name displayed
- [ ] All data sections render

**Test 3 Valid IDs:**
1. `/builder/___` → Loads: [ ] Yes [ ] No
2. `/builder/___` → Loads: [ ] Yes [ ] No
3. `/builder/___` → Loads: [ ] Yes [ ] No

**Invalid Builder ID:**
- [ ] Error page shown (404 or custom)
- [ ] Error message is clear
- [ ] Link back to dashboard provided

### Edge Case Testing (NEW - MANDATORY)

**CRITICAL: Test Excluded Builder IDs**
```
Excluded IDs: 129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332
```

**Test excluded builder access:**
1. Navigate to `/builder/129` (Afiya Augustine - staff)
   - Should show: [ ] Error/403 [ ] Empty page [ ] Full profile (BUG)
   - Actual: ___

2. Navigate to `/builder/5` (Greg Hogue - staff)
   - Should show: [ ] Error/403 [ ] Empty page [ ] Full profile (BUG)
   - Actual: ___

3. Navigate to `/builder/324` (duplicate account)
   - Should show: [ ] Error/403 [ ] Empty page [ ] Full profile (BUG)
   - Actual: ___

**Privacy Check:** If excluded builders show full profiles, this is a **CRITICAL SECURITY/PRIVACY BUG**

### Performance Testing (NEW)

**Profile Load Time:**
- Navigate to `/builder/309`
- Measure time to interactive: ___ ms
- Expected: <3s
- Pass: [ ] Yes [ ] No

**Test 5 different profiles:**
1. Builder ___ → ___ ms
2. Builder ___ → ___ ms
3. Builder ___ → ___ ms
4. Builder ___ → ___ ms
5. Builder ___ → ___ ms
- Average: ___ ms

### UX/UI Evaluation

**Error Handling (1-5):**
- Error page design: ___/5
- Error message clarity: ___/5
- Recovery options: ___/5

### 🐛 Issues Found (MANDATORY)

**Critical Issues (Privacy/Security):**
1. [SEVERITY: HIGH] Excluded builders accessible: [ ] Yes [ ] No

**UX Issues:**
1. [SEVERITY: HIGH/MEDIUM/LOW] ___

**Performance Issues:**
1. [SEVERITY: HIGH/MEDIUM/LOW] ___

### 💡 Improvement Suggestions (MINIMUM 2)

1. Add 403 error for excluded builder IDs
2. Implement redirect to dashboard for invalid IDs
3. ___

### 🎯 Score with Justification

**Test 6.2 Score: ___/5**

**Breakdown:**
- Functionality: ___/5
- Privacy/Security: ___/5 (excluded builder handling)
- Performance: ___/5
- Error handling: ___/5

**Justification:** ___

---

## Test 6.3: Profile Layout & Structure

### Actions
1. Review overall profile page layout
2. Identify all sections

### Functionality Checks

**Sections Present:**
- [ ] Builder name header
- [ ] 4 KPI cards (summary stats)
- [ ] Attendance history section
- [ ] Completed tasks section
- [ ] Status indicator (Top Performer/On Track/Struggling)
- [ ] Engagement score
- [ ] Back navigation

### UX/UI Evaluation

**Layout Quality (1-5):**
- Information hierarchy: ___/5
- Section organization: ___/5
- Visual design: ___/5
- Use of space: ___/5

**Observations:**
- Is the layout clear and scannable:
- Any sections that seem out of place:
- Amount of information: [ ] Too much [ ] Just right [ ] Too little

---

## Test 6.4: Profile KPI Cards

### Actions
1. Review the 4 KPI cards on builder profile
2. Compare to dashboard metrics

### Functionality Checks

**KPI Cards Present:**
- [ ] Total Tasks Completed (number)
- [ ] Attendance Rate (percentage)
- [ ] Engagement Score (0-100)
- [ ] Status (Top Performer/On Track/Struggling)

### Data Validation

**Builder: _______________**

**KPI Values:**
- Total Tasks Completed: ___
- Attendance Rate: ___%
- Engagement Score: ___/100
- Status: _______________

**Logical Consistency Checks:**

**If Status = "Top Performer":**
- Completion should be >90%: Actual: ___%  ✓/✗
- Attendance should be >90%: Actual: ___%  ✓/✗
- Engagement should be >80: Actual: ___  ✓/✗

**If Status = "Struggling":**
- Completion should be <50% OR Attendance <70%: ✓/✗
- Engagement should be <40: Actual: ___  ✓/✗

**Is status assignment logical?** [ ] Yes [ ] No

### UX/UI Evaluation

**KPI Card Design (1-5):**
- Visual consistency with dashboard: ___/5
- Metric prominence: ___/5
- Status indicator clarity: ___/5
- Color coding (if used): ___/5

**Observations:**

---

## Test 6.5: Attendance History Section

### Actions
1. Locate attendance history section
2. Review the data presentation
3. Check for completeness

### Functionality Checks
- [ ] Attendance dates are listed
- [ ] Status for each date (Present, Late, Absent)
- [ ] Late arrival minutes shown (if applicable)
- [ ] Dates are in chronological order
- [ ] Date formatting is clear

### Data Validation

**Builder: _______________**

**Attendance Records:**
- Total records shown: ___
- Expected: ~19 class days

**Status Breakdown:**
- Present: ___ days
- Late: ___ days
- Absent: ___ days

**Date Range:**
- Earliest: _______________
- Latest: _______________
- Expected range: Sept 6, 2025 - Oct 1, 2025

**Check for Thursday/Friday:**
- Any Thursday records: [ ] Yes (should be No) [ ] No
- Any Friday records: [ ] Yes (should be No) [ ] No

**Spot Check 5 Dates:**
1. ___ | Status: ___ | Late minutes: ___
2. ___ | Status: ___ | Late minutes: ___
3. ___ | Status: ___ | Late minutes: ___
4. ___ | Status: ___ | Late minutes: ___
5. ___ | Status: ___ | Late minutes: ___

### UX/UI Evaluation

**Attendance Display (1-5):**
- Chronological ordering: ___/5
- Status clarity: ___/5
- Date formatting: ___/5
- Data density: ___/5

**Observations:**
- Is late arrival info useful:
- Any missing dates or gaps:

---

## Test 6.6: Completed Tasks Section

### Actions
1. Locate completed tasks section
2. Review task list
3. Check for task details

### Functionality Checks
- [ ] Task names are listed
- [ ] Completion dates are shown
- [ ] Tasks are sortable/filterable (if applicable)
- [ ] Task count matches KPI card

### Data Validation

**Builder: _______________**

**Completed Tasks:**
- Total shown: ___
- Matches "Total Tasks Completed" KPI: [ ] Yes [ ] No

**Date Range:**
- Earliest completion: _______________
- Latest completion: _______________

**Task Names:**
- Are task names clear/identifiable: [ ] Yes [ ] No
- Are they truncated: [ ] Yes [ ] No [ ] Some

**Spot Check 5 Tasks:**
1. Task: _______________ | Date: ___
2. Task: _______________ | Date: ___
3. Task: _______________ | Date: ___
4. Task: _______________ | Date: ___
5. Task: _______________ | Date: ___

**Do completion dates fall within cohort timeframe?** [ ] Yes [ ] No

### UX/UI Evaluation

**Task List Design (1-5):**
- List organization: ___/5
- Task name clarity: ___/5
- Date formatting: ___/5
- Scanability: ___/5

**Observations:**
- Are tasks in useful order (chronological, alphabetical):
- Would search/filter be helpful:

---

## Test 6.7: Engagement Score Breakdown

### Actions
1. Locate engagement score (0-100)
2. Look for calculation explanation
3. Compare to overall behavior

### Functionality Checks
- [ ] Engagement score is displayed prominently
- [ ] Calculation formula is explained (if shown)
- [ ] Score aligns with KPIs and status

### Data Validation

**Builder: _______________**

**Engagement Score:** ___/100

**Formula (if shown):**
- Attendance weight: ___%
- Completion weight: ___%
- Quality weight: ___%

**Expected Formula:**
- (Attendance × 30%) + (Completion × 50%) + (Quality × 20%)

**Manual Calculation Check:**
- Attendance: ___% × 0.30 = ___
- Completion: ___% × 0.50 = ___
- Quality: ___% × 0.20 = ___
- Sum: ___
- Matches displayed score: [ ] Yes [ ] No [ ] Approximately

### UX/UI Evaluation

**Engagement Score Display (1-5):**
- Score prominence: ___/5
- Formula transparency: ___/5
- Visual design: ___/5

**Observations:**

---

## Test 6.8: Status Indicator

### Actions
1. Review builder status (Top Performer/On Track/Struggling)
2. Check for visual indicators (color, badge, icon)

### Functionality Checks
- [ ] Status is clearly displayed
- [ ] Status has visual differentiation (color coding)
- [ ] Status criteria is explained (if present)

### Data Validation

**Builder: _______________**

**Status:** _______________

**Visual Treatment:**
- Color: _______________
- Icon/badge: _______________
- Placement: _______________

**Status Validation:**
- Does status match KPIs: [ ] Yes [ ] No
- Is status criteria clear: [ ] Yes [ ] No

### UX/UI Evaluation

**Status Indicator Quality (1-5):**
- Visual prominence: ___/5
- Clarity: ___/5
- Color coding effectiveness: ___/5

**Observations:**

---

## Test 6.9: Multiple Builder Comparison

### Actions
1. View profiles for 3 different builders:
   - One "Top Performer"
   - One "On Track"
   - One "Struggling"

### Data Validation

**Builder 1 (Top Performer):**
- Name: _______________
- Completion: ___%
- Attendance: ___%
- Engagement: ___
- Status: _______________

**Builder 2 (On Track):**
- Name: _______________
- Completion: ___%
- Attendance: ___%
- Engagement: ___
- Status: _______________

**Builder 3 (Struggling):**
- Name: _______________
- Completion: ___%
- Attendance: ___%
- Engagement: ___
- Status: _______________

**Status Assignment Accuracy:**
- Top Performer criteria met: [ ] Yes [ ] No
- On Track criteria met: [ ] Yes [ ] No
- Struggling criteria met: [ ] Yes [ ] No

### UX/UI Evaluation

**Profile Consistency (1-5):**
- Layout consistency across profiles: ___/5
- Status differentiation effectiveness: ___/5

---

## Test 6.10: Back Navigation

### Actions
1. From builder profile, find navigation back to dashboard
2. Test back button in browser
3. Test any breadcrumbs or links

### Functionality Checks
- [ ] Clear back navigation exists
- [ ] Browser back button works
- [ ] Returns to correct previous page
- [ ] No data loss when navigating back

### UX/UI Evaluation

**Navigation Quality (1-5):**
- Back option visibility: ___/5
- Back option clarity: ___/5
- Navigation consistency: ___/5

**Observations:**

---

## Test 6.11: Profile URL Sharing

### Actions
1. Copy a builder profile URL
2. Open in new browser tab/window
3. Share URL (test if shareable)

### Functionality Checks
- [ ] URL is clean and shareable
- [ ] Direct URL access works
- [ ] Profile loads in new tab
- [ ] No authentication issues (if public)

### UX/UI Evaluation

**URL Quality:**
- Format: `/builder/[ID]`
- Is URL human-readable: [ ] Yes [ ] No
- Is URL shareable: [ ] Yes [ ] No

---

## Test 6.12: Profile Performance

### Actions
1. Navigate to 5 different builder profiles
2. Measure load times

### Performance Data

**Load Times:**
1. Builder ___ : ___ seconds
2. Builder ___ : ___ seconds
3. Builder ___ : ___ seconds
4. Builder ___ : ___ seconds
5. Builder ___ : ___ seconds

**Average Load Time:** ___ seconds

**Expected:** <3 seconds

### UX/UI Evaluation

**Performance (1-5):**
- Load speed: ___/5
- Transition smoothness: ___/5

---

## Test 6.13: Profile Responsiveness

### Actions
1. View builder profile at different screen sizes
2. Test mobile layout

### Functionality Checks
- [ ] Layout adapts to screen width
- [ ] KPI cards reflow on mobile
- [ ] Attendance history is readable on mobile
- [ ] Task list is usable on mobile
- [ ] No horizontal scrolling

### UX/UI Evaluation

**Responsiveness (1-5):**
- Desktop: ___/5
- Tablet: ___/5
- Mobile: ___/5

**Observations:**

---

## Test 6.14: Data Freshness

### Actions
1. Note "Last updated" or data timestamp (if present)
2. Check if data reflects recent activity

### Functionality Checks
- [ ] Data timestamp is shown
- [ ] Data appears current
- [ ] Recent tasks are included
- [ ] Recent attendance is included

### Observations:

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

### Navigation Issues
1.
2.
3.

### Strengths
1.
2.
3.

### Overall Builder Profiles Score
- Functionality: ___/5
- Data Accuracy: ___/5
- Privacy/Security: ___/5 (excluded builder handling)
- Navigation: ___/5
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

**Privacy/Security Note:**
If excluded builders are accessible (IDs: 129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332), this is a CRITICAL issue that MUST be fixed before production.

### Ready for Next Test?
- [ ] Yes, proceed to Test 07: Terminology & Content
- [ ] No, issues must be addressed first

---

## For AI Agent Testers: Completion Checklist

- [ ] Completed ALL tests in this guide (6.1-6.14)
- [ ] Found minimum 5 issues total (or stated "No issues")
- [ ] Verified data accuracy with database queries
- [ ] Tested excluded builder IDs (CRITICAL privacy check)
- [ ] Tested edge cases (invalid IDs, missing data)
- [ ] Checked accessibility and navigation
- [ ] NO score is 5/5 without exceptional justification
- [ ] Provided improvement suggestions for each test
- [ ] Made production readiness assessment

---

**Tester:** _______________
**Date:** _______________
**Time Spent:** ___ minutes
