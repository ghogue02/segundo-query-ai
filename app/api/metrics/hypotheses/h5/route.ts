import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cohort = searchParams.get('cohort') || 'September 2025';

    const query = `
      WITH submission_patterns AS (
        SELECT
          ts.user_id,
          CASE
            WHEN EXTRACT(DOW FROM ts.created_at) IN (0, 6) THEN 'weekend'
            ELSE 'weekday'
          END as period_type,
          COUNT(DISTINCT ts.id) as submission_count
        FROM task_submissions ts
        JOIN users u ON ts.user_id = u.user_id
        WHERE u.cohort = $1
          AND u.active = true
          AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
        GROUP BY ts.user_id, period_type
      )
      SELECT
        period_type,
        SUM(submission_count) as total_submissions,
        AVG(submission_count) as avg_per_builder,
        COUNT(DISTINCT user_id) as builder_count
      FROM submission_patterns
      GROUP BY period_type
    `;

    const results = await executeQuery(query, [cohort]);

    const weekdayData = results.find((r: any) => r.period_type === 'weekday') || {
      total_submissions: 0,
      avg_per_builder: 0,
      builder_count: 0,
    };

    const weekendData = results.find((r: any) => r.period_type === 'weekend') || {
      total_submissions: 0,
      avg_per_builder: 0,
      builder_count: 0,
    };

    const weekday = {
      count: parseInt(String(weekdayData.total_submissions)),
      avgCompletion: Math.round(parseFloat(String(weekdayData.avg_per_builder))),
      builders: parseInt(String(weekdayData.builder_count)),
    };

    const weekend = {
      count: parseInt(String(weekendData.total_submissions)),
      avgCompletion: Math.round(parseFloat(String(weekendData.avg_per_builder))),
      builders: parseInt(String(weekendData.builder_count)),
    };

    const weekendPct = Math.round((weekend.count / (weekday.count + weekend.count)) * 100);

    const insight =
      weekendPct > 40
        ? `${weekendPct}% of submissions happen on weekends, indicating strong weekend engagement.`
        : weekendPct > 25
        ? `${weekendPct}% of submissions on weekends. Balanced work pattern across the week.`
        : `Only ${weekendPct}% of work on weekends. Most activity happens during weekday class time.`;

    return NextResponse.json({
      weekday,
      weekend,
      weekendPct,
      insight,
    });
  } catch (error) {
    console.error('H5 API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch H5 data' }, { status: 500 });
  }
}
