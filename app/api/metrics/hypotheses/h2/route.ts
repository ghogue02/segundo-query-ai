import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

/**
 * H2: Early Engagement Predicts Success
 * Week 1 submissions vs Total submissions
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cohort = searchParams.get('cohort') || 'September 2025';

    // Get Week 1 date range (Sept 6-12 for September cohort)
    const week1Query = `
      SELECT MIN(day_date) as start_date, MAX(day_date) as end_date
      FROM (
        SELECT day_date FROM curriculum_days
        WHERE cohort = $1
        ORDER BY day_date
        LIMIT 7
      ) subq
    `;

    const week1Result = await executeQuery(week1Query, [cohort]);
    const week1Start = week1Result[0]?.start_date;
    const week1End = week1Result[0]?.end_date;

    if (!week1Start) {
      return NextResponse.json({ builders: [], correlation: 0, trendline: [], insights: {} });
    }

    // Get submission counts per builder
    const query = `
      WITH builder_submissions AS (
        SELECT
          u.user_id,
          u.first_name || ' ' || u.last_name as builder_name,
          COUNT(DISTINCT CASE
            WHEN ts.created_at::date BETWEEN $2 AND $3 THEN ts.id
          END) as week1_submissions,
          COUNT(DISTINCT ts.id) as total_submissions
        FROM users u
        LEFT JOIN task_submissions ts ON u.user_id = ts.user_id
        WHERE u.cohort = $1
          AND u.active = true
          AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
        GROUP BY u.user_id, u.first_name, u.last_name
        HAVING COUNT(DISTINCT ts.id) > 0
      )
      SELECT * FROM builder_submissions
      ORDER BY total_submissions DESC
    `;

    const results = await executeQuery(query, [cohort, week1Start, week1End]);

    const builders = results.map((row: any) => ({
      x: parseInt(row.week1_submissions),
      y: parseInt(row.total_submissions),
      label: row.builder_name,
      user_id: row.user_id,
    }));

    // Calculate correlation
    const n = builders.length;
    if (n === 0) {
      return NextResponse.json({
        builders: [],
        correlation: 0,
        trendline: [],
        insights: { avgWeek1: 0, topPerformersAvgWeek1: 0, strugglingAvgWeek1: 0 },
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

    // Trendline
    const meanX = sumX / n;
    const meanY = sumY / n;
    const slope =
      sumX2 - n * meanX * meanX === 0
        ? 0
        : (sumXY - n * meanX * meanY) / (sumX2 - n * meanX * meanX);
    const intercept = meanY - slope * meanX;

    const maxX = Math.max(...builders.map((b) => b.x));
    const trendline = [
      { x: 0, y: intercept },
      { x: maxX, y: slope * maxX + intercept },
    ];

    // Insights
    const sortedByTotal = [...builders].sort((a, b) => b.y - a.y);
    const topPerformers = sortedByTotal.slice(0, Math.ceil(n * 0.2)); // Top 20%
    const struggling = sortedByTotal.slice(-Math.ceil(n * 0.2)); // Bottom 20%

    const avgWeek1 = sumX / n;
    const topPerformersAvgWeek1 = topPerformers.reduce((sum, b) => sum + b.x, 0) / topPerformers.length;
    const strugglingAvgWeek1 = struggling.reduce((sum, b) => sum + b.x, 0) / struggling.length;

    return NextResponse.json({
      builders,
      correlation: Math.round(correlation * 100) / 100,
      trendline,
      insights: {
        avgWeek1,
        topPerformersAvgWeek1,
        strugglingAvgWeek1,
      },
    });
  } catch (error) {
    console.error('H2 API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch H2 data' }, { status: 500 });
  }
}
