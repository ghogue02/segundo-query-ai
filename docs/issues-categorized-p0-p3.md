# SEGUNDO QUERY AI - CATEGORIZED ISSUES FROM TESTING
**Generated:** October 4, 2025
**Source:** Testing Feedback Document (Tests 4-8)
**Total Issues:** 56

---

## CRITICAL (P0) - Must Fix Before Production

### 🚨 Data Accuracy & Privacy

**ISSUE #1: Excluded Builders Fully Accessible (CRITICAL SECURITY/PRIVACY VIOLATION)**
- **Location:** Builder Profiles (Test 6.2)
- **Current Behavior:** Staff members (IDs: 129, 5, 240, 326) and duplicate accounts (ID: 324) have fully accessible profiles
- **Expected Behavior:** Should return 403 Forbidden or 404 Not Found
- **Impact:** Exposes private data for individuals who should not appear in system
- **Suggested Fix:** Implement access control layer to block excluded user IDs before profile query
- **Test Plan:** Verify /builder/129, /builder/5, /builder/324 return errors

**ISSUE #2: Attendance Calculation Shows >100% (MATHEMATICAL IMPOSSIBILITY)**
- **Location:** Builder Profiles (Test 6.4, 6.6)
- **Current Behavior:** Builder 241 shows "20/19 days attended" = 105.3%
- **Expected Behavior:** Attendance should never exceed 100%
- **Impact:** Undermines trust in entire analytics platform
- **Suggested Fix:** Review curriculum_days query - ensure denominator counts only valid class days for date range
- **Test Plan:** Verify all builders show attendance ≤ 100%

**ISSUE #3: Quality by Category Shows Identical Scores for All Builders**
- **Location:** Quality Metrics Dashboard - Quality by Category Card (Test 5.2)
- **Current Behavior:** All 50 builders show identical scores (Overall: 36, Technical: 82, Business: 75, PM: 80, Critical: 72)
- **Expected Behavior:** Each builder should have individualized scores from BigQuery assessments
- **Impact:** Completely defeats purpose of individual quality tracking - instructors cannot identify who needs help
- **Suggested Fix:** Change query from `AVG(score) OVER()` to `AVG(score) GROUP BY builder_name`
- **Root Cause:** Query returns cohort averages instead of individual scores
- **Priority:** URGENT - Blocks individual builder quality tracking

---

## HIGH (P1) - Fix Before Launch

### 🔴 Navigation & Functionality

**ISSUE #4: "Back to Dashboard" Button Non-Functional**
- **Location:** Builder Profiles (Test 6.9)
- **Current Behavior:** Button visible but clicking has no effect
- **Expected Behavior:** Should navigate back to /metrics dashboard
- **Impact:** Users forced to use browser back button
- **Suggested Fix:** Add onClick handler with router.push('/metrics')

**ISSUE #5: KPI Cards Not Keyboard Accessible**
- **Location:** Metrics Dashboard - All KPI Cards (Test 4.1-4.5, 4.8)
- **Current Behavior:** Cards have no tab order, cannot activate with Enter/Space
- **Expected Behavior:** Cards should be in tab order with role="button"
- **Impact:** WCAG 2.1 Level A violation - keyboard users cannot access drill-downs
- **Suggested Fix:** Add `tabindex="0"`, `role="button"`, `onKeyDown` handlers to all KPI cards
- **Accessibility Score:** CRITICAL

**ISSUE #6: Missing ARIA Labels on KPI Cards and Modals**
- **Location:** Metrics Dashboard (Test 4.1-4.5)
- **Current Behavior:** No aria-label, role="dialog", or aria-modal attributes
- **Expected Behavior:** Proper ARIA semantics for screen readers
- **Impact:** Screen readers cannot announce cards/modals properly
- **Suggested Fix:**
  - Cards: Add `aria-label="Attendance Today: 49 out of 76 builders present. Click to view details"`
  - Modals: Add `role="dialog"` and `aria-modal="true"`

**ISSUE #7: No Visible Hover States on KPI Cards**
- **Location:** Metrics Dashboard - All KPI Cards (Test 4.8)
- **Current Behavior:** Only cursor changes to pointer, no visual effect
- **Expected Behavior:** Background color change, border highlight, or shadow increase on hover
- **Impact:** Poor affordance - users may not realize cards are clickable
- **Suggested Fix:** Add CSS hover state with `transform: translateY(-2px)` and `box-shadow` increase

