# Local Testing Guide - Before Production Deployment

**Purpose:** Test all bug fixes locally before deploying to production
**Environment:** http://localhost:3000 (or http://localhost:3002 if 3000 is in use)
**Time Required:** 10-15 minutes

---

## Quick Start

### 1. Start Local Server

```bash
cd /Users/greghogue/Curricullum/segundo-query-ai
npm run dev
```

**Expected Output:**
```
> segundo-query-ai@0.1.0 dev
> next dev

  ▲ Next.js 15.5.4
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2s
```

**Server URL:** http://localhost:3000
*(If port 3000 is busy, Next.js will use 3001, 3002, etc.)*

---

## 2. Run Regression Test Locally

Use **Guide 01A** but test against **localhost** instead of production:

### Test Checklist (Local Environment)

#### ✅ Test 1: Day Detection
- [ ] Navigate to: http://localhost:3000
- [ ] Check current day: **Saturday, October 4, 2025**
- [ ] Verify: Thursday/Friday message should **NOT** appear
- [ ] Result: ___________

**Expected:** No "No class today" message on Saturday

---

#### ✅ Test 2: Task Count
- [ ] Check "Curriculum Tasks" stat on homepage
- [ ] Value shown: ___
- [ ] Expected: 112 (or 107 if not yet fixed)
- [ ] Result: ___________

---

#### ✅ Test 3: Consistent Day Counts
- [ ] Homepage "Class Days": ___
- [ ] Navigate to: http://localhost:3000/query
- [ ] Query page days: ___
- [ ] Match: [ ] Yes [ ] No

**Expected:** Both show 19 days

---

#### ✅ Test 4: Navigation Test
- [ ] Home → Query → Metrics → Home
- [ ] All pages load: [ ] Yes [ ] No
- [ ] No errors: [ ] Yes [ ] No

---

#### ✅ Test 5: Browser Console
- [ ] Open DevTools (F12)
- [ ] Console tab
- [ ] Refresh homepage
- [ ] Errors: ___
- [ ] Clean: [ ] Yes [ ] No

---

## 3. Test Specific Bug Fixes

### Fix #1: Day Detection Logic

**Current Code (app/page.tsx line 155):**
```javascript
{(new Date().getDay() === 4 || new Date().getDay() === 5) && (
  <Card>
    <p>No class today ({new Date().toLocaleDateString('en-US', { weekday: 'long' })})</p>
  </Card>
)}
```

**Test Cases:**

| Day | getDay() | Should Show Message? | Local Result |
|-----|----------|----------------------|--------------|
| Sunday | 0 | No | ___ |
| Monday | 1 | No | ___ |
| Tuesday | 2 | No | ___ |
| Wednesday | 3 | No | ___ |
| Thursday | 4 | **YES** | ___ |
| Friday | 5 | **YES** | ___ |
| Saturday | 6 | No | ___ |

**To Test Different Days Locally:**

You can temporarily mock the day in your code:

```javascript
// TEMPORARY TEST CODE - Remove before deployment
const testDay = 4; // Change to 0-6 to test different days
{(testDay === 4 || testDay === 5) && (
  <Card>
    <p>No class today (Test: {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][testDay]})</p>
  </Card>
)}
```

**Test each day (0-6) and verify correct behavior**

---

### Fix #2: Task Count (if implementing fix)

**Check Query Location:**

1. Open: `/app/page.tsx`
2. Find line ~147: `<div className="text-4xl font-bold text-black">107</div>`
3. This is **hardcoded** - not queried from database

**Options:**

**Option A: Quick Fix (Hardcode to 112)**
```javascript
<div className="text-4xl font-bold text-black">112</div>
```

**Option B: Dynamic Query (Better)**
```javascript
// Add to page.tsx (server component)
import { sql } from '@vercel/postgres';

export default async function HomePage() {
  // Query task count
  const { rows } = await sql`
    SELECT COUNT(*) as task_count
    FROM tasks t
    JOIN curriculum_days cd ON t.curriculum_day_id = cd.day_id
    WHERE cd.cohort = 'September 2025'
  `;
  const taskCount = rows[0]?.task_count || 107;

  return (
    // ... in JSX
    <div className="text-4xl font-bold text-black">{taskCount}</div>
  );
}
```

**Test After Change:**
- [ ] Refresh http://localhost:3000
- [ ] Task count shows: ___
- [ ] Expected: 112

---

### Fix #3: Inconsistent Day Counts

**Check Both Locations:**

**Homepage** (`/app/page.tsx` line ~142):
```javascript
<div className="text-4xl font-bold text-black">19</div>
<div className="text-sm text-gray-600 mt-1">Class Days</div>
```

**Query Page** (`/app/query/page.tsx`):
- Search for day count display
- Ensure it also shows "19 days"

