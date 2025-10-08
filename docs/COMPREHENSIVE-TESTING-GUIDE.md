# Comprehensive Testing Guide - Second Query AI
**Version:** 1.0
**Date:** October 2, 2025
**Production URL:** https://segundo-query-7zrllot7g-gregs-projects-61e51c01.vercel.app
**Purpose:** Systematic testing and evaluation for functionality, UX/UI, and data accuracy

---

## 🎯 Testing Objectives

1. **Functionality:** Verify all features work as expected
2. **Data Accuracy:** Validate metrics against known values
3. **UX/UI:** Evaluate user experience and interface design
4. **Performance:** Check load times and responsiveness
5. **Improvements:** Identify opportunities for enhancement

---

## 📋 SECTION 1: Landing Page Testing

### URL to Test
`https://segundo-query-7zrllot7g-gregs-projects-61e51c01.vercel.app`

### Functionality Checklist

#### Visual Elements
- [ ] **Header displays correctly**
  - Logo (📊) visible
  - Title "Second Query AI" present
  - Subtitle "September 2025 Cohort Analytics" visible

- [ ] **Two option cards display**
  - Natural Language Query card (💬 icon)
  - Metrics Dashboard card (📊 icon)
  - Both cards have hover effects
  - Borders highlight on hover

- [ ] **Stats bar at bottom**
  - Shows "76 Active Builders"
  - Shows "19 Class Days"
  - Shows "107 Curriculum Tasks"

- [ ] **Footer present**
  - "Powered by Claude AI" text visible

#### Interactive Elements
- [ ] **Click Natural Language card** → Navigates to `/query`
- [ ] **Click Metrics Dashboard card** → Navigates to `/metrics`
- [ ] **Hover effects work** → Cards lift and border appears
- [ ] **Responsive design** → Test on mobile/tablet (resize browser)

### UX/UI Evaluation

**Rate each (1-5, 5=excellent):**
- Visual appeal: _____
- Clarity of options: _____
- Ease of navigation: _____
- Color scheme: _____
- Typography: _____
- Mobile responsiveness: _____

**Improvement Suggestions:**
- [ ] Should cards show preview screenshots?
- [ ] Add "What's New" badge for Metrics Dashboard?
- [ ] Include user testimonials or benefits?
- [ ] Add quick stats preview on hover?
- [ ] Too much/too little information?

**Issues Found:**
```
(List any bugs, visual glitches, unclear text, etc.)
```

---

## 📋 SECTION 2: Natural Language Query Interface

### URL to Test
`https://segundo-query-7zrllot7g-gregs-projects-61e51c01.vercel.app/query`

### Functionality Checklist

#### Page Load
- [ ] **Header displays correctly**
  - Navigation: "← Home" and "📊 Dashboard" links work
  - Page title visible

- [ ] **Query input visible**
  - Text input field present
  - Placeholder text clear
  - "Ask" button visible

- [ ] **Pre-prompt templates display**
  - 20 example queries shown
  - Organized by category (Daily Ops, Trends, etc.)
  - Templates are clickable

#### Test 10 Example Queries

**Test each query and document results:**

1. **"What is today's attendance rate?"**
   - [ ] Query submits successfully
   - [ ] Response received within 10 seconds
   - [ ] Chart/table displays
   - [ ] Data looks accurate (cross-check if possible)
   - [ ] SQL query shown (if enabled)
   - Issues/Notes: _____

2. **"Who is absent today?"**
   - [ ] Returns list of builders
   - [ ] Shows meaningful data
   - [ ] Can click builder names to drill down
   - Issues/Notes: _____

3. **"Show me today's task completion"**
   - [ ] Returns completion statistics
   - [ ] Visualizes appropriately
   - [ ] Drill-down available
   - Issues/Notes: _____

4. **"Show attendance trends for this week"**
   - [ ] Line chart or appropriate visualization
   - [ ] Shows trend over time
   - [ ] Interactive (hover for details)
   - Issues/Notes: _____

5. **"Which builders completed the most tasks this week?"**
   - [ ] Returns ranked list
   - [ ] Shows bar chart or table
   - [ ] Click to see builder details
   - Issues/Notes: _____

6. **"Who has the highest completion rate?"**
   - [ ] Calculates completion percentage
   - [ ] Shows top builders
   - [ ] Data makes sense
   - Issues/Notes: _____