### 🔴 Data Accuracy

**ISSUE #8: Task Completion Variance Between Features (3% Discrepancy)**
- **Location:** H1 Chart vs Builder Profile (Test 8.6)
- **Current Behavior:** H1 chart shows 75%, profile shows 72% for same builder (Michael Fehdrau)
- **Expected Behavior:** Both should show identical value
- **Impact:** Users see conflicting data across features
- **Suggested Fix:** Ensure both features query same data source with identical calculation

**ISSUE #9: Builder Name Mismatch on Navigation**
- **Location:** Metrics Dashboard → Builder Profile (Test 6.1)
- **Current Behavior:** Clicked "Kane Roman" but profile shows "Farla Noman" at URL /builder/271
- **Expected Behavior:** Profile should show clicked builder's name
- **Impact:** Confusing user experience, possible data integrity issue
- **Suggested Fix:** Verify builder_id mapping in attendance drill-down query

### 🔴 UX/Content Issues

**ISSUE #10: Typo on "Need Intervention" Card**
- **Location:** Metrics Dashboard - Need Intervention KPI Card (Test 4.5)
- **Current Behavior:** Card shows "30% completion OR <70% attendance"
- **Expected Behavior:** Should be "<50% completion OR <70% attendance"
- **Impact:** Misleading information about intervention criteria
- **Suggested Fix:** Update card text to match actual logic

**ISSUE #11: Missing "Need Intervention" Definition**
- **Location:** Terminology Legend (Test 7.2)
- **Current Behavior:** Dashboard shows "Need Intervention: 26" but NO explanation in legend
- **Expected Behavior:** Dedicated section explaining criteria
- **Impact:** Stakeholders cannot understand this critical metric
- **Suggested Fix:** Add definition: "Builders flagged with <50% completion OR <70% attendance"

**ISSUE #12: Missing Standalone "Engagement Score" Definition**
- **Location:** Terminology Legend (Test 7.8)
- **Current Behavior:** Formula only appears embedded in other definitions
- **Expected Behavior:** Dedicated "Engagement Score" section
- **Impact:** Users must hunt through multiple definitions to understand fundamental concept
- **Suggested Fix:** Create standalone section explaining (Attendance × 30%) + (Completion × 50%) + (Quality × 20%)

**ISSUE #13: No Loading States on KPI Cards**
- **Location:** Metrics Dashboard (Test 4.9)
- **Current Behavior:** No skeleton, spinner, or loading indicator during data refresh
- **Expected Behavior:** Visual loading skeleton or pulse animation
- **Impact:** Users can't tell if data is loading or stale
- **Suggested Fix:** Add loading skeleton component with animate-pulse

**ISSUE #14: No Loading Indicators During BigQuery Fetch**
- **Location:** Quality Metrics Dashboard (Test 5.1)
- **Current Behavior:** 2-3 second blank space during BigQuery queries
- **Expected Behavior:** Skeleton loader or spinner
- **Impact:** Users think dashboard is broken
- **Suggested Fix:** Add loading skeleton to all chart cards

**ISSUE #15: "7-Day Attendance" Shows 8 Records (Confusing Naming)**
- **Location:** Metrics Dashboard - 7-Day Attendance KPI (Test 4.4)
- **Current Behavior:** Modal title says "7-Day" but shows "8 records"
- **Expected Behavior:** Title should match record count
- **Impact:** Confusing naming/counting
- **Suggested Fix:** Change to "Last 7 Class Days" or fix record count

**ISSUE #16: Possible Duplicate Date in 7-Day Attendance**
- **Location:** 7-Day Attendance Drill-Down (Test 4.4)
- **Current Behavior:** Sept 28, 2025 appears twice in data
- **Expected Behavior:** Each date should appear once
- **Impact:** Could skew 7-day average calculation
- **Suggested Fix:** Investigate database query for duplicate records

