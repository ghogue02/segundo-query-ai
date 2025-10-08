# Testing Guide 01: Initial Load & Navigation
**Version:** 1.1
**Focus:** Landing page, first impressions, navigation structure, dynamic stats
**Time Required:** 10-15 minutes
**Test Environment:** Local (http://localhost:3000) or Production (https://segundo-query-ai.vercel.app)

---

## Overview

This guide tests the first user experience: loading the homepage and understanding the application's purpose and navigation. **Version 1.1 includes verification of dynamic statistics.**

---

## Test 1.1: First Impressions (0-30 seconds)

### Actions
1. Navigate to: **http://localhost:3000** (local) or https://segundo-query-ai.vercel.app (production)
2. Observe the page as it loads
3. Read the main headline and description
4. Note your immediate understanding of what the application does

### Functionality Checks
- [ ] Page loads within 3 seconds
- [ ] No error messages appear
- [ ] No layout issues (overlapping text, broken images)
- [ ] Two main options are visible: "Natural Language" and "Metrics Dashboard"
- [ ] Stats overview is displayed (builders, days, tasks)

### Data Validation
**Record the stats shown:**
- Active Builders: ___
- Class Days: ___
- Curriculum Tasks: ___

**Expected values (dynamic from database):**
- Active Builders: 75-76 (depends on active status)
- Class Days: 21 (as of October 4, 2025)
- Curriculum Tasks: ~128 (dynamic, depends on curriculum)

**⚠️ CRITICAL (v1.1):** Stats should NOT be hardcoded as 76/19/107 or 75/18/107
- [ ] Stats appear to be dynamic (reasonable values)
- [ ] Stats match query page (test cross-page consistency)

**To verify stats are dynamic:**
1. Open browser dev tools → Network tab
2. Refresh page
3. Look for API call to `/api/stats`
4. Verify response matches displayed values

**Discrepancies found:**

### UX/UI Evaluation

**First Impression (choose one):**
- [ ] Immediately clear what the app does
- [ ] Somewhat clear, but needed to read more
- [ ] Confusing, unclear purpose
- [ ] Overwhelming with too much information

**Visual Design (1-5 scale):**
- Professional appearance: ___/5
- Visual hierarchy (most important info stands out): ___/5
- Color scheme appropriateness: ___/5
- Typography readability: ___/5

**Layout Quality:**
- [ ] Clean and organized
- [ ] Somewhat cluttered
- [ ] Too sparse/empty
- [ ] Confusing layout

**Observations:**
- What works well:
- What could be improved:
- Any visual bugs:

---

## Test 1.2: Thursday/Friday Context (If Applicable)

### Actions
1. Check what day of the week it is
2. If Thursday or Friday, look for contextual messaging

### Functionality Checks
- [ ] If Thu/Fri: "No class today" or similar message appears
- [ ] If Mon/Tue/Wed/Sat/Sun: Normal messaging appears

### UX/UI Evaluation
**Context Messaging Quality:**
- [ ] Clear and prominent
- [ ] Present but easy to miss
- [ ] Not present when expected
- [ ] Not applicable (not Thu/Fri)

**Feedback:**

---

## Test 1.3: Call-to-Action Clarity

### Actions
1. Identify the two main paths: Natural Language vs Metrics Dashboard
2. Read the descriptions for each option

### Functionality Checks
- [ ] Natural Language option clearly labeled
- [ ] Metrics Dashboard option clearly labeled
- [ ] Both options are clickable buttons/cards
- [ ] Hover states work (cursor changes, visual feedback)

### UX/UI Evaluation

**Clarity of Options (1-5):**
- Natural Language description clarity: ___/5
- Metrics Dashboard description clarity: ___/5
- Visual differentiation between options: ___/5

**Decision Making:**
- [ ] Immediately clear which option to choose for my use case
- [ ] Needed to read both descriptions carefully
- [ ] Still unclear which option is better for what

**Design Observations:**
- Button/card design quality:
- Spacing and layout:
- Any confusing elements:

---

## Test 1.4: Navigation to Natural Language Interface

### Actions
1. Click on "Natural Language" option
2. Observe page transition
3. Note the URL change

### Functionality Checks
- [ ] Click successfully navigates to `/query` page
- [ ] Page loads without errors
- [ ] URL changes appropriately
- [ ] Navigation is smooth (no long delays)

### UX/UI Evaluation
**Transition Quality:**
- Loading time: ___ seconds
- Any loading indicators shown: [ ] Yes [ ] No
- Transition feels: [ ] Smooth [ ] Abrupt [ ] Slow

**Navigation Breadcrumbs:**
- [ ] Can see how to return to home
- [ ] Back button in browser works as expected
- [ ] In-app navigation present

**Observations:**

---

## Test 1.5: Navigation to Metrics Dashboard

### Actions
1. Return to homepage (use back button or navigate directly)
2. Click on "Metrics Dashboard" option
3. Observe page transition

### Functionality Checks
- [ ] Click successfully navigates to `/metrics` page
- [ ] Page loads without errors
- [ ] Dashboard displays all expected sections
- [ ] Navigation is smooth

### UX/UI Evaluation
**Transition Quality:**
- Loading time: ___ seconds
- Loading indicators: [ ] Yes [ ] No
- Transition smoothness: ___/5

**Information Architecture:**
- [ ] Dashboard layout is immediately understandable
- [ ] Tab structure is clear (Defined Metrics, Terminology)
- [ ] Key sections are visually distinct
- [ ] Overwhelming amount of information
- [ ] Well-organized information

**Observations:**

---

## Test 1.6: Return Navigation

### Actions
1. From Metrics Dashboard, find way to return to home
2. Test navigation back to home
3. From Natural Language page, find way to return to home

### Functionality Checks
- [ ] Clear "Home" or "Back" navigation exists
- [ ] Browser back button works correctly
- [ ] Navigation returns to landing page, not 404

### UX/UI Evaluation
**Navigation Consistency:**
- [ ] Navigation is in same location on all pages
- [ ] Navigation style is consistent
- [ ] Clear affordance (looks clickable)

**Ease of Return (1-5):** ___/5

**Observations:**

---

## Test 1.7: Mobile Responsiveness (If Testable)

### Actions
1. Resize browser to mobile width (375px)
2. OR test on actual mobile device
3. Navigate through home → query → metrics → home

### Functionality Checks
- [ ] Layout adapts to mobile width
- [ ] No horizontal scrolling required
- [ ] Text remains readable
- [ ] Buttons are tappable (not too small)
- [ ] Navigation menu works on mobile

### UX/UI Evaluation
**Mobile Experience (1-5):**
- Layout adaptation: ___/5
- Readability: ___/5
- Touch target sizes: ___/5
- Overall mobile UX: ___/5

**Issues Found:**

**Note:** If mobile testing is not possible, mark as "Not Tested"

---

## Summary & Recommendations

### Critical Issues (Must Fix)
1.
2.
3.

### UX/UI Improvements
1.
2.
3.

### Functionality Issues
1.
2.
3.

### Strengths
1.
2.
3.

### Overall Landing Page Score
- Functionality: ___/5
- UX/UI: ___/5
- Performance: ___/5
- **Overall: ___/5**

### Ready for Next Test?
- [ ] Yes, proceed to Test 02: Natural Language Interface
- [ ] No, critical issues must be fixed first

**Reason if No:**

---

**Tester:** _______________
**Date:** _______________
**Browser/Device:** _______________
**Time Spent:** ___ minutes