**Test:**
- [ ] Homepage shows: 19 days
- [ ] Query page shows: 19 days
- [ ] Match: [ ] Yes [ ] No

---

## 4. Performance Check

### Load Time Test

1. Open DevTools → Network tab
2. Hard refresh (Cmd+Shift+R)
3. Note "DOMContentLoaded" time
4. Note "Load" time

**Results:**
- DOMContentLoaded: ___ ms
- Load: ___ ms
- Expected: <3000ms (3 seconds)

### Lighthouse Score (Optional)

1. DevTools → Lighthouse tab
2. Run Desktop audit
3. Note scores

**Scores:**
- Performance: ___/100
- Accessibility: ___/100
- Best Practices: ___/100
- SEO: ___/100

---

## 5. Cross-Page Consistency

### Stats Comparison

| Stat | Homepage | Query Page | Metrics Dashboard | Consistent? |
|------|----------|------------|-------------------|-------------|
| Builders | ___ | ___ | ___ | [ ] Yes [ ] No |
| Days | ___ | ___ | ___ | [ ] Yes [ ] No |
| Tasks | ___ | ___ | ___ | [ ] Yes [ ] No |

**All should match:**
- Builders: 76
- Days: 19
- Tasks: 112 (or 107 if not fixed)

---

## 6. Local Testing Checklist Summary

- [ ] ✅ Local server running on http://localhost:3000
- [ ] ✅ Day detection working correctly (no message on Saturday)
- [ ] ✅ Task count is correct (112 or documented value)
- [ ] ✅ Day counts match across pages (both show 19)
- [ ] ✅ Navigation works smoothly
- [ ] ✅ No console errors
- [ ] ✅ Load time <3 seconds
- [ ] ✅ All stats consistent across pages

**Overall Local Test:**
- [ ] ✅ PASS - Ready to deploy to production
- [ ] ⚠️ PARTIAL - Some issues remain
- [ ] ❌ FAIL - Must fix before deploying

---

## 7. Deploy to Production (After Local Tests Pass)

### Deployment Steps

```bash
# 1. Ensure all changes are saved
git status

# 2. Add changes
git add .

# 3. Commit with descriptive message
git commit -m "Fix: Day detection bug, task count, and data consistency issues"

# 4. Push to main (triggers Vercel deployment)
git push origin main

# 5. Wait for Vercel deployment (~2-3 minutes)
# Check status at: https://vercel.com/dashboard

# 6. Verify deployment
curl https://segundo-query-ai.vercel.app/api/health
```

### Post-Deployment Verification

After deployment completes:

1. **Wait 2-3 minutes** for Vercel build
2. **Hard refresh** production site (Cmd+Shift+R)
3. **Run Guide 01A** against production URL
4. **Verify all fixes** are live

---

## 8. Rollback Plan (If Issues)

If production deployment has issues:

```bash
# Option 1: Revert last commit
git revert HEAD
git push origin main

# Option 2: Redeploy previous version in Vercel dashboard
# Go to: https://vercel.com → Deployments → Click previous deployment → Promote to Production
```

---

## Common Issues & Solutions

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or let Next.js use different port (3001, 3002, etc.)
# It will auto-select available port
```

### Issue: Changes not showing

**Solution:**
```bash
# Hard refresh in browser
Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)

# Or restart dev server
# Ctrl+C to stop, then npm run dev again
```

### Issue: Database connection errors

**Solution:**
```bash
# Verify .env.local has correct credentials
cat .env.local | grep POSTGRES

# Should show:
# POSTGRES_HOST=34.57.101.141
# POSTGRES_PORT=5432
# POSTGRES_DB=segundo-db
# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=Pursuit1234!
```

---

## Testing Notes

**Environment:** Local Development
**URL:** http://localhost:3000
**Date:** ______________
**Tester:** ______________

**Issues Found:**
1.
2.
3.

**Ready for Production:** [ ] Yes [ ] No

**Notes:**

---

## Next Steps

**After Local Tests Pass:**
1. ✅ Commit changes to git
2. ✅ Push to GitHub (triggers Vercel deployment)
3. ✅ Wait for deployment (2-3 minutes)
4. ✅ Run Guide 01A on production URL
5. ✅ Verify all fixes are live
6. ✅ Proceed to Guide 02 testing

**Production URL After Deployment:**
https://segundo-query-ai.vercel.app

---

**Quick Reference:**
- Local URL: http://localhost:3000
- Production URL: https://segundo-query-ai.vercel.app
- Guide 01A: `/docs/testing/01A-REGRESSION-AFTER-FIXES.md`
- Bug Report: `/docs/testing/BUG-REPORT-001-DAY-DETECTION.md`
