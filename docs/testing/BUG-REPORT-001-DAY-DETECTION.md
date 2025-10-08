# Bug Report #001: Day Detection Display Issue

**Severity:** 🔴 CRITICAL
**Status:** CONFIRMED
**Date Reported:** October 4, 2025
**Reported By:** Claude AI Testing Agent
**Affected Component:** Landing Page (`app/page.tsx`)

---

## Summary

The "No class today" message is displaying on **Saturday** when it should only appear on **Thursday** and **Friday**.

---

## Expected Behavior

The Thursday/Friday notice should:
- ✅ Display on Thursday (day 4)
- ✅ Display on Friday (day 5)
- ❌ **NOT** display on Saturday (day 6)
- ❌ **NOT** display on Sunday, Monday, Tuesday, Wednesday (days 0, 1, 2, 3)

---

## Actual Behavior

On **Saturday, October 4, 2025**, the message displays:
```
No class today (Thursday)
Builders are off on Thursdays and Fridays. Class resumes Saturday.
```

**Issues:**
1. Message is showing when it shouldn't (today is Saturday, not Thu/Fri)
2. Message incorrectly states "Thursday" instead of "Saturday"

---

## Root Cause Analysis

### Code Review (`app/page.tsx` lines 155-168):

```javascript
{(new Date().getDay() === 4 || new Date().getDay() === 5) && (
  <Card className="mt-8 max-w-4xl mx-auto bg-gray-50 border-gray-300">
    <CardContent className="p-6">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">
          No class today ({new Date().toLocaleDateString('en-US', { weekday: 'long' })})
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Builders are off on Thursdays and Fridays. Class resumes Saturday.
        </p>
      </div>
    </CardContent>
  </Card>
)}
```

### Verification:

```javascript
// Today (October 4, 2025):
new Date().getDay() // Returns: 6 (Saturday)

// Logic check:
(6 === 4 || 6 === 5) // Returns: false

// Therefore, the message SHOULD NOT render
```

**Conclusion:** The **code logic is correct**. The message should NOT be showing on Saturday.

---

## Hypothesis: Possible Causes

### 1. Server-Side Rendering vs Client-Side Mismatch
**Likelihood:** HIGH

Next.js may be rendering the component on the server (which could be in a different timezone) and then hydrating on the client, causing a mismatch.

**Test:** Check if server timezone differs from local timezone.

### 2. Caching/Stale Build
**Likelihood:** MEDIUM

The production deployment may have a cached version from Thursday/Friday.

**Test:** Hard refresh, check deployment timestamp.

### 3. Timezone Issue
**Likelihood:** MEDIUM

If the server is in UTC and it's early Saturday UTC but still Friday in server's interpretation.

**Test:** Log server time vs client time.

---

## Recommended Fixes

### Fix #1: Client-Side Only Rendering (Immediate)

Force the message to only render on the client to avoid SSR/hydration mismatches:

```javascript
'use client';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [currentDay, setCurrentDay] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentDay(new Date().getDay());
  }, []);

  // ... rest of component

  // In JSX:
  {mounted && (currentDay === 4 || currentDay === 5) && (
    <Card>
      {/* Message content */}
    </Card>
  )}
}
```

**Pros:**
- Eliminates SSR/hydration mismatch
- Ensures client-side date is used

**Cons:**
- Adds useState/useEffect complexity
- Slight delay in showing message

---

### Fix #2: Use Consistent Timezone (Production-Ready)

Ensure both server and client use the same timezone reference (EST):

```javascript
// Create a utility function
const isThursdayOrFriday = () => {
  const now = new Date();
  // Convert to EST (UTC-5)
  const estOffset = -5 * 60; // EST is UTC-5
  const localOffset = now.getTimezoneOffset();
  const estTime = new Date(now.getTime() + (estOffset - localOffset) * 60 * 1000);
  const dayOfWeek = estTime.getDay();
  return dayOfWeek === 4 || dayOfWeek === 5;
};

// In JSX:
{isThursdayOrFriday() && (
  <Card>
    {/* Message content */}
  </Card>
)}
```

**Pros:**
- Timezone-consistent
- Production-ready
- Matches business logic (cohort is EST-based)

**Cons:**
- More complex logic

---

### Fix #3: Suppress Hydration Warning (Quick Fix)

If the issue is hydration mismatch only:

```javascript
{(new Date().getDay() === 4 || new Date().getDay() === 5) && (
  <Card suppressHydrationWarning className="mt-8 max-w-4xl mx-auto bg-gray-50 border-gray-300">
    {/* Content */}
  </Card>
)}
```

**Pros:**
- Minimal code change

**Cons:**
- Doesn't fix root cause, just suppresses warning
- Not recommended for production

---

## Immediate Action Items

1. ✅ Verify production deployment timezone settings
2. ✅ Check Vercel deployment logs for build time
3. ✅ Test with hard refresh to rule out caching
4. ✅ Implement Fix #2 (timezone-consistent logic)
5. ✅ Add logging to confirm day detection on both server and client

---

## Testing Verification

After implementing fix:

**Test Cases:**
- [ ] Monday: Message does NOT show
- [ ] Tuesday: Message does NOT show
- [ ] Wednesday: Message does NOT show
- [ ] Thursday: Message DOES show (correctly states "Thursday")
- [ ] Friday: Message DOES show (correctly states "Friday")
- [ ] Saturday: Message does NOT show
- [ ] Sunday: Message does NOT show

---

## Impact Assessment

**User Impact:** MEDIUM
- Misleading information about class schedule
- Could cause confusion about when classes are held
- Undermines trust in data accuracy

**Business Impact:** HIGH (before Wednesday presentation)
- Must be fixed before demo to Dave
- Reflects poorly on overall system reliability

**Technical Debt:** LOW
- Fix is straightforward once root cause confirmed
- Should take <30 minutes to implement and test

---

## Resolution

**Status:** PENDING INVESTIGATION
**Assigned To:** Development Team
**Target Resolution:** Before October 7, 2025 (Wednesday presentation)

**Next Steps:**
1. Verify production environment timezone
2. Implement recommended Fix #2
3. Deploy to production
4. Re-test on all 7 days of the week
5. Update test results documentation

---

**Related Issues:**
- Task count discrepancy (107 vs 112)
- Inconsistent day counts (19 vs 18)

**Documentation:**
- Testing Results: `/docs/testing/RESULTS-01-INITIAL-LOAD-NAVIGATION.md`
- Source Code: `/app/page.tsx` (lines 155-168)
