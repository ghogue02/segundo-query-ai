/**
 * Task Completion Calculation Utility
 * Single source of truth for task completion percentage across all features
 */

import { executeQuery } from '@/lib/db';

const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

export interface TaskCompletionResult {
  user_id: number;
  tasks_completed: number;
  total_tasks: number;
  completion_pct: number;
}

/**
 * Calculate task completion for a single builder
 * @param userId - Builder user ID
 * @param cohort - Cohort name (default: 'September 2025')
 * @returns Task completion data
 */
export async function calculateTaskCompletion(
  userId: number,
  cohort: string = 'September 2025'
): Promise<TaskCompletionResult> {
  const query = `
    WITH sept_tasks AS (
      SELECT DISTINCT t.id
      FROM tasks t
      JOIN time_blocks tb ON t.block_id = tb.id
      JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE cd.cohort = $1 AND t.task_type != 'break'
    ),
    user_completed AS (
      SELECT COUNT(DISTINCT task_id) as count
      FROM (
        SELECT ts.task_id
        FROM task_submissions ts
        WHERE ts.user_id = $2 AND ts.task_id IN (SELECT id FROM sept_tasks)
        UNION
        SELECT tt.task_id
        FROM task_threads tt
        WHERE tt.user_id = $2 AND tt.task_id IN (SELECT id FROM sept_tasks)
      ) interactions
    ),
    total_count AS (
      SELECT COUNT(*) as count FROM sept_tasks
    )
    SELECT
      $2::int as user_id,
      (SELECT count FROM user_completed) as tasks_completed,
      (SELECT count FROM total_count) as total_tasks,
      ROUND(
        (SELECT count FROM user_completed)::FLOAT /
        NULLIF((SELECT count FROM total_count), 0) * 100
      ) as completion_pct
  `;

  const results = await executeQuery(query, [cohort, userId]);

  if (results.length === 0) {
    return {
      user_id: userId,
      tasks_completed: 0,
      total_tasks: 0,
      completion_pct: 0,
    };
  }

  return {
    user_id: userId,
    tasks_completed: parseInt(String(results[0].tasks_completed)) || 0,
    total_tasks: parseInt(String(results[0].total_tasks)) || 0,
    completion_pct: parseFloat(String(results[0].completion_pct)) || 0,
  };
}

/**
 * Calculate task completion for all builders in cohort
 * @param cohort - Cohort name (default: 'September 2025')
 * @returns Array of task completion data per builder
 */
export async function calculateBulkTaskCompletion(
  cohort: string = 'September 2025'
): Promise<TaskCompletionResult[]> {
  const query = `
    WITH sept_tasks AS (
      SELECT DISTINCT t.id
      FROM tasks t
      JOIN time_blocks tb ON t.block_id = tb.id
      JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE cd.cohort = $1 AND t.task_type != 'break'
    )
    SELECT
      u.user_id,
      (SELECT COUNT(DISTINCT task_id) FROM (
        SELECT ts.task_id FROM task_submissions ts WHERE ts.user_id = u.user_id AND ts.task_id IN (SELECT id FROM sept_tasks)
        UNION
        SELECT tt.task_id FROM task_threads tt WHERE tt.user_id = u.user_id AND tt.task_id IN (SELECT id FROM sept_tasks)
      ) interactions) as tasks_completed,
      (SELECT COUNT(*) FROM sept_tasks) as total_tasks,
      ROUND(
        (SELECT COUNT(DISTINCT task_id) FROM (
          SELECT ts.task_id FROM task_submissions ts WHERE ts.user_id = u.user_id AND ts.task_id IN (SELECT id FROM sept_tasks)
          UNION
          SELECT tt.task_id FROM task_threads tt WHERE tt.user_id = u.user_id AND tt.task_id IN (SELECT id FROM sept_tasks)
        ) i)::FLOAT / NULLIF((SELECT COUNT(*) FROM sept_tasks), 0) * 100
      ) as completion_pct
    FROM users u
    WHERE u.cohort = $1
      AND u.active = true
      AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
    ORDER BY u.user_id
  `;

  const results = await executeQuery(query, [cohort]);

  return results.map((row: any) => ({
    user_id: parseInt(row.user_id),
    tasks_completed: parseInt(row.tasks_completed) || 0,
    total_tasks: parseInt(row.total_tasks) || 0,
    completion_pct: parseFloat(row.completion_pct) || 0,
  }));
}

/**
 * Get cohort-wide average task completion
 * @param cohort - Cohort name (default: 'September 2025')
 * @returns Average completion percentage
 */
export async function getCohortAverageCompletion(
  cohort: string = 'September 2025'
): Promise<number> {
  const allCompletions = await calculateBulkTaskCompletion(cohort);

  if (allCompletions.length === 0) {
    return 0;
  }

  const totalPct = allCompletions.reduce((sum, builder) => sum + builder.completion_pct, 0);
  return Math.round(totalPct / allCompletions.length);
}
