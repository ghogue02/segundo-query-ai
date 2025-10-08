/**
 * Task-Level Quality Service (PostgreSQL)
 *
 * Provides task-level quality calculations from task_analyses table.
 * Part of hybrid approach: PostgreSQL for task quality, BigQuery for rubric breakdown.
 *
 * Expected baseline: ~71.9 average quality across September 2025 cohort
 */

import { executeQuery } from '@/lib/db';

// Excluded users: instructors, inactive builders, duplicate accounts
const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

export interface TaskQualityScore {
  task_id: number;
  builders_assessed: number;
  avg_quality: number;
  total_assessments: number;
}

export interface BuilderQualityScore {
  user_id: number;
  builder_name: string;
  tasks_assessed: number;
  avg_quality: number;
  total_assessments: number;
}

export interface TaskBuilderScore {
  user_id: number;
  builder_name: string;
  quality_score: number;
  created_at: Date;
  analysis_type: string;
}

/**
 * Get cohort-wide average quality from all task assessments
 *
 * @param cohort - Cohort name (e.g., "September 2025")
 * @returns Average quality score across all task assessments (expected ~71.9)
 */
export async function getCohortTaskQuality(cohort: string): Promise<number> {
  try {
    const sql = `
      SELECT ROUND(AVG(CAST(ta.analysis_result->>'completion_score' AS NUMERIC)), 1) as avg_quality
      FROM task_analyses ta
      JOIN users u ON ta.user_id = u.user_id
      WHERE u.cohort = $1
        AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(', ')})
        AND ta.analysis_result->>'completion_score' IS NOT NULL
        AND CAST(ta.analysis_result->>'completion_score' AS NUMERIC) BETWEEN 0 AND 100
    `;

    const result = await executeQuery<{ avg_quality: number }>(sql, [cohort]);

    if (!result || result.length === 0 || result[0].avg_quality === null) {
      console.warn(`No task quality data found for cohort: ${cohort}`);
      return 0;
    }

    return result[0].avg_quality;
  } catch (error) {
    console.error('Error fetching cohort task quality:', error);
    throw new Error(`Failed to fetch cohort task quality: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get per-task quality averages (for drill-down)
 *
 * @param cohort - Cohort name
 * @returns Array of task-level quality scores with assessment counts
 */
export async function getTaskLevelQuality(cohort: string): Promise<TaskQualityScore[]> {
  try {
    const sql = `
      SELECT
        t.id as task_id,
        COUNT(DISTINCT ta.user_id) as builders_assessed,
        ROUND(AVG(CAST(ta.analysis_result->>'completion_score' AS NUMERIC)), 1) as avg_quality,
        COUNT(ta.id) as total_assessments
      FROM tasks t
      JOIN task_analyses ta ON t.id = ta.task_id
      JOIN users u ON ta.user_id = u.user_id
      WHERE u.cohort = $1
        AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(', ')})
        AND ta.analysis_result->>'completion_score' IS NOT NULL
        AND CAST(ta.analysis_result->>'completion_score' AS NUMERIC) BETWEEN 0 AND 100
      GROUP BY t.id
      ORDER BY t.id
    `;

    const result = await executeQuery<TaskQualityScore>(sql, [cohort]);

    if (!result || result.length === 0) {
      console.warn(`No task-level quality data found for cohort: ${cohort}`);
      return [];
    }

    return result;
  } catch (error) {
    console.error('Error fetching task-level quality:', error);
    throw new Error(`Failed to fetch task-level quality: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get per-builder quality averages from task_analyses
 *
 * @param cohort - Cohort name
 * @returns Array of builder-level quality scores with task counts
 */
export async function getBuilderTaskQuality(cohort: string): Promise<BuilderQualityScore[]> {
  try {
    const sql = `
      SELECT
        u.user_id,
        CONCAT(u.first_name, ' ', u.last_name) as builder_name,
        COUNT(DISTINCT ta.task_id) as tasks_assessed,
        ROUND(AVG(CAST(ta.analysis_result->>'completion_score' AS NUMERIC)), 1) as avg_quality,
        COUNT(ta.id) as total_assessments
      FROM users u
      JOIN task_analyses ta ON u.user_id = ta.user_id
      WHERE u.cohort = $1
        AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(', ')})
        AND ta.analysis_result->>'completion_score' IS NOT NULL
        AND CAST(ta.analysis_result->>'completion_score' AS NUMERIC) BETWEEN 0 AND 100
      GROUP BY u.user_id, u.first_name, u.last_name
      ORDER BY avg_quality DESC
    `;

    const result = await executeQuery<BuilderQualityScore>(sql, [cohort]);

    if (!result || result.length === 0) {
      console.warn(`No builder quality data found for cohort: ${cohort}`);
      return [];
    }

    return result;
  } catch (error) {
    console.error('Error fetching builder task quality:', error);
    throw new Error(`Failed to fetch builder task quality: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get individual builder scores for specific task (drill-down detail)
 *
 * @param taskId - Task ID to query
 * @param cohort - Cohort name
 * @returns Array of individual builder scores for the task
 */
export async function getTaskBuilderScores(taskId: number, cohort: string): Promise<TaskBuilderScore[]> {
  try {
    const sql = `
      SELECT
        u.user_id,
        CONCAT(u.first_name, ' ', u.last_name) as builder_name,
        CAST(ta.analysis_result->>'completion_score' AS NUMERIC) as quality_score,
        ta.created_at,
        COALESCE(ta.analysis_result->>'analysis_type', 'unknown') as analysis_type
      FROM task_analyses ta
      JOIN users u ON ta.user_id = u.user_id
      WHERE ta.task_id = $1
        AND u.cohort = $2
        AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(', ')})
        AND ta.analysis_result->>'completion_score' IS NOT NULL
        AND CAST(ta.analysis_result->>'completion_score' AS NUMERIC) BETWEEN 0 AND 100
      ORDER BY quality_score DESC, u.first_name, u.last_name
    `;

    const result = await executeQuery<TaskBuilderScore>(sql, [taskId, cohort]);

    if (!result || result.length === 0) {
      console.warn(`No builder scores found for task ${taskId} in cohort: ${cohort}`);
      return [];
    }

    return result;
  } catch (error) {
    console.error('Error fetching task builder scores:', error);
    throw new Error(`Failed to fetch task builder scores: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// INLINE TESTS (Development/Verification)
// ============================================================================

/**
 * Test suite for task-quality service
 * Run with: npx ts-node lib/services/task-quality.ts
 */
async function runTests() {
  const COHORT = 'September 2025';

  console.log('🧪 Testing Task Quality Service\n');
  console.log('================================\n');

  try {
    // Test 1: Cohort average (~71.9 expected)
    console.log('Test 1: Cohort Average Quality');
    const cohortAvg = await getCohortTaskQuality(COHORT);
    console.log(`✅ Cohort average: ${cohortAvg}`);
    console.log(`   Expected: ~71.9, Got: ${cohortAvg}`);
    console.log(`   ${Math.abs(cohortAvg - 71.9) < 5 ? '✅ PASS' : '❌ FAIL'} (within 5 points of expected)\n`);

    // Test 2: Task-level quality (199 tasks expected)
    console.log('Test 2: Task-Level Quality Breakdown');
    const taskQuality = await getTaskLevelQuality(COHORT);
    console.log(`✅ Tasks with quality data: ${taskQuality.length}`);
    console.log(`   Expected: ~199 tasks, Got: ${taskQuality.length}`);
    console.log(`   ${taskQuality.length >= 190 ? '✅ PASS' : '❌ FAIL'} (at least 190 tasks)\n`);

    if (taskQuality.length > 0) {
      console.log('   Sample tasks:');
      taskQuality.slice(0, 3).forEach(t => {
        console.log(`   - Task ${t.task_id}: ${t.avg_quality} avg (${t.builders_assessed} builders, ${t.total_assessments} assessments)`);
      });
      console.log('');
    }

    // Test 3: Builder-level quality (170 builders expected)
    console.log('Test 3: Builder-Level Quality Averages');
    const builderQuality = await getBuilderTaskQuality(COHORT);
    console.log(`✅ Builders with quality data: ${builderQuality.length}`);
    console.log(`   Expected: ~170 builders, Got: ${builderQuality.length}`);
    console.log(`   ${builderQuality.length >= 165 ? '✅ PASS' : '❌ FAIL'} (at least 165 builders)\n`);

    if (builderQuality.length > 0) {
      console.log('   Top 3 builders:');
      builderQuality.slice(0, 3).forEach((b, idx) => {
        console.log(`   ${idx + 1}. ${b.builder_name}: ${b.avg_quality} avg (${b.tasks_assessed} tasks)`);
      });
      console.log('');
    }

    // Test 4: Excluded users verification
    console.log('Test 4: Excluded Users Filter');
    const allBuilders = await executeQuery<{ user_id: number }>(
      `SELECT DISTINCT user_id FROM task_analyses WHERE user_id IN (${EXCLUDED_USER_IDS.join(', ')})`
    );
    const includedExcluded = builderQuality.filter(b => EXCLUDED_USER_IDS.includes(b.user_id));
    console.log(`✅ Excluded users in data: ${allBuilders.length}`);
    console.log(`   Found in results: ${includedExcluded.length}`);
    console.log(`   ${includedExcluded.length === 0 ? '✅ PASS' : '❌ FAIL'} (no excluded users in results)\n`);

    // Test 5: Drill-down for specific task
    if (taskQuality.length > 0) {
      const sampleTaskId = taskQuality[0].task_id;
      console.log(`Test 5: Task Builder Scores (Task ${sampleTaskId})`);
      const taskScores = await getTaskBuilderScores(sampleTaskId, COHORT);
      console.log(`✅ Builder scores for task: ${taskScores.length}`);

      if (taskScores.length > 0) {
        console.log('   Sample scores:');
        taskScores.slice(0, 3).forEach(s => {
          console.log(`   - ${s.builder_name}: ${s.quality_score} (${s.analysis_type})`);
        });
      }
      console.log('');
    }

    console.log('================================');
    console.log('✅ All tests completed successfully!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}
