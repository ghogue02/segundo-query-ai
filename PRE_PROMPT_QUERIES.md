# Pre-Prompt Query Library

## 15 Curated Queries for Daily Operations

Based on comprehensive analysis of the September 2025 cohort data structure, these queries are optimized for common use cases.

---

## 📊 **Daily Operations** (5 queries)

### 1. "What is today's attendance rate?"
**Use Case**: Daily stand-up, morning check
**Returns**: Current day attendance percentage and count
**Chart Type**: Stat card or simple number
**Typical Result**: "72/77 builders present (93.51%)"

### 2. "Who is absent today?"
**Use Case**: Follow-up on missing builders
**Returns**: List of builders not checked in
**Chart Type**: Table with names and contact info
**Typical Result**: 5 builder names with last attendance date

### 3. "Show me today's task completion"
**Use Case**: Mid-day or end-of-day progress check
**Returns**: Task completion rates for current day's tasks
**Chart Type**: Table or bar chart
**Typical Result**: 6 tasks with 60-85% completion rates

---

## 📈 **Weekly/Trend Analysis** (3 queries)

### 4. "Show attendance trends for this week"
**Use Case**: Weekly review, identify patterns
**Returns**: Daily attendance rates for current week
**Chart Type**: Line chart
**Typical Result**: Mon-Wed + Sat-Sun attendance percentages with trend

### 5. "What's the average engagement score?"
**Use Case**: Program health check
**Returns**: Mean engagement score across all active builders
**Chart Type**: Stat card with distribution
**Typical Result**: "82.5% average engagement (range: 45-99%)"

### 6. "Which tasks had the best completion this week?"
**Use Case**: Identify what's working well
**Returns**: Top 10 tasks by completion rate from current week
**Chart Type**: Bar chart
**Typical Result**: Tasks with 80-95% completion highlighted

---

## ⚠️ **At-Risk & Support** (3 queries)

### 7. "Which builders need additional support?"
**Use Case**: Intervention planning
**Returns**: Builders with low engagement (<60%) or declining metrics
**Chart Type**: Table with engagement breakdown
**Typical Result**: 8-12 builders with specific metric deficiencies
**AI Clarification**: Will ask "By attendance, task completion, or overall engagement?"

### 8. "Show me builders with attendance below 80%"
**Use Case**: Attendance intervention
**Returns**: Builders who've missed 4+ days
**Chart Type**: Table with attendance details
**Typical Result**: 10-15 builders with days missed and last attendance

### 9. "Which builders are falling behind on tasks?"
**Use Case**: Academic support planning
**Returns**: Builders with <50% task completion
**Chart Type**: Table with task progress
**Typical Result**: 15-20 builders with completion rates and gaps

---

## 🏆 **Performance & Success** (3 queries)

### 10. "Who are the top 10 most engaged builders?"
**Use Case**: Recognition, mentorship identification
**Returns**: Top 10 by engagement score
**Chart Type**: Table with score breakdown
**Typical Result**: Jonel (99.68%), Joshua (97.72%), etc.
**Clickable**: Click builder → See full profile

### 11. "Show me builders with perfect attendance"
**Use Case**: Recognition, attendance awards
**Returns**: Builders with 18/18 attendance
**Chart Type**: Table with names and punctuality
**Typical Result**: 30-40 builders with 100% attendance

### 12. "Which builders completed the most tasks?"
**Use Case**: Academic achievement recognition
**Returns**: Top 20 builders by task count
**Chart Type**: Bar chart or table
**Typical Result**: Top performers with 90-102 tasks completed
**Clickable**: Click builder → See which tasks

---

## 📝 **Task & Feedback Analysis** (4 queries)

### 13. "Which tasks have the lowest completion rates?"
**Use Case**: Curriculum improvement, difficult content identification
**Returns**: Bottom 20 tasks by completion rate
**Chart Type**: Table with task details
**Typical Result**: Weekly Feedback (17%), Independent Retros (30-40%)
**Clickable**: Click task → See who completed it
**Insight**: May reveal content that needs redesign

### 14. "Show me Weekly Feedback completion rates"
**Use Case**: Feedback collection monitoring
**Returns**: All Weekly Feedback tasks with completion %
**Chart Type**: Bar chart by week
**Typical Result**: Week 2: 18.67%, Week 3: 20% (low!)
**Action Item**: Follow up on missing feedback

### 15. "What are the latest feedback scores?"
**Use Case**: Pulse check, NPS monitoring
**Returns**: Recent feedback submissions with referral likelihood
**Chart Type**: Table with NPS scores and comments
**Typical Result**: Week 3 feedback, NPS 8-10 range
**Insight**: Sentiment analysis from comments

---

## 🎨 **Visual Organization**

### Homepage Layout:
```
┌─────────────────────────────────────────────────┐
│   Ask about your cohort data                    │
│   77 builders • 18 days • 103 tasks             │
│                                                  │
│   [Daily Ops] [Trends] [At-Risk] [Performers]  │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────┐│
│  │ What is      │  │ Show         │  │ Which  ││
│  │ today's      │  │ attendance   │  │ tasks  ││
│  │ attendance?  │  │ trends?      │  │ lowest?││
│  └──────────────┘  └──────────────┘  └────────┘│
│                                                  │
│  ... (15 total query cards) ...                 │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Color Coding:
- **Green** badges: Daily operations
- **Blue** badges: Trends & analysis
- **Yellow** badges: At-risk & support
- **Purple** badges: Top performers

---

## 💡 **Usage Patterns**

### Morning Routine:
1. "What is today's attendance rate?" → Quick overview
2. "Who is absent today?" → Follow-up calls
3. "Show me today's task completion" → Progress check

### Weekly Review:
1. "Show attendance trends for this week" → Identify patterns
2. "Which tasks had the best completion this week?" → Highlight wins
3. "What's the average engagement score?" → Health metric

### Monthly Planning:
1. "Which builders need additional support?" → Intervention list
2. "Which tasks have the lowest completion rates?" → Curriculum fixes
3. "What are the latest feedback scores?" → Program satisfaction

---

## 🔍 **Query Design Philosophy**

Each query is designed to:
1. **Answer a specific question** - Not vague "show data"
2. **Suggest an action** - Results lead to decisions
3. **Be contextual** - Relevant to program operations
4. **Trigger AI clarification** - Most will ask follow-ups
5. **Return clickable data** - Drill down for details

---

## 📊 **Expected Clarifications**

### "Which builders need additional support?"
**AI will ask**: "How would you like to identify builders needing support? 1) By engagement score (<60%), 2) By attendance patterns (<80%), or 3) By task completion progress (<50%)?"

### "Show attendance trends for this week"
**AI will ask**: "What time period? 1) Current week (Sept 23-29), 2) Last 7 days, or 3) All time (Sept 6-30)?"

### "Which tasks have the lowest completion rates?"
**AI will ask**: "Would you like to see: 1) Bottom 20 tasks across all days, 2) Tasks with <30% completion (never attempted), or 3) Bottom tasks from a specific time period?"

---

## ✅ **Implementation Complete**

**File**: `components/QueryChat.tsx:150-180`

**Changes**:
- Increased from 4 to 15 pre-prompt queries
- Organized in 4 categories (Daily, Trends, At-Risk, Performers)
- Added category badges for visual organization
- Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Updated cohort stats in header (77 builders, 18 days, 103 tasks)

**Status**: ✅ Ready to test!
