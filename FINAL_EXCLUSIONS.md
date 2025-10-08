# Final Exclusion List - Updated September 30, 2025

## Complete Exclusion List (13 users)

### Staff (3):
- **129**: Afiya Augustine
- **5**: Greg Hogue
- **240/326**: Carlos Godoy (duplicate accounts)

### Inactive Builders (3):
- **324**: Farid ahmad Sofizada (duplicate account)
- **325**: Aaron Glaser
- **9**: Laziah Bernstine

### Volunteers (7):
- **327**: Jason Specland
- **329**: Brian Heckman
- **331**: Hasani Blackwell
- **330**: David Caiafa
- **328**: Rivas Elvimar ✨ NEW
- **332**: Joe Fabisevich ✨ NEW

---

## Final Counts

**Active Builders**: 75 (was 77)
**Total Class Days**: 18
**Total Tasks**: 107

**Exclusion String**: `129,5,240,324,325,326,9,327,329,331,330,328,332`

---

## Files Updated

1. `.env.local` - EXCLUDED_USER_IDS, ACTIVE_BUILDERS_COUNT=75
2. `lib/claude.ts` - Business rules, all example queries (/ 77 → / 75)
3. `lib/queries/taskQueries.ts` - Task completion rates (/ 77 → / 75)
4. `components/QueryChat.tsx` - Homepage display (77 → 75)

---

## Verification

```sql
SELECT COUNT(*) FROM users
WHERE cohort = 'September 2025'
  AND active = true
  AND user_id NOT IN (129,5,240,324,325,326,9,327,329,331,330,328,332);
-- Returns: 75 ✅
```

---

## Status

**Exclusions**: ✅ Complete (13 users)
**Active Count**: ✅ 75 builders
**All Queries**: ✅ Using correct denominators
**System**: ✅ Working

**No more volunteers in any query results!**
