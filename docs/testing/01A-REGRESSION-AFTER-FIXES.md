# Testing Guide 01A: Regression Test - After Bug Fixes
**Version:** 1.0
**Focus:** Verify critical bug fixes from Guide 01
**Time Required:** 5-10 minutes
**Prerequisites:** Complete Guide 01, implement fixes for P1/P2 issues

---

## Overview

This is a **quick regression test** to verify that the critical issues found in Guide 01 have been resolved before proceeding to Guide 02.

**Run this test AFTER implementing fixes for:**
- 🔴 Day detection bug
- 🟡 Task count discrepancy
- 🟡 Inconsistent day counts

---

## Quick Verification Checklist

### Pre-Test Setup
- [ ] Fixes have been deployed to production
- [ ] Cache has been cleared (hard refresh: Cmd+Shift+R or Ctrl+Shift+F5)
- [ ] Note current day of week: __________

---

## Test 1A.1: Day Detection Fix Verification

### Actions
1. Navigate to: https://segundo-query-ai.vercel.app
2. Check current day of week
3. Verify Thursday/Friday message behavior

### Expected Behavior

**If today is Monday, Tuesday, Wednesday, Saturday, or Sunday:**
- [ ] ✅ No "No class today" message appears
- [ ] ✅ Stats section is visible
- [ ] ✅ Navigation works normally

**If today is Thursday:**
- [ ] ✅ "No class today (Thursday)" message appears
- [ ] ✅ Message is accurate (says "Thursday")
- [ ] ✅ Message explains Thu/Fri are off days

**If today is Friday:**
- [ ] ✅ "No class today (Friday)" message appears
- [ ] ✅ Message is accurate (says "Friday")
- [ ] ✅ Message explains Thu/Fri are off days

### Current Test (Today is: ____________)

**Result:**
- [ ] ✅ PASS - Behavior matches expected
- [ ] ❌ FAIL - Still showing incorrect day
- [ ] ⚠️ PARTIAL - Works but has issues

**Notes:**

**Screenshots (if FAIL):**

---

## Test 1A.2: Task Count Fix Verification

### Actions
1. On homepage, check "Curriculum Tasks" stat
2. Compare to expected value

### Expected Behavior
- [ ] ✅ Shows **112 tasks** (or documented correct value)
- [ ] ✅ Matches expected baseline

### Data Validation

**Homepage Display:**
- Curriculum Tasks: ___
- Expected: 112

**Result:**
- [ ] ✅ PASS - Shows 112 tasks
- [ ] ⚠️ PARTIAL - Shows different value but documented as correct
- [ ] ❌ FAIL - Still shows 107 or other incorrect value

**If different value, is it documented as correct?**
- [ ] Yes - documented in: ______________
- [ ] No - still a discrepancy

**Notes:**

---

## Test 1A.3: Consistent Day Count Verification

### Actions
1. On homepage, note "Class Days" stat
2. Navigate to `/query` page
3. Check day count in subtitle or stats
4. Compare values

### Expected Behavior
- [ ] ✅ Both pages show same day count
- [ ] ✅ Value matches expected (19 days as of Oct 4, 2025)

### Data Validation

**Homepage "Class Days":** ___
**Query Page "Days":** ___

**Result:**
- [ ] ✅ PASS - Both show same value
- [ ] ❌ FAIL - Still inconsistent

**Difference (if any):** ___

**Notes:**

---

## Test 1A.4: Cross-Page Data Consistency

### Actions
1. Review all three pages (home, query, metrics) for consistent stats
2. Look for any other discrepancies

### Consistency Check

| Stat | Homepage | Query Page | Metrics Dashboard | Consistent? |
|------|----------|------------|-------------------|-------------|
| Builders | ___ | ___ | ___ | [ ] Yes [ ] No |
| Days | ___ | ___ | ___ | [ ] Yes [ ] No |
| Tasks | ___ | ___ | ___ | [ ] Yes [ ] No |

**Result:**
- [ ] ✅ PASS - All stats consistent across pages
- [ ] ❌ FAIL - Still have inconsistencies

**Inconsistencies found:**

---

## Test 1A.5: Quick Navigation Smoke Test

### Actions
1. Home → Query → Metrics → Home (full circle)
2. Verify no errors or broken states

### Expected Behavior
- [ ] ✅ All navigation works smoothly
- [ ] ✅ No console errors
- [ ] ✅ No broken layouts
- [ ] ✅ Back button works throughout

**Result:**
- [ ] ✅ PASS - Navigation works perfectly
- [ ] ❌ FAIL - Navigation issues found

**Issues:**

---

## Test 1A.6: Browser Console Check

