# shadcn/ui + Tailwind v4 Best Practices & Rules

## 🎯 Critical Rules for Coding Agents

Follow these rules **exactly** when working with this project to ensure Vercel deployments work correctly.

---

## 1. CSS Configuration (globals.css)

### ✅ CORRECT Format (Tailwind v4 + shadcn/ui):

```css
@import "tailwindcss";

:root {
  --background: hsl(0 0% 100%);      /* ✅ Wrapped in hsl() */
  --foreground: hsl(0 0% 3.9%);
  /* ... all other variables with hsl() wrapper */
}

.dark {
  --background: hsl(0 0% 3.9%);      /* ✅ Dark mode variables */
  /* ... dark mode overrides */
}

@theme inline {
  --color-background: var(--background);  /* ✅ NO hsl() wrapper here */
  --color-foreground: var(--foreground);
  /* ... all color mappings */
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### ❌ WRONG Formats:

```css
/* ❌ WRONG: Variables without hsl() wrapper */
:root {
  --background: 0 0% 100%;  /* Missing hsl() */
}

/* ❌ WRONG: Using @theme for variables (v4 syntax that breaks Vercel) */
@theme {
  --color-background: oklch(1 0 0);  /* Not compatible with shadcn */
}

/* ❌ WRONG: Using Tailwind v3 directives */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 2. Package Dependencies

### ✅ REQUIRED Packages (Never Remove):

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-tabs": "^1.1.13",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4"
  }
}
```

### ⚠️ DO NOT:
- ❌ Remove any @radix-ui packages (shadcn components depend on them)
- ❌ Downgrade tailwindcss to v3
- ❌ Remove class-variance-authority or clsx

---

## 3. Tailwind Configuration

### ✅ CORRECT: No tailwind.config.ts File

Tailwind v4 uses **CSS-first configuration** via `@theme` directive.

**DO NOT create `tailwind.config.ts`** - it will cause type errors and break builds.

### ❌ WRONG:
```typescript
// ❌ DO NOT CREATE THIS FILE
// tailwind.config.ts
export default {
  darkMode: ["class"],  // This breaks with Tailwind v4
  content: [...],
}
```

---

## 4. PostCSS Configuration

### ✅ CORRECT (postcss.config.mjs):

```javascript
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
```

### ❌ WRONG:
```javascript
// ❌ DO NOT use old Tailwind v3 plugins
plugins: {
  tailwindcss: {},
  autoprefixer: {},
}
```

---

## 5. Component Styling Rules

### ✅ CORRECT Patterns:

```tsx
// ✅ Use semantic color variables
className="bg-background text-foreground"
className="bg-card text-card-foreground"
className="bg-primary text-primary-foreground"

// ✅ Use utility classes from Tailwind
className="rounded-lg shadow-md hover:shadow-lg"

// ✅ Combine with cn() utility
import { cn } from "@/lib/utils"
className={cn("base-classes", conditionalClasses)}

// ✅ Use data-slot attributes (Tailwind v4 + shadcn)
<div data-slot="card" className="...">
```

### ❌ WRONG Patterns:

```tsx
// ❌ Hardcoded colors (not themeable)
className="bg-white text-black"  // Use bg-background instead

// ❌ Inline styles for things Tailwind can do
style={{ backgroundColor: '#ffffff' }}

// ❌ Using hsl() in className
className="bg-[hsl(0 0% 100%)]"  // Use bg-background instead
```

---

## 6. Chart Color Configuration

### ✅ CORRECT (No hsl() wrapper):

```typescript
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",  // ✅ Direct variable reference
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",  // ✅ No hsl() wrapper
  },
}
```

### ❌ WRONG:

```typescript
// ❌ Wrapping in hsl() (old Tailwind v3 style)
color: "hsl(var(--chart-1))"
```

---

## 7. Size Utilities (Tailwind v4)

### ✅ CORRECT (Use size-* utility):

```tsx
// ✅ Use size-* for square elements
className="size-4"      // Replaces w-4 h-4
className="size-10"     // Replaces w-10 h-10
className="size-full"   // Replaces w-full h-full
```

### ❌ OLD Style (Still works but verbose):

```tsx
// ⚠️ Works but not idiomatic Tailwind v4
className="w-4 h-4"
```

---

## 8. Accessibility (Always Required)

### ✅ MANDATORY for Interactive Elements:

```tsx
// ✅ KPI Cards, Buttons, Clickable Divs
<div
  role="button"
  tabIndex={0}
  aria-label="Descriptive label with full context"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  className="..."
>
```

### ✅ MANDATORY for Modals:

```tsx
// ✅ Dialogs must have proper ARIA
<DialogContent
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogTitle id="dialog-title">Title</DialogTitle>
  <DialogDescription id="dialog-description">Description</DialogDescription>