7. **"Which tasks had the best completion this week?"**
   - [ ] Returns task list with completion rates
   - [ ] Click to see task details
   - Issues/Notes: _____

8. **"Show me builders with attendance below 80%"**
   - [ ] Filters correctly
   - [ ] Returns struggling builders
   - [ ] Click for details
   - Issues/Notes: _____

9. **"What are the latest feedback scores?"**
   - [ ] BigQuery data retrieved
   - [ ] Quality scores displayed
   - Issues/Notes: _____

10. **"Show me Weekly Feedback completion rates"**
    - [ ] Specific task type queried
    - [ ] Accurate results
    - Issues/Notes: _____

#### Drill-Down Testing

**For each query above that returns builder/task data:**
- [ ] **Click builder name** → Opens builder detail panel
  - Shows full profile
  - Task history visible
  - Attendance records shown
  - Can navigate back

- [ ] **Click task name** → Opens task detail panel
  - Task description shown
  - Completion statistics visible
  - Submissions listed
  - Can navigate back

- [ ] **Click chart elements** → Filters or drills down
  - Bar charts are clickable
  - Drill-down is relevant
  - Can return to overview

#### Error Handling
- [ ] **Submit empty query** → Appropriate error message
- [ ] **Submit nonsense query** → AI handles gracefully
- [ ] **Submit query with no data** → "No results" message clear
- [ ] **Network error** → Error message displayed

### UX/UI Evaluation

**Rate each (1-5):**
- Query interface clarity: _____
- Response time satisfaction: _____
- Chart/visualization quality: _____
- Drill-down usefulness: _____
- Template organization: _____
- Mobile usability: _____

**Improvement Suggestions:**
- [ ] Should queries be saved to history?
- [ ] Add "Clear" button to reset query?
- [ ] Better organization of templates?
- [ ] Add "Recent queries" section?
- [ ] Include query suggestions as you type?
- [ ] Show loading indicator during query?
- [ ] Add "Export" button for results?

**Common User Questions:**
```
What questions would users likely ask that aren't in templates?
What confusion points might arise?
What additional context is needed?
```

---

## 📋 SECTION 3: Metrics Dashboard Testing

### URL to Test
`https://segundo-query-7zrllot7g-gregs-projects-61e51c01.vercel.app/metrics`

### Tab 1: Defined Metrics

#### Filter Sidebar Testing

**Time Range Filters:**
- [ ] **"Last 7 days"** → Dashboard updates
- [ ] **"Last 14 days"** → Dashboard updates
- [ ] **"Last 30 days"** → Dashboard updates
- [ ] **"All time"** (default) → Shows all data
- [ ] Changes reflect immediately (no page reload)

**Week Selection:**
- [ ] **Uncheck Week 1** → Dashboard filters correctly
- [ ] **Select only Week 2** → Shows Week 2 data only
- [ ] **Select multiple weeks** → Combines data appropriately

**Builder Segments:**
- [ ] **"All Builders"** (default) → Shows 76 builders
- [ ] **"Top Performers"** → Filters to top segment
- [ ] **"Struggling"** → Filters to struggling builders
- [ ] Counts update in KPI cards

**Activity Categories:**
- [ ] **Uncheck "Core Learning"** → Filters out learning tasks
- [ ] **Select only "Applied Work"** → Shows building tasks only
- [ ] **Multiple selections** → Combines appropriately

**Task Type & Mode:**
- [ ] **Individual only** → Filters correctly
- [ ] **Group only** → Shows group tasks
- [ ] **Conversation mode only** → Filters AI-assisted tasks
- [ ] **Basic mode only** → Shows independent tasks

**Filter Interactions:**
- [ ] **"Reset" button** → Returns all filters to default
- [ ] **Active Filters summary** → Updates in sidebar
- [ ] **Multiple filter changes** → Dashboard updates smoothly
- [ ] **Filters persist** → Remain when switching charts

#### KPI Cards (5 Cards)

**Test Each Card:**

1. **Active Builders Today**
   - [ ] Shows count (X/76)
   - [ ] Shows percentage
   - [ ] Comparison to 7-day avg
   - [ ] Green/red indicator for up/down
   - [ ] Hover tooltip explains metric
   - Data looks accurate? _____

