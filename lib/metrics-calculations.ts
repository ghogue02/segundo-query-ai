/**
 * Metrics Calculations
 *
 * All metric calculation logic with proper 7-day class average handling.
 * CLASS DAYS: Mon, Tue, Wed, Sat, Sun (NO Thu/Fri)
 */

import { executeQuery } from './db';

const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];
const CLASS_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Saturday', 'Sunday'];

/**
 * Calculate 7-day CLASS average (excludes Thu/Fri)
 */
export function getClassDaysInRange(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayName = current.toLocaleDateString('en-US', { weekday: 'long' });
    if (CLASS_DAYS.includes(dayName)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Get active builders today (ATTENDANCE - who checked in)
 * Uses attendance_date column which is already in EST timezone
 */
export async function getActiveBuildersToday(cohort: string = 'September 2025') {
  const query = `
    SELECT COUNT(DISTINCT ba.user_id) as count
    FROM builder_attendance_new ba
    JOIN users u ON ba.user_id = u.user_id
    WHERE ba.attendance_date = CURRENT_DATE
      AND ba.status IN ('present', 'late')
      AND u.cohort = $1
      AND u.active = true
      AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
  `;

  const result = await executeQuery<{ count: number }>(query, [cohort]);
  return parseInt(result[0].count as any);
}

/**
 * Get active builders for prior day (ATTENDANCE - who checked in yesterday)
 * Uses attendance_date column which is already in EST timezone
 */
export async function getActiveBuildersYesterday(cohort: string = 'September 2025') {
  const query = `
    SELECT COUNT(DISTINCT ba.user_id) as count
    FROM builder_attendance_new ba
    JOIN users u ON ba.user_id = u.user_id
    WHERE ba.attendance_date = CURRENT_DATE - INTERVAL '1 day'
      AND ba.status IN ('present', 'late')
      AND u.cohort = $1
      AND u.active = true
      AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
  `;

  const result = await executeQuery<{ count: number }>(query, [cohort]);
  return parseInt(result[0].count as any);
}

/**
 * Get 7-day CLASS average (only Mon, Tue, Wed, Sat, Sun) - ATTENDANCE based
 */
export async function get7DayClassAverage(cohort: string = 'September 2025') {
  const query = `
    SELECT
      ba.attendance_date as date,
      COUNT(DISTINCT ba.user_id) as active_builders
    FROM builder_attendance_new ba
    JOIN users u ON ba.user_id = u.user_id
    WHERE ba.attendance_date >= CURRENT_DATE - INTERVAL '7 days'
      AND ba.status = 'present'
      AND u.cohort = $1
      AND u.active = true
      AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
      AND EXTRACT(DOW FROM ba.attendance_date) NOT IN (4, 5) -- Exclude Thu(4), Fri(5)
    GROUP BY ba.attendance_date
    ORDER BY date DESC
  `;

  const results = await executeQuery<{ date: Date; active_builders: number }>(query, [cohort]);

  if (results.length === 0) return 0;

  const sum = results.reduce((acc, row) => acc + parseInt(row.active_builders as any), 0);
  return Math.round(sum / results.length);
}

/**
 * Task completion rate this week
 * Returns AVERAGE of per-task completion percentages (matches drill-down view)
 */
export async function getTaskCompletionThisWeek(cohort: string = 'September 2025') {
  const query = `
    WITH weekly_tasks AS (
      SELECT DISTINCT t.id, t.task_title
      FROM tasks t
      JOIN time_blocks tb ON t.block_id = tb.id
      JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE cd.day_date >= DATE_TRUNC('week', CURRENT_DATE)
        AND cd.day_date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'
        AND cd.cohort = $1
        AND t.task_type != 'break'
    ),
    active_builders AS (
      SELECT COUNT(*) as total_builders
      FROM users
      WHERE cohort = $1
        AND active = true
        AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
    ),
    task_completion_rates AS (
      SELECT
        wt.id as task_id,
        wt.task_title,
        COUNT(DISTINCT CASE WHEN ts.id IS NOT NULL OR tt.id IS NOT NULL THEN u.user_id END) as builders_completed,
        ab.total_builders,
        ROUND((COUNT(DISTINCT CASE WHEN ts.id IS NOT NULL OR tt.id IS NOT NULL THEN u.user_id END)::FLOAT / ab.total_builders * 100)::numeric, 1) as completion_pct
      FROM weekly_tasks wt
      CROSS JOIN active_builders ab
      LEFT JOIN task_submissions ts ON wt.id = ts.task_id
        AND ts.user_id IN (SELECT user_id FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')}))
      LEFT JOIN task_threads tt ON wt.id = tt.task_id
        AND tt.user_id IN (SELECT user_id FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')}))
      LEFT JOIN users u ON (ts.user_id = u.user_id OR tt.user_id = u.user_id)
      GROUP BY wt.id, wt.task_title, ab.total_builders
    )
    SELECT ROUND(AVG(completion_pct)) as avg_completion_rate
    FROM task_completion_rates
  `;

  const result = await executeQuery<{ avg_completion_rate: number }>(query, [cohort]);
  return parseInt(String(result[0]?.avg_completion_rate)) || 0;
}

/**
 * Attendance rate (7-day CLASS average)
 * Matches drill-down logic exactly
 */
export async function getAttendanceRate(cohort: string = 'September 2025') {
  // Get last 7 class days attendance (same as drill-down)
  const query = `
    WITH daily_attendance AS (
      SELECT
        ba.attendance_date,
        COUNT(DISTINCT ba.user_id) as attended,
        (SELECT COUNT(*) FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})) as total_builders,
        ROUND((COUNT(DISTINCT ba.user_id)::FLOAT / NULLIF((SELECT COUNT(*) FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})), 0) * 100)::numeric, 1) as attendance_pct
      FROM builder_attendance_new ba
      JOIN users u ON ba.user_id = u.user_id
      WHERE ba.attendance_date >= CURRENT_DATE - INTERVAL '7 days'
        AND ba.status IN ('present', 'late')
        AND u.cohort = $1
        AND u.active = true
        AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
        AND EXTRACT(DOW FROM ba.attendance_date) NOT IN (4, 5)
      GROUP BY ba.attendance_date
      ORDER BY ba.attendance_date DESC
    )
    SELECT AVG(attendance_pct) as avg_rate FROM daily_attendance
  `;

  const result = await executeQuery<{ avg_rate: number }>(query, [cohort]);
  return Math.round(result[0]?.avg_rate || 0);
}

/**
 * Builder segmentation: Struggling (Threshold-based)
 * Uses BOTH task_submissions AND task_threads for completion
 */
export async function getStrugglingBuilders_Threshold(cohort: string = 'September 2025') {
  const query = `
    WITH sept_tasks AS (
      SELECT DISTINCT t.id
      FROM tasks t
      JOIN time_blocks tb ON t.block_id = tb.id
      JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE cd.cohort = $1 AND t.task_type != 'break'
    ),
    builder_stats AS (
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        -- Task completion % (UNION of submissions and threads)
        (SELECT COUNT(DISTINCT task_id) FROM (
          SELECT ts.task_id FROM task_submissions ts WHERE ts.user_id = u.user_id AND ts.task_id IN (SELECT id FROM sept_tasks)
          UNION
          SELECT tt.task_id FROM task_threads tt WHERE tt.user_id = u.user_id AND tt.task_id IN (SELECT id FROM sept_tasks)
        ) interactions)::FLOAT / NULLIF((SELECT COUNT(*) FROM sept_tasks), 0) * 100 as completion_pct,
        -- Attendance %
        COUNT(DISTINCT CASE WHEN ba.status IN ('present', 'late') THEN ba.attendance_date END)::FLOAT / NULLIF(
          (SELECT COUNT(*) FROM curriculum_days WHERE cohort = $1),
          0
        ) * 100 as attendance_pct
      FROM users u
      LEFT JOIN builder_attendance_new ba ON u.user_id = ba.user_id
      WHERE u.cohort = $1
        AND u.active = true
        AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
      GROUP BY u.user_id, u.first_name, u.last_name
    )
    SELECT user_id, first_name, last_name, completion_pct, attendance_pct
    FROM builder_stats
    WHERE completion_pct < 50 OR attendance_pct < 70
    ORDER BY completion_pct ASC
  `;

  return executeQuery(query, [cohort]);
}

/**
 * Builder segmentation: Composite Score
 */
export async function getBuilderEngagementScores(cohort: string = 'September 2025') {
  const query = `
    WITH builder_stats AS (
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        -- Attendance % (30%)
        COUNT(DISTINCT CASE WHEN ba.status = 'present' THEN ba.attendance_date END)::FLOAT / NULLIF(
          (SELECT COUNT(*) FROM curriculum_days WHERE cohort = $1),
          0
        ) * 100 as attendance_pct,
        -- Task completion % (50%)
        COUNT(DISTINCT ts.task_id)::FLOAT / NULLIF(
          (SELECT COUNT(*) FROM tasks t WHERE t.task_type != 'break'),
          0
        ) * 100 as completion_pct,
        -- Quality % (20%) - placeholder until BigQuery integration
        75 as quality_pct
      FROM users u
      LEFT JOIN task_submissions ts ON u.user_id = ts.user_id
      LEFT JOIN builder_attendance_new ba ON u.user_id = ba.user_id
      WHERE u.cohort = $1
        AND u.active = true
        AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
      GROUP BY u.user_id, u.first_name, u.last_name
    )
    SELECT
      user_id,
      first_name,
      last_name,
      attendance_pct,
      completion_pct,
      quality_pct,
      -- Composite Score: (Attendance × 0.3) + (Completion × 0.5) + (Quality × 0.2)
      ROUND((attendance_pct * 0.3) + (completion_pct * 0.5) + (quality_pct * 0.2)) as engagement_score,
      CASE
        WHEN ((attendance_pct * 0.3) + (completion_pct * 0.5) + (quality_pct * 0.2)) < 40 THEN 'struggling'
        WHEN ((attendance_pct * 0.3) + (completion_pct * 0.5) + (quality_pct * 0.2)) > 80 THEN 'top'
        ELSE 'average'
      END as segment
    FROM builder_stats
    ORDER BY engagement_score DESC
  `;

  return executeQuery(query, [cohort]);
}

/**
 * Builders needing intervention (either threshold or composite)
 */
export async function getBuildersNeedingIntervention(cohort: string = 'September 2025') {
  const struggling = await getStrugglingBuilders_Threshold(cohort);
  return struggling.length;
}

/**
 * Total active builders
 */
export async function getTotalActiveBuilders(cohort: string = 'September 2025') {
  const query = `
    SELECT COUNT(*) as count
    FROM users
    WHERE cohort = $1
      AND active = true
      AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
  `;

  const result = await executeQuery<{ count: number }>(query, [cohort]);
  return parseInt(result[0].count as any);
}
