# 🤖 Agent Verification Checklist
**Quick Testing Guide for AI Agents**

Test all critical fixes implemented in segundo-query-ai. Run these tests systematically and report pass/fail for each.

---


# Open http://localhost:3000
```

---

## ✅ CRITICAL FIXES (P0) - Must Pass All

### 1. Attendance Never >100%
**Test:** Query builder profiles with high attendance
```bash
curl http://localhost:3000/api/builder/321 | grep attendance_pct
curl http://localhost:3000/api/builder/262 | grep attendance_pct
curl http://localhost:3000/api/builder/241 | grep attendance_pct
```
**Expected:** All values ≤ 100
**Pass/Fail:** ___

### 2. Quality Rubric Categories Show Variance
**Test:** Check quality drill-down data
```bash
curl http://localhost:3000/api/metrics/drill-down/quality-rubric | jq '.data[] | {name: .builder_name, tech: .technical_skills, bus: .business_value}'
```
**Expected:** Different scores per builder (not all identical)
**Pass/Fail:** ___

### 3. Excluded Builders Return 403/404
**Test:** Try accessing excluded builder profiles
```bash
# Should fail with 403 or 404
curl -I http://localhost:3000/api/builder/129  # Afiya Augustine
curl -I http://localhost:3000/api/builder/5    # Greg Hogue
curl -I http://localhost:3000/api/builder/240  # Carlos Godoy
```
**Expected:** HTTP 403 or 404 status
**Pass/Fail:** ___

---

## ✅ HIGH PRIORITY FIXES (P1) - Must Pass 18/21

### 4. Task Completion Consistency
**Test:** Compare task completion across endpoints
```bash
# Get completion from dashboard
curl http://localhost:3000/api/metrics/kpis | jq '.kpis[] | select(.label=="Task Completion This Week") | .value'

# Get completion from H1 chart for builder 321
curl http://localhost:3000/api/metrics/hypotheses/h1 | jq '.data[] | select(.user_id==321) | .task_completion_pct'

# Get completion from builder profile
curl http://localhost:3000/api/builder/321 | jq '.completion_pct'
```
**Expected:** Variance <3% across all endpoints
**Pass/Fail:** ___

### 5. Keyboard Navigation (Requires UI)
**Test:** Check component for accessibility attributes
```bash
grep -n 'tabIndex' components/metrics-dashboard/KPICards.tsx
grep -n 'role="button"' components/metrics-dashboard/KPICards.tsx
grep -n 'onKeyDown' components/metrics-dashboard/KPICards.tsx
```
**Expected:** All three patterns found in code
**Pass/Fail:** ___

### 6. ARIA Labels Present
**Test:** Check for ARIA accessibility
```bash
grep -n 'aria-label' components/metrics-dashboard/KPICards.tsx
grep -n 'aria-modal' components/metrics-dashboard/DrillDownModal.tsx
grep -n 'role="dialog"' components/metrics-dashboard/DrillDownModal.tsx
```
**Expected:** All patterns found in code
**Pass/Fail:** ___

### 7. Focus Trap Hook Exists
**Test:** Verify focus management implementation
```bash
test -f hooks/useFocusTrap.ts && echo "PASS: Focus trap hook exists" || echo "FAIL: Missing focus trap"
grep -n 'useFocusTrap' components/metrics-dashboard/DrillDownModal.tsx
```
**Expected:** File exists and is imported
**Pass/Fail:** ___

### 8. Loading Skeleton Component
**Test:** Verify skeleton exists
```bash
test -f components/ui/skeleton.tsx && echo "PASS: Skeleton exists" || echo "FAIL: Missing skeleton"
grep -n 'Skeleton' components/metrics-dashboard/KPICards.tsx
```
**Expected:** Component exists and is used
**Pass/Fail:** ___

### 9. Tooltips Added
**Test:** Check for tooltip implementation
```bash
grep -n 'Tooltip' components/metrics-dashboard/KPICards.tsx
grep -n 'TooltipTrigger' components/metrics-dashboard/KPICards.tsx
```
**Expected:** Tooltip components found
**Pass/Fail:** ___

### 10. "Need Intervention" Typo Fixed
**Test:** Verify shows <50% not 30%
```bash
grep -n '<50%' components/metrics-dashboard/KPICards.tsx
grep -n '<50%' components/metrics-dashboard/TerminologyLegend.tsx
grep -n '30%' components/metrics-dashboard/KPICards.tsx  # Should NOT find
```
**Expected:** Shows <50%, no mention of 30%
**Pass/Fail:** ___

### 11. Hover States CSS
**Test:** Check for hover transitions
```bash
grep -n 'hover:shadow' components/metrics-dashboard/KPICards.tsx
grep -n 'hover:scale' components/metrics-dashboard/KPICards.tsx
grep -n 'transition' components/metrics-dashboard/KPICards.tsx
```
**Expected:** Hover CSS classes present
**Pass/Fail:** ___

### 12. Thursday/Friday Messages
**Test:** Check for day-of-week logic
```bash
grep -n 'Thursday\|Friday' components/metrics-dashboard/KPICards.tsx
grep -n 'No class' components/metrics-dashboard/KPICards.tsx
```
**Expected:** Contextual messages for Thu/Fri
**Pass/Fail:** ___

### 13. Shared Task Completion Utility
**Test:** Verify shared utility exists and is used
```bash
test -f lib/metrics/task-completion.ts && echo "PASS: Utility exists" || echo "FAIL: Missing utility"
grep -n 'task-completion' app/builder/[id]/page.tsx
grep -n 'task-completion' app/api/metrics/hypotheses/h1/route.ts
```
**Expected:** File exists and imported in multiple places
**Pass/Fail:** ___

### 14. BigQuery Rubric Parser
**Test:** Verify BigQuery service exists
```bash
test -f lib/services/bigquery-individual.ts && echo "PASS: Service exists" || echo "FAIL: Missing service"
grep -n 'bigquery-individual' app/api/metrics/quality/route.ts
```
**Expected:** Service exists and is used
**Pass/Fail:** ___

### 15. Data Consistency - 76 Builders
**Test:** Verify builder count everywhere
```bash
# Homepage stats
curl http://localhost:3000/api/stats | jq '.activeBuilders'