2. **Active Builders Prior Day**
   - [ ] Shows yesterday's count
   - [ ] Comparison to 7-day avg
   - [ ] Makes sense relative to "Today" card
   - Data looks accurate? _____

3. **Task Completion This Week**
   - [ ] Shows percentage
   - [ ] "vs last week" comparison
   - [ ] Week-over-week change indicated
   - Data looks accurate? _____

4. **Attendance Rate (7-Day Class Avg)**
   - [ ] Shows percentage
   - [ ] "vs last week" comparison
   - [ ] **VERIFY:** Excludes Thu/Fri (no class days)
   - Data looks accurate? _____

5. **Need Intervention**
   - [ ] Shows count of flagged builders
   - [ ] Explanation: "<50% completion OR <70% attendance"
   - [ ] Click to see list (if implemented)
   - Count seems reasonable? _____

**KPI Card Issues:**
```
Any cards showing strange numbers?
Any unclear labels?
Any missing hover tooltips?
```

#### Quality Metrics (2 Cards)

1. **Overall Quality Score**
   - [ ] Shows score out of 100
   - [ ] Total assessments count shown
   - [ ] Data source noted (BigQuery)
   - [ ] Score seems reasonable (0-100 range)

2. **Quality Radar Chart**
   - [ ] Radar chart displays correctly
   - [ ] Shows all rubric categories:
     - Product & Business Thinking
     - Professional & Learning Skills
     - AI Direction & Collaboration
     - Technical Concepts & Integration
   - [ ] Scores shown below chart
   - [ ] Visual is clear and readable

**Quality Metrics Issues:**
```
Does rubric breakdown make sense?
Are scores plausible?
Chart labels clear?
```

#### Hypothesis Charts (Test All 7)

**H1: Attendance Drives Task Completion**
- [ ] Scatter plot displays
- [ ] Shows correlation coefficient (e.g., 0.73)
- [ ] Trend line visible
- [ ] Hover on points shows builder name
- [ ] Insight text makes sense
- [ ] Can click points to see builder details
- **Correlation value:** _____ (document)
- **Visual clarity (1-5):** _____
- Issues/Suggestions: _____

**H2: Early Engagement Predicts Success**
- [ ] Scatter plot displays
- [ ] Week 1 vs Total submissions shown
- [ ] Correlation coefficient shown
- [ ] Insight cards at bottom (Cohort Avg, Top Performers, Struggling)
- [ ] Data makes logical sense
- **Correlation value:** _____ (document)
- Issues/Suggestions: _____

**H3: Activity Type Completion Patterns**
- [ ] Radar chart displays
- [ ] Shows 5 categories (Core Learning, Applied Work, etc.)
- [ ] Completion rates shown
- [ ] Insight text explains pattern
- **Top category:** _____ (document)
- Issues/Suggestions: _____

**H4: Week-over-Week Improvement Trajectory**
- [ ] Line chart displays
- [ ] Shows Weeks 1-4 (or available weeks)
- [ ] Two lines: Completion % and Attendance %
- [ ] Trend indicators (📈 improving / 📉 declining / ➡️ stable)
- [ ] Insight explains overall direction
- **Trend:** _____ (improving/declining/stable)
- Issues/Suggestions: _____

**H5: Weekend vs Weekday Work Patterns**
- [ ] Bar chart displays
- [ ] Compares Weekday (Mon-Wed) vs Weekend (Sat-Sun)
- [ ] Shows submission counts
- [ ] Avg completion rates shown
- [ ] Insight text explains pattern
- **Weekend %:** _____ (document)
- Issues/Suggestions: _____

**H6: Peer Influence (Table Groups)**
- [ ] Displays "unavailable" message
- [ ] Explains table group data not yet tracked
- [ ] UI is clean even with no data
- Suggestion: _____

**H7: Task Difficulty Distribution**
- [ ] Histogram displays
- [ ] Shows 4 categories: Easy/Medium/Hard/Very Hard
- [ ] Color-coded appropriately
- [ ] Lists tasks needing redesign (<70% completion)
- [ ] Shows count of flagged tasks
- **Tasks needing redesign:** _____ (count)
- Issues/Suggestions: _____

#### Chart Interactivity