**ISSUE #17: Confusing Comparison Metrics**
- **Location:** Attendance Today KPI (Test 4.6)
- **Current Behavior:** Shows "↑ 22% vs 7-day avg" but today's rate (64.5%) < 7-day rate (71%)
- **Expected Behavior:** Comparison should be logical
- **Impact:** Contradictory or unclear metrics
- **Suggested Fix:** Clarify what 22% represents (absolute change? relative change?)

**ISSUE #18: Natural Language "Key Insights" Discrepancy**
- **Location:** Natural Language Query Results (Test 8.1)
- **Current Behavior:** Summary says "10 individuals absent" but table shows 27 rows
- **Expected Behavior:** Summary should match row count
- **Impact:** Confusing summary doesn't match data
- **Suggested Fix:** Update AI summary generation to count actual query results

**ISSUE #19: Quality Score Appears Identical for Multiple Builders (36/100)**
- **Location:** Builder Profiles (Test 6.4)
- **Current Behavior:** Multiple builders tested all show Quality Score = 36
- **Expected Behavior:** Individualized scores
- **Impact:** May not be personalized
- **Suggested Fix:** Verify quality score calculation is per-builder, not cohort average

**ISSUE #20: H4 Drill-Down Shows "0 Records"**
- **Location:** Quality Metrics - H4 Week-over-Week Chart (Test 5.6)
- **Current Behavior:** Chart displays but drill-down modal shows "0 records"
- **Expected Behavior:** Weekly breakdown data per builder
- **Impact:** Users cannot access underlying data
- **Suggested Fix:** Populate drill-down with weekly data

**ISSUE #21: H5 Completion Rate Labels Are Confusing**
- **Location:** Quality Metrics - H5 Weekend Patterns (Test 5.7)
- **Current Behavior:** Shows "2% completion rate" but Y-axis is "Number of Submissions"
- **Expected Behavior:** Consistent units (either counts OR percentages)
- **Impact:** Users confused about metric meaning
- **Suggested Fix:** Use "90 weekday submissions, 190 weekend submissions" OR "32% weekday, 68% weekend"

**ISSUE #22: H4 Insight Contradicts Chart Data**
- **Location:** H4 Week-over-Week Chart (Test 5.6)
- **Current Behavior:** Insight says "stable" but chart shows fluctuations
- **Expected Behavior:** Insight should match visual trend
- **Impact:** Misleading interpretation
- **Suggested Fix:** Update to "Performance fluctuates week-over-week. Week 3 peak followed by decline."

**ISSUE #23: No Contextual Messages for No-Class Days**
- **Location:** Attendance Prior Day KPI (Test 4.2)
- **Current Behavior:** Thursday/Friday show "0/76" without explanation
- **Expected Behavior:** Badge or message "No class scheduled on Thursday"
- **Impact:** Users may think low attendance vs understanding "no class"
- **Suggested Fix:** Replace decline % with "No class scheduled" on Thu/Fri

**ISSUE #24: Late Arrival Time Not Shown in Builder Profiles**
- **Location:** Builder Profile - Attendance History (Test 6.5)
- **Current Behavior:** Only shows "late" badge, no minute count
- **Expected Behavior:** Should show "late (77 min)" format
- **Impact:** Less granular information than dashboard drill-down
- **Suggested Fix:** Add late minutes to attendance history display

---

## MEDIUM (P2) - Post-Launch Week 1

### 🟡 UX/Navigation

**ISSUE #25: No Explanation of Engagement Score Calculation in Profiles**
- **Location:** Builder Profiles (Test 6.7)
- **Current Behavior:** Score displayed but formula not explained
- **Expected Behavior:** Tooltip or help text showing formula
- **Impact:** Users don't know how score is derived
- **Suggested Fix:** Add tooltip with breakdown: "Attendance (30%) + Completion (50%) + Quality (20%)"

**ISSUE #26: No Explanation of Status Criteria in Profiles**
- **Location:** Builder Profiles - Status Indicator (Test 6.8)
- **Current Behavior:** Status shown but thresholds not documented
- **Expected Behavior:** Tooltip explaining criteria
- **Impact:** Users don't know what triggers each status
- **Suggested Fix:** Add tooltip: "Struggling: <70% completion OR <70% attendance"

