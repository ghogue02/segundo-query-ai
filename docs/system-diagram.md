# Second Query AI - System Flow Diagram

## How It Works (Visual Guide)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                             │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │  "Which builders completed   │
                    │   the most tasks?"           │
                    │                              │
                    │  Natural Language Question   │
                    └──────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         AI PROCESSING                                │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │   Claude AI Analyzes:        │
                    │   • What data is needed?     │
                    │   • Which tables to query?   │
                    │   • How to filter results?   │
                    └──────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │   Generates SQL Query:       │
                    │   SELECT builder_name,       │
                    │   COUNT(*) as tasks          │
                    │   FROM submissions...        │
                    └──────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                               │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │   PostgreSQL Database        │
                    │   • 75 Active Builders       │
                    │   • 107 Curriculum Tasks     │
                    │   • 18 Class Days            │
                    │   • Real-time Submissions    │
                    └──────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │   Returns Raw Data:          │
                    │   [                          │
                    │     {builder: "Alex", 45},   │
                    │     {builder: "Sam", 42},    │
                    │     ...                      │
                    │   ]                          │
                    └──────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      VISUALIZATION ENGINE                            │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │   AI Determines Best View:   │
                    │   • Bar chart for ranking    │
                    │   • Line chart for trends    │
                    │   • Table for details        │
                    └──────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FINAL DISPLAY                                │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌───────────────────────────────────────────────┐
         │  📊 Interactive Chart                         │
         │  ┌─────────────────────────────────────┐     │
         │  │ Alex        ████████████████ 45     │     │
         │  │ Sam         ███████████████  42     │     │
         │  │ Jordan      ██████████████   38     │     │
         │  └─────────────────────────────────────┘     │
         │                                               │
         │  💬 Natural Language Summary:                 │
         │  "Alex leads with 45 completed tasks,         │
         │   followed by Sam with 42..."                 │
         │                                               │
         │  🔍 [Click any bar to see builder details]   │
         └───────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │   Drill-Down Panel Opens     │
                    │   • Individual task list     │
                    │   • Completion dates         │
                    │   • Performance metrics      │
                    └──────────────────────────────┘
```

## Key Components

### 1️⃣ **User Input Layer**
- Simple text box for natural language questions
- Pre-loaded templates for common queries
- No SQL knowledge required

### 2️⃣ **AI Translation Layer**
- Claude AI interprets user intent
- Converts natural language → database query
- Handles complex filtering automatically

### 3️⃣ **Database Layer**
- PostgreSQL with cohort data
- Filters for September 2025 cohort
- Excludes staff/volunteers automatically

### 4️⃣ **Visualization Layer**
- Automatically chooses best chart type
- Interactive charts (click to explore)
- Natural language summaries

### 5️⃣ **Drill-Down Layer**
- Click any data point for details
- Builder profiles with full history
- Task details with submissions

---

## Example Flow

**Question:** "Show me attendance for last week"

1. **AI understands:** Need attendance data, filtered by date range
2. **Queries database:** Gets check-in records for past 7 days
3. **Creates visualization:** Line chart showing daily attendance
4. **Adds summary:** "Average attendance was 68/75 builders (90.7%)"
5. **Enables drill-down:** Click any day to see who was absent

---

## Technology Stack (Simple Terms)

| Component | What It Does |
|-----------|--------------|
| **Frontend** | The interface you see and interact with |
| **Claude AI** | Understands questions and generates answers |
| **PostgreSQL** | Stores all cohort data (builders, tasks, attendance) |
| **Vercel** | Hosts the app so it's accessible from anywhere |
| **Next.js** | Framework that connects everything together |

---

**Result:** Ask questions → Get instant visual answers → Explore deeper details

No manual SQL queries. No complex reports. Just ask and explore.
