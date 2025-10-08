# Testing Guides - Second Query AI

## Overview

This directory contains modular, focused testing guides for comprehensive evaluation of the Second Query AI analytics dashboard.

Each guide is designed to be completed independently in 10-25 minutes, allowing for systematic testing without overwhelming the tester.

---

## Testing Guide Index

### ✅ Guide 01: Initial Load & Navigation
**File:** `01-INITIAL-LOAD-NAVIGATION.md`
**Time:** 10-15 minutes
**Focus:** Landing page, first impressions, navigation structure
**Tests:** 7 sections

**Key Areas:**
- First impressions and clarity
- Thursday/Friday context messaging
- Call-to-action effectiveness
- Navigation between pages
- Mobile responsiveness

---

### ✅ Guide 01A: Regression Test (After Bug Fixes)
**File:** `01A-REGRESSION-AFTER-FIXES.md`
**Time:** 5-10 minutes
**Focus:** Verify critical bug fixes before proceeding
**Tests:** 7 quick verification checks

**Key Areas:**
- Day detection fix verification
- Task count fix verification
- Data consistency across pages
- Performance regression check
- Console error check

**When to Run:** After implementing fixes from Guide 01, before starting Guide 02

---

### ✅ Guide 02: Natural Language Interface
**File:** `02-NATURAL-LANGUAGE-INTERFACE.md`
**Time:** 15-20 minutes
**Focus:** Natural language queries, AI responses, visualizations
**Tests:** 12 sections

**Key Areas:**
- Example query functionality
- Custom query handling
- Error/edge case handling
- Drill-down panels
- Query history
- Export functionality

---

### ✅ Guide 03: Metrics Dashboard Overview
**File:** `03-METRICS-DASHBOARD-OVERVIEW.md`
**Time:** 15-20 minutes
**Focus:** Dashboard layout, filters, auto-refresh, organization
**Tests:** 13 sections

**Key Areas:**
- Dashboard load performance
- Tab structure
- Information architecture
- Filter functionality (time, week, segment, category)
- Multi-filter combinations
- Auto-refresh feature
- Responsive behavior

---

### ✅ Guide 04: KPI Cards Testing
**File:** `04-KPI-CARDS-TESTING.md`
**Time:** 20-25 minutes
**Focus:** 5 main KPI cards, drill-downs, data accuracy
**Tests:** 10 sections

**Key Areas:**
- Attendance Today card
- Attendance Prior Day card
- Task Completion This Week card
- 7-Day Attendance Rate card
- Need Intervention card
- Cross-KPI consistency
- Modal usability
- Export functionality

---

### 🔄 Guide 05: Quality Metrics & Charts *(Coming Soon)*
**Time:** 20-25 minutes
**Focus:** Quality scores, hypothesis charts (H1-H7)

**Will Cover:**
- Overall Quality Score card
- Quality by Category card
- H1: Attendance Drives Completion
- H2: Early Engagement
- H3: Activity Type Preference
- H4: Improvement Trajectory
- H5: Weekend Patterns
- H6: Peer Influence
- H7: Task Difficulty

---

### 🔄 Guide 06: Builder Profiles *(Coming Soon)*
**Time:** 15-20 minutes
**Focus:** Individual builder profile pages

**Will Cover:**
- Profile navigation
- Profile KPI cards
- Attendance history
- Completed tasks list
- Status indicators

---

### 🔄 Guide 07: Terminology & Content *(Coming Soon)*
**Time:** 10-15 minutes
**Focus:** Terminology Legend tab, content quality

**Will Cover:**
- Metric definitions clarity
- Examples and explanations
- Excluded users documentation
- Calculation methodology
- Content accuracy

---

### 🔄 Guide 08: Cross-Feature Validation *(Coming Soon)*
**Time:** 15-20 minutes
**Focus:** Data consistency across features

**Will Cover:**
- Natural Language vs Dashboard comparison
- KPI card vs drill-down consistency
- Cross-chart data validation
- Excluded user verification
- Business logic validation

---

## How to Use These Guides

### For Individual Testing
1. Choose a guide based on the feature area you want to test
2. Complete all tests in sequence (guides are progressive)
3. Fill in observations, scores, and data validation
4. Document issues with screenshots
5. Complete the summary section