**Test Each Chart:**
- [ ] **Hover interactions** → Tooltips show data
- [ ] **Click interactions** → Drills down or opens detail
- [ ] **Legend interactions** → Can toggle datasets
- [ ] **Responsive** → Works on smaller screens
- [ ] **Print-friendly** → Looks good if printed

#### Refresh Functionality

- [ ] **Auto-refresh indicator** → Shows "Last refreshed: X minutes ago"
- [ ] **Manual refresh button** → Clicking refreshes all data
- [ ] **5-minute auto-refresh** → Wait 5 minutes, check if updates
- [ ] **Timestamp updates** → "X minutes ago" changes over time

### Tab 2: Terminology Legend

#### Content Testing
- [ ] **All 9 metrics documented:**
  - Attendance
  - Task Completion
  - Quality Score
  - Active Builder
  - Struggling Builder (Threshold)
  - Struggling Builder (Composite)
  - Top Performer (Threshold)
  - Top Performer (Composite)
  - 7-Day Class Average

- [ ] **Each metric has:**
  - Clear definition
  - Calculation formula
  - Data source
  - Update frequency
  - Example
  - Important notes (if applicable)

- [ ] **Expandable sections work**
  - Click to expand details
  - Click again to collapse
  - Only one expanded at a time (or multiple?)

- [ ] **Excluded users documented**
  - Staff list (4 users)
  - Volunteers list (6 users)
  - Inactive/duplicates (3 users)
  - Total: 76 active builders shown

#### Comprehension Testing
- [ ] **Definitions are clear** → Non-technical person can understand
- [ ] **Examples are helpful** → Illustrate the calculation
- [ ] **No jargon** → Or jargon is explained
- [ ] **Consistent terminology** → Same terms used throughout

**Clarity Issues:**
```
Which definitions are confusing?
What needs more explanation?
Any contradictions found?
```

---

## 📋 SECTION 4: Data Accuracy Validation

### Cross-Check Known Values

**Test these queries and validate results:**

#### Query 1: Total Active Builders
**Natural Language:** "How many active builders are there?"
**Expected:** 76 (after exclusions)
**Actual:** _____
**Status:** ✅ Pass / ❌ Fail
**Notes:** _____

#### Query 2: Total Tasks
**Natural Language:** "How many curriculum tasks are there?"
**Expected:** 107
**Actual:** _____
**Status:** ✅ Pass / ❌ Fail

#### Query 3: Class Days
**Natural Language:** "How many class days have there been?"
**Expected:** 19 (Sept 6 - Oct 1, excluding Thu/Fri)
**Actual:** _____
**Status:** ✅ Pass / ❌ Fail

#### Query 4: Specific Builder (Dwight Williams, user_id: 141)
**Natural Language:** "Show me Dwight Williams' task completion"
**Expected:** Should show 21 submissions (from earlier analysis)
**Actual:** _____
**Status:** ✅ Pass / ❌ Fail

#### Query 5: Excluded Users
**Natural Language:** "Show me data for Greg Hogue" (user_id: 5)
**Expected:** Should be excluded, no data shown
**Actual:** _____
**Status:** ✅ Pass / ❌ Fail

#### Query 6: No Class Days
**Natural Language:** "Show attendance for Thursday September 12"
**Expected:** No data (no class on Thursdays)
**Actual:** _____
**Status:** ✅ Pass / ❌ Fail

#### Query 7: Quality Scores
**Dashboard:** Check Quality Metrics card
**Expected:** Average score from BigQuery assessments
**Actual Score:** _____
**Total Assessments:** _____
**Status:** ✅ Pass / ❌ Fail

### Metric Calculation Validation

**7-Day Class Average:**
- [ ] **Verify excludes Thu/Fri**
  - Manually count active builders last 7 CLASS days
  - Compare to KPI card "7-day average"
  - Manual count: _____
  - Dashboard shows: _____
  - Match? ✅ / ❌

**Task Completion Rate:**
- [ ] **Verify calculation**
  - Check if "completion" means ANY interaction
  - Or if it requires quality threshold
  - Definition matches Terminology Legend? ✅ / ❌

**Struggling Builder Criteria:**
- [ ] **Threshold method:** <50% completion OR <70% attendance
- [ ] **Composite method:** Score < 40
- [ ] Compare results from both methods
  - Threshold count: _____
  - Composite count: _____
  - Do they identify same builders? _____

---

