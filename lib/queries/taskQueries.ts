import { executeQuery } from '../db';

export interface TaskDetail {
  id: number;
  task_title: string;
  intro: string | null;
  task_type: string | null;
  duration_minutes: number | null;
  task_mode: string | null;
  ai_helper_mode: string | null;
  deliverable_type: string | null;
  start_time: string;
  end_time: string;
  block_category: string | null;
  day_number: number;
  day_date: string;
  day_type: string;
  daily_goal: string | null;
  completed_count: number;
  submission_count: number;
  thread_count: number;
  completion_percentage: number;
  active_builder_count: number;
}

export interface BuilderCompletion {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  has_submission: boolean;
  has_thread: boolean;
  completed_at: string | null;
}

export interface TaskSubmissionPreview {
  user_id: number;
  first_name: string;
  last_name: string;
  content_preview: string;
  submitted_at: string;
}

export async function getTaskDetail(taskId: number): Promise<TaskDetail | null> {
  const query = `
    WITH active_builder_count AS (
      SELECT COUNT(*) as count
      FROM users
      WHERE cohort = 'September 2025'
        AND active = true
        AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332)
    ),
    task_completion AS (
      SELECT
        t.id as task_id,
        COUNT(DISTINCT u.user_id) as completed_count,
        COUNT(DISTINCT ts.id) as submission_count,
        COUNT(DISTINCT tt.id) as thread_count
      FROM tasks t
      LEFT JOIN task_submissions ts ON t.id = ts.task_id
      LEFT JOIN task_threads tt ON t.id = tt.task_id
      LEFT JOIN users u ON (ts.user_id = u.user_id OR tt.user_id = u.user_id)
      WHERE t.id = $1
        AND (u.user_id IS NULL OR (
          u.cohort = 'September 2025'
          AND u.active = true
          AND u.user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332)
        ))
      GROUP BY t.id
    ),
    task_info AS (
      SELECT
        t.id,
        t.task_title,
        t.intro,
        t.task_type,
        t.duration_minutes,
        t.task_mode,
        t.ai_helper_mode,
        t.deliverable_type,
        tb.start_time,
        tb.end_time,
        tb.block_category,
        cd.day_number,
        cd.day_date,
        cd.day_type,
        cd.daily_goal
      FROM tasks t
      JOIN time_blocks tb ON t.block_id = tb.id
      JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE t.id = $1 AND cd.cohort = 'September 2025'
    )
    SELECT
      ti.*,
      COALESCE(tc.completed_count, 0) as completed_count,
      COALESCE(tc.submission_count, 0) as submission_count,
      COALESCE(tc.thread_count, 0) as thread_count,
      (SELECT count FROM active_builder_count) as active_builder_count,
      ROUND((COALESCE(tc.completed_count, 0)::numeric / NULLIF((SELECT count FROM active_builder_count), 0)) * 100, 2) as completion_percentage
    FROM task_info ti
    LEFT JOIN task_completion tc ON ti.id = tc.task_id;
  `;

  const results = await executeQuery<TaskDetail>(query, [taskId]);
  return results[0] || null;
}

export async function getTaskBuilders(taskId: number): Promise<BuilderCompletion[]> {
  const query = `
    SELECT DISTINCT
      u.user_id,
      u.first_name,
      u.last_name,
      u.email,
      (ts.id IS NOT NULL) as has_submission,
      (tt.id IS NOT NULL) as has_thread,
      COALESCE(ts.created_at, tt.created_at) as completed_at
    FROM users u
    LEFT JOIN task_submissions ts ON u.user_id = ts.user_id AND ts.task_id = $1
    LEFT JOIN task_threads tt ON u.user_id = tt.user_id AND tt.task_id = $1
    WHERE u.cohort = 'September 2025'
      AND u.active = true
      AND u.user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332)
      AND (ts.id IS NOT NULL OR tt.id IS NOT NULL)
    ORDER BY completed_at DESC;
  `;

  return await executeQuery<BuilderCompletion>(query, [taskId]);
}

export async function getTaskSubmissionPreviews(taskId: number): Promise<TaskSubmissionPreview[]> {
  const query = `
    SELECT
      ts.user_id,
      u.first_name,
      u.last_name,
      LEFT(ts.content, 200) as content_preview,
      ts.created_at as submitted_at
    FROM task_submissions ts
    JOIN users u ON ts.user_id = u.user_id
    WHERE ts.task_id = $1
      AND u.cohort = 'September 2025'
      AND u.active = true
      AND u.user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332)
    ORDER BY ts.created_at DESC
    LIMIT 10;
  `;

  return await executeQuery<TaskSubmissionPreview>(query, [taskId]);
}
