/**
 * Test script to investigate available builder data
 */
import { executeQuery } from '../lib/db';

async function investigateBuilderData() {
  console.log('🔍 Investigating Builder Data Structure\n');

  try {
    // 1. Check attendance statuses
    console.log('1️⃣ ATTENDANCE STATUS VALUES:');
    const statuses = await executeQuery<{ status: string; count: number }>(
      `SELECT status, COUNT(*) as count
       FROM builder_attendance_new
       GROUP BY status
       ORDER BY count DESC`
    );
    console.log(statuses);
    console.log('');

    // 2. Check task_analyses structure
    console.log('2️⃣ TASK ANALYSES SAMPLE (User 322):');
    const taskAnalyses = await executeQuery(
      `SELECT
        user_id,
        task_id,
        created_at,
        analysis_result->>'completion_score' as score,
        analysis_result->>'analysis_type' as type,
        analysis_result->>'feedback' as feedback
       FROM task_analyses
       WHERE user_id = 322
       ORDER BY created_at DESC
       LIMIT 5`
    );
    console.log(taskAnalyses);
    console.log('');

    // 3. Check task categories
    console.log('3️⃣ TASK CATEGORIES AND TYPES:');
    const taskTypes = await executeQuery(
      `SELECT DISTINCT category, type, COUNT(*) as count
       FROM tasks
       WHERE category IS NOT NULL
       GROUP BY category, type
       ORDER BY category, type`
    );
    console.log(taskTypes);
    console.log('');

    // 4. Check task completion by category for a builder
    console.log('4️⃣ TASK COMPLETION BY CATEGORY (User 322):');
    const categoryBreakdown = await executeQuery(
      `SELECT
        t.category,
        t.type,
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(DISTINCT CASE WHEN ts.id IS NOT NULL OR tt.id IS NOT NULL THEN t.id END) as completed
       FROM tasks t
       JOIN time_blocks tb ON t.block_id = tb.id
       JOIN curriculum_days cd ON tb.day_id = cd.id
       LEFT JOIN task_submissions ts ON t.id = ts.task_id AND ts.user_id = 322
       LEFT JOIN task_threads tt ON t.id = tt.task_id AND tt.user_id = 322
       WHERE cd.cohort = 'September 2025'
       GROUP BY t.category, t.type
       ORDER BY t.category, t.type`
    );
    console.log(categoryBreakdown);
    console.log('');

    // 5. Check engagement metrics
    console.log('5️⃣ ENGAGEMENT METRICS (User 322):');
    const engagement = await executeQuery(
      `SELECT
        COUNT(DISTINCT ts.id) as submissions_count,
        COUNT(DISTINCT tt.id) as threads_count,
        COUNT(DISTINCT ta.id) as analyses_count,
        COUNT(DISTINCT ba.attendance_date) as attendance_days
       FROM users u
       LEFT JOIN task_submissions ts ON u.user_id = ts.user_id
       LEFT JOIN task_threads tt ON u.user_id = tt.user_id
       LEFT JOIN task_analyses ta ON u.user_id = ta.user_id
       LEFT JOIN builder_attendance_new ba ON u.user_id = ba.user_id
       WHERE u.user_id = 322`
    );
    console.log(engagement);
    console.log('');

    // 6. Check quality score history
    console.log('6️⃣ QUALITY SCORE HISTORY (User 322):');
    const qualityHistory = await executeQuery(
      `SELECT
        DATE(ta.created_at) as assessment_date,
        COUNT(*) as assessments,
        ROUND(AVG(CAST(ta.analysis_result->>'completion_score' AS NUMERIC)), 1) as avg_score
       FROM task_analyses ta
       WHERE ta.user_id = 322
         AND ta.analysis_result->>'completion_score' IS NOT NULL
       GROUP BY DATE(ta.created_at)
       ORDER BY assessment_date DESC
       LIMIT 10`
    );
    console.log(qualityHistory);
    console.log('');

    // 7. Check available analysis_result fields
    console.log('7️⃣ ANALYSIS RESULT FIELDS:');
    const analysisFields = await executeQuery(
      `SELECT DISTINCT jsonb_object_keys(analysis_result) as field
       FROM task_analyses
       WHERE user_id = 322
       LIMIT 20`
    );
    console.log(analysisFields);
    console.log('');

    // 8. Total class days
    console.log('8️⃣ TOTAL CLASS DAYS (September 2025):');
    const totalDays = await executeQuery(
      `SELECT COUNT(*) as total_class_days
       FROM curriculum_days
       WHERE cohort = 'September 2025'
         AND EXTRACT(DOW FROM day_date) NOT IN (4, 5)`
    );
    console.log(totalDays);
    console.log('');

    // 9. Builder cohort stats
    console.log('9️⃣ BUILDER COHORT STATS:');
    const cohortStats = await executeQuery(
      `SELECT
        COUNT(*) as total_builders,
        COUNT(DISTINCT CASE WHEN user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332) THEN user_id END) as active_builders
       FROM users
       WHERE cohort = 'September 2025'`
    );
    console.log(cohortStats);
    console.log('');

    console.log('✅ Investigation complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run investigation
investigateBuilderData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Investigation failed:', error);
    process.exit(1);
  });