</DialogContent>
```

---

## 9. Git & Secrets Management

### ✅ CRITICAL: Never Commit Secrets

**Always use .gitignore:**

```gitignore
# Environment
.env
.env.local
.env*.local
*.env

# Secrets
*credentials*.json
*secret*.json
*key*.json

# Docs that might contain secrets
DEPLOYMENT.md
SUMMARY.md
HANDOFF*.md
FINAL_DELIVERY.md
VERCEL_DEPLOYMENT_GUIDE.md
```

### ⚠️ If GitHub Blocks Push:

**DO NOT** try to force push or bypass - secrets in git history will always be detected.

**Instead:**
1. Remove the secret files completely
2. Use `git filter-repo` to clean history
3. Or create fresh repo with clean commits only

---

## 10. Vercel Deployment

### ✅ Environment Variables Required:

```
POSTGRES_HOST=34.57.101.141
POSTGRES_PORT=5432
POSTGRES_DB=segundo-db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[your-password]
ANTHROPIC_API_KEY=[your-api-key]
```

**Set these in:** Vercel Dashboard → Project → Settings → Environment Variables

**Select:** ✅ Production, ✅ Preview, ✅ Development

### ✅ Deploy Commands:

```bash
# Preview deployment
npx vercel --yes

# Production deployment
vercel promote [preview-url] --yes

# Or manual production
npx vercel --prod
```

---

## 11. Component Creation Rules

### ✅ When Adding New shadcn Components:

```bash
# Always use the CLI to add components
npx shadcn@latest add [component-name]

# This ensures:
# - Correct Tailwind v4 syntax
# - Proper data-slot attributes
# - No forwardRef (React 19 compatible)
# - Up-to-date Radix UI versions
```

### ❌ DO NOT:

- ❌ Manually copy component code from old documentation
- ❌ Use components from Tailwind v3 examples
- ❌ Create components without data-slot attributes

---

## 12. Type Safety

### ✅ CORRECT TypeScript Usage:

```typescript
// ✅ Use ComponentProps instead of forwardRef
function MyComponent({
  className,
  ...props
}: React.ComponentProps<typeof SomePrimitive>) {
  return <SomePrimitive data-slot="my-component" className={cn(...)} {...props} />
}

// ✅ Proper null checks
const value = data?.field || 'default';

// ✅ Type assertions with safety
const num = parseInt(String(value)) || 0;
```

### ❌ WRONG:

```typescript
// ❌ Using forwardRef (old React 18 pattern)
const MyComponent = React.forwardRef<...>(...);

// ❌ Missing null checks
const value = data.field;  // Might be undefined

// ❌ Unsafe type coercion
const num = parseInt(value);  // Type error if value is not string
```

---

## 13. Build & Test Before Deploy

### ✅ ALWAYS Run Before Pushing:

```bash
# 1. Clean build
rm -rf .next
npm run build

# 2. Check for errors
# Build should complete with "✓ Compiled successfully"

# 3. Test locally
npm run dev
# Verify at http://localhost:3000

# 4. Then deploy
npx vercel --yes
```

### ⚠️ If Build Fails:

1. Check for TypeScript errors first
2. Verify all imports are correct
3. Ensure no missing dependencies
4. Check globals.css syntax
5. Look for null/undefined access

---

## 14. Data Fetching Rules

### ✅ CORRECT Patterns:

```typescript
// ✅ Always cap attendance at 100%
LEAST(100, ROUND((days_attended / total_days) * 100))

// ✅ Always exclude Thursday/Friday
WHERE EXTRACT(DOW FROM day_date) NOT IN (4, 5)

// ✅ Always filter excluded users
const EXCLUDED_USER_IDS = [129, 5, 240, ...];
if (EXCLUDED_USER_IDS.includes(userId)) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

// ✅ Use shared utilities for calculations
import { calculateTaskCompletion } from '@/lib/metrics/task-completion';
```

---

## 15. CSS Variable Naming Convention

### ✅ Pattern to Follow:

| Root Variable | Tailwind Theme | Usage |
|--------------|----------------|-------|
| `--background` | `--color-background` | `bg-background` |
| `--primary` | `--color-primary` | `bg-primary` |
| `--border` | `--color-border` | `border-border` |

**Rule:**
- Root variables: `--name` (no prefix)
- Theme mappings: `--color-name` (with color- prefix)
- CSS classes: `bg-name`, `text-name`, `border-name`

---

## 16. Loading States & Skeletons

### ✅ ALWAYS Include:

```tsx
// ✅ Loading skeleton with ARIA
{loading ? (
  <div role="status" aria-live="polite" aria-busy="true">
    <Skeleton className="h-8 w-full" />
    <span className="sr-only">Loading data...</span>
  </div>
) : (
  <YourComponent data={data} />
)}
```

---

## 17. Week Range Calculations

### ✅ Use Dynamic Utilities:

```typescript
// ✅ ALWAYS use cohort-dates utility
import { calculateWeekRanges, getCurrentWeek } from '@/lib/utils/cohort-dates';