**ISSUE #27: No Search Functionality in Terminology Legend**
- **Location:** Terminology Legend (Test 7.16)
- **Current Behavior:** Users must manually scroll through all definitions
- **Expected Behavior:** Search box at top to find terms
- **Impact:** Poor UX with 9+ definitions
- **Suggested Fix:** Add search input that filters visible sections

**ISSUE #28: Filter Impact Unclear on Dashboard**
- **Location:** Dashboard Filter Sidebar (Test 8.9)
- **Current Behavior:** Filter UI updates but unclear if data refreshes
- **Expected Behavior:** Loading indicator or "Apply Filters" button
- **Impact:** Users unsure if filters are actively applied
- **Suggested Fix:** Add visual feedback when filters change data

**ISSUE #29: No Export Button in Quality Score Drill-Down**
- **Location:** Quality Metrics - Overall Quality Score Modal (Test 5.1)
- **Current Behavior:** Shows 76 builders but no export option
- **Expected Behavior:** Export CSV button like other modals
- **Impact:** Users cannot save builder performance data
- **Suggested Fix:** Add "Export CSV" button

**ISSUE #30: Only 50 of 76 Builders in Quality by Category Drill-Down**
- **Location:** Quality Metrics - Quality by Category Modal (Test 5.2)
- **Current Behavior:** Modal shows "50 records" but cohort has 76 builders
- **Expected Behavior:** All 76 builders shown
- **Impact:** Missing 34% of cohort
- **Suggested Fix:** Include all builders in drill-down query

**ISSUE #31: Radar Chart Shows 0% for All Categories**
- **Location:** Quality by Category Card (Test 5.2)
- **Current Behavior:** Main card radar chart displays flat line at 0%
- **Expected Behavior:** Display actual category averages (82%, 75%, 80%, etc.)
- **Impact:** Chart is useless
- **Suggested Fix:** Connect chart to actual category average data

### 🟡 Accessibility

**ISSUE #32: KPI Cards Not Keyboard-Accessible (Profiles)**
- **Location:** Builder Profiles - KPI Cards (Test 6.12)
- **Current Behavior:** Cannot tab to KPI cards
- **Expected Behavior:** Cards in tab order with keyboard activation
- **Impact:** Keyboard-only users cannot interact
- **Suggested Fix:** Add tabindex and ARIA roles

**ISSUE #33: No Column Sorting in Modals**
- **Location:** All KPI Drill-Down Modals (Test 4.3, 4.4)
- **Current Behavior:** Column headers not clickable
- **Expected Behavior:** Click to sort by column
- **Impact:** Users can't organize data by completion %, attendance, etc.
- **Suggested Fix:** Make column headers sortable

**ISSUE #34: Charts Missing ARIA Labels**
- **Location:** Quality Metrics Charts (Test 5 - Accessibility)
- **Current Behavior:** Charts lack aria-label attributes
- **Expected Behavior:** Descriptive ARIA labels for screen readers
- **Impact:** Not screen reader accessible
- **Suggested Fix:** Add `aria-label="Hypothesis 1: Attendance drives completion. Correlation 0.79"`

**ISSUE #35: No Tooltips on Card Hover**
- **Location:** Metrics Dashboard - All KPI Cards (Test 4.1)
- **Current Behavior:** No explanatory tooltip when hovering
- **Expected Behavior:** Tooltip: "Number of builders who checked in during today's scheduled class time"
- **Impact:** Users may not understand metric meaning
- **Suggested Fix:** Add tooltip component to all cards

**ISSUE #36: Date Formatting Too Technical**
- **Location:** 7-Day Attendance Drill-Down (Test 4.4)
- **Current Behavior:** Shows "2025-10-04T04:00:00.000Z"
- **Expected Behavior:** "Mon, Oct 4, 2025 at 8:42 AM"
- **Impact:** Hard to read
- **Suggested Fix:** Format dates with date-fns or similar library

**ISSUE #37: No Search/Filter Within Modals**
- **Location:** All KPI Drill-Down Modals (Test 4.1)
- **Current Behavior:** Cannot search for specific builders/tasks
- **Expected Behavior:** Search input at top of modal
- **Impact:** Difficult to find items in long lists
- **Suggested Fix:** Add search functionality to modals with >20 rows

