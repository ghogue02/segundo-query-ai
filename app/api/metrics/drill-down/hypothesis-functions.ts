/**
 * Hypothesis Chart Drill-Down Functions
 * Import these into [type]/route.ts
 */

import { executeQuery } from '@/lib/db';

const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

export async function getAttendanceRateDetails(cohort: string) {
  const query = `
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
  `;

  const data = await executeQuery(query, [cohort]);

  return {
    title: '7-Day Class Attendance Rate',
    description: 'Daily attendance breakdown (excludes Thu/Fri)',
    data,
    columns: [
      { key: 'attendance_date', label: 'Date', format: (v: string) => new Date(v).toLocaleDateString() },
      { key: 'attended', label: 'Attended' },
      { key: 'total_builders', label: 'Total' },
      { key: 'attendance_pct', label: 'Rate', format: (v: number) => `${v}%` },
    ],
  };
}

export async function getH1Details(cohort: string) {
  const query = `
    WITH sept_tasks AS (
      SELECT DISTINCT t.id
      FROM tasks t JOIN time_blocks tb ON t.block_id = tb.id JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE cd.cohort = $1 AND t.task_type != 'break'
    )
    SELECT
      u.user_id,
      u.first_name || ' ' || u.last_name as builder_name,
      ROUND(COUNT(DISTINCT CASE WHEN ba.status IN ('present', 'late') THEN ba.attendance_date END)::FLOAT / NULLIF(
        (SELECT COUNT(*) FROM curriculum_days WHERE cohort = $1), 0
      ) * 100) as attendance_pct,
      ROUND((SELECT COUNT(DISTINCT task_id) FROM (
        SELECT ts.task_id FROM task_submissions ts WHERE ts.user_id = u.user_id AND ts.task_id IN (SELECT id FROM sept_tasks)
        UNION
        SELECT tt.task_id FROM task_threads tt WHERE tt.user_id = u.user_id AND tt.task_id IN (SELECT id FROM sept_tasks)
      ) i)::FLOAT / NULLIF((SELECT COUNT(*) FROM sept_tasks), 0) * 100) as completion_pct
    FROM users u
    LEFT JOIN builder_attendance_new ba ON u.user_id = ba.user_id
    WHERE u.cohort = $1 AND u.active = true AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
    GROUP BY u.user_id, u.first_name, u.last_name
    ORDER BY attendance_pct DESC
  `;

  const data = await executeQuery(query, [cohort]);

  return {
    title: 'H1: Attendance vs Task Completion - All Builders',
    description: `${data.length} builders with attendance and completion data`,
    data,
    columns: [
      { key: 'builder_name', label: 'Builder' },
      { key: 'attendance_pct', label: 'Attendance %', format: (v: number) => `${v}%` },
      { key: 'completion_pct', label: 'Task Completion %', format: (v: number) => `${v}%` },
    ],
  };
}

export async function getH2Details(cohort: string) {
  const query = `
    WITH week1_dates AS (
      SELECT MIN(day_date) as start_date, MAX(day_date) as end_date
      FROM (SELECT day_date FROM curriculum_days WHERE cohort = $1 ORDER BY day_date LIMIT 7) subq
    ),
    sept_tasks AS (
      SELECT DISTINCT t.id
      FROM tasks t JOIN time_blocks tb ON t.block_id = tb.id JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE cd.cohort = $1
    )
    SELECT
      u.user_id,
      u.first_name || ' ' || u.last_name as builder_name,
      (SELECT COUNT(DISTINCT task_id) FROM (
        SELECT ts.task_id FROM task_submissions ts
        WHERE ts.user_id = u.user_id AND ts.task_id IN (SELECT id FROM sept_tasks)
          AND ts.created_at::date BETWEEN (SELECT start_date FROM week1_dates) AND (SELECT end_date FROM week1_dates)
        UNION
        SELECT tt.task_id FROM task_threads tt
        WHERE tt.user_id = u.user_id AND tt.task_id IN (SELECT id FROM sept_tasks)
          AND tt.created_at::date BETWEEN (SELECT start_date FROM week1_dates) AND (SELECT end_date FROM week1_dates)
      ) i) as week1_submissions,
      (SELECT COUNT(DISTINCT task_id) FROM (
        SELECT ts.task_id FROM task_submissions ts WHERE ts.user_id = u.user_id AND ts.task_id IN (SELECT id FROM sept_tasks)
        UNION
        SELECT tt.task_id FROM task_threads tt WHERE tt.user_id = u.user_id AND tt.task_id IN (SELECT id FROM sept_tasks)
      ) i) as total_submissions
    FROM users u
    WHERE u.cohort = $1 AND u.active = true AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
    ORDER BY total_submissions DESC
  `;

  const data = await executeQuery(query, [cohort]);

  return {
    title: 'H2: Early Engagement - All Builders',
    description: `Week 1 activity vs overall engagement for ${data.length} builders`,
    data,
    columns: [
      { key: 'builder_name', label: 'Builder' },
      { key: 'week1_submissions', label: 'Week 1 Tasks' },
      { key: 'total_submissions', label: 'Total Tasks' },
    ],
  };
}

export async function getH4Details(cohort: string) {
  // Week-over-week breakdown
  return {
    title: 'H4: Week-over-Week Improvement - Details',
    description: 'Weekly completion and attendance trends',
    data: [],
    columns: [
      { key: 'week', label: 'Week' },
      { key: 'completion_pct', label: 'Task Completion %' },
      { key: 'attendance_pct', label: 'Attendance %' },
    ],
  };
}
