import { executeQuery } from '../db';

export interface BuilderProfile {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  cohort: string;
  days_attended: number;
  total_days: number;
  attendance_percentage: number;
  punctuality_rate: number | null;
  tasks_completed: number;
  total_tasks: number;
  completion_percentage: number;
  engagement_score: number;
}

export interface AttendanceRecord {
  attendance_date: string;
  check_in_time: string;
  status: 'present' | 'late' | 'absent' | 'excused';
  late_arrival_minutes: number | null;
  day_number: number | null;
  day_type: string | null;
}

export interface CompletedTask {
  task_id: number;
  task_title: string;
  task_type: string | null;
  day_number: number;
  completed_at: string;
  has_submission: boolean;
}

export interface FeedbackRecord {
  day_number: number;
  week_number: number;
  referral_likelihood: number | null;
  what_we_did_well: string | null;
  what_to_improve: string | null;
  submitted_at: string;
}

export interface QualityAssessment {
  task_id: number;
  block_title: string;
  score: number;
  assessed_at: string;
  analysis_type: string;
  day_number: number | null;
}

export async function getBuilderProfile(builderId: number): Promise<BuilderProfile | null> {
  const query = `
    WITH builder_engagement AS (
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.cohort,
        -- Attendance calculation with 1 AM EST cutoff (late counts as present) - ONLY count official curriculum days
        -- 1 AM cutoff: Check-ins 12:00-12:59 AM EST count for previous day (stayed late after class, not early next day)
        -- Reasoning: Class runs 6:30 PM - late, so midnight check-in = finishing up previous day's work
        COUNT(DISTINCT CASE WHEN ba.status IN ('present', 'late') AND EXISTS(
          SELECT 1 FROM curriculum_days cd2
          WHERE cd2.day_date = CASE
            WHEN EXTRACT(HOUR FROM ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') < 1 THEN
              (DATE(ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') - INTERVAL '1 day')::date
            ELSE
              DATE(ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York')
          END
            AND cd2.cohort = 'September 2025'
        ) THEN CASE
            WHEN EXTRACT(HOUR FROM ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') < 1 THEN
              (DATE(ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') - INTERVAL '1 day')::date
            ELSE
              DATE(ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York')
          END END) as days_attended,
        LEAST(100, ROUND((COUNT(DISTINCT CASE WHEN ba.status IN ('present', 'late') AND EXISTS(
          SELECT 1 FROM curriculum_days cd2
          WHERE cd2.day_date = CASE
            WHEN EXTRACT(HOUR FROM ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') < 1 THEN
              (DATE(ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') - INTERVAL '1 day')::date
            ELSE
              DATE(ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York')
          END
            AND cd2.cohort = 'September 2025'
        ) THEN CASE
            WHEN EXTRACT(HOUR FROM ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') < 1 THEN
              (DATE(ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') - INTERVAL '1 day')::date
            ELSE
              DATE(ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York')
          END END)::numeric / NULLIF((SELECT COUNT(*) FROM curriculum_days WHERE cohort = 'September 2025' AND EXTRACT(DOW FROM day_date) NOT IN (4, 5)), 0)) * 100, 2)) as attendance_percentage,
        -- Punctuality calculation with 1 AM cutoff
        ROUND((COUNT(CASE WHEN ba.status = 'present' AND EXISTS(
          SELECT 1 FROM curriculum_days cd2
          WHERE cd2.day_date = CASE
            WHEN EXTRACT(HOUR FROM ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') < 1 THEN
              (DATE(ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') - INTERVAL '1 day')::date
            ELSE
              DATE(ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York')
          END
            AND cd2.cohort = 'September 2025'
        ) THEN 1 END)::numeric / NULLIF(COUNT(CASE WHEN ba.status IN ('present', 'late') AND EXISTS(
          SELECT 1 FROM curriculum_days cd2
          WHERE cd2.day_date = CASE
            WHEN EXTRACT(HOUR FROM ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') < 1 THEN
              (DATE(ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') - INTERVAL '1 day')::date
            ELSE
              DATE(ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York')
          END
            AND cd2.cohort = 'September 2025'
        ) THEN 1 END), 0)) * 100, 2) as punctuality_rate,
        -- Task completion (from both submissions and threads) - MUST USE UNION
        -- Exclude break tasks from count to match total_tasks denominator
        (SELECT COUNT(DISTINCT task_id) FROM (
          SELECT ts.task_id FROM task_submissions ts
          JOIN tasks t ON ts.task_id = t.id
          WHERE ts.user_id = u.user_id
            AND t.task_type != 'break'
            AND ts.task_id IN (
              SELECT t2.id FROM tasks t2
              JOIN time_blocks tb ON t2.block_id = tb.id
              JOIN curriculum_days cd ON tb.day_id = cd.id
              WHERE cd.cohort = 'September 2025'
            )
          UNION
          SELECT tt.task_id FROM task_threads tt
          JOIN tasks t ON tt.task_id = t.id
          WHERE tt.user_id = u.user_id
            AND t.task_type != 'break'
            AND tt.task_id IN (
              SELECT t2.id FROM tasks t2
              JOIN time_blocks tb ON t2.block_id = tb.id
              JOIN curriculum_days cd ON tb.day_id = cd.id
              WHERE cd.cohort = 'September 2025'
            )
        ) combined) as tasks_completed,
        -- Total tasks for this cohort (excluding breaks)
        (SELECT COUNT(*) FROM tasks t
         JOIN time_blocks tb ON t.block_id = tb.id
         JOIN curriculum_days cd ON tb.day_id = cd.id
         WHERE cd.cohort = 'September 2025' AND t.task_type != 'break') as total_tasks_for_percentage,
        -- Completion percentage capped at 100%
        LEAST(100, ROUND(
          (SELECT COUNT(DISTINCT task_id) FROM (
            SELECT ts.task_id FROM task_submissions ts
            JOIN tasks t ON ts.task_id = t.id
            WHERE ts.user_id = u.user_id
              AND t.task_type != 'break'
              AND ts.task_id IN (
                SELECT t2.id FROM tasks t2
                JOIN time_blocks tb ON t2.block_id = tb.id
                JOIN curriculum_days cd ON tb.day_id = cd.id
                WHERE cd.cohort = 'September 2025'
              )
            UNION
            SELECT tt.task_id FROM task_threads tt
            JOIN tasks t ON tt.task_id = t.id
            WHERE tt.user_id = u.user_id
              AND t.task_type != 'break'
              AND tt.task_id IN (
                SELECT t2.id FROM tasks t2
                JOIN time_blocks tb ON t2.block_id = tb.id
                JOIN curriculum_days cd ON tb.day_id = cd.id
                WHERE cd.cohort = 'September 2025'
              )
          ) combined)::numeric /
          NULLIF((SELECT COUNT(*) FROM tasks t
                  JOIN time_blocks tb ON t.block_id = tb.id
                  JOIN curriculum_days cd ON tb.day_id = cd.id
                  WHERE cd.cohort = 'September 2025' AND t.task_type != 'break'), 0) * 100,
        2)) as completion_percentage
      FROM users u
      LEFT JOIN builder_attendance_new ba ON u.user_id = ba.user_id
      WHERE u.user_id = $1
      GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.cohort
    )
    SELECT
      user_id,
      first_name,
      last_name,
      email,
      cohort,
      days_attended,
      attendance_percentage,
      punctuality_rate,
      tasks_completed,
      total_tasks_for_percentage as total_tasks,
      completion_percentage,
      (SELECT COUNT(*) FROM curriculum_days WHERE cohort = 'September 2025' AND EXTRACT(DOW FROM day_date) NOT IN (4, 5) AND day_date <= CURRENT_DATE) as total_days,
      ROUND((attendance_percentage + completion_percentage + COALESCE(punctuality_rate, 0)) / 3, 2) as engagement_score
    FROM builder_engagement;
  `;

  const results = await executeQuery<BuilderProfile>(query, [builderId]);
  return results[0] || null;
}

