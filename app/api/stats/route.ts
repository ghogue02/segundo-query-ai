import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

export async function GET() {
  try {
    // Query 1: Active builders count
    const buildersQuery = `
      SELECT COUNT(DISTINCT user_id) as active_builders
      FROM users
      WHERE cohort = 'September 2025'
        AND active = true
        AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
    `;

    // Query 2: Class days count
    const daysQuery = `
      SELECT COUNT(DISTINCT id) as class_days
      FROM curriculum_days
      WHERE cohort = 'September 2025'
    `;

    // Query 3: Total tasks count
    const tasksQuery = `
      SELECT COUNT(*) as total_tasks
      FROM tasks t
      JOIN time_blocks tb ON t.block_id = tb.id
      JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE cd.cohort = 'September 2025'
    `;

    // Execute all queries
    const [buildersResult, daysResult, tasksResult] = await Promise.all([
      executeQuery(buildersQuery, []),
      executeQuery(daysQuery, []),
      executeQuery(tasksQuery, [])
    ]);

    const stats = {
      activeBuilders: parseInt(String(buildersResult[0].active_builders)),
      classDays: parseInt(String(daysResult[0].class_days)),
      totalTasks: parseInt(String(tasksResult[0].total_tasks))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