**ISSUE #38: No Breadcrumb Navigation in Profiles**
- **Location:** Builder Profiles (Test 6.3)
- **Current Behavior:** Only "Back" button, no location context
- **Expected Behavior:** Breadcrumb: "Dashboard > Builders > [Name]"
- **Impact:** Users lose context of navigation path
- **Suggested Fix:** Add breadcrumb component

**ISSUE #39: No "Last Updated" Timestamp**
- **Location:** Builder Profiles, Dashboard (Test 6.3)
- **Current Behavior:** Data freshness unclear
- **Expected Behavior:** "Last updated: 2 minutes ago"
- **Impact:** Users don't know if data is current
- **Suggested Fix:** Add timestamp to page header

**ISSUE #40: Absent Days Not Shown in Attendance History**
- **Location:** Builder Profiles - Attendance Section (Test 6.5)
- **Current Behavior:** Only present/late shown, absences implicit
- **Expected Behavior:** Show all class days with "absent" badge
- **Impact:** Incomplete picture of attendance
- **Suggested Fix:** Add absent days to history list

**ISSUE #41: No Task Search/Filter in Completed Tasks**
- **Location:** Builder Profiles - Completed Tasks (Test 6.6)
- **Current Behavior:** No search for long task lists
- **Expected Behavior:** Search input
- **Impact:** Hard to find specific tasks
- **Suggested Fix:** Add search box above task list

**ISSUE #42: Duplicate Task Names Without Context**
- **Location:** Builder Profiles - Completed Tasks (Test 6.6)
- **Current Behavior:** Multiple "Daily Stand-up" entries with only dates
- **Expected Behavior:** Add week context: "Daily Stand-up (Week 3)"
- **Impact:** Hard to distinguish identical task names
- **Suggested Fix:** Append week/day to duplicate task names

**ISSUE #43: "Top Performer" Badge Uses Black Color (Not Green)**
- **Location:** Builder Profiles - Status Indicator (Test 6.8)
- **Current Behavior:** Black background for Top Performer badge
- **Expected Behavior:** Green background (more intuitive for success)
- **Impact:** Less intuitive color choice
- **Suggested Fix:** Change badge color to green

**ISSUE #44: No Keyboard Shortcut to Return to Dashboard**
- **Location:** Builder Profiles (Test 6.12)
- **Current Behavior:** No keyboard shortcuts
- **Expected Behavior:** ESC key returns to dashboard
- **Impact:** Keyboard users have limited navigation
- **Suggested Fix:** Add ESC key handler

---

## LOW (P3) - Future Improvements

### 💡 UX Enhancements

**ISSUE #45: Technical Jargon Without Explanation in Terminology**
- **Location:** Terminology Legend (Test 7.11)
- **Current Behavior:** Shows "task_submissions table", "BigQuery"
- **Expected Behavior:** Plain language or collapsible technical details
- **Impact:** Non-technical users confused
- **Suggested Fix:** Add collapsible "Technical Details" sections

**ISSUE #46: Inconsistent Section Ordering in Terminology Legend**
- **Location:** Terminology Legend (Test 7.2)
- **Current Behavior:** No logical order (not alphabetical, not by importance)
- **Expected Behavior:** Core metrics → Derived metrics → Segments
- **Impact:** Harder to find definitions
- **Suggested Fix:** Reorder sections logically

**ISSUE #47: "Late" Status Ambiguity in Attendance Definition**
- **Location:** Terminology Legend - Attendance (Test 7.4)
- **Current Behavior:** Doesn't explicitly state "late" counts as "present"
- **Expected Behavior:** Clear statement about late status
- **Impact:** Users may think late is excluded
- **Suggested Fix:** Add: "Note: 'Late' status counts as 'present' for attendance %"

**ISSUE #48: Dual Definition Approach Not Explained**
- **Location:** Terminology Legend - Struggling/Top Performer (Test 7.6, 7.7)
- **Current Behavior:** Two methods shown (Threshold vs Composite) without rationale
- **Expected Behavior:** Explanation of which method is used when
- **Impact:** Confusion about which definition applies
- **Suggested Fix:** Add intro: "We provide two identification methods: simple thresholds OR composite engagement score"

