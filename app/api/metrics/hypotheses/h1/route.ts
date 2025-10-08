import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { calculateBulkTaskCompletion } from '@/lib/metrics/task-completion';

const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

/**
 * H1: Attendance Drives Task Completion
 * Scatter plot showing correlation between attendance % and completion %
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cohort = searchParams.get('cohort') || 'September 2025';

    // Use shared task completion utility for consistency
    const taskCompletions = await calculateBulkTaskCompletion(cohort);
    const completionMap = new Map(taskCompletions.map(tc => [tc.user_id, tc.completion_pct]));

    // Get attendance for each builder
    const query = `
      WITH class_days AS (
        SELECT COUNT(*) as total_class_days
        FROM curriculum_days
        WHERE cohort = $1
          AND EXTRACT(DOW FROM day_date) NOT IN (4, 5)
      )
      SELECT
        u.user_id,
        u.first_name || ' ' || u.last_name as builder_name,
        LEAST(
          ROUND(
            COUNT(DISTINCT CASE WHEN ba.status IN ('present', 'late') THEN ba.attendance_date END)::FLOAT /
            NULLIF((SELECT total_class_days FROM class_days), 0) * 100
          ),
          100
        ) as attendance_pct
      FROM users u
      LEFT JOIN builder_attendance_new ba ON u.user_id = ba.user_id
        AND EXTRACT(DOW FROM ba.attendance_date) NOT IN (4, 5)
      WHERE u.cohort = $1
        AND u.active = true
        AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
      GROUP BY u.user_id, u.first_name, u.last_name
      ORDER BY attendance_pct DESC
    `;

    const results = await executeQuery(query, [cohort]);

    // Transform to scatter plot format with shared task completion data
    const builders = results.map((row: any) => ({
      x: parseFloat(row.attendance_pct),
      y: completionMap.get(row.user_id) || 0,
      label: row.builder_name,
      user_id: row.user_id,
    }));

    // Calculate correlation coefficient (Pearson's r)
    const n = builders.length;
    if (n === 0) {
      return NextResponse.json({
        builders: [],
        correlation: 0,
        trendline: [],
      });
    }

    const sumX = builders.reduce((sum, p) => sum + p.x, 0);
    const sumY = builders.reduce((sum, p) => sum + p.y, 0);
    const sumXY = builders.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = builders.reduce((sum, p) => sum + p.x * p.x, 0);
    const sumY2 = builders.reduce((sum, p) => sum + p.y * p.y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    const correlation = denominator === 0 ? 0 : numerator / denominator;

    // Calculate trendline (linear regression)
    const meanX = sumX / n;
    const meanY = sumY / n;
    const slope =
      sumX2 - n * meanX * meanX === 0
        ? 0
        : (sumXY - n * meanX * meanY) / (sumX2 - n * meanX * meanX);
    const intercept = meanY - slope * meanX;

    const trendline = [
      { x: 0, y: intercept },
      { x: 100, y: slope * 100 + intercept },
    ];

    return NextResponse.json({
      builders,
      correlation: Math.round(correlation * 100) / 100,
      trendline,
    });
  } catch (error) {
    console.error('H1 API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch H1 data' }, { status: 500 });
  }
}