### For Comprehensive Testing
1. **Start with Guide 01** (Initial Load & Navigation)
2. **Proceed in order** through Guides 02-08
3. **Track issues** across all guides in a master list
4. **Prioritize issues** using the P1/P2/P3 system
5. **Compile final report** from all guide summaries

### For Quick Spot Checks
1. Jump to the relevant guide for the feature you're testing
2. Complete only the specific test sections needed
3. Cross-reference with other guides if data consistency matters

---

## Testing Checklist

**Before You Begin:**
- [ ] Have browser DevTools ready (F12)
- [ ] Have screenshot tool ready
- [ ] Have spreadsheet/notepad for tracking issues
- [ ] Know the production URL
- [ ] Understand expected baseline metrics (see Appendix)

**As You Test:**
- [ ] Fill in ALL data validation fields
- [ ] Provide scores for ALL UX/UI evaluations
- [ ] Document ALL critical issues with screenshots
- [ ] Note browser/device/OS for context
- [ ] Record time spent per guide

**After Testing:**
- [ ] Compile issues by priority (P1/P2/P3)
- [ ] Create actionable recommendations
- [ ] Assess presentation readiness
- [ ] Share findings with development team

---

## Scoring Guide

### Functionality Scores (1-5)
- **5** - Works perfectly, no issues
- **4** - Works well, minor cosmetic issues
- **3** - Works with moderate issues
- **2** - Barely functional, major issues
- **1** - Broken, does not work

### UX/UI Scores (1-5)
- **5** - Excellent, intuitive, professional
- **4** - Good, clear, minor improvements possible
- **3** - Adequate, usable but confusing in places
- **2** - Poor, frustrating user experience
- **1** - Unusable, major redesign needed

---

## Issue Priority Levels

### P1 - Critical (Blocking)
**Must fix before launch/presentation**
- Data accuracy errors (wrong calculations)
- Broken core functionality (features don't work)
- Security/privacy issues
- Major UX blockers (users can't complete tasks)

### P2 - Important (Should Fix)
**Should address before presentation**
- Moderate data inconsistencies
- Confusing UX/UI elements
- Missing expected features
- Performance issues (slow loads)

### P3 - Nice to Have (Can Wait)
**Address in future iterations**
- Visual polish
- Edge case handling
- Enhancement ideas
- Minor UX improvements

---

## Expected Baseline Metrics

**As of October 2, 2025:**
- Total Builders: 76
- Class Days: 19
- Total Tasks: 112
- Attendance Today: 0 (Thursday - no class)
- Attendance Yesterday: 50 builders (Oct 1)
- Task Completion This Week: 93%
- 7-Day Attendance Rate: 38%
- Need Intervention: 22 builders
- Quality Score: 36/100 (238 assessments)

**Use these to validate if current metrics are in expected ranges.**

---

## Excluded User IDs Reference

**Should NOT appear in any results:**
- Staff: 129, 5, 240, 326
- Volunteers: 327, 329, 331, 330, 328, 332
- Inactive: 324, 325, 9

**Total Active Builders: 76** (after exclusions)

---

## Production URL

**Live Application:** https://segundo-query-ai.vercel.app

**Routes:**
- `/` - Landing page
- `/query` - Natural language interface
- `/metrics` - Metrics dashboard
- `/builder/[id]` - Builder profile (e.g., `/builder/309`)

**Health Check:** `/api/health`

---

## Contact & Reporting

**Issues Found?**
- Document in testing guide
- Take screenshots
- Note browser/device/OS
- Record reproduction steps
- Assign priority level (P1/P2/P3)

**Ready to Report?**
- Compile all guide summaries
- Create master issue list
- Provide actionable recommendations
- Share with development team

---

## Guide Status

| Guide | Status | Completion |
|-------|--------|------------|
| 01: Initial Load & Navigation | ✅ Ready | 100% |
| 02: Natural Language Interface | ✅ Ready | 100% |
| 03: Metrics Dashboard Overview | ✅ Ready | 100% |
| 04: KPI Cards Testing | ✅ Ready | 100% |
| 05: Quality Metrics & Charts | 🔄 In Progress | 0% |
| 06: Builder Profiles | 📋 Planned | 0% |
| 07: Terminology & Content | 📋 Planned | 0% |
| 08: Cross-Feature Validation | 📋 Planned | 0% |

---

**Last Updated:** October 4, 2025
**Version:** 1.0