const weeks = calculateWeekRanges('September 2025');
const currentWeek = getCurrentWeek('September 2025');

// ✅ NEVER hardcode weeks
// ❌ WRONG: const weeks = [1, 2, 3, 4];
```

---

## 18. Deployment Checklist

Before any deployment, verify:

- [ ] Build passes locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] globals.css has proper format (hsl() wrapper + @theme inline)
- [ ] All @radix-ui packages in package.json
- [ ] No secrets in committed files
- [ ] .gitignore excludes .env files
- [ ] Environment variables set in Vercel dashboard
- [ ] Accessibility attributes present (role, aria-label, tabIndex)

---

## 19. Common Errors & Fixes

### Error: "Can't resolve '@radix-ui/react-slot'"
**Fix:** Add to package.json dependencies:
```bash
npm install @radix-ui/react-slot class-variance-authority
```

### Error: "Type 'unknown' is not assignable"
**Fix:** Add String() wrapper:
```typescript
parseInt(String(value)) || 0
parseFloat(String(value)) || 0
```

### Error: CSS not loading on Vercel
**Fix:** Ensure globals.css has:
1. `:root` variables wrapped in `hsl()`
2. `@theme inline` directive
3. NO `tailwind.config.ts` file

### Error: "darkMode strategy" type error
**Fix:** Delete `tailwind.config.ts` - use CSS-only config with Tailwind v4

---

## 20. Code Review Checklist

Before committing any code:

### Accessibility:
- [ ] All interactive elements have `role` attribute
- [ ] All buttons/cards have `aria-label`
- [ ] All modals have `aria-modal="true"`
- [ ] Keyboard navigation works (`tabIndex`, `onKeyDown`)
- [ ] Focus indicators visible

### Data Integrity:
- [ ] Attendance percentages capped at 100%
- [ ] Thursday/Friday excluded from calculations
- [ ] Excluded user IDs return 404
- [ ] No hardcoded counts (use dynamic queries)

### Styling:
- [ ] Uses semantic color variables (`bg-background`, not `bg-white`)
- [ ] Uses size-* for square elements
- [ ] No inline styles (use Tailwind classes)
- [ ] Responsive design (`md:`, `lg:` breakpoints)

### Performance:
- [ ] Loading states implemented
- [ ] ARIA live regions for dynamic content
- [ ] No console.log in production code
- [ ] Images optimized

---

## 21. File Organization

```
segundo-query-ai/
├── app/
│   ├── api/           # API routes (Next.js)
│   ├── globals.css    # ✅ CRITICAL: Tailwind + shadcn styles
│   └── ...
├── components/
│   ├── ui/            # shadcn components (CLI-generated)
│   └── metrics-dashboard/
├── lib/
│   ├── utils.ts       # cn() utility
│   ├── utils/         # Cohort dates, helpers
│   ├── services/      # BigQuery, external APIs
│   └── metrics/       # Shared calculations
├── hooks/             # Custom React hooks
├── docs/              # Documentation (check for secrets!)
└── tests/             # Test files
```

---

## 22. Quick Reference: Tailwind v4 Changes

| Feature | Tailwind v3 | Tailwind v4 |
|---------|------------|-------------|
| Config | `tailwind.config.js` | `@theme` in CSS |
| Colors | `hsl(var(--color))` | `var(--color)` |
| Size | `w-4 h-4` | `size-4` |
| Animations | `tailwindcss-animate` | `tw-animate-css` |
| CSS Import | `@tailwind base` | `@import "tailwindcss"` |

---

## 23. Mandatory Testing

After ANY change to:
- `globals.css`
- `package.json`
- Component styling
- Color variables

**Run:**
```bash
npm run build          # Must pass
npm run dev           # Verify visually
npx vercel --yes      # Test on Vercel preview
```

---

## 24. Emergency Rollback

If deployment breaks:

```bash
# 1. Find last working deployment
vercel ls

# 2. Promote it to production
vercel promote [working-url] --yes

# 3. Fix locally, test thoroughly
npm run build

# 4. Deploy again when fixed
npx vercel --yes
```

---

## 🎯 Summary: Non-Negotiable Rules

1. **Never remove** @radix-ui packages
2. **Never create** tailwind.config.ts
3. **Always wrap** :root variables in hsl()
4. **Always use** @theme inline for color mappings
5. **Always test** build before deploying
6. **Never commit** .env files or secrets
7. **Always add** accessibility attributes
8. **Always use** size-* for square elements
9. **Always use** semantic color variables
10. **Always verify** Vercel deployment works

---

## ✅ This Configuration Works

**Production Score:** 4.8/5
**Build Time:** ~45 seconds
**Vercel Compatible:** ✅ Yes
**Accessibility:** WCAG 2.1 Level AA

Follow these rules and your deployments will work every time! 🚀
