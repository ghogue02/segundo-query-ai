# Testing Guide 02: Natural Language Interface
**Version:** 1.1
**Focus:** Natural language query functionality, AI responses, visualizations, dynamic stats
**Time Required:** 20-25 minutes
**Test Environment:** Local (http://localhost:3000)

---

## Overview

This guide tests the natural language query interface where users can ask questions in plain English and receive AI-generated responses with visualizations. **Version 1.1 includes new tests for dynamic statistics consistency.**

---

## ⚠️ Pre-Test Requirements

Before starting Test 2.1, complete these prerequisite checks:

### Development Server
- [ ] Server running: `npm run dev`
- [ ] Accessible at: http://localhost:3000
- [ ] No console errors on startup

### Database Connection
- [ ] PostgreSQL database accessible
- [ ] Environment variables configured (.env.local)
- [ ] API endpoints responding

### Browser Setup
- [ ] Clear browser cache
- [ ] Open Developer Tools (Console tab)
- [ ] Disable browser extensions that might interfere

---

## Test 2.0: Dynamic Stats Verification (NEW)

### Purpose
Verify that the query page displays accurate, dynamic statistics that match the homepage and database.

### Actions
1. Navigate to http://localhost:3000/query
2. Locate the stats display under "Ask about your cohort data"
3. Record the displayed statistics
4. Open browser Developer Tools → Console tab
5. Check for any API errors

### Functionality Checks
- [ ] Stats display is visible
- [ ] Three stats are shown: builders, days, tasks
- [ ] No "NaN" or undefined values
- [ ] No console errors related to `/api/stats`
- [ ] Stats load within 2 seconds

### Data Recording
**Query Page Stats (http://localhost:3000/query):**
- Active Builders: ___
- Class Days: ___
- Curriculum Tasks: ___

**Browser Console:**
- [ ] No errors
- [ ] No warnings related to stats API
- [ ] Stats API call visible in Network tab

### Expected Values (From Database)
According to CLAUDE.md:
- **Active Builders:** 75 (78 total minus 3 excluded)
- **Class Days:** 21 (as of October 4, 2025)
- **Curriculum Tasks:** ~112+ (dynamic, depends on curriculum)

**Excluded Users:** 129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332

### Cross-Page Consistency Check
1. Open new tab: http://localhost:3000 (homepage)
2. Scroll to stats section
3. Record homepage stats

**Homepage Stats (http://localhost:3000):**
- Active Builders: ___
- Class Days: ___
- Curriculum Tasks: ___

**Do stats match query page?**
- [ ] ✅ All three stats match exactly
- [ ] ⚠️ Some stats differ (record differences below)
- [ ] ❌ All stats differ

**If stats differ, record discrepancies:**
- Builders: Homepage ___ vs Query ___
- Days: Homepage ___ vs Query ___
- Tasks: Homepage ___ vs Query ___

### API Endpoint Test
1. Open new browser tab
2. Navigate to: http://localhost:3000/api/stats
3. View raw JSON response

**API Response:**
```json
{
  "activeBuilders": ___,
  "classDays": ___,
  "totalTasks": ___
}
```

**Does API response match displayed stats?**
- [ ] ✅ Matches query page
- [ ] ✅ Matches homepage
- [ ] ❌ Differs (record differences)

### Error Handling Test
1. Stop the development server (Ctrl+C)
2. Reload query page
3. Observe behavior

**Fallback Behavior:**
- [ ] Page still loads
- [ ] Shows fallback stats (75, 18, 107)
- [ ] Displays error message
- [ ] Other: _______________

### Pass Criteria
- ✅ **PASS:** Stats match across query page, homepage, and API
- ⚠️ **WARNING:** Stats load but don't match (investigate cause)
- ❌ **FAIL:** Stats don't load or show errors

### UX/UI Evaluation

**Dynamic Stats Quality (1-5):**
- Load speed: ___/5
- Consistency across pages: ___/5
- Error handling: ___/5
- Visual presentation: ___/5

**Observations:**
- Stats update frequency:
- API response time:
- Any flickering or loading states:

---

## Test 2.1: Interface Layout & Design

### Actions
1. Navigate to http://localhost:3000/query
2. Observe the layout and design
3. Identify key interface elements

### Functionality Checks
- [ ] Query input field is visible
- [ ] Example queries are displayed
- [ ] Submit button is present
- [ ] No layout errors or broken elements

### UX/UI Evaluation

**Layout Quality (1-5):**
- Input area prominence: ___/5
- Example query organization: ___/5
- Overall page layout: ___/5
- Visual hierarchy: ___/5

**Design Observations:**
- Input field size/design:
- Example query presentation:
- Any confusing elements:

---

## Test 2.2: Example Query - Attendance

### Actions
1. Find example query: "What is today's attendance rate?"
2. Click or copy the query
3. Submit the query
4. Wait for response

### Functionality Checks
- [ ] Query submits successfully
- [ ] Loading indicator appears
- [ ] Response appears within 10 seconds
- [ ] Response is relevant to attendance
- [ ] No error messages

### Data Validation
**Response received:**
- Attendance count: ___
- Total builders: ___
- Percentage: ___%
- Date referenced: ___

**Expected for Thursday/Friday:** 0 attendance (no class)
**Expected for class days:** 30-60 builders

**Is data reasonable?** [ ] Yes [ ] No [ ] Unsure

### UX/UI Evaluation

**Response Quality (1-5):**
- Response clarity: ___/5
- Visualization quality (if shown): ___/5
- Loading state design: ___/5
- Response formatting: ___/5

**Observations:**
- Response time: ___ seconds
- Was response helpful:
- Any confusing elements:

---

## Test 2.3: Example Query - Task Completion

### Actions
1. Submit query: "Show me task completion by builder"
2. Wait for response
3. Review the data and visualization

### Functionality Checks
- [ ] Query processes successfully
- [ ] Response includes builder names
- [ ] Response includes completion data
- [ ] Visualization is generated (chart or table)
- [ ] Data is sortable or organized

### Data Validation
**Response includes:**
- Number of builders shown: ___
- Completion rate range: ___% to ___%
- Visualization type: ___________

**Spot Check 3 Builders:**
1. Builder name: ___ | Completion: ___%
2. Builder name: ___ | Completion: ___%
3. Builder name: ___ | Completion: ___%

**Do these rates seem reasonable?** [ ] Yes [ ] No

### UX/UI Evaluation

**Visualization Quality (1-5):**
- Chart readability: ___/5
- Data organization: ___/5
- Legend clarity (if applicable): ___/5
- Overall presentation: ___/5

**Observations:**

---

## Test 2.4: Example Query - Low Completion Tasks

### Actions
1. Submit query: "Which tasks have the lowest completion rates?"
2. Review response

### Functionality Checks
- [ ] Query processes successfully
- [ ] Response lists specific tasks
- [ ] Completion rates are shown
- [ ] Tasks are ranked/ordered

### Data Validation
**Response includes:**
- Number of tasks shown: ___
- Lowest completion rate: ___%
- Highest completion rate in results: ___%

**Top 3 Lowest Completion Tasks:**
1. Task: ___ | Rate: ___%
2. Task: ___ | Rate: ___%
3. Task: ___ | Rate: ___%

**Are task names clear/identifiable?** [ ] Yes [ ] No

### UX/UI Evaluation

**Data Presentation (1-5):**
- Task name clarity: ___/5
- Data formatting: ___/5
- Actionability of information: ___/5

**Observations:**

---

## Test 2.5: Custom Query - Top Performers

### Actions
1. Type your own query: "Who are the top 5 most engaged builders this week?"
2. Submit and review response

### Functionality Checks
- [ ] Custom query is accepted
- [ ] AI understands the intent
- [ ] Response is relevant
- [ ] Builder names are listed
- [ ] Engagement metrics are shown

### Data Validation
**Response includes:**
- Number of builders: ___
- Engagement criteria shown: ___
- Data seems accurate: [ ] Yes [ ] No

### UX/UI Evaluation

**AI Understanding Quality:**
- [ ] Perfectly understood query
- [ ] Understood with minor interpretation
- [ ] Somewhat off-target response
- [ ] Did not understand query

**Response Usefulness (1-5):** ___/5

---

## Test 2.6: Custom Query - Trends

### Actions
1. Type: "Show attendance trends over the last 2 weeks"
2. Submit and review

### Functionality Checks
- [ ] Query processes successfully
- [ ] Time-series data is shown
- [ ] Trend visualization appears (line chart expected)
- [ ] Date range is correct (last 2 weeks)

### Data Validation
**Response includes:**
- Date range: ___ to ___
- Number of data points: ___
- Trend direction: [ ] Increasing [ ] Decreasing [ ] Stable [ ] Variable

### UX/UI Evaluation

**Chart Quality (1-5):**
- Axis labels: ___/5
- Readability: ___/5
- Trend clarity: ___/5

**Observations:**

---

## Test 2.7: Vague Query Handling

### Actions
1. Submit intentionally vague query: "Show me data"
2. Observe response

### Functionality Checks
- [ ] System handles vague query gracefully
- [ ] Error message or clarification request appears
- [ ] OR system makes reasonable assumption
- [ ] No crash or blank response

### UX/UI Evaluation

**Error Handling Quality:**
- [ ] Helpful error message
- [ ] Suggests how to refine query
- [ ] Still provides some useful response
- [ ] Poor error handling

**Observations:**

---

## Test 2.8: Impossible Query Handling

### Actions
1. Submit impossible query: "What will attendance be next week?"
2. Observe response

### Functionality Checks
- [ ] System handles gracefully
- [ ] Explains it cannot predict future
- [ ] Offers alternative (e.g., historical trends)
- [ ] No crash or confusing response

### UX/UI Evaluation

**AI Response Quality:**
- [ ] Polite and professional
- [ ] Explains limitation
- [ ] Offers alternative
- [ ] Confusing or unhelpful

**Observations:**

---

## Test 2.9: Interactive Drill-Down Panel

### Actions
1. Submit a query that returns builder list
2. Look for clickable elements in response
3. Click on a builder name (if clickable)

### Functionality Checks
- [ ] Interactive elements are indicated (hover states)
- [ ] Clicking opens drill-down panel or modal
- [ ] Additional builder details are shown
- [ ] Panel/modal can be closed easily

### UX/UI Evaluation

**Interactivity Quality (1-5):**
- Clickability indication: ___/5
- Panel/modal design: ___/5
- Detail information usefulness: ___/5
- Close/dismiss ease: ___/5

**Observations:**

---

## Test 2.10: Multiple Queries in Session

### Actions
1. Submit 3 different queries in sequence
2. Observe query history (if present)
3. Check if previous results remain visible

### Functionality Checks
- [ ] Multiple queries can be submitted
- [ ] Query history is maintained
- [ ] Previous results remain accessible
- [ ] New results don't break previous ones

### UX/UI Evaluation

**Conversation Flow (1-5):**
- Multi-query handling: ___/5
- History visibility: ___/5
- Context preservation: ___/5

**Observations:**

---

## Test 2.11: Copy/Export Functionality

### Actions
1. Submit any query with results
2. Look for copy or export options
3. Test any export buttons

### Functionality Checks
- [ ] Results can be copied
- [ ] Export to CSV option exists (if applicable)
- [ ] Export works correctly
- [ ] Exported data matches displayed data

### UX/UI Evaluation

**Export Usability:**
- Export button visibility: ___/5
- Export process ease: ___/5

**Observations:**

---

## Test 2.12: Long Query Handling

### Actions
1. Submit a very long query (150+ words)
2. Observe system behavior

### Functionality Checks
- [ ] Long query is accepted
- [ ] No character limit error
- [ ] Response is still relevant
- [ ] No performance issues

### UX/UI Evaluation

**Handling Quality:**
- [ ] Handles long queries well
- [ ] Shows character limit warning
- [ ] Rejects overly long queries appropriately

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

### AI Response Quality Issues
1.
2.
3.

### Data Accuracy Concerns
1.
2.
3.

### Strengths
1.
2.
3.

### Overall Natural Language Interface Score
- **Dynamic Stats (Test 2.0):** ___/5
- Functionality: ___/5
- AI Response Quality: ___/5
- Data Accuracy: ___/5
- UX/UI: ___/5
- **Overall: ___/5**

### Critical Pre-Production Checklist
Based on 01a fixes, verify these items are working:

**Dynamic Stats (Must All Pass):**
- [ ] Stats API endpoint responds correctly (http://localhost:3000/api/stats)
- [ ] Homepage stats are dynamic (not hardcoded 76, 19, 107)
- [ ] Query page stats are dynamic (not hardcoded 75, 18, 107)
- [ ] All three pages show identical stats
- [ ] H4 metrics chart loads without 500 error

**If any checkbox above is unchecked:**
- 🚨 **DO NOT proceed to production**
- 🔧 Review `/docs/testing/01a-fixes-completed.md`
- 🔧 Re-run fixes from Test 01a

### Ready for Next Test?
- [ ] Yes, all dynamic stats tests pass, proceed to Test 03: Metrics Dashboard Overview
- [ ] No, issues must be addressed first (document below)

**Issues to Address:**
1.
2.
3.

---

**Tester:** _______________
**Date:** _______________
**Time Spent:** ___ minutes
