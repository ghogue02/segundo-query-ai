# Testing Guide 03: Metrics Dashboard Overview
**Version:** 2.0 (CRITICAL TESTING MODE)
**Focus:** Dashboard layout, filters, auto-refresh, data accuracy, error handling
**Time Required:** 30-40 minutes
**Test Environment:** Local (http://localhost:3000/metrics)

---

## ⚠️ CRITICAL TESTING INSTRUCTIONS FOR AI AGENTS

This is a **CRITICAL TESTING GUIDE** designed to find real issues, not just validate functionality.

### Scoring Philosophy
- **5/5 = EXCEPTIONAL** - Zero issues, exceeds industry standards, perfect execution
- **4/5 = GOOD** - Minor cosmetic issues only, meets all requirements
- **3/5 = ACCEPTABLE** - Works but has UX problems or missing features
- **2/5 = NEEDS WORK** - Functional but significant usability/performance issues
- **1/5 = BROKEN** - Does not work as intended, critical bugs

**MOST PRODUCTION-READY SOFTWARE SCORES 3.5-4.5/5**

### Required Testing Approach
1. **Test for FAILURE first** - Assume things are broken until proven otherwise
2. **Verify data accuracy** - Don't just check if numbers display, verify they're CORRECT
3. **Test edge cases** - Empty states, no data, extreme values, invalid inputs
4. **Find accessibility issues** - Keyboard nav, screen readers, color contrast
5. **Document ALL issues** - Even minor ones matter for iterative improvement

### Mandatory Sections
Every test MUST include:
- ✅ Functional verification
- 📊 Data accuracy check (compare to database when possible)
- 🐛 Issues found (minimum 1 per test, or explicitly state "No issues found")
- 💡 Improvement suggestions (even if it works perfectly)
- 🎯 Objective score with justification

---

## Pre-Test Setup

### Required Tools
- [ ] Browser DevTools open (F12)
- [ ] Console tab visible (watch for errors)
- [ ] Network tab open (monitor API calls)
- [ ] Database access ready (for data validation)

### Baseline Metrics (Record These First)
Navigate to http://localhost:3000/metrics and record:

**Initial Page Load:**
- Load time: ___ seconds (measure from navigation to fully interactive)
- Time to First Contentful Paint: ___ seconds (DevTools Performance tab)
- Total API calls: ___ (Network tab)
- Failed requests: ___ (any red in Network tab)
- Console errors: ___ (any red in Console)

**Expected Performance Benchmarks:**
- Load time: <3s (Google standard)
- First paint: <1.5s
- Failed requests: 0
- Console errors: 0

---

## Test 3.1: Initial Dashboard Load

### Actions
1. Navigate to http://localhost:3000/metrics
2. Open DevTools → Performance tab → Record page load
3. Stop recording after page is fully interactive
4. Analyze metrics

### Functionality Checks
- [ ] Dashboard loads within 5 seconds
- [ ] All sections render without errors
- [ ] Tab structure is visible (Natural Language, Defined Metrics, Terminology Legend)
- [ ] KPI cards are displayed (count: ___)
- [ ] Charts are displayed (count: ___)
- [ ] Filter sidebar is visible

### Performance Analysis (MANDATORY)

**Load Time Breakdown:**
- Initial HTML: ___ ms
- JavaScript execution: ___ ms
- API calls total: ___ ms
- First Contentful Paint: ___ ms
- Time to Interactive: ___ ms

**API Call Analysis:**
Document each API call from Network tab:
```
GET /api/metrics/kpis?cohort=September%202025 → ___ ms (Status: ___)
GET /api/metrics/hypotheses/h1?cohort=September%202025 → ___ ms (Status: ___)
GET /api/metrics/hypotheses/h2?cohort=September%202025 → ___ ms (Status: ___)
[Continue for all API calls...]
```

**Critical Analysis:**
- Any API call >2s? [ ] Yes [ ] No → If yes, which: ___
- Any failed requests (4xx/5xx)? [ ] Yes [ ] No → If yes, which: ___
- Any duplicate API calls? [ ] Yes [ ] No → If yes, which: ___

### Data Accuracy Validation (MANDATORY)

**KPI Cards - Verify Against Database:**

For EACH KPI card, run database query to verify:

1. **Attendance Today:**
   - Displayed value: ___
   - Database query:
     ```sql
     SELECT COUNT(*) FROM builder_attendance_new
     WHERE status = 'present'
     AND DATE(attendance_date) = CURRENT_DATE
     AND cohort = 'September 2025';
     ```
   - Database result: ___
   - ✅ Match? [ ] Yes [ ] No
   - If no: **CRITICAL BUG** - Document discrepancy

2. **Task Completion %:**
   - Displayed value: ___%
   - Expected calculation: (Completed tasks / Total tasks) * 100
   - Manual verification: ___ / ___ = ___%
   - ✅ Match? [ ] Yes [ ] No

3. **Attendance Rate:**
   - Displayed value: ___%
   - Database verification: ___
   - ✅ Match? [ ] Yes [ ] No

### UX/UI Evaluation (CRITICAL LENS)

**First Impression (1-5 with justification):**
- Information organization: ___/5
  - Justification: ___
  - Issues: ___

- Visual hierarchy: ___/5
  - Justification: ___
  - Issues: ___

- Amount of information: [ ] Too much [ ] Just right [ ] Too little
  - Justification: ___

- Overall layout quality: ___/5
  - Justification: ___
  - Issues: ___

### 🐛 Issues Found (MANDATORY)

**Critical Issues:**
1. [SEVERITY: HIGH/MEDIUM/LOW] Description
2.

**UX Issues:**
1. [SEVERITY: HIGH/MEDIUM/LOW] Description
2.

**Performance Issues:**
1. [SEVERITY: HIGH/MEDIUM/LOW] Description
2.

**If NO issues found:**
State explicitly: "No issues found in initial load test. Verified data accuracy, performance, and UX."

### 💡 Improvement Suggestions (MANDATORY)

Even if perfect, suggest improvements:
1.
2.
3.

### 🎯 Score with Justification

**Test 3.1 Score: ___/5**

**Justification:**
- Functionality: ___
- Performance: ___
- Data accuracy: ___
- UX: ___

---

## Test 3.2: Tab Structure

### Actions
1. Click "Natural Language" tab
2. Click "Defined Metrics" tab
3. Click "Terminology Legend" tab
4. Repeat 3 times rapidly (stress test)

### Functionality Checks
- [ ] Tab names are clear
- [ ] Tabs are clickable
- [ ] Tab content switches correctly
- [ ] Active tab is visually indicated
- [ ] Tab switching is smooth (no flicker/delay)

### Accessibility Testing (NEW - MANDATORY)

**Keyboard Navigation:**
1. Use Tab key to navigate to tabs
2. Use Arrow keys to switch between tabs
3. Use Enter/Space to activate tabs

- [ ] Can reach tabs with Tab key
- [ ] Can switch tabs with Arrow keys
- [ ] Can activate with Enter/Space
- [ ] Focus indicator is visible (border/outline)
- [ ] Focus order is logical (left to right)

**Screen Reader Simulation:**
1. Inspect tab HTML in DevTools
2. Check for ARIA attributes:
   - [ ] `role="tablist"` on container
   - [ ] `role="tab"` on each tab
   - [ ] `aria-selected="true"` on active tab
   - [ ] `aria-controls` linking tab to panel

**Color Contrast Check:**
1. Use DevTools → Inspect → Accessibility panel
2. Check active tab contrast ratio
   - Active tab text: ___ : 1 (minimum 4.5:1 for WCAG AA)
   - Inactive tab text: ___ : 1
   - ✅ Meets WCAG AA? [ ] Yes [ ] No

### Edge Case Testing (NEW - MANDATORY)

**Test: Rapid Tab Switching**
1. Click tabs rapidly 10 times in 5 seconds
2. Observe behavior:
   - [ ] No broken content
   - [ ] No visual glitches
   - [ ] Content loads correctly
   - [ ] No console errors

**Test: Tab Content Preservation**
1. Switch to Terminology tab
2. Scroll down
3. Switch to Defined Metrics
4. Switch back to Terminology
   - [ ] Scroll position preserved?
   - [ ] Content state maintained?

### 🐛 Issues Found

**Critical Issues:**
1.

**UX Issues:**
1.

**Accessibility Issues:**
1.

### 💡 Improvement Suggestions
1.
2.

### 🎯 Score: ___/5

**Justification:**

---

## Test 3.3: Information Architecture

### Actions
1. On "Defined Metrics" tab, identify all sections
2. Screenshot the page for layout analysis
3. Count items in each section

### Functionality Checks

**Sections Present:**
- [ ] KPI Cards (count: ___)
- [ ] Quality Metrics (count: ___)
- [ ] Hypothesis Charts (count: ___)
- [ ] Filter Sidebar (location: ___)
- [ ] Refresh Indicator (location: ___)

### Information Density Analysis (NEW - MANDATORY)

**Cognitive Load Assessment:**

Based on Miller's Law (7±2 chunks):
- KPI Cards: ___ items (optimal: 5-7)
- Charts per screen: ___ visible (optimal: 3-5)
- Filters visible: ___ (optimal: 5-7)

**Visual Grouping:**
- [ ] Related items are grouped (proximity principle)
- [ ] Groups have clear headers
- [ ] White space separates different groups
- [ ] Color coding is consistent

### Comparative Analysis (NEW - MANDATORY)

**Industry Benchmark Comparison:**

Compare to Tableau/Google Analytics dashboards:

| Metric | Our Dashboard | Industry Standard | Score |
|--------|---------------|-------------------|-------|
| KPI cards | ___ | 4-6 | ___/5 |
| Charts | ___ | 4-8 | ___/5 |
| Filters | ___ | 5-7 | ___/5 |
| Load time | ___s | <3s | ___/5 |
| Information density | High/Medium/Low | Medium | ___/5 |

### 🐛 Issues Found

**Layout Issues:**
1.

**Information Hierarchy Issues:**
1.

### 💡 Improvement Suggestions
1. Consider lazy-loading charts below fold
2.
3.

### 🎯 Score: ___/5

---

## Test 3.4: Filter Sidebar - Layout

### Actions
1. Locate filter sidebar
2. Expand/collapse all filter groups
3. Measure filter hit target sizes (DevTools)

### Functionality Checks

**Filters Present:**
- [ ] Time Range (options: ___)
- [ ] Week Selection (options: ___)
- [ ] Builder Segments (options: ___)
- [ ] Activity Categories (options: ___)
- [ ] Task Types (options: ___)
- [ ] Task Modes (options: ___)
- [ ] Active Filters summary (location: ___)
- [ ] Reset button (location: ___)

### Accessibility Audit (NEW - MANDATORY)

**Touch Target Size Check:**
Use DevTools to measure clickable areas:
- Checkbox size: ___ x ___ px (minimum: 44x44px per WCAG)
- Radio button size: ___ x ___ px (minimum: 44x44px)
- Filter labels clickable: [ ] Yes [ ] No
- Adequate spacing between targets: [ ] Yes [ ] No

**Keyboard Navigation:**
- [ ] Can Tab through all filters
- [ ] Can activate with Space/Enter
- [ ] Focus indicator visible
- [ ] Logical tab order (top to bottom)

**Screen Reader Test:**
Inspect HTML for accessibility:
- [ ] `<fieldset>` groups related filters
- [ ] `<legend>` labels each filter group
- [ ] `aria-label` on checkboxes/radios
- [ ] Form inputs have associated `<label>`

### Visual Design Analysis (NEW - MANDATORY)

**Color Contrast:**
- Filter labels: ___ : 1 (minimum 4.5:1)
- Disabled filters: ___ : 1 (minimum 3:1)
- Checked checkboxes: ___ : 1 (minimum 3:1)

**Typography:**
- Filter label font size: ___ px (minimum 16px)
- Filter count badges: ___ px (minimum 14px)

### 🐛 Issues Found

**Accessibility Issues:**
1.

**UX Issues:**
1.

### 💡 Improvement Suggestions
1.
2.

### 🎯 Score: ___/5

---

## Test 3.5: Time Range Filter - CRITICAL DATA VALIDATION

### Actions
1. Record current KPI values (screenshot)
2. Change time range to "7 days"
3. Verify data changes
4. Change to "30 days"
5. Change to "All time"
6. Document each change

### Functionality Checks
- [ ] Time range selector works
- [ ] Dashboard updates after selection
- [ ] KPI values change appropriately
- [ ] Charts update with new date range
- [ ] Loading indicators appear during update
- [ ] Update completes within 3 seconds

### CRITICAL BUG TEST (NEW - MANDATORY)

**Time Filter Logic Validation:**

**EXPECTED BEHAVIOR:**
- "All Time" = entire cohort duration (Sept 6, 2025 - Oct 4, 2025)
- "Last 7 Days" = Oct 4 - Sept 28, 2025
- "Last 30 Days" = Oct 4 - Sept 5, 2025

**TEST: Does time filter affect real-time KPIs?**

1. Select "Last 7 Days"
2. Check "Attendance Today" KPI
   - Expected: Should show TODAY's attendance (not filtered)
   - Actual: ___
   - 🚨 BUG? [ ] Yes [ ] No

**LOGIC ERROR:** Time range should NOT affect "Today" metrics like:
- Attendance Today
- Prior Day Attendance

But SHOULD affect historical metrics:
- Task Completion Rate
- Attendance Rate (historical average)

**Document behavior:**
- Attendance Today changes with time filter? [ ] Yes (BUG!) [ ] No (correct)
- Task Completion changes with time filter? [ ] Yes (correct) [ ] No (BUG!)

### Data Accuracy Validation (MANDATORY)

**KPI Changes with Time Range:**

**All Time:**
- Attendance Rate: ___%
- Task Completion: ___%
- Database verification query:
  ```sql
  SELECT
    ROUND(AVG(attendance_pct), 2) as avg_attendance,
    ROUND(AVG(completion_pct), 2) as avg_completion
  FROM (
    -- Your aggregate query here
  ) subquery
  WHERE date >= '2025-09-06' AND date <= '2025-10-04';
  ```
- Database result: ___ % attendance, ___ % completion
- ✅ Match? [ ] Yes [ ] No

**7 Days:**
- Displayed: ___ % attendance, ___ % completion
- Expected date range: 2025-09-28 to 2025-10-04
- Database verified: ___ % attendance, ___ % completion
- ✅ Match? [ ] Yes [ ] No

**30 Days:**
- Displayed: ___ % attendance, ___ % completion
- Expected date range: 2025-09-05 to 2025-10-04
- Database verified: ___ % attendance, ___ % completion
- ✅ Match? [ ] Yes [ ] No

### Performance Testing (NEW - MANDATORY)

**Filter Response Time:**
1. Open Network tab
2. Change time filter
3. Record all API calls triggered:

```
GET /api/metrics/kpis?cohort=...&timeRange=7 → ___ ms
GET /api/metrics/hypotheses/h1?... → ___ ms
[List all API calls with timings]
```

**Total filter response time:** ___ ms (should be <2000ms)

**Loading State Test:**
- [ ] Loading spinner appears
- [ ] Content doesn't shift/jump
- [ ] User can't interact during load (prevents race conditions)

### Edge Case Testing (NEW - MANDATORY)

**Test: Select time range with no class days**

1. If possible, select a date range that includes Thursday/Friday only
2. Expected: Message like "No class days in selected range"
3. Actual: ___
4. ✅ Handles gracefully? [ ] Yes [ ] No

**Test: Extremely long time range**

1. Select "All Time" (full cohort)
2. Check for performance degradation
3. Load time: ___ ms (should still be <3s)

### UX Evaluation (CRITICAL)

**Filter Label Clarity:**
- Does "All Time" show date range? [ ] Yes [ ] No
  - If no: **UX ISSUE** - users don't know what "All Time" means
  - Suggestion: "All Time (Sept 6 - Oct 4, 2025)"

- Does "Last 7 Days" show actual dates? [ ] Yes [ ] No
  - If no: **UX ISSUE** - ambiguous timeframe
  - Suggestion: "Last 7 Days (Sept 28 - Oct 4)"

### 🐛 Issues Found (Minimum 2 expected)

**Critical Issues:**
1.

**Data Accuracy Issues:**
1.

**UX Issues:**
1. Time range labels don't show actual dates (LOW)
2.

**Performance Issues:**
1.

### 💡 Improvement Suggestions
1. Add date range to filter labels for clarity
2. Show loading skeleton instead of spinner
3. Add progressive loading (KPIs first, then charts)
4.

### 🎯 Score: ___/5

**Justification:**
- Functionality (works?): ___/5
- Data accuracy (correct?): ___/5
- Performance (<2s): ___/5
- UX (clear labels?): ___/5
- **Average: ___/5**

---

## Test 3.6: Week Selection Filter

### Actions
1. Note current state
2. Uncheck "Week 4"
3. Observe changes
4. Uncheck "Week 3"
5. Check all weeks
6. Uncheck all weeks (if possible)

### Functionality Checks
- [ ] Week filter works independently
- [ ] Dashboard filters to selected week(s)
- [ ] Data changes reflect week selection
- [ ] Can select/deselect individual weeks
- [ ] Can select multiple weeks
- [ ] Active Filters shows week count

### Edge Case Testing (NEW - MANDATORY)

**Test: Select NO weeks**
1. Uncheck all week checkboxes
2. Expected behavior: ___
3. Actual behavior: ___
4. Does it show error message? [ ] Yes [ ] No
5. Does it prevent deselecting last week? [ ] Yes [ ] No
6. 🐛 BUG if: Dashboard shows data with no weeks selected

**Test: Week 1 vs Week 4 data progression**
1. Select only Week 1
2. Record Task Completion: ___%
3. Select only Week 4
4. Record Task Completion: ___%
5. Expected: Week 4 should have higher completion (learning progression)
6. Actual: Week ___ has higher completion
7. ✅ Logical? [ ] Yes [ ] No

### Data Validation (MANDATORY)

**Week Date Verification:**

For each week, verify date labels are correct:
- Week 1: Shown as "___" → Expected: "Sept 6-12, 2025"
- Week 2: Shown as "___" → Expected: "Sept 13-19, 2025"
- Week 3: Shown as "___" → Expected: "Sept 20-26, 2025"
- Week 4: Shown as "___" → Expected: "Sept 27-30, 2025"

✅ All dates correct? [ ] Yes [ ] No

**Week-Specific Data Check:**
```sql
-- Verify Week 1 task completion
SELECT
  COUNT(DISTINCT task_id) as completed,
  (SELECT COUNT(*) FROM tasks WHERE week = 1) as total,
  ROUND(COUNT(DISTINCT task_id)::numeric / (SELECT COUNT(*) FROM tasks WHERE week = 1) * 100, 2) as pct
FROM task_submissions
WHERE week = 1;
```

Database result: ___%
Dashboard shows: ___%
✅ Match? [ ] Yes [ ] No

### 🐛 Issues Found

**Critical Issues:**
1.

**UX Issues:**
1.

### 💡 Improvement Suggestions
1.
2.

### 🎯 Score: ___/5

---

## Test 3.7: Builder Segment Filter

### Actions
1. Select "Top Performers"
2. Note builder count and KPI changes
3. Select "Struggling Builders"
4. Note changes
5. Return to "All Builders"

### Functionality Checks
- [ ] Segment filter works
- [ ] KPI cards update to reflect segment
- [ ] Charts filter to segment
- [ ] Builder counts change appropriately
- [ ] Segment definition is explained (tooltip/info icon)

### Data Validation (CRITICAL - MANDATORY)

**Builder Segment Definitions:**

First, verify what each segment means:
1. Check if there's a tooltip/info icon explaining criteria
2. Document the criteria:
   - Top Performers: ___
   - Struggling Builders: ___
   - All Builders: ___

**Builder Count Verification:**

**All Builders:**
- Displayed: ___
- Database query:
  ```sql
  SELECT COUNT(*) FROM users
  WHERE cohort = 'September 2025'
  AND active = true
  AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332);
  ```
- Database result: ___
- ✅ Match? [ ] Yes [ ] No

**Top Performers:**
- Displayed: ___
- Expected: Subset of All Builders
- ✅ Less than All Builders? [ ] Yes [ ] No (BUG if No)

**Struggling Builders:**
- Displayed: ___
- Expected: Subset of All Builders
- ✅ Less than All Builders? [ ] Yes [ ] No

**Logical Validation:**
- Top + Struggling = All Builders? [ ] Yes [ ] No [ ] N/A
- Any overlap between Top and Struggling? [ ] Yes (BUG!) [ ] No

### Edge Case Testing (NEW - MANDATORY)

**Test: Struggling Builders with no data**

If "Struggling Builders" count is 0:
1. Expected: Message like "No struggling builders this week! 🎉"
2. Actual: ___
3. ✅ Graceful handling? [ ] Yes [ ] No

**Test: Top Performers criteria transparency**

1. Can users see why someone is "Top Performer"? [ ] Yes [ ] No
2. If yes, how: ___
3. If no: **UX ISSUE** - criteria should be visible

### Performance Testing (NEW)

**Segment Switch Response Time:**
1. Click "Top Performers"
2. Time from click to updated data: ___ ms
3. ✅ Under 2 seconds? [ ] Yes [ ] No

### 🐛 Issues Found

**Critical Issues:**
1.

**Data Issues:**
1.

**UX Issues:**
1. Segment criteria not explained (if applicable)
2.

### 💡 Improvement Suggestions
1. Add tooltip explaining segment criteria
2. Show segment criteria in filter label (e.g., "Top Performers (>80% attendance)")
3.

### 🎯 Score: ___/5

---

## Test 3.8: Activity Category Filter

### Actions
1. Note current state (which categories are selected by default)
2. Deselect all categories
3. Select only "Reflection"
4. Observe changes
5. Select "Core Learning" + "Applied Work"

### Functionality Checks
- [ ] Activity filter works
- [ ] Dashboard shows only selected activities
- [ ] Task counts decrease when filtered
- [ ] Can select multiple categories
- [ ] ⭐ Core categories are marked/highlighted
- [ ] Active Filters shows category count

### Default State Validation (NEW - MANDATORY)

**Initial State Check:**
- Which categories are selected by default: ___
- Expected: Core Learning ⭐, Applied Work ⭐
- ✅ Correct defaults? [ ] Yes [ ] No

**Justification for defaults:**
- Are defaults explained to user? [ ] Yes [ ] No
- If no: **UX ISSUE** - users don't know why some are pre-selected

### Data Validation (MANDATORY)

**Task Count Verification:**

**All Categories:**
- Total tasks shown: ___
- Database query:
  ```sql
  SELECT COUNT(*) FROM tasks WHERE cohort = 'September 2025';
  ```
- Database result: ___
- ✅ Match? [ ] Yes [ ] No

**Reflection Only:**
- Tasks shown: ___
- Database query:
  ```sql
  SELECT COUNT(*) FROM tasks
  WHERE cohort = 'September 2025'
  AND category = 'Reflection';
  ```
- Database result: ___
- ✅ Match? [ ] Yes [ ] No

**Core Learning + Applied Work:**
- Tasks shown: ___
- Expected: Sum of both categories
- ✅ Correct? [ ] Yes [ ] No

### Edge Case Testing (NEW - MANDATORY)

**Test: Deselect all categories**
1. Uncheck all category checkboxes
2. Expected: Error message OR force at least one selection
3. Actual: ___
4. 🐛 BUG if: Shows data with no categories selected

**Test: Category with zero tasks**

If any category has 0 tasks:
1. Select that category only
2. Expected: "No tasks in this category" message
3. Actual: ___
4. ✅ Graceful handling? [ ] Yes [ ] No

### Visual Design Check (NEW - MANDATORY)

**Core Category Indicators:**
- How are Core Learning and Applied Work marked? ___
- Is the ⭐ icon meaningful? [ ] Yes [ ] No [ ] No icon shown
- If no icon: **UX ISSUE** - core categories should be visually distinct

### 🐛 Issues Found

**Critical Issues:**
1.

**UX Issues:**
1.
2.

### 💡 Improvement Suggestions
1. Show task count per category (e.g., "Core Learning ⭐ (42)")
2. Add tooltip explaining why Core Learning and Applied Work are default
3.

### 🎯 Score: ___/5

---

## Test 3.9: Multiple Filter Combination

### Actions
1. Apply these filters together:
   - Time Range: "Last 7 Days"
   - Week: "Week 3" only
   - Segment: "Top Performers"
   - Categories: "Core Learning" + "Reflection"
2. Document results

### Functionality Checks
- [ ] Multiple filters work together seamlessly
- [ ] Dashboard updates correctly
- [ ] No conflicts between filters
- [ ] Active Filters section shows all applied
- [ ] Can clear filters individually
- [ ] Filters are applied in logical order

### CRITICAL: Filter Logic Validation (NEW - MANDATORY)

**Test for Filter Conflicts:**

**Potential Conflict #1: Time Range + Week Selection**
- Time Range: "Last 7 Days" selected
- Week: "Week 1" selected (Sept 6-12, which is >30 days ago)
- Expected: Show Week 1 data (week filter overrides time filter) OR show error
- Actual: ___
- ✅ Logical behavior? [ ] Yes [ ] No

If both Week and Time Range are active:
- Which takes precedence: ___
- Is this explained to user: [ ] Yes [ ] No

**Potential Conflict #2: Segment + Time Range**
- Segment: "Top Performers" (based on all-time performance)
- Time Range: "Last 7 Days"
- Question: Are Top Performers calculated from ALL TIME or LAST 7 DAYS?
- Actual behavior: ___
- Is this clear to user: [ ] Yes [ ] No

### Data Validation (MANDATORY)

**Combined Filter Result Check:**

With all 4 filters applied:
- Builders shown: ___
- Tasks shown: ___
- Date range: ___

**Sanity Check:**
- Builders should be: Subset of Top Performers
- Tasks should be: Core Learning + Reflection only
- Date range should be: Week 3 dates only
- ✅ All logical? [ ] Yes [ ] No

**Database Verification (Complex Query):**
```sql
SELECT COUNT(DISTINCT u.user_id) as builder_count,
       COUNT(DISTINCT t.id) as task_count
FROM users u
JOIN task_submissions ts ON u.user_id = ts.user_id
JOIN tasks t ON ts.task_id = t.id
WHERE u.cohort = 'September 2025'
  AND u.active = true
  AND u.user_id NOT IN (129, 5, 240, ...)  -- excluded users
  AND t.category IN ('Core Learning', 'Reflection')
  AND DATE(ts.created_at) BETWEEN '2025-09-20' AND '2025-09-26'  -- Week 3
  AND u.user_id IN (SELECT user_id FROM top_performers_view);  -- adjust as needed
```

Database result: ___ builders, ___ tasks
Dashboard shows: ___ builders, ___ tasks
✅ Match? [ ] Yes [ ] No

### Performance Testing (NEW - MANDATORY)

**Multi-Filter Performance:**

1. Apply all 4 filters
2. Record total time to update: ___ ms
3. API calls triggered: ___
4. Any duplicate API calls: [ ] Yes [ ] No (BUG if yes)

**Expected:** <3 seconds for full update
**Actual:** ___ seconds
**Score:** ___/5 (5=<1s, 4=<2s, 3=<3s, 2=<5s, 1=>5s)

### UX Evaluation (CRITICAL)

**Active Filters Display:**
- Are all 4 filters shown in Active Filters: [ ] Yes [ ] No
- Format example: ___
- Is it clear what's filtered: [ ] Yes [ ] No

**Filter Removal:**
- Can individual filters be removed from Active Filters: [ ] Yes [ ] No
- If yes, test removing "Week 3": [ ] Works [ ] Doesn't work

**Filter Precedence:**
- Is filter precedence documented anywhere: [ ] Yes [ ] No
- If no: **UX ISSUE** - users don't know which filter "wins"

### 🐛 Issues Found

**Critical Issues:**
1.

**Logic Issues:**
1.

**UX Issues:**
1.
2.

### 💡 Improvement Suggestions
1. Add filter precedence explanation (tooltip or help text)
2. Show applied filters as tags/chips that can be individually removed
3. Warn user about filter conflicts (e.g., "Week 1 is outside Last 7 Days range")
4.

### 🎯 Score: ___/5

---

## Test 3.10: Filter Reset/Clear

### Actions
1. Apply 4+ different filters
2. Take screenshot of Active Filters section
3. Click "Reset" button
4. Verify all filters return to defaults

### Functionality Checks
- [ ] Clear/reset option exists
- [ ] Reset button is visible
- [ ] Resetting works correctly
- [ ] Dashboard returns to default state
- [ ] All filters return to defaults (not necessarily all unchecked)

### Default State Validation (NEW - MANDATORY)

**Document Default State:**

After clicking Reset, verify these defaults:
- Time Range: ___ (Expected: "All Time")
- Weeks: ___ (Expected: All 4 weeks checked)
- Builder Segment: ___ (Expected: "All Builders")
- Activity Categories: ___ (Expected: Core Learning + Applied Work)
- Task Types: ___ (Expected: ___)
- Task Modes: ___ (Expected: ___)

✅ All defaults correct? [ ] Yes [ ] No

### UX Evaluation (CRITICAL)

**Reset Button Discovery:**
- Time to find Reset button: ___ seconds
- Location: ___
- Visual prominence (1-5): ___/5
- Clear label: [ ] Yes [ ] No

**Confirmation Dialog:**
- Does reset ask for confirmation: [ ] Yes [ ] No
- Should it: [ ] Yes (prevents accidents) [ ] No (one-click is better)
- Justification: ___

**Undo Capability:**
- Can user undo reset: [ ] Yes [ ] No
- If no: Consider adding (UX improvement)

### Edge Case Testing (NEW - MANDATORY)

**Test: Reset with unsaved work**

If dashboard has any user-modified state (e.g., expanded charts):
1. Make modifications
2. Click Reset
3. Are modifications lost: [ ] Yes [ ] No
4. Should there be a warning: [ ] Yes [ ] No

**Test: Reset performance**
1. Click Reset
2. Time to reset: ___ ms
3. ✅ Instant (<500ms)? [ ] Yes [ ] No

### 🐛 Issues Found

**UX Issues:**
1.
2.

### 💡 Improvement Suggestions
1. Add keyboard shortcut for reset (e.g., Ctrl+R or Cmd+R)
2. Show "Filters reset" confirmation toast
3. Add "Undo reset" button (temporary, 5 seconds)
4.

### 🎯 Score: ___/5

---

## Test 3.11: Auto-Refresh Feature

### Actions
1. Note "Last refreshed" timestamp
2. Wait 1 minute, check timestamp update
3. Wait 5+ minutes (if possible) to test auto-refresh
4. Click manual refresh button
5. Monitor for unexpected refreshes

### Functionality Checks
- [ ] "Last refreshed" timestamp is displayed
- [ ] Timestamp updates every minute (relative time)
- [ ] Note about auto-refresh frequency is shown
- [ ] Manual refresh button exists
- [ ] Manual refresh works

### Timestamp Accuracy (NEW - MANDATORY)

**Relative Time Check:**

Record timestamp at intervals:
- T+0: "___" (Expected: "just now" or "0 minutes ago")
- T+1min: "___" (Expected: "1 minute ago")
- T+3min: "___" (Expected: "3 minutes ago")
- T+5min: "___" (Expected: "5 minutes ago" OR auto-refresh to "just now")

✅ Timestamps accurate? [ ] Yes [ ] No

### Auto-Refresh Behavior (NEW - MANDATORY)

**Test: Auto-refresh at 5 minutes**

If time permits (wait 5 minutes):
1. Watch for automatic refresh
2. Did it refresh at exactly 5 minutes: [ ] Yes [ ] No
3. Was refresh disruptive (lose scroll position, etc.): [ ] Yes [ ] No
4. Any visual indication before refresh: [ ] Yes [ ] No

**Expected behavior:**
- Refresh at 5min ✓
- Non-disruptive (preserve scroll, filters)
- Optional: Show countdown timer

### Manual Refresh Testing (NEW - MANDATORY)

**Test: Manual refresh button**

1. Click manual refresh button
2. Observe behavior:
   - [ ] Loading indicator appears
   - [ ] Data updates
   - [ ] Timestamp resets to "just now"
   - [ ] Scroll position preserved
   - [ ] Filters preserved
   - [ ] Charts smoothly update (no flicker)

**Performance:**
- Manual refresh time: ___ ms
- ✅ Under 3 seconds? [ ] Yes [ ] No

### Edge Case Testing (NEW - MANDATORY)

**Test: Refresh during filter change**

1. Click a filter
2. Immediately click manual refresh
3. Expected: Queue refresh until filter completes OR cancel filter
4. Actual: ___
5. ✅ Graceful handling? [ ] Yes [ ] No

**Test: Tab in background**

1. Switch to different browser tab
2. Wait 5+ minutes
3. Return to metrics tab
4. Expected: Show stale data with "Data may be outdated, click refresh"
5. Actual: ___

### UX Evaluation (CRITICAL)

**Refresh Communication:**

Score each aspect (1-5):
- Timestamp visibility: ___/5
- Refresh frequency clarity: ___/5 (Is "every 5 minutes" clear?)
- Manual refresh discoverability: ___/5
- Loading state clarity: ___/5

**Issues:**
1. Timestamp shows "3 minutes ago" but note says "auto-refreshes every 5 minutes" - confusing when NEXT refresh will happen
2.

### 🐛 Issues Found

**UX Issues:**
1. No countdown timer for next refresh (users don't know when it will refresh)
2. No loading indicator on manual refresh button
3.

**Performance Issues:**
1.

### 💡 Improvement Suggestions
1. Add countdown timer: "Next refresh in 2:34"
2. Add loading spinner to manual refresh button
3. Show toast notification after auto-refresh: "Data updated"
4. Add "pause auto-refresh" option for users actively working
5.

### 🎯 Score: ___/5

**Justification:**
- Functionality works but UX is confusing
- No clear indication of WHEN next refresh will occur
- Manual refresh lacks visual feedback

---

## Test 3.12: Responsive Behavior

### Actions
1. Resize browser to 1920px width
2. Resize to 1366px
3. Resize to 1024px
4. Resize to 768px
5. Resize to 375px (mobile)

### Functionality Checks (EACH SIZE)

**Desktop (1920px):**
- [ ] All content visible without scrolling
- [ ] Charts are full width
- [ ] Filter sidebar is full height
- [ ] No wasted white space

**Laptop (1366px):**
- [ ] Layout adapts
- [ ] No horizontal scrolling
- [ ] Charts remain readable
- [ ] Filters accessible

**Tablet (1024px):**
- [ ] Filter sidebar collapses OR remains visible
- [ ] Charts reflow to 2 columns (or similar)
- [ ] Touch targets are adequate (44x44px)

**Tablet Portrait (768px):**
- [ ] Filter sidebar becomes hamburger menu OR collapsible
- [ ] Charts stack vertically
- [ ] KPI cards reflow appropriately

**Mobile (375px):**
- [ ] Hamburger menu for filters (if not visible)
- [ ] Charts stack vertically
- [ ] KPI cards stack vertically
- [ ] All text remains readable (min 16px)
- [ ] No horizontal scrolling

### Responsive Breakpoint Analysis (NEW - MANDATORY)

**Identify breakpoints:**

Use DevTools responsive mode to find where layout breaks:
- Breakpoint 1: ___ px (What changes: ___)
- Breakpoint 2: ___ px (What changes: ___)
- Breakpoint 3: ___ px (What changes: ___)

**Are breakpoints standard:**
- 1920px (large desktop): ✓
- 1366px (laptop): ✓
- 1024px (tablet landscape): ✓
- 768px (tablet portrait): ✓
- 375px (mobile): ✓

### Mobile-Specific Testing (NEW - MANDATORY)

**Test at 375px (iPhone SE):**

1. Filter accessibility:
   - [ ] Filters hidden behind hamburger menu
   - [ ] Can open filter menu
   - [ ] Can apply filters
   - [ ] Can close filter menu

2. Chart readability:
   - [ ] Charts are full width
   - [ ] Text is readable (>16px)
   - [ ] No overlapping labels

3. Touch targets:
   - [ ] All buttons >44x44px
   - [ ] Adequate spacing between targets

4. Performance:
   - Page load time on mobile: ___ seconds
   - ✅ Under 5 seconds? [ ] Yes [ ] No

### Issues at Different Sizes (MANDATORY)

**1920px Issues:**
1.

**1366px Issues:**
1.

**1024px Issues:**
1.

**768px Issues:**
1.

**375px Issues:**
1.

### 🐛 Issues Found

**Critical Issues (blocking mobile usage):**
1.

**UX Issues (makes mobile difficult):**
1.
2.

### 💡 Improvement Suggestions
1.
2.

### 🎯 Score by Device Size

- Desktop (>1200px): ___/5
- Laptop (1024-1200px): ___/5
- Tablet (768-1024px): ___/5
- Mobile (<768px): ___/5
- **Average: ___/5**

---

## Test 3.13: Browser Console & Error Testing

### Actions
1. Open DevTools (F12)
2. Go to Console tab
3. Refresh dashboard
4. Apply various filters
5. Review all errors/warnings

### Console Error Check

**JavaScript Errors:**
Record ANY errors (even if page works):
```
1. [Error Type] Error message
   Location: file.js:line
   Severity: HIGH/MEDIUM/LOW

2. [Error Type] ...
```

**Network Errors:**
From Network tab, record failed requests:
```
1. GET /api/... → Status: 404/500/etc.
   Response: ...
   Impact: ...
```

**Warnings:**
```
1. Warning message
   Source: ...
   Should be fixed: YES/NO/MAYBE
```

### Error State Testing (NEW - MANDATORY)

**Test: API Failure Simulation**

1. Open DevTools → Network tab
2. Right-click on `/api/metrics/kpis` → Block request URL
3. Refresh dashboard
4. Observe behavior:
   - [ ] Error message displayed
   - [ ] Retry button shown
   - [ ] Graceful degradation (other sections still work)
   - [ ] No white screen of death

**Expected:** "Unable to load KPI data. [Retry]"
**Actual:** ___
**Score:** ___/5

**Test: Slow Network Simulation**

1. DevTools → Network → Throttling → Slow 3G
2. Refresh dashboard
3. Observe:
   - [ ] Loading indicators for each section
   - [ ] Progressive loading (KPIs load first)
   - [ ] No timeout errors
   - [ ] User can still interact with loaded sections

**Performance on Slow 3G:**
- Time to first content: ___ seconds
- Time to fully loaded: ___ seconds
- ✅ Usable on slow network? [ ] Yes [ ] No

**Test: Database Connection Failure**

If you can simulate database disconnection:
1. Stop database or block database connection
2. Refresh dashboard
3. Expected: Friendly error message with retry
4. Actual: ___

### Security & Privacy Check (NEW - MANDATORY)

**Console Messages Review:**

Check for sensitive data leaks:
- [ ] No API keys in console
- [ ] No database credentials
- [ ] No personal builder data (names, emails)
- [ ] No internal system paths exposed

**Network Tab Review:**

Check request headers:
- [ ] No auth tokens in URL (should be in headers)
- [ ] No excessive data in responses (only what's needed)

### 🐛 Issues Found

**Critical Issues (blocking bugs):**
1.

**Errors (should be fixed):**
1.
2.

**Warnings (nice to fix):**
1.
2.

**Security/Privacy Issues:**
1.

### 💡 Improvement Suggestions
1. Add error boundaries to prevent white screen
2. Implement retry logic for failed API calls
3. Add offline detection and messaging
4. Reduce console noise (warnings)
5.

### 🎯 Score: ___/5

**Justification:**
- 5/5: Zero errors, graceful error handling, works offline
- 4/5: Minor warnings only, good error handling
- 3/5: Some errors but functionality works, basic error handling
- 2/5: Multiple errors, poor error handling
- 1/5: Console errors break functionality

---

## Summary & Recommendations

### 🚨 Critical Issues (MUST FIX BEFORE PRODUCTION)

List ANY issues that would prevent production deployment:

1. **[Severity: HIGH]** Issue description
   - Impact: ___
   - Affected users: ___
   - Fix priority: URGENT

2.

**If NO critical issues:** State "No critical blocking issues found."

### ⚠️ Data Accuracy Issues

List ANY discrepancies between displayed and database values:

1. **[Component]** Issue description
   - Displayed: ___
   - Expected: ___
   - Impact: ___

**If NO data issues:** State "All data verified accurate against database."

### 🐛 UX/UI Issues

List UX problems (even minor ones):

1. **[Severity: MEDIUM]** Issue description
   - Affected users: ___
   - Improvement: ___

2.

### ⚡ Performance Issues

List performance problems:

1. **[Component]** Performance issue
   - Current: ___
   - Expected: ___
   - Impact: ___

**If NO performance issues:** State "Performance meets all benchmarks (<3s load)."

### 🎯 Accessibility Issues

List accessibility problems:

1. **[WCAG Violation]** Issue description
   - Affected users: ___
   - Fix: ___

2.

**If NO accessibility issues:** State "No WCAG AA violations found."

### 💡 Improvement Suggestions (POST-LAUNCH)

Prioritized list of enhancements:

**High Priority:**
1.
2.

**Medium Priority:**
1.
2.

**Low Priority (nice-to-have):**
1.
2.

### ✅ Strengths

List 3-5 things that work exceptionally well:

1.
2.
3.
4.
5.

### 📊 Overall Dashboard Overview Score

**Component Scores:**
- Layout & Organization: ___/5 (Justification: ___)
- Filter Functionality: ___/5 (Justification: ___)
- Data Accuracy: ___/5 (Justification: ___)
- Performance: ___/5 (Justification: ___)
- UX/UI: ___/5 (Justification: ___)
- Accessibility: ___/5 (Justification: ___)
- Error Handling: ___/5 (Justification: ___)

**Overall Score: ___/5**

**Weighted Average Calculation:**
```
(Layout*0.15 + Filters*0.20 + Data*0.25 + Performance*0.15 + UX*0.15 + Accessibility*0.05 + Errors*0.05) = ___/5
```

### Production Readiness Assessment

**Score Interpretation:**
- **4.5-5.0:** READY FOR PRODUCTION - Excellent quality
- **4.0-4.4:** READY WITH MINOR FIXES - Good quality, fix minor issues
- **3.5-3.9:** NOT READY - Significant improvements needed
- **<3.5:** NOT READY - Major rework required

**Verdict:** ___

**Justification:**

### Ready for Next Test?

- [ ] YES - Proceed to Test 04: KPI Cards Testing
  - All critical issues documented
  - Data accuracy verified
  - Performance acceptable

- [ ] NO - Must address issues first
  - Critical issues to fix: ___
  - Estimated fix time: ___
  - Retest required: [ ] Yes [ ] No

---

## Appendix: Testing Metadata

**Tester:** _______________
**Date:** _______________
**Test Duration:** ___ minutes
**Browser:** _______________ (version: ___)
**OS:** _______________ (version: ___)
**Screen Size:** ___px x ___px
**Network Speed:** _______________ (Mbps)

**Database Connection:**
- Host: _______________
- Response time: ___ ms
- Queries executed: ___

**Test Environment:**
- URL: http://localhost:3000/metrics
- Build version: _______________
- Cohort tested: September 2025
- Builder count: 76
- Days tested: 21

---

## For AI Agent Testers: Final Checklist

Before submitting this test report, verify you have:

- [ ] Completed ALL 13 tests
- [ ] Found and documented at least 5 issues total (across all tests)
- [ ] Verified data accuracy for at least 3 KPIs
- [ ] Tested at least 2 edge cases
- [ ] Checked accessibility for at least 1 component
- [ ] Scored NO test as 5/5 unless truly exceptional
- [ ] Provided justification for every score
- [ ] Listed specific improvement suggestions
- [ ] Calculated weighted overall score
- [ ] Made production readiness recommendation

**If any checkbox is unchecked, RETURN TO TESTING.**