### Actions
1. Open DevTools (F12)
2. Go to Console tab
3. Refresh homepage
4. Review for errors

### Expected Behavior
- [ ] ✅ No JavaScript errors
- [ ] ✅ No failed network requests (404, 500)
- [ ] ✅ Only expected warnings (if any)

**Errors Found:**
- Count: ___
- Details:

**Result:**
- [ ] ✅ PASS - Clean console
- [ ] ⚠️ PARTIAL - Minor warnings only
- [ ] ❌ FAIL - Errors present

---

## Test 1A.7: Performance Check (After Fixes)

### Actions
1. Clear cache
2. Reload homepage
3. Measure load time

### Expected Behavior
- [ ] ✅ Loads in <3 seconds
- [ ] ✅ Time to interactive <3 seconds
- [ ] ✅ No performance regressions from fixes

**Load Time:** ___ seconds

**Result:**
- [ ] ✅ PASS - Performance maintained
- [ ] ⚠️ PARTIAL - Slightly slower but acceptable
- [ ] ❌ FAIL - Significant slowdown

**Notes:**

---

## Regression Test Summary

### Overall Results

**Tests Passed:** ___/7
**Tests Failed:** ___/7
**Tests Partial:** ___/7

### Critical Issues Status

| Issue | Original Status | Current Status | Fixed? |
|-------|----------------|----------------|--------|
| Day Detection Bug | 🔴 Critical | ___ | [ ] Yes [ ] No |
| Task Count (107→112) | 🟡 Important | ___ | [ ] Yes [ ] No |
| Inconsistent Days (18/19) | 🟡 Important | ___ | [ ] Yes [ ] No |

### Pass/Fail Decision

**Overall Regression Test:**
- [ ] ✅ PASS - All critical issues fixed, ready for Guide 02
- [ ] ⚠️ CONDITIONAL PASS - Minor issues remain, but can proceed
- [ ] ❌ FAIL - Critical issues still present, must fix before continuing

---

## Recommendations

### If ALL TESTS PASS ✅
**Action:** Proceed to Testing Guide 02: Natural Language Interface
**Confidence:** HIGH - Core functionality is solid
**Next Steps:**
1. Mark Guide 01A as complete
2. Begin Guide 02 testing
3. Continue systematic testing through Guide 08

### If SOME TESTS FAIL ⚠️
**Action:** Document remaining issues, decide if blocking
**Assessment Needed:**
- Are remaining issues critical for presentation?
- Can they be worked around during demo?
- Do they affect user trust/accuracy?

**Decision:**
- [ ] Proceed with caution (document known issues)
- [ ] Fix remaining issues first

### If CRITICAL TESTS FAIL ❌
**Action:** STOP - Do not proceed to Guide 02
**Required:**
1. Review fix implementation
2. Debug remaining issues
3. Re-run regression test
4. Only proceed when PASS

---

## New Issues Found (If Any)

**Issue 1:**
- Description:
- Severity: [ ] P1 [ ] P2 [ ] P3
- Impact:

**Issue 2:**
- Description:
- Severity: [ ] P1 [ ] P2 [ ] P3
- Impact:

**Issue 3:**
- Description:
- Severity: [ ] P1 [ ] P2 [ ] P3
- Impact:

---

## Testing Notes

**Environment:**
- Browser: ______________
- Device: ______________
- Date/Time: ______________
- Day of Week: ______________

**Deployment Info:**
- Last deployment: ______________
- Build number (if available): ______________
- Vercel URL: https://segundo-query-ai.vercel.app

**Additional Observations:**

---

## Sign-Off

**Tester:** _______________
**Date:** _______________
**Time Spent:** ___ minutes

**Recommendation:**
- [ ] ✅ APPROVED - Proceed to Guide 02
- [ ] ⚠️ CONDITIONAL - Proceed with known issues documented
- [ ] ❌ REJECTED - Must fix critical issues first

**Signature/Approval:** _______________

---

## Next Step

**If regression test PASSES:**
→ Proceed to **Testing Guide 02: Natural Language Interface**
```
/Users/greghogue/Curricullum/segundo-query-ai/docs/testing/02-NATURAL-LANGUAGE-INTERFACE.md
```

**If regression test FAILS:**
→ Return to development, implement remaining fixes, re-run this test

---

**Quick Reference:**
- Original Test Results: `/docs/testing/RESULTS-01-INITIAL-LOAD-NAVIGATION.md`
- Bug Report: `/docs/testing/BUG-REPORT-001-DAY-DETECTION.md`
- Testing Summary: `/docs/testing/TESTING-SESSION-SUMMARY.md`