## 📋 SECTION 5: UX/UI Deep Dive

### Navigation & Flow

**User Journey 1: First-time Facilitator**
- [ ] Lands on homepage → Clear what to do?
- [ ] Chooses Natural Language → Gets immediate value?
- [ ] Asks common question → Finds answer easily?
- [ ] Wants to explore more → Navigation is clear?

**User Journey 2: Daily Check-in (Program Manager)**
- [ ] Lands on homepage → Knows to go to Dashboard?
- [ ] Opens Metrics Dashboard → Sees KPIs immediately?
- [ ] Filters to "Last 7 days" → Gets current snapshot?
- [ ] Identifies struggling builders → Can take action?

**User Journey 3: Data Analysis (Leadership)**
- [ ] Wants to understand trends → Finds H4 chart?
- [ ] Needs to explain metrics → Finds Terminology Legend?
- [ ] Wants cross-cohort comparison → Understands it's Phase 2?

**Navigation Issues:**
```
Any dead ends?
Any confusing labels?
Missing breadcrumbs?
Back button confusion?
```

### Visual Design Evaluation

**Color Scheme:**
- [ ] Consistent across pages
- [ ] Sufficient contrast for readability
- [ ] Color-coding makes sense (green=good, red=bad)
- [ ] Accessible for color-blind users?

**Typography:**
- [ ] Font sizes appropriate
- [ ] Headings clearly differentiated
- [ ] Body text readable
- [ ] No text too small

**Layout:**
- [ ] Good use of whitespace
- [ ] Cards/sections clearly separated
- [ ] Information hierarchy clear
- [ ] No overcrowding

**Interactive Elements:**
- [ ] Buttons clearly look clickable
- [ ] Hover states provide feedback
- [ ] Active states are obvious
- [ ] Disabled states are clear

### Mobile/Responsive Testing

**Test on these screen sizes:**

**Mobile (375px width):**
- [ ] Landing page readable
- [ ] Cards stack vertically
- [ ] Filters accessible (drawer/collapse?)
- [ ] Charts render correctly
- [ ] Touch interactions work
- Issues: _____

**Tablet (768px width):**
- [ ] Layout adjusts appropriately
- [ ] Charts side-by-side or stacked?
- [ ] Filters visible or hidden?
- Issues: _____

**Desktop (1920px width):**
- [ ] Makes good use of space
- [ ] Not too stretched out
- [ ] Readable from normal distance
- Issues: _____

---

## 📋 SECTION 6: Performance Testing

### Load Time Measurements

**Homepage:**
- Load time: _____ seconds
- Time to interactive: _____ seconds
- Status: ✅ <2s / ⚠️ 2-5s / ❌ >5s

**Natural Language Query Page:**
- Initial load: _____ seconds
- Query response time: _____ seconds (average 5 queries)
- Status: ✅ <5s / ⚠️ 5-10s / ❌ >10s

**Metrics Dashboard:**
- Initial load: _____ seconds
- All charts loaded: _____ seconds
- Filter change response: _____ seconds
- Status: ✅ <3s / ⚠️ 3-7s / ❌ >7s

### API Response Times

**Test each endpoint (use browser DevTools Network tab):**

| Endpoint | Response Time | Status |
|----------|--------------|--------|
| `/api/health` | _____ ms | ✅ / ❌ |
| `/api/metrics/kpis` | _____ ms | ✅ / ❌ |
| `/api/metrics/quality` | _____ ms | ✅ / ❌ |
| `/api/metrics/hypotheses/h1` | _____ ms | ✅ / ❌ |
| `/api/metrics/hypotheses/h2` | _____ ms | ✅ / ❌ |
| `/api/metrics/hypotheses/h7` | _____ ms | ✅ / ❌ |
| `/api/query` (NL query) | _____ ms | ✅ / ❌ |

**Performance Issues:**
```
Any endpoints consistently slow (>5s)?
Any failures or timeouts?
Which queries are slowest?
```

---

## 📋 SECTION 7: Edge Cases & Error Scenarios

### Data Edge Cases

**Test these scenarios:**

1. **No data for selected filters**
   - [ ] Filter to future date range
   - [ ] Expected: "No data available" message
   - [ ] Actual: _____

2. **Single builder selected**
   - [ ] Filter to one specific builder
   - [ ] Charts adjust appropriately
   - [ ] Stats make sense for single builder

