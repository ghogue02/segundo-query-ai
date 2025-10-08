# Testing Guide 07: Terminology & Content Quality
**Version:** 2.0 (CRITICAL TESTING MODE)
**Focus:** Terminology Legend tab, content clarity, documentation quality, accuracy
**Time Required:** 15-20 minutes
**Test Environment:** Local (http://localhost:3000/metrics → Terminology Legend tab)

---

## ⚠️ CRITICAL TESTING INSTRUCTIONS

**READ FIRST:** `/docs/testing/CRITICAL-TESTING-FRAMEWORK.md`

This test follows CRITICAL TESTING MODE:
- Test for FAILURE first (assume broken until proven otherwise)
- Verify definition accuracy against actual dashboard behavior
- Test completeness and clarity
- Document ALL issues (even minor ones)
- Scoring: Most production software = 3.5-4.5/5 (not 5/5)

**Mandatory for EVERY test:**
- ✅ Functional verification
- 📊 Content accuracy (definitions match calculations)
- 🐛 Issues found (minimum 1 or state "No issues")
- 💡 Improvements (minimum 2 suggestions)
- 🎯 Score with justification

**Expected Critical Issues (from framework):**
- Technical jargon without explanation
- Missing definitions
- Inconsistent terminology
- Definitions don't match actual calculations

---

## Overview

This guide tests the Terminology Legend tab, metric definitions, excluded user documentation, and overall content quality throughout the application.

---

## Test 7.1: Terminology Legend Tab Access

### Actions
1. Navigate to Metrics Dashboard
2. Locate "Terminology Legend" tab
3. Click to switch to this tab

### Functionality Checks
- [ ] Tab is clearly labeled
- [ ] Tab is clickable
- [ ] Content switches to terminology definitions
- [ ] Layout is clean and organized

### UX/UI Evaluation

**Tab Quality (1-5):**
- Tab visibility: ___/5
- Tab label clarity: ___/5
- Content organization: ___/5

---

## Test 7.2: Metric Definitions - Completeness

### Actions
1. Review all metric definitions provided
2. Check for the 9 core metrics

### Functionality Checks

**Metrics Defined:**
- [ ] Task Completion
- [ ] Attendance
- [ ] 7-Day Class Average
- [ ] Struggling Builder
- [ ] Top Performer
- [ ] Engagement Score
- [ ] Quality Score
- [ ] Need Intervention
- [ ] Active Builders Count

**Total Metrics Defined:** ___

**Expected:** 9 metrics minimum

### Content Accuracy Validation (MANDATORY)

**Cross-reference definitions against actual dashboard behavior:**

For EACH metric definition, verify:
1. Definition matches actual calculation
2. No contradictions with dashboard data
3. Technical terms are explained

**Accuracy Check Example:**
- Definition says: "Attendance counts 'present' and 'late' statuses"
- Dashboard behavior: ___ (verify with data)
- ✅ Match? [ ] Yes [ ] No

### Edge Case Testing (NEW - MANDATORY)

**Test Scenario: Missing Definitions**
- Count total metrics shown on dashboard: ___
- Count definitions in Terminology Legend: ___
- Any metrics without definitions: ___
- Score: ___/5

**Test Scenario: Contradictory Information**
- Compare definition text to dashboard tooltips
- Any contradictions found: [ ] Yes [ ] No
- If yes, list: ___

### Accessibility Check (NEW)

**Content Readability:**
- Font size adequate: [ ] Yes [ ] No
- Line spacing sufficient: [ ] Yes [ ] No
- Color contrast (text on background): ___:1
- WCAG AA compliance (4.5:1): [ ] Yes [ ] No

**Organization:**
- Can search/filter definitions: [ ] Yes [ ] No
- Alphabetical order: [ ] Yes [ ] No
- Logical grouping: [ ] Yes [ ] No

### Content Quality Evaluation

**Definition Clarity (1-5):**
- Non-technical language: ___/5
- Completeness: ___/5
- Examples provided: ___/5

**Observations:**
- Any missing definitions:
- Any overly technical jargon:

### 🐛 Issues Found (MANDATORY)

**Critical Issues (Content Accuracy):**
1. [SEVERITY: HIGH] Definitions that contradict dashboard: ___

**Completeness Issues:**
1. [SEVERITY: HIGH/MEDIUM/LOW] Missing definitions: ___

**Clarity Issues:**
1. [SEVERITY: HIGH/MEDIUM/LOW] Technical jargon: ___

**If NO issues:** State "No issues found. All definitions accurate and complete."

### 💡 Improvement Suggestions (MINIMUM 2)

1. Add examples for each metric (e.g., "If builder has 80% attendance and 90% completion...")
2. Include visual diagrams for complex calculations
3. ___

### 🎯 Score with Justification

**Test 7.2 Score: ___/5**

**Breakdown:**
- Completeness: ___/5 (all metrics defined)
- Accuracy: ___/5 (matches dashboard)
- Clarity: ___/5 (non-technical language)
- Accessibility: ___/5

**Justification:** ___

---

## Test 7.3: Task Completion Definition

### Actions
1. Find "Task Completion" definition
2. Review the explanation

### Content Validation

**Definition Includes:**
- [ ] What counts as "completion"
- [ ] Data sources (submissions + threads)
- [ ] Clarification that it's engagement-based, not quality-based
- [ ] Example (if present)

**Definition Text (summarize):**

**Clarity Assessment:**
- [ ] Very clear
- [ ] Somewhat clear
- [ ] Confusing
- [ ] Missing key information

### UX/UI Evaluation

**Definition Quality (1-5):**
- Clarity: ___/5
- Completeness: ___/5
- Usefulness: ___/5

**Observations:**
- Does it match how completion is actually calculated:
- Any contradictions with dashboard behavior:

---

## Test 7.4: Attendance Definition

### Actions
1. Find "Attendance" definition
2. Review explanation

### Content Validation

**Definition Includes:**
- [ ] What counts as "present" (status: present OR late)
- [ ] Data source (builder_attendance_new table)
- [ ] Timezone clarification (UTC → EST conversion)
- [ ] Exclusion of Thu/Fri
- [ ] Example (if present)

**Clarity Assessment:**
- [ ] Very clear
- [ ] Somewhat clear
- [ ] Confusing

**Does it explain "late" counts as present?** [ ] Yes [ ] No

### Content Quality (1-5):**
- Clarity: ___/5
- Completeness: ___/5

---

## Test 7.5: 7-Day Class Average Definition

### Actions
1. Find "7-Day Class Average" definition
2. Review calculation method

### Content Validation

**Definition Includes:**
- [ ] "Class days" only (Mon/Tue/Wed/Sat/Sun)
- [ ] Exclusion of Thu/Fri
- [ ] Last 7 CLASS days, not calendar days
- [ ] Calculation formula
- [ ] Example (if present)

**Critical Point Clarity:**
- Does it clearly state Thu/Fri are excluded: [ ] Yes [ ] No
- Does it explain "class days" vs "calendar days": [ ] Yes [ ] No

### Content Quality (1-5):** ___/5

**Observations:**

---

## Test 7.6: Struggling Builder Definition

### Actions
1. Find "Struggling Builder" definition
2. Review dual criteria

### Content Validation

**Definition Includes:**
- [ ] Threshold method: <50% completion OR <70% attendance
- [ ] Composite method: Engagement score <40
- [ ] Both methods explained
- [ ] Rationale for dual approach (if present)

**Dual Definition Clarity:**
- Are both methods explained: [ ] Yes [ ] No
- Is it clear which is used when: [ ] Yes [ ] No

### Content Quality (1-5):** ___/5

---

## Test 7.7: Top Performer Definition

### Actions
1. Find "Top Performer" definition
2. Review criteria

### Content Validation

**Definition Includes:**
- [ ] Threshold method: >90% completion AND >90% attendance
- [ ] Composite method: Engagement score >80
- [ ] Both methods explained

**Clarity Assessment:**
- [ ] Very clear
- [ ] Somewhat clear
- [ ] Confusing

### Content Quality (1-5):** ___/5

---

## Test 7.8: Engagement Score Definition

### Actions
1. Find "Engagement Score" definition
2. Review formula

### Content Validation

**Formula Shown:**
- Attendance weight: ___%
- Completion weight: ___%
- Quality weight: ___%

**Expected Formula:**
- (Attendance × 30%) + (Completion × 50%) + (Quality × 20%)

**Formula Match:** [ ] Yes [ ] No

**Definition Includes:**
- [ ] Full formula
- [ ] Weight explanations
- [ ] Score range (0-100)
- [ ] Example calculation (if present)

### Content Quality (1-5):** ___/5

---

## Test 7.9: Quality Score Definition

### Actions
1. Find "Quality Score" definition
2. Review data source

### Content Validation

**Definition Includes:**
- [ ] Data source (BigQuery assessments)
- [ ] Score range (0-100)
- [ ] What assessments measure
- [ ] Number of assessments (~238)
- [ ] Assessment categories (Technical, Business, Professional)

**Clarity Assessment:**
- [ ] Very clear
- [ ] Somewhat clear
- [ ] Confusing

### Content Quality (1-5):** ___/5

---

## Test 7.10: Excluded Users Documentation

### Actions
1. Find "Excluded Users" section
2. Review the list and rationale

### Content Validation

**Excluded Users Listed:**
- [ ] Staff members (129, 5, 240, 326)
- [ ] Volunteers (327, 329, 331, 330, 328, 332)
- [ ] Inactive builders (324, 325, 9)

**Total Excluded:** ___
**Expected:** 13 users

**User IDs Match:**
- Staff: 129, 5, 240, 326 → [ ] All present
- Volunteers: 327, 329, 331, 330, 328, 332 → [ ] All present
- Inactive: 324, 325, 9 → [ ] All present

**Rationale Provided:**
- [ ] Why staff excluded
- [ ] Why volunteers excluded
- [ ] Why inactive builders excluded

### Content Quality (1-5):**
- Completeness: ___/5
- Clarity: ___/5

**Observations:**

---

## Test 7.11: Calculation Methodology

### Actions
1. Review how calculations are explained
2. Check for transparency

### Content Validation

**For Each Metric, Check If Shown:**
- Data source table/field
- SQL logic (if applicable)
- Edge cases handled
- Timezone considerations (for attendance)
- Rounding rules

**Transparency Level:**
- [ ] Very transparent (shows formulas, data sources)
- [ ] Somewhat transparent
- [ ] Not transparent (just definitions, no methods)

### Content Quality (1-5):**
- Methodology transparency: ___/5
- Reproducibility: ___/5

---

## Test 7.12: Examples & Context

### Actions
1. Check if examples are provided for each metric
2. Assess example quality

### Content Validation

**Examples Provided For:**
- Task Completion: [ ] Yes [ ] No
- Attendance: [ ] Yes [ ] No
- Engagement Score: [ ] Yes [ ] No
- Struggling Builder: [ ] Yes [ ] No

**Example Quality:**
- [ ] Concrete numbers shown
- [ ] Real-world scenarios
- [ ] Helpful for understanding
- [ ] Generic/unhelpful

### Content Quality (1-5):** ___/5

---

## Test 7.13: Terminology Consistency

### Actions
1. Compare terminology in Legend to terminology used in:
   - Dashboard KPI cards
   - Natural Language interface
   - Drill-down modals

### Consistency Check

**Terminology Matches:**
- "Builders" vs "Students": [ ] Consistent [ ] Inconsistent
- "Task Completion" phrasing: [ ] Consistent [ ] Inconsistent
- "Attendance" phrasing: [ ] Consistent [ ] Inconsistent
- "Engagement Score" phrasing: [ ] Consistent [ ] Inconsistent

**Inconsistencies Found:**

### Content Quality (1-5):**
- Terminology consistency: ___/5

---

## Test 7.14: Content Accuracy

### Actions
1. Compare definitions to actual dashboard behavior
2. Verify formulas match calculations

### Accuracy Validation

**Test 3 Metrics:**

**Metric 1: _____________**
- Definition says: ___
- Dashboard shows: ___
- Match: [ ] Yes [ ] No

**Metric 2: _____________**
- Definition says: ___
- Dashboard shows: ___
- Match: [ ] Yes [ ] No

**Metric 3: _____________**
- Definition says: ___
- Dashboard shows: ___
- Match: [ ] Yes [ ] No

**Contradictions Found:**

### Content Quality (1-5):**
- Definition accuracy: ___/5

---

## Test 7.15: Layout & Readability

### Actions
1. Review overall layout of Terminology Legend
2. Assess readability

### UX/UI Evaluation

**Layout Features:**
- [ ] Sections are expandable/collapsible
- [ ] Clear headings for each metric
- [ ] Adequate spacing
- [ ] Easy to scan
- [ ] Logical ordering

**Readability (1-5):**
- Font size: ___/5
- Line spacing: ___/5
- Section organization: ___/5
- Scannability: ___/5

**Observations:**
- Is the layout helpful for reference:
- Any readability issues:

---

## Test 7.16: Search/Filter Functionality

### Actions
1. Look for search or filter within Terminology Legend
2. Test if present

### Functionality Checks
- [ ] Search box exists
- [ ] Can filter/search definitions
- [ ] Search works correctly (if present)

**If Not Present:**
- Would search be useful: [ ] Yes [ ] No
- Priority: [ ] High [ ] Medium [ ] Low

---

## Test 7.17: Content Throughout Site

### Actions
1. Review all user-facing text across the application
2. Check for typos, grammar, clarity

### Content Quality Evaluation

**Pages Reviewed:**
- [ ] Landing page
- [ ] Natural Language interface
- [ ] Metrics Dashboard
- [ ] Builder Profiles
- [ ] Terminology Legend

**Issues Found:**
- Typos: ___
- Grammar errors: ___
- Unclear labels: ___
- Inconsistent terminology: ___

**List Issues:**
1.
2.
3.

### Overall Content Quality (1-5):** ___/5

---

## Test 7.18: Help Text & Tooltips

### Actions
1. Look for tooltips or help icons throughout the app
2. Test tooltip functionality (if present)

### Functionality Checks
- [ ] Tooltips exist on complex metrics
- [ ] Hover triggers tooltips
- [ ] Tooltips are readable
- [ ] Tooltips provide useful context

**Tooltip Quality (1-5):** ___/5

**Observations:**
- Where are tooltips most needed:
- Any misleading help text:

---

## Test 7.19: Onboarding/Guidance

### Actions
1. Imagine you're a first-time user
2. Assess if there's adequate guidance

### UX/UI Evaluation

**Guidance Present:**
- [ ] Welcome message or tour
- [ ] Instructions for Natural Language interface
- [ ] Explanation of dashboard sections
- [ ] Link to Terminology Legend from dashboard

**First-Time User Experience (1-5):**
- Clarity of purpose: ___/5
- Guidance adequacy: ___/5
- Ease of getting started: ___/5

**Observations:**
- What would confuse a first-time user:
- What guidance is missing:

---

## Test 7.20: Documentation Completeness

### Actions
1. Consider what questions a user might have
2. Assess if Terminology Legend answers them

### Completeness Evaluation

**Common Questions Answered:**
- [ ] What is considered "completion"?
- [ ] Why are Thu/Fri excluded?
- [ ] How is engagement calculated?
- [ ] What does "struggling" mean?
- [ ] Why are some builders excluded?
- [ ] How often is data updated?

**Questions Not Answered:**

**Completeness Score (1-5):** ___/5

---

## Summary & Recommendations

### Critical Issues (Must Fix)
1.
2.
3.

### Content Accuracy Issues
1.
2.
3.

### Clarity Improvements Needed
1.
2.
3.

### Missing Definitions/Explanations
1.
2.
3.

### Strengths
1.
2.
3.

### Overall Terminology & Content Score
- Definition Clarity: ___/5
- Completeness: ___/5
- Accuracy: ___/5 (definitions match dashboard)
- Consistency: ___/5
- Accessibility: ___/5
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

**Content Accuracy Note:**
If definitions contradict dashboard behavior, this is a CRITICAL issue. Users rely on documentation to understand metrics - inaccurate definitions undermine trust.

### Ready for Next Test?
- [ ] Yes, proceed to Test 08: Cross-Feature Validation
- [ ] No, issues must be addressed first

---

## For AI Agent Testers: Completion Checklist

- [ ] Completed ALL tests in this guide (7.1-7.20)
- [ ] Found minimum 5 issues total (or stated "No issues")
- [ ] Verified definition accuracy against dashboard behavior
- [ ] Tested completeness (all metrics defined)
- [ ] Checked for technical jargon and clarity
- [ ] Verified excluded user documentation (13 users)
- [ ] Tested content consistency across app
- [ ] NO score is 5/5 without exceptional justification
- [ ] Provided improvement suggestions for each test
- [ ] Made production readiness assessment

---

**Tester:** _______________
**Date:** _______________
**Time Spent:** ___ minutes