export async function getBuilderAttendance(builderId: number): Promise<AttendanceRecord[]> {
  const query = `
    SELECT
      cd.day_date as attendance_date,
      ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York' as check_in_time,
      COALESCE(ba.status, 'absent') as status,
      ba.late_arrival_minutes,
      cd.day_number,
      cd.day_type
    FROM curriculum_days cd
    LEFT JOIN builder_attendance_new ba ON ba.attendance_date = cd.day_date AND ba.user_id = $1
    WHERE cd.cohort = 'September 2025'
      AND EXTRACT(DOW FROM cd.day_date) NOT IN (4, 5)
      AND cd.day_date <= CURRENT_DATE
    ORDER BY cd.day_date DESC;
  `;

  return await executeQuery<AttendanceRecord>(query, [builderId]);
}

export async function getBuilderCompletedTasks(builderId: number): Promise<CompletedTask[]> {
  const query = `
    SELECT DISTINCT ON (t.id)
      t.id as task_id,
      t.task_title,
      t.task_type,
      cd.day_number,
      tb.start_time,
      COALESCE(ts.created_at, tt.created_at) as completed_at,
      (ts.id IS NOT NULL) as has_submission
    FROM tasks t
    JOIN time_blocks tb ON t.block_id = tb.id
    JOIN curriculum_days cd ON tb.day_id = cd.id
    LEFT JOIN task_submissions ts ON t.id = ts.task_id AND ts.user_id = $1
    LEFT JOIN task_threads tt ON t.id = tt.task_id AND tt.user_id = $1
    WHERE cd.cohort = 'September 2025'
      AND (ts.id IS NOT NULL OR tt.id IS NOT NULL)
    ORDER BY t.id, cd.day_number ASC, tb.start_time ASC;
  `;

  return await executeQuery<CompletedTask>(query, [builderId]);
}

export async function getBuilderFeedback(builderId: number): Promise<FeedbackRecord[]> {
  const query = `
    SELECT
      bf.day_number,
      CEIL(bf.day_number / 5.0) as week_number,
      bf.referral_likelihood,
      bf.what_we_did_well,
      bf.what_to_improve,
      bf.created_at as submitted_at
    FROM builder_feedback bf
    WHERE bf.user_id = $1
    ORDER BY bf.day_number ASC;
  `;

  return await executeQuery<FeedbackRecord>(query, [builderId]);
}

export async function getBuilderQualityAssessments(
  builderId: number,
  cohort: string
): Promise<QualityAssessment[]> {
  const query = `
    SELECT
      t.id as task_id,
      t.task_title as block_title,
      CAST(ta.analysis_result->>'completion_score' AS INTEGER) as score,
      ta.created_at as assessed_at,
      COALESCE(ta.analysis_result->>'analysis_type', 'general') as analysis_type,
      cd.day_number
    FROM task_analyses ta
    JOIN tasks t ON ta.task_id = t.id
    JOIN time_blocks tb ON t.block_id = tb.id
    JOIN curriculum_days cd ON tb.day_id = cd.id
    WHERE ta.user_id = $1
      AND cd.cohort = $2
      AND ta.analysis_result ? 'completion_score'
      AND CAST(ta.analysis_result->>'completion_score' AS INTEGER) BETWEEN 0 AND 100
    ORDER BY ta.created_at DESC
    LIMIT 20;
  `;

  return await executeQuery<QualityAssessment>(query, [builderId, cohort]);
}