# Metrics KPIs
curl http://localhost:3000/api/metrics/kpis | jq '.kpis[0].value' | grep -o '[0-9]*$'

# H1 chart
curl http://localhost:3000/api/metrics/hypotheses/h1 | jq '.data | length'
```
**Expected:** All show 76 builders
**Pass/Fail:** ___

### 16. Auto-Refresh Countdown (If Implemented)
**Test:** Check RefreshIndicator component
```bash
grep -n 'countdown\|timer' components/metrics-dashboard/RefreshIndicator.tsx
```
**Expected:** Countdown logic present
**Pass/Fail:** ___

### 17. Terminology Definitions Added
**Test:** Verify missing definitions added
```bash
grep -n 'Need Intervention' components/metrics-dashboard/TerminologyLegend.tsx
grep -n 'Engagement Score' components/metrics-dashboard/TerminologyLegend.tsx
```
**Expected:** Both definitions found
**Pass/Fail:** ___

### 18. Export CSV Present
**Test:** Check drill-down modals have export
```bash
grep -n 'Export CSV' components/metrics-dashboard/DrillDownModal.tsx
grep -n 'exportToCSV\|downloadCSV' components/metrics-dashboard/DrillDownModal.tsx
```
**Expected:** Export functionality present
**Pass/Fail:** ___

---

## ✅ DATA ACCURACY VALIDATION

### 19. Attendance Calculation Query
**Test:** Verify SQL excludes Thu/Fri
```bash
grep -n 'EXTRACT(DOW' app/builder/[id]/page.tsx
grep -n 'NOT IN (4, 5)' app/builder/[id]/page.tsx  # 4=Thu, 5=Fri
```
**Expected:** Day-of-week filtering present
**Pass/Fail:** ___

### 20. Attendance Deduplication
**Test:** Check for DISTINCT or GROUP BY
```bash
grep -n 'DISTINCT.*attendance_date' app/builder/[id]/page.tsx
```
**Expected:** Deduplication logic present
**Pass/Fail:** ___

### 21. Attendance Capped at 100%
**Test:** Check for LEAST() function
```bash
grep -n 'LEAST.*100' app/builder/[id]/page.tsx
```
**Expected:** Cap at 100% present
**Pass/Fail:** ___

---

## ✅ INTEGRATION TESTS EXIST

### 22. Test Files Created
**Test:** Verify test files exist
```bash
test -f tests/integration/data-accuracy.test.ts && echo "PASS" || echo "FAIL"
test -f tests/integration/rubric-categories.test.ts && echo "PASS" || echo "FAIL"
test -f tests/accessibility/wcag-compliance.test.tsx && echo "PASS" || echo "FAIL"
```
**Expected:** All 3 test files exist
**Pass/Fail:** ___

---

## 📊 QUICK RESULTS SUMMARY

**Test Results:**
- P0 Critical (Tests 1-3): ___ / 3 passed
- P1 High Priority (Tests 4-18): ___ / 15 passed
- Data Accuracy (Tests 19-21): ___ / 3 passed
- Integration Tests (Test 22): ___ / 1 passed

**Overall Pass Rate:** ___ / 22 (___%）

**Production Ready?**
- [ ] YES - All P0 + 90%+ P1 passing
- [ ] NO - Critical failures found

---

## 🐛 Issues Found

**List any failing tests:**
1. Test #___ failed because: ___
2. Test #___ failed because: ___

---

## ✅ Final Verification

**Checklist:**
- [ ] All P0 tests passed (3/3)
- [ ] 90%+ P1 tests passed (14+/15)
- [ ] No console errors when running `npm run dev`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors

**Agent Signature:** _______________
**Date:** _______________
**Overall Status:** PASS / FAIL / PARTIAL

---

## 📝 Notes

Add any observations, warnings, or recommendations:

