/**
 * Diagnostic script to investigate task_analyses data coverage
 * Run with: npx tsx --env-file=.env.local scripts/diagnose-quality-data.ts
 */

import { executeQuery } from '../lib/db';

const COHORT = 'September 2025';
const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

async function diagnose() {
  console.log('🔍 Diagnosing task_analyses data coverage\n');
  console.log('==========================================\n');

  try {
    // Total task_analyses records
    const totalRecords = await executeQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM task_analyses`
    );
    console.log(`Total task_analyses records: ${totalRecords[0].count}\n`);

    // Records with completion_score
    const withScore = await executeQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM task_analyses
       WHERE analysis_result->>'completion_score' IS NOT NULL`
    );
    console.log(`Records with completion_score: ${withScore[0].count}\n`);

    // Records for September 2025 cohort
    const cohortRecords = await executeQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM task_analyses ta
       JOIN users u ON ta.user_id = u.user_id
       WHERE u.cohort = $1`,
      [COHORT]
    );
    console.log(`Records for ${COHORT}: ${cohortRecords[0].count}\n`);

    // Unique tasks with assessments
    const uniqueTasks = await executeQuery<{ count: number }>(
      `SELECT COUNT(DISTINCT ta.task_id) as count
       FROM task_analyses ta
       JOIN users u ON ta.user_id = u.user_id
       WHERE u.cohort = $1
         AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(', ')})
         AND ta.analysis_result->>'completion_score' IS NOT NULL`,
      [COHORT]
    );
    console.log(`Unique tasks with quality data: ${uniqueTasks[0].count}\n`);

    // Total curriculum tasks for cohort
    const totalTasks = await executeQuery<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM tasks t
       JOIN time_blocks tb ON t.block_id = tb.id
       JOIN curriculum_days cd ON tb.day_id = cd.id
       WHERE cd.cohort = $1`,
      [COHORT]
    );
    console.log(`Total curriculum tasks for ${COHORT}: ${totalTasks[0].count}\n`);

    // Unique builders with assessments
    const uniqueBuilders = await executeQuery<{ count: number }>(
      `SELECT COUNT(DISTINCT ta.user_id) as count
       FROM task_analyses ta
       JOIN users u ON ta.user_id = u.user_id
       WHERE u.cohort = $1
         AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(', ')})
         AND ta.analysis_result->>'completion_score' IS NOT NULL`,
      [COHORT]
    );
    console.log(`Unique builders with quality data: ${uniqueBuilders[0].count}\n`);

    // Total active builders in cohort
    const totalBuilders = await executeQuery<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM users
       WHERE cohort = $1
         AND active = true
         AND user_id NOT IN (${EXCLUDED_USER_IDS.join(', ')})`,
      [COHORT]
    );
    console.log(`Total active builders in ${COHORT}: ${totalBuilders[0].count}\n`);

    // Sample of tasks without assessments
    console.log('Sample tasks WITHOUT quality assessments:');
    const tasksWithoutAssessments = await executeQuery<{ task_id: number, intro: string }>(
      `SELECT t.id as task_id, LEFT(t.intro, 80) as intro
       FROM tasks t
       JOIN time_blocks tb ON t.block_id = tb.id
       JOIN curriculum_days cd ON tb.day_id = cd.id
       LEFT JOIN task_analyses ta ON t.id = ta.task_id
       WHERE cd.cohort = $1
         AND ta.id IS NULL
       LIMIT 10`,
      [COHORT]
    );
    tasksWithoutAssessments.forEach(t => {
      console.log(`  - Task ${t.task_id}: ${t.intro || '(no intro)'}...`);
    });
    console.log('');

    // Check what's in analysis_result
    console.log('Sample analysis_result structure:');
    const sampleResults = await executeQuery<{ analysis_result: any }>(
      `SELECT analysis_result
       FROM task_analyses
       LIMIT 3`
    );
    sampleResults.forEach((result, idx) => {
      console.log(`\nSample ${idx + 1}:`, JSON.stringify(result.analysis_result, null, 2));
    });
    console.log('');

    console.log('==========================================');
    console.log('✅ Diagnosis complete\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    process.exit(1);
  }
}

diagnose();
