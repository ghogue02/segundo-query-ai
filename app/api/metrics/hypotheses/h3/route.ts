import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

// Category mapping
const CATEGORY_MAPPING: Record<string, string> = {
  learning: 'Core Learning',
  building: 'Applied Work',
  collaboration: 'Collaboration',
  reflection: 'Reflection',
  other: 'Other',
};

const BLOCK_CATEGORY_TO_META: Record<string, string> = {
  'Learning': 'learning',
  'Practice': 'learning',
  'Research': 'learning',
  'Self learning': 'learning',
  'Building': 'building',
  'Build': 'building',
  'Testing': 'building',
  'Assessment': 'building',
  'Group Activity': 'collaboration',
  'Team Building': 'collaboration',
  'Presentation': 'collaboration',
  'Reflection': 'reflection',
  'Reflecton': 'reflection', // typo in data
  'Individual': 'reflection',
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cohort = searchParams.get('cohort') || 'September 2025';

    const query = `
      SELECT
        tb.block_category,
        COUNT(DISTINCT ts.user_id)::FLOAT / NULLIF(
          (SELECT COUNT(*) FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})),
          0
        ) * 100 as completion_pct
      FROM time_blocks tb
      JOIN tasks t ON t.block_id = tb.id
      LEFT JOIN task_submissions ts ON ts.task_id = t.id
      JOIN users u ON ts.user_id = u.user_id
      WHERE u.cohort = $1
        AND u.active = true
        AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
        AND tb.block_category IS NOT NULL
      GROUP BY tb.block_category
      HAVING COUNT(DISTINCT ts.id) > 0
    `;

    const results = await executeQuery(query, [cohort]);

    // Group into meta-categories
    const categoryTotals: Record<string, { total: number; count: number }> = {
      learning: { total: 0, count: 0 },
      building: { total: 0, count: 0 },
      collaboration: { total: 0, count: 0 },
      reflection: { total: 0, count: 0 },
      other: { total: 0, count: 0 },
    };

    results.forEach((row: any) => {
      const metaCategory = BLOCK_CATEGORY_TO_META[row.block_category] || 'other';
      categoryTotals[metaCategory].total += parseFloat(row.completion_pct);
      categoryTotals[metaCategory].count += 1;
    });

    const categories = Object.entries(categoryTotals)
      .filter(([_, data]) => data.count > 0)
      .map(([key, data]) => ({
        key,
        name: CATEGORY_MAPPING[key],
        completion_pct: Math.round(data.total / data.count),
      }))
      .sort((a, b) => b.completion_pct - a.completion_pct);

    const topCategory = categories[0];
    const insight = topCategory
      ? `${topCategory.name} activities have the highest completion rate at ${topCategory.completion_pct}%.`
      : 'Insufficient data for activity preference analysis.';

    return NextResponse.json({ categories, insight });
  } catch (error) {
    console.error('H3 API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch H3 data' }, { status: 500 });
  }
}
