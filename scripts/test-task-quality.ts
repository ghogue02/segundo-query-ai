/**
 * Test script for task-quality service
 * Loads environment variables and runs validation tests
 *
 * Run with: npx tsx --env-file=.env.local scripts/test-task-quality.ts
 */

// Now import the service after env is loaded
import {
  getCohortTaskQuality,
  getTaskLevelQuality,
  getBuilderTaskQuality,
  getTaskBuilderScores,
} from '../lib/services/task-quality';
import { executeQuery } from '../lib/db';

const COHORT = 'September 2025';
const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

async function runTests() {
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

    // Test 6: Data quality checks
    console.log('Test 6: Data Quality Validation');
    const invalidScores = await executeQuery<{ count: number }>(
      `SELECT COUNT(*) as count FROM task_analyses
       WHERE CAST(analysis_result->>'completion_score' AS NUMERIC) NOT BETWEEN 0 AND 100
       AND analysis_result->>'completion_score' IS NOT NULL`
    );
    console.log(`✅ Invalid scores (out of range): ${invalidScores[0]?.count || 0}`);
    console.log(`   ${(invalidScores[0]?.count || 0) === 0 ? '✅ PASS' : '⚠️ WARNING'} (all scores should be 0-100)\n`);

    console.log('================================');
    console.log('✅ All tests completed successfully!\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