**ISSUE #49: No Hover Tooltips on Charts**
- **Location:** Quality Metrics - H1, H2, H7 Charts (Test 5.3, 5.4, 5.9)
- **Current Behavior:** Cannot hover to identify specific builders/data points
- **Expected Behavior:** Recharts tooltip showing builder name and values
- **Impact:** Must open drill-down to identify outliers
- **Suggested Fix:** Add `<Tooltip>` component to all Recharts

**ISSUE #50: Data Point Overlap at High Values in Scatter Plot**
- **Location:** H1 Attendance vs Completion Chart (Test 5.3)
- **Current Behavior:** Many builders cluster at 95% attendance, hard to distinguish
- **Expected Behavior:** Slight jitter or semi-transparent points
- **Impact:** Individual points hard to identify
- **Suggested Fix:** Add opacity: 0.7 or slight random jitter

**ISSUE #51: H3, H5 Drill-Downs Show "No Data Available"**
- **Location:** H3 Activity Patterns, H5 Weekend Patterns (Test 5.5, 5.7)
- **Current Behavior:** Charts display but drill-downs are empty
- **Expected Behavior:** Activity/day-level breakdown data
- **Impact:** Cannot verify chart data
- **Suggested Fix:** Populate drill-downs with detailed data

**ISSUE #52: Radar Chart Lacks Scale Numbers**
- **Location:** H3 Activity Type Patterns (Test 5.5)
- **Current Behavior:** No axis values on radar chart
- **Expected Behavior:** Radial axis labels (0%, 25%, 50%, 75%, 100%)
- **Impact:** Users can't quantify differences
- **Suggested Fix:** Add scale labels to radar chart

**ISSUE #53: H3 Chart Missing 2 Activity Categories**
- **Location:** H3 Activity Type Patterns (Test 5.5)
- **Current Behavior:** Only shows 3 categories (Core Learning, Applied Work, Collaboration)
- **Expected Behavior:** All 5 categories from filter (including Reflection, Other)
- **Impact:** Incomplete picture
- **Suggested Fix:** Include all 5 categories or explain exclusion

**ISSUE #54: "Weekday" Definition Unclear in H5**
- **Location:** H5 Weekend vs Weekday Patterns (Test 5.7)
- **Current Behavior:** Doesn't specify Mon-Fri or Mon/Tue/Wed (class days)
- **Expected Behavior:** Clarification in axis label
- **Impact:** Ambiguous metric
- **Suggested Fix:** Label as "Weekday (Mon/Tue/Wed class days)"

**ISSUE #55: H6 Peer Influence Has No Timeline**
- **Location:** H6 Peer Influence Placeholder (Test 5.8)
- **Current Behavior:** Says "Coming soon" with no date
- **Expected Behavior:** Estimated timeline shown
- **Impact:** Users don't know when feature arrives
- **Suggested Fix:** Add "Expected: Q1 2026"

**ISSUE #56: No Visual Feedback on Export CSV Click**
- **Location:** All Drill-Down Modals (Test 4.7, 4.10)
- **Current Behavior:** No loading indicator when clicking Export
- **Expected Behavior:** Spinner or "Downloading..." message
- **Impact:** Users unsure if export worked
- **Suggested Fix:** Add loading state to export button

---

## SUMMARY STATISTICS

**Total Issues Found:** 56

**By Priority:**
- Critical (P0): 3 issues (5%)
- High (P1): 21 issues (38%)
- Medium (P2): 20 issues (36%)
- Low (P3): 12 issues (21%)

**By Test Section:**
- Test 4 (KPI Cards): 20 issues
- Test 5 (Quality Metrics): 15 issues
- Test 6 (Builder Profiles): 11 issues
- Test 7 (Terminology): 8 issues
- Test 8 (Cross-Feature): 2 issues

**Critical Path to Production:**
1. ✅ FIX P0 ISSUES (3 issues - BLOCKING)
2. ✅ FIX P1 ISSUES (21 issues - REQUIRED)
3. 📋 Launch with P2/P3 as backlog

**Estimated Timeline:**
- P0 Fixes: 2-3 days
- P1 Fixes: 5-7 days
- **Total to Production: 7-10 days**
