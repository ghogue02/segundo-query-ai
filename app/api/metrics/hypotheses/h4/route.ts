import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cohort = searchParams.get('cohort') || 'September 2025';

    const query = `
      WITH week_numbers AS (
        SELECT DISTINCT
          EXTRACT(WEEK FROM day_date) - EXTRACT(WEEK FROM (SELECT MIN(day_date) FROM curriculum_days WHERE cohort = $1)) + 1 as week_number,
          'Week ' || (EXTRACT(WEEK FROM day_date) - EXTRACT(WEEK FROM (SELECT MIN(day_date) FROM curriculum_days WHERE cohort = $1)) + 1) as week_label
        FROM curriculum_days
        WHERE cohort = $1
          AND day_date < CURRENT_DATE  -- Only completed days
      ),
      builder_week_stats AS (
        SELECT
          wn.week_number,
          wn.week_label,
          u.user_id,
          -- Per-builder task completion % for that week
          COUNT(DISTINCT CASE
            WHEN ts.task_id IS NOT NULL OR tt.task_id IS NOT NULL
            THEN COALESCE(ts.task_id, tt.task_id)
          END)::FLOAT / NULLIF(COUNT(DISTINCT t.id), 0) * 100 as builder_completion_pct
        FROM week_numbers wn
        CROSS JOIN users u
        CROSS JOIN curriculum_days cd
        LEFT JOIN time_blocks tb ON tb.day_id = cd.id
        LEFT JOIN tasks t ON t.block_id = tb.id AND t.task_type != 'break'
        LEFT JOIN task_submissions ts ON ts.task_id = t.id AND ts.user_id = u.user_id
        LEFT JOIN task_threads tt ON tt.task_id = t.id AND tt.user_id = u.user_id
        WHERE cd.cohort = $1
          AND EXTRACT(WEEK FROM cd.day_date) - EXTRACT(WEEK FROM (SELECT MIN(day_date) FROM curriculum_days WHERE cohort = $1)) + 1 = wn.week_number
          AND u.cohort = $1
          AND u.active = true
          AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
        GROUP BY wn.week_number, wn.week_label, u.user_id
      ),
      daily_attendance AS (
        SELECT
          cd.day_date,
          EXTRACT(WEEK FROM cd.day_date) - EXTRACT(WEEK FROM (SELECT MIN(day_date) FROM curriculum_days WHERE cohort = $1)) + 1 as week_number,
          COUNT(DISTINCT ba.user_id)::FLOAT / NULLIF(
            (SELECT COUNT(*) FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})), 0
          ) * 100 as daily_attendance_pct
        FROM curriculum_days cd
        LEFT JOIN builder_attendance_new ba ON ba.attendance_date = cd.day_date
          AND ba.status IN ('present', 'late')
          AND ba.user_id IN (
            SELECT user_id FROM users
            WHERE cohort = $1 AND active = true
              AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
          )
        WHERE cd.cohort = $1
          AND cd.day_date < CURRENT_DATE
          AND EXTRACT(DOW FROM cd.day_date) NOT IN (4, 5)  -- Exclude Thu/Fri
        GROUP BY cd.day_date, week_number
      ),
      week_summary AS (
        SELECT
          wn.week_number,
          wn.week_label,
          -- Average task completion across all builders
          COALESCE(AVG(bws.builder_completion_pct), 0) as completion_pct,
          -- Average daily attendance for the week
          COALESCE((SELECT AVG(daily_attendance_pct) FROM daily_attendance WHERE week_number = wn.week_number), 0) as attendance_pct,
          -- Active builders (unique builders who interacted)
          COUNT(DISTINCT CASE WHEN bws.builder_completion_pct > 0 THEN bws.user_id END) as active_builders
        FROM week_numbers wn
        LEFT JOIN builder_week_stats bws ON bws.week_number = wn.week_number
        GROUP BY wn.week_number, wn.week_label
      )
      SELECT
        week_number,
        week_label,
        ROUND(completion_pct::numeric, 1) as completion_pct,
        ROUND(attendance_pct::numeric, 1) as attendance_pct,
        active_builders
      FROM week_summary
      ORDER BY week_number
    `;

    const results = await executeQuery(query, [cohort]);

    const weeks = results.map((row: any) => ({
      week_number: parseInt(row.week_number),
      week_label: row.week_label,
      completion_pct: parseFloat(row.completion_pct),
      attendance_pct: parseFloat(row.attendance_pct),
      active_builders: parseInt(row.active_builders),
    }));

    // Determine trends
    const getTrend = (values: number[]): 'improving' | 'declining' | 'stable' => {
      if (values.length < 2) return 'stable';
      const first = values[0];
      const last = values[values.length - 1];
      const diff = last - first;

      if (diff > 5) return 'improving';
      if (diff < -5) return 'declining';
      return 'stable';
    };

    const completionValues = weeks.map((w) => w.completion_pct);
    const attendanceValues = weeks.map((w) => w.attendance_pct);

    const completionTrend = getTrend(completionValues);
    const attendanceTrend = getTrend(attendanceValues);

    const overallDirection =
      completionTrend === 'improving' && attendanceTrend === 'improving'
        ? 'Cohort is improving across both metrics! Strong upward trajectory.'
        : completionTrend === 'improving' || attendanceTrend === 'improving'
        ? `Cohort showing improvement in ${completionTrend === 'improving' ? 'task completion' : 'attendance'}.`
        : completionTrend === 'declining' && attendanceTrend === 'declining'
        ? 'Declining trends detected in both metrics. Consider intervention strategies.'
        : 'Performance is stable week-over-week. Continue monitoring.';

    return NextResponse.json({
      weeks,
      trends: {
        completion: completionTrend,
        attendance: attendanceTrend,
        overallDirection,
      },
    });
  } catch (error) {
    console.error('H4 API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch H4 data' }, { status: 500 });
  }
}
