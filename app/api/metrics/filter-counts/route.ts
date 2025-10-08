import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cohort = searchParams.get('cohort') || 'September 2025';

    // Get segment counts (top performers and struggling builders)
    const segmentQuery = `
      WITH builder_stats AS (
        SELECT
          u.user_id,
          -- Task completion
          COUNT(DISTINCT CASE
            WHEN ts.task_id IS NOT NULL OR tt.task_id IS NOT NULL
            THEN COALESCE(ts.task_id, tt.task_id)
          END)::FLOAT /
          NULLIF((SELECT COUNT(*) FROM tasks t
            JOIN time_blocks tb ON t.block_id = tb.id
            JOIN curriculum_days cd ON tb.day_id = cd.id
            WHERE cd.cohort = $1), 0) * 100 as completion_pct,
          -- Attendance
          COUNT(DISTINCT CASE WHEN ba.status IN ('present', 'late') THEN ba.attendance_date END)::FLOAT /
          NULLIF((SELECT COUNT(*) FROM curriculum_days WHERE cohort = $1), 0) * 100 as attendance_pct
        FROM users u
        LEFT JOIN task_submissions ts ON u.user_id = ts.user_id
        LEFT JOIN task_threads tt ON u.user_id = tt.user_id
        LEFT JOIN builder_attendance_new ba ON u.user_id = ba.user_id AND ba.cohort = u.cohort
        WHERE u.cohort = $1
          AND u.active = true
          AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
        GROUP BY u.user_id
      )
      SELECT
        COUNT(*) FILTER (WHERE completion_pct > 90 AND attendance_pct > 90) as top_performers,
        COUNT(*) FILTER (WHERE completion_pct < 50 OR attendance_pct < 70) as struggling,
        COUNT(*) as total_builders
      FROM builder_stats;
    `;

    // Get category task counts
    const categoryQuery = `
      SELECT
        tb.block_category as category,
        COUNT(*) as task_count
      FROM tasks t
      JOIN time_blocks tb ON t.block_id = tb.id
      JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE cd.cohort = $1
      GROUP BY tb.block_category;
    `;

    const [segmentResults, categoryResults] = await Promise.all([
      executeQuery(segmentQuery, [cohort]),
      executeQuery(categoryQuery, [cohort])
    ]);

    const segments = {
      all: parseInt(String(segmentResults[0].total_builders)),
      top: parseInt(String(segmentResults[0].top_performers)),
      struggling: parseInt(String(segmentResults[0].struggling))
    };

    const categories = categoryResults.reduce((acc: Record<string, number>, row: any) => {
      const category = String(row.category);
      acc[category] = parseInt(String(row.task_count));
      return acc;
    }, {});

    return NextResponse.json({
      segments,
      categories
    });
  } catch (error) {
    console.error('Filter counts API error:', error);
    // Return default counts on error to prevent UI breakage
    return NextResponse.json({
      segments: {
        all: 75,
        top: 0,
        struggling: 0
      },
      categories: {
        'learning': 50,
        'building': 30,
        'collaboration': 15,
        'reflection': 10,
        'other': 5
      },
      error: 'Database temporarily unavailable'
    });
  }
}