3. **Empty week (no submissions)**
   - [ ] Filter to week with no activity
   - [ ] How does dashboard handle this?
   - [ ] Is it clear why it's empty?

4. **Invalid cohort**
   - [ ] Try URL: `/metrics?cohort=InvalidCohort`
   - [ ] Graceful error handling?

### Error Recovery

**Test these failures:**

1. **Database down** (can't simulate easily)
   - [ ] Error message user-friendly?
   - [ ] Retry mechanism?

2. **BigQuery fails**
   - [ ] Quality metrics show error?
   - [ ] Rest of dashboard still works?

3. **AI query fails**
   - [ ] Error message helpful?
   - [ ] Can retry immediately?

---

## 📋 SECTION 8: Feature-Specific Testing

### Dual Segmentation Comparison

**In Metrics Dashboard:**
- [ ] **Find "Top Performers" using Threshold method**
  - Count: _____
  - Criteria: >90% completion AND >90% attendance

- [ ] **Find "Top Performers" using Composite Score**
  - Count: _____
  - Criteria: Engagement score >80

- [ ] **Compare results:**
  - Do both methods identify similar builders? _____
  - Which method seems more fair/accurate? _____
  - Recommendation: _____

### BigQuery Integration

**Verify quality data:**
- [ ] **Check /api/metrics/quality**
  - Total assessments: _____
  - Average score: _____
  - Rubric categories: _____ (count)

- [ ] **Cross-reference with BigQuery directly** (if access)
  - Do counts match?
  - Do scores match?
  - Any discrepancies?

### Pattern Analysis (After 8am EST Run)

**Check after tomorrow morning:**
- [ ] **Pattern insights appear** in dashboard
- [ ] **Task analysis available** for tasks with 10+ submissions
- [ ] **Common misconceptions** identified
- [ ] **Tasks flagged for redesign** listed
- [ ] **Recommendations** are actionable

---

## 📋 SECTION 9: User Acceptance Criteria

### For Facilitators

**Can they easily:**
- [ ] See who's absent today?
- [ ] Identify builders needing support?
- [ ] Check yesterday's engagement?
- [ ] Find struggling builders?
- [ ] See task completion trends?

**Pain points:**
```
What takes too many clicks?
What's not obvious?
What's missing?
```

### For Program Managers

**Can they easily:**
- [ ] Generate weekly reports?
- [ ] See cohort-wide trends?
- [ ] Compare weeks?
- [ ] Find quality scores?
- [ ] Export data (when implemented)?

**Reporting needs not met:**
```
What data do they need that's not available?
What visualizations would help?
```

### For Leadership

**Can they easily:**
- [ ] See high-level KPIs at a glance?
- [ ] Understand metric definitions?
- [ ] Trust the data (Terminology Legend helps)?
- [ ] Compare to goals/expectations?

**Missing context:**
```
What additional context would help decision-making?
```

---

## 📋 SECTION 10: Improvement Recommendations

### Quick Wins (Easy to implement)

**Based on testing, suggest:**

**Visual/UI Improvements:**
- [ ] Add loading skeletons (instead of "Loading...")
- [ ] Add empty state illustrations
- [ ] Improve error messages
- [ ] Add keyboard shortcuts
- [ ] Improve mobile navigation
- [ ] Add dark mode toggle

**Feature Enhancements:**
- [ ] Add "Share this view" button (with filter state)
- [ ] Add "Download as PDF/CSV" (already planned for Phase 2)
- [ ] Add "Save favorite queries"
- [ ] Add query history
- [ ] Add comparison mode (Week 1 vs Week 2 side-by-side)
- [ ] Add alerts/notifications

**Data/Metrics:**
- [ ] Add more granular time filters (specific dates)
- [ ] Add builder search/autocomplete
- [ ] Add task category breakdown
- [ ] Add time-of-day patterns
- [ ] Add cohort benchmarks

### Medium-Term Improvements (Require more work)

**Suggested for Phase 2:**
- [ ] Proactive insights panel (AI auto-detects issues)
- [ ] Static KPI dashboard view
- [ ] Cross-cohort comparison (Sept vs June vs March)
- [ ] Predictive analytics (identify at-risk builders earlier)
- [ ] Automated weekly reports via email
- [ ] Integration with Slack/Discord for alerts

### Strategic Recommendations

**Based on usage patterns:**
- [ ] Which features are most used?
- [ ] Which features are never used (can remove)?
- [ ] What questions can't be answered?
- [ ] What manual processes could be automated?

---

## 📋 SECTION 11: Accessibility Testing

### Screen Reader Testing (If possible)
- [ ] All images have alt text
- [ ] Charts have descriptive labels
- [ ] Forms have proper labels
- [ ] Tab order makes sense
- [ ] Skip links available

### Keyboard Navigation
- [ ] Can navigate entire site with keyboard only
- [ ] Tab order is logical
- [ ] All interactive elements reachable
- [ ] Focus indicators visible
- [ ] Escape key closes modals/panels

### Contrast & Readability
- [ ] Text meets WCAG AA standards (4.5:1 ratio)
- [ ] Interactive elements have sufficient contrast
- [ ] Charts are distinguishable without color
- [ ] No reliance on color alone for meaning

---

## 📋 SECTION 12: Security & Privacy

### Data Security
- [ ] **No sensitive data exposed** in client-side code
- [ ] **API keys not visible** in browser
- [ ] **Database credentials secure**
- [ ] **No SQL injection vulnerabilities** (test with malicious queries)

### Privacy
- [ ] **Builder data appropriate** for facilitators to see?
- [ ] **Quality scores** should be visible to all staff?
- [ ] **Pattern analysis** doesn't expose individual builders inappropriately?
- [ ] **Excluded users** truly excluded from all queries?

---

## 📋 SECTION 13: Integration Testing

### Cross-Feature Testing

**Test these workflows:**

1. **Natural Language → Dashboard**
   - [ ] Ask query in NL interface
   - [ ] Navigate to Dashboard
   - [ ] Find same data in metrics
   - [ ] Numbers match between interfaces?

2. **Dashboard → Natural Language**
   - [ ] See interesting pattern in H7 (task difficulty)
   - [ ] Navigate to NL interface
   - [ ] Ask question about that pattern
   - [ ] Get more detailed answer?

3. **Dashboard Filter → Drill-down**
   - [ ] Filter to "Struggling builders"
   - [ ] See list in KPI card
   - [ ] Click builder to see profile
   - [ ] Profile shows why they're struggling?

### Terminology Alignment

**Verify consistency:**
- [ ] **"Task Completion"** means same thing everywhere
  - Natural Language interface definition: _____
  - Dashboard KPI card definition: _____
  - Terminology Legend definition: _____
  - All match? ✅ / ❌

- [ ] **"Struggling Builder"** criteria consistent
  - Mentioned in Natural Language: _____
  - Used in Dashboard: _____
  - Defined in Legend: _____
  - All match? ✅ / ❌

---

## 📋 SECTION 14: Pattern Analysis Testing (After 8am EST Run)

**Test after first cron job runs:**

### Verify Execution
- [ ] Check Vercel logs for cron execution
- [ ] Verify ran at 8am EST (13:00 UTC)
- [ ] No errors in execution log
- [ ] Completion message received

### Data Generated
- [ ] **task_pattern_analysis table has data**
  - Query: `SELECT COUNT(*) FROM task_pattern_analysis`
  - Expected: >0 records
  - Actual: _____

- [ ] **Analysis results make sense**
  - Check one task's pattern analysis
  - Understanding distribution adds to 100%?
  - Recommendations are actionable?

### Dashboard Display
- [ ] **Pattern insights section populates**
- [ ] **Common misconceptions** shown
- [ ] **Tasks needing redesign** listed
- [ ] **Red flags** explained clearly

---

## 📋 SECTION 15: Bugs & Issues Log

**Document all issues found:**

### Critical (Blocks core functionality)
```
Issue #1:
Description:
Steps to reproduce:
Expected:
Actual:
Priority: Critical
```

### Major (Impacts user experience)
```
Issue #1:
Description:
Steps to reproduce:
Expected:
Actual:
Priority: Major
```

### Minor (Cosmetic or edge case)
```
Issue #1:
Description:
Steps to reproduce:
Expected:
Actual:
Priority: Minor
```

---

## 📋 SECTION 16: Final Recommendations

### Overall Assessment

**Functionality Score (1-10):** _____
**UX/UI Score (1-10):** _____
**Data Accuracy Score (1-10):** _____
**Performance Score (1-10):** _____
**Overall Score (1-10):** _____

### Top 5 Improvements Needed (Ranked)

1. _____
2. _____
3. _____
4. _____
5. _____

### Top 5 Strengths (What works well)

1. _____
2. _____
3. _____
4. _____
5. _____

### Ready for Launch?

**Recommendation:**
- [ ] ✅ Yes - Ready to present to Dave
- [ ] ⚠️ Yes with minor fixes - (list fixes needed)
- [ ] ❌ Not yet - (list blockers)

**Critical blockers:**
```
What MUST be fixed before presentation?
```

**Nice-to-haves:**
```
What would strengthen the presentation but isn't critical?
```

---

## 📋 SECTION 17: Specific Test Cases

### Test Case 1: Empty State Handling
**Steps:**
1. Filter to Week 5 (doesn't exist yet)
2. Observe dashboard behavior

**Expected:** Clear "No data for selected period" message
**Actual:** _____
**Pass/Fail:** _____

### Test Case 2: Extreme Values
**Steps:**
1. Ask: "Show me builders with 0% attendance"
2. Observe results

**Expected:** List of builders never attended
**Actual:** _____
**Data looks correct:** ✅ / ❌

### Test Case 3: Time Zone Handling
**Steps:**
1. Check attendance for Sept 6 (first day)
2. Verify dates are EST (not UTC)

**Expected:** Sept 6 data shows correctly
**Actual:** _____
**Timezone correct:** ✅ / ❌

### Test Case 4: Large Dataset
**Steps:**
1. Ask: "Show all task submissions"
2. Observe if system handles large response

**Expected:** Pagination or handles gracefully
**Actual:** _____
**Performance:** ✅ / ❌

### Test Case 5: Concurrent Users (If possible)
**Steps:**
1. Open dashboard in 3 browser tabs
2. Change filters in each tab
3. Observe if any conflicts

**Expected:** Each tab independent
**Actual:** _____
**Issues:** _____

---

## 📋 SECTION 18: Documentation Review

**Review all documentation for completeness:**

- [ ] **README.md** - Clear setup instructions?
- [ ] **PRD** - Complete and accurate?
- [ ] **System Diagram** - Helps understanding?
- [ ] **Terminology Legend** - Comprehensive?
- [ ] **Deployment Guide** - Can someone else deploy?

**Documentation gaps:**
```
What's not documented?
What needs more detail?
What's confusing?
```

---

## 📊 SECTION 19: Test Results Summary

### Completion Checklist

**Functional Testing:**
- Landing Page: _____% tests passed
- Natural Language: _____% tests passed
- Metrics Dashboard: _____% tests passed
- API Endpoints: _____% tests passed

**Data Accuracy:**
- Known values validated: _____% match
- Calculations correct: _____% verified
- Exclusions working: ✅ / ❌

**UX/UI:**
- Navigation clarity: _____ / 5
- Visual design: _____ / 5
- Mobile experience: _____ / 5

**Performance:**
- Load times acceptable: ✅ / ❌
- API responses fast: ✅ / ❌
- No lag or freezing: ✅ / ❌

### Critical Path Verification

**Core user flows all work:**
- [ ] ✅ Homepage → Natural Language → Ask Question → Get Answer → Drill Down
- [ ] ✅ Homepage → Dashboard → View KPIs → Filter Data → Analyze Hypothesis
- [ ] ✅ Dashboard → Terminology Legend → Understand Metric → Apply Knowledge

---

## 🎯 Testing Completion Criteria

**This testing is complete when:**
- [ ] All functionality tests attempted (100% coverage)
- [ ] At least 20 natural language queries tested
- [ ] All 7 hypothesis charts evaluated
- [ ] Data accuracy validated against 10+ known values
- [ ] UX/UI rated across all sections
- [ ] Top 5 improvements identified
- [ ] Launch recommendation provided

---

## 📝 Notes & Observations

**General observations:**
```
First impressions:
Most impressive features:
Biggest frustrations:
Unexpected behaviors:
Questions raised:
```

**For the development team:**
```
Technical debt identified:
Scalability concerns:
Code quality observations:
```

---

**End of Testing Guide**

**Testing Agent: Complete all sections above and provide a comprehensive report with specific recommendations for improvements.**
