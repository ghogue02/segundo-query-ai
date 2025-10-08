import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

/**
 * H7: Task Difficulty Distribution
 * Shows completion rates across all tasks to identify difficult ones
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cohort = searchParams.get('cohort') || 'September 2025';

    const query = `
      WITH sept_tasks AS (
        SELECT DISTINCT t.id, t.task_title
        FROM tasks t
        JOIN time_blocks tb ON t.block_id = tb.id
        JOIN curriculum_days cd ON tb.day_id = cd.id
        WHERE cd.cohort = $1 AND t.task_type != 'break'
      ),
      task_completion AS (
        SELECT
          st.id as task_id,
          st.task_title,
          (SELECT COUNT(DISTINCT user_id) FROM (
            SELECT ts.user_id FROM task_submissions ts WHERE ts.task_id = st.id AND ts.user_id IN (
              SELECT user_id FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
            )
            UNION
            SELECT tt.user_id FROM task_threads tt WHERE tt.task_id = st.id AND tt.user_id IN (
              SELECT user_id FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
            )
          ) interactions)::FLOAT / NULLIF(
            (SELECT COUNT(*) FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})),
            0
          ) * 100 as completion_rate,
          (SELECT COUNT(*) FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})) as total_builders,
          (SELECT COUNT(DISTINCT user_id) FROM (
            SELECT ts.user_id FROM task_submissions ts WHERE ts.task_id = st.id AND ts.user_id IN (
              SELECT user_id FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
            )
            UNION
            SELECT tt.user_id FROM task_threads tt WHERE tt.task_id = st.id AND tt.user_id IN (
              SELECT user_id FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
            )
          ) interactions) as completed_count
        FROM sept_tasks st
      )
      SELECT
        task_id,
        task_title,
        ROUND(completion_rate::numeric, 1) as completion_rate,
        total_builders,
        completed_count,
        CASE
          WHEN completion_rate >= 90 THEN 'Easy'
          WHEN completion_rate >= 70 THEN 'Medium'
          WHEN completion_rate >= 50 THEN 'Hard'
          ELSE 'Very Hard'
        END as difficulty
      FROM task_completion
      ORDER BY completion_rate ASC
    `;

    const results = await executeQuery(query, [cohort]);

    const tasks = results.map((row: any) => ({
      task_id: parseInt(row.task_id),
      task_title: row.task_title,
      completion_rate: parseFloat(row.completion_rate),
      total_builders: parseInt(row.total_builders),
      completed_count: parseInt(row.completed_count),
      difficulty: row.difficulty as 'Easy' | 'Medium' | 'Hard' | 'Very Hard',
    }));

    // Distribution
    const distribution = {
      easy: tasks.filter((t) => t.difficulty === 'Easy').length,
      medium: tasks.filter((t) => t.difficulty === 'Medium').length,
      hard: tasks.filter((t) => t.difficulty === 'Hard').length,
      veryHard: tasks.filter((t) => t.difficulty === 'Very Hard').length,
    };

    // Tasks needing redesign (<70% completion)
    const needsRedesign = tasks.filter((t) => t.completion_rate < 70);

    return NextResponse.json({
      tasks,
      distribution,
      needsRedesign,
    });
  } catch (error) {
    console.error('H7 API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch H7 data' }, { status: 500 });
  }
}
