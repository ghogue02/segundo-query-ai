# Segundo Query AI

Natural language analytics dashboard for September 2025 cohort data.

## Features

- 🤖 **Natural Language Queries** - Ask questions in plain English
- 📊 **Auto-Generated Charts** - Bar, line, pie, area, scatter, and table views
- ⚡ **Real-time Results** - Instant query execution and visualization
- 🎯 **Pre-built Templates** - 20+ common queries ready to use
- 🧠 **AI-Powered Insights** - Claude generates actionable insights
- 📈 **Metrics Dashboard** - 5 KPI cards + 7 hypothesis charts
- ♿ **Fully Accessible** - WCAG 2.1 Level AA compliant
- 📅 **Dynamic Weeks** - Auto-detects current week (8 weeks total)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local` with your credentials (see `.env.example`).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts, Chart.js
- **Database**: PostgreSQL + BigQuery
- **AI**: Anthropic Claude 3.5 Sonnet

## Deployment

See deployment guide in `/docs/PRODUCTION-DEPLOYMENT-CHECKLIST.md`

## License

MIT
