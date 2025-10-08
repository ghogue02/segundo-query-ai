# Task Quality Service - Usage Guide

Quick reference for using the PostgreSQL task quality service in your application.

---

## Import

```typescript
import {
  getCohortTaskQuality,
  getTaskLevelQuality,
  getBuilderTaskQuality,
  getTaskBuilderScores,
  type TaskQualityScore,
  type BuilderQualityScore,
  type TaskBuilderScore
} from '@/lib/services/task-quality';
```

---

## 1. Get Cohort Average Quality

**Use case:** Display overall cohort performance metric (e.g., "Class Average: 75.3")

```typescript
const cohortAvg = await getCohortTaskQuality('September 2025');
// Returns: 75.3
```

**Example UI:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Class Average Quality</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-4xl font-bold">{cohortAvg}%</div>
    <p className="text-sm text-muted-foreground">
      Based on {totalAssessments} task assessments
    </p>
  </CardContent>
</Card>
```

---

## 2. Get Per-Task Quality Breakdown

**Use case:** Show which tasks have highest/lowest quality scores

```typescript
const taskQuality = await getTaskLevelQuality('September 2025');
// Returns array of TaskQualityScore objects
```

**Response structure:**
```typescript
[
  {
    task_id: 1007,
    builders_assessed: 24,
    avg_quality: 50.8,
    total_assessments: 44
  },
  {
    task_id: 1018,
    builders_assessed: 8,
    avg_quality: 62.7,
    total_assessments: 13
  },
  // ... 49 more tasks
]
```

**Example UI:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Task</TableHead>
      <TableHead>Avg Quality</TableHead>
      <TableHead>Builders</TableHead>
      <TableHead>Assessments</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {taskQuality.map(task => (
      <TableRow key={task.task_id}>
        <TableCell>Task {task.task_id}</TableCell>
        <TableCell>{task.avg_quality}%</TableCell>
        <TableCell>{task.builders_assessed}</TableCell>
        <TableCell>{task.total_assessments}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 3. Get Per-Builder Quality Averages

**Use case:** Leaderboard or builder performance rankings

```typescript
const builderQuality = await getBuilderTaskQuality('September 2025');
// Returns array of BuilderQualityScore objects
```

**Response structure:**
```typescript
[
  {
    user_id: 123,
    builder_name: "Joey Mejias",
    tasks_assessed: 1,
    avg_quality: 95.0,
    total_assessments: 1
  },
  {
    user_id: 456,
    builder_name: "Mamoudou Keita",
    tasks_assessed: 13,
    avg_quality: 90.5,
    total_assessments: 15
  },
  // ... 67 more builders
]
```

**Example UI:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Top Performers</CardTitle>
  </CardHeader>
  <CardContent>
    {builderQuality.slice(0, 10).map((builder, idx) => (
      <div key={builder.user_id} className="flex justify-between py-2">
        <span>#{idx + 1} {builder.builder_name}</span>
        <span className="font-bold">{builder.avg_quality}%</span>
        <span className="text-sm text-muted-foreground">
          ({builder.tasks_assessed} tasks)
        </span>
      </div>
    ))}
  </CardContent>
</Card>
```

---

## 4. Get Individual Task Scores (Drill-Down)

**Use case:** Clicking on a task to see all builder scores for that task

```typescript
const taskId = 1007;
const taskScores = await getTaskBuilderScores(taskId, 'September 2025');
// Returns array of TaskBuilderScore objects
```

**Response structure:**
```typescript
[
  {
    user_id: 789,
    builder_name: "Carlos Valdez",
    quality_score: 92,
    created_at: "2025-09-15T14:30:00Z",
    analysis_type: "unknown"
  },
  {
    user_id: 101,
    builder_name: "Rene Ugarte",
    quality_score: 90,
    created_at: "2025-09-15T14:32:00Z",
    analysis_type: "unknown"
  },
  // ... 42 more builders
]
```

**Example UI:**
```tsx
<Dialog>
  <DialogTrigger>View Task Details</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Task {taskId} - Builder Scores</DialogTitle>
    </DialogHeader>
    <ScrollArea className="h-96">
      {taskScores.map(score => (
        <div key={score.user_id} className="flex justify-between py-2">
          <span>{score.builder_name}</span>
          <span className="font-bold">{score.quality_score}%</span>
          <span className="text-xs text-muted-foreground">
            {new Date(score.created_at).toLocaleDateString()}
          </span>
        </div>
      ))}
    </ScrollArea>
  </DialogContent>
</Dialog>
```

---

## Error Handling

All functions throw descriptive errors if database queries fail:

```typescript
try {
  const cohortAvg = await getCohortTaskQuality('September 2025');
} catch (error) {
  console.error('Failed to fetch cohort quality:', error);
  // Handle error (show toast, fallback UI, etc.)
}
```

**Common error scenarios:**
- Database connection failure
- Invalid cohort name (returns 0 with warning)
- No data available (returns empty array with warning)
- Invalid completion_score values (filtered automatically)

---

## Best Practices

### 1. Caching

Quality scores don't change frequently - cache results:

```typescript
// Example with React Query
const { data: cohortAvg } = useQuery({
  queryKey: ['cohort-quality', cohort],
  queryFn: () => getCohortTaskQuality(cohort),
  staleTime: 1000 * 60 * 5, // 5 minutes
});
```

### 2. Loading States

Show loading indicators while fetching:

```tsx
{isLoading ? (
  <Skeleton className="h-20 w-full" />
) : (
  <div className="text-4xl font-bold">{cohortAvg}%</div>
)}
```

### 3. Empty States

Handle cases where no data exists:

```tsx
{builderQuality.length === 0 ? (
  <div className="text-center py-8 text-muted-foreground">
    No quality data available yet
  </div>
) : (
  <BuilderQualityTable data={builderQuality} />
)}
```

### 4. Sorting & Filtering

Data is pre-sorted, but you can add client-side filtering:

```typescript
// Filter by minimum task count
const activeBuilders = builderQuality.filter(
  b => b.tasks_assessed >= 5
);

// Sort by task count instead of quality
const sortedByCount = [...taskQuality].sort(
  (a, b) => b.builders_assessed - a.builders_assessed
);
```

---

## Testing

Run the test suite to verify service functionality:

```bash
# Full test suite (6 tests)
npx tsx --env-file=.env.local scripts/test-task-quality.ts

# Diagnostic analysis
npx tsx --env-file=.env.local scripts/diagnose-quality-data.ts
```

---

## Next Steps

This service provides **task-level quality scores only**. For rubric-level breakdown (Technical, Business, Professional skills), see the upcoming BigQuery service integration (Part 2).

**Coming soon:**
- `/api/quality/rubric` - Rubric breakdown by skill category
- Chart-ready data formats for visualization
- Time-series quality tracking
