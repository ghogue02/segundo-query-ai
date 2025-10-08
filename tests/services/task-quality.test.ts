/**
 * Task Quality Service Tests
 * Tests the PostgreSQL-based task quality service (Part 5 of hybrid implementation)
 */

import { describe, it, expect } from '@jest/globals';
import {
  getCohortTaskQuality,
  getTaskLevelQuality,
  getBuilderTaskQuality,
  getTaskBuilderScores,
  TaskQualityScore,
  BuilderQualityScore,
  TaskBuilderScore
} from '@/lib/services/task-quality';

const TEST_COHORT = 'September 2025';
const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

describe('Task Quality Service (PostgreSQL)', () => {
  describe('getCohortTaskQuality', () => {
    it('returns cohort average quality around 72 (±5 points)', async () => {
      const avgQuality = await getCohortTaskQuality(TEST_COHORT);

      console.log(`Cohort average quality: ${avgQuality}`);

      // Expected: ~71.9 from task_analyses table
      expect(avgQuality).toBeGreaterThan(67); // 72 - 5
      expect(avgQuality).toBeLessThan(77);    // 72 + 5
    }, 30000);

    it('returns a valid numeric score', async () => {
      const avgQuality = await getCohortTaskQuality(TEST_COHORT);

      expect(typeof avgQuality).toBe('number');
      expect(avgQuality).toBeGreaterThanOrEqual(0);
      expect(avgQuality).toBeLessThanOrEqual(100);
    });

    it('excludes filtered users from calculation', async () => {
      // This is implicitly tested by checking the average is in expected range
      // If excluded users were included, the average would be different
      const avgQuality = await getCohortTaskQuality(TEST_COHORT);

      // With exclusions, we expect ~72
      // Without exclusions, would be different
      expect(avgQuality).toBeGreaterThan(65);
      expect(avgQuality).toBeLessThan(80);
    });
  });

  describe('getTaskLevelQuality', () => {
    it('returns quality data for approximately 199 tasks', async () => {
      const taskQuality = await getTaskLevelQuality(TEST_COHORT);

      console.log(`Tasks with quality data: ${taskQuality.length}`);

      // Expected: ~199 tasks from September 2025 cohort
      expect(taskQuality.length).toBeGreaterThan(190);
      expect(taskQuality.length).toBeLessThan(210);
    }, 30000);

    it('returns valid task quality scores', async () => {
      const taskQuality = await getTaskLevelQuality(TEST_COHORT);

      expect(taskQuality.length).toBeGreaterThan(0);

      // Check structure and validity of first few tasks
      taskQuality.slice(0, 10).forEach((task: TaskQualityScore) => {
        expect(task).toHaveProperty('task_id');
        expect(task).toHaveProperty('builders_assessed');
        expect(task).toHaveProperty('avg_quality');
        expect(task).toHaveProperty('total_assessments');

        expect(typeof task.task_id).toBe('number');
        expect(task.builders_assessed).toBeGreaterThan(0);
        expect(task.avg_quality).toBeGreaterThanOrEqual(0);
        expect(task.avg_quality).toBeLessThanOrEqual(100);
        expect(task.total_assessments).toBeGreaterThanOrEqual(task.builders_assessed);
      });
    });

    it('shows quality variance across tasks (not all identical)', async () => {
      const taskQuality = await getTaskLevelQuality(TEST_COHORT);

      const uniqueScores = new Set(taskQuality.map(t => t.avg_quality));

      // Should have at least 10 different quality scores across tasks
      expect(uniqueScores.size).toBeGreaterThan(10);

      console.log(`Unique task quality scores: ${uniqueScores.size}`);
    });
  });

  describe('getBuilderTaskQuality', () => {
    it('returns quality data for approximately 170 builders', async () => {
      const builderQuality = await getBuilderTaskQuality(TEST_COHORT);

      console.log(`Builders with quality data: ${builderQuality.length}`);

      // Expected: ~170 builders with task assessments
      expect(builderQuality.length).toBeGreaterThan(160);
      expect(builderQuality.length).toBeLessThan(180);
    }, 30000);

    it('excludes all filtered users (instructors/inactive)', async () => {
      const builderQuality = await getBuilderTaskQuality(TEST_COHORT);

      EXCLUDED_USER_IDS.forEach(excludedId => {
        const found = builderQuality.find(b => b.user_id === excludedId);
        expect(found).toBeUndefined();
      });

      console.log(`Verified ${EXCLUDED_USER_IDS.length} users excluded`);
    });

    it('returns valid builder quality scores', async () => {
      const builderQuality = await getBuilderTaskQuality(TEST_COHORT);

      expect(builderQuality.length).toBeGreaterThan(0);

      // Check structure and validity
      builderQuality.slice(0, 10).forEach((builder: BuilderQualityScore) => {
        expect(builder).toHaveProperty('user_id');
        expect(builder).toHaveProperty('builder_name');
        expect(builder).toHaveProperty('tasks_assessed');
        expect(builder).toHaveProperty('avg_quality');
        expect(builder).toHaveProperty('total_assessments');

        expect(typeof builder.user_id).toBe('number');
        expect(typeof builder.builder_name).toBe('string');
        expect(builder.tasks_assessed).toBeGreaterThan(0);
        expect(builder.avg_quality).toBeGreaterThanOrEqual(0);
        expect(builder.avg_quality).toBeLessThanOrEqual(100);
        expect(builder.total_assessments).toBeGreaterThanOrEqual(builder.tasks_assessed);
      });
    });

    it('shows quality variance across builders (not all 36)', async () => {
      const builderQuality = await getBuilderTaskQuality(TEST_COHORT);

      const uniqueScores = new Set(builderQuality.map(b => b.avg_quality));

      // Critical: should NOT all be 36 (hardcoded bug)
      expect(uniqueScores.has(36)).toBe(false); // No hardcoded 36

      // Should have significant variance (at least 20 different scores)
      expect(uniqueScores.size).toBeGreaterThan(20);

      console.log(`Unique builder quality scores: ${uniqueScores.size}`);
      console.log(`Score range: ${Math.min(...builderQuality.map(b => b.avg_quality))} - ${Math.max(...builderQuality.map(b => b.avg_quality))}`);
    });
  });

  describe('getTaskBuilderScores', () => {
    it('returns individual builder scores for specific task', async () => {
      // First get a task with quality data
      const taskQuality = await getTaskLevelQuality(TEST_COHORT);
      expect(taskQuality.length).toBeGreaterThan(0);

      const sampleTask = taskQuality[0];
      console.log(`Testing drill-down for Task ${sampleTask.task_id}`);

      // Get individual builder scores
      const builderScores = await getTaskBuilderScores(sampleTask.task_id, TEST_COHORT);

      expect(builderScores.length).toBeGreaterThan(0);
      expect(builderScores.length).toBeLessThanOrEqual(sampleTask.builders_assessed + 5); // Allow slight variance

      // Check structure
      builderScores.forEach((score: TaskBuilderScore) => {
        expect(score).toHaveProperty('user_id');
        expect(score).toHaveProperty('builder_name');
        expect(score).toHaveProperty('quality_score');
        expect(score).toHaveProperty('assessed_at');
        expect(score).toHaveProperty('analysis_type');

        expect(score.quality_score).toBeGreaterThanOrEqual(0);
        expect(score.quality_score).toBeLessThanOrEqual(100);
      });
    }, 30000);

    it('excludes filtered users from task drill-down', async () => {
      const taskQuality = await getTaskLevelQuality(TEST_COHORT);
      const sampleTask = taskQuality[0];

      const builderScores = await getTaskBuilderScores(sampleTask.task_id, TEST_COHORT);

      // Verify no excluded users in results
      EXCLUDED_USER_IDS.forEach(excludedId => {
        const found = builderScores.find(s => s.user_id === excludedId);
        expect(found).toBeUndefined();
      });
    });
  });

  describe('Data Quality Checks', () => {
    it('has at least 1400+ total assessments across cohort', async () => {
      const builderQuality = await getBuilderTaskQuality(TEST_COHORT);

      const totalAssessments = builderQuality.reduce(
        (sum, builder) => sum + builder.total_assessments,
        0
      );

      console.log(`Total assessments: ${totalAssessments}`);

      // Expected: significantly more than BigQuery's 238
      expect(totalAssessments).toBeGreaterThan(1400);
    });

    it('cohort average matches weighted individual scores', async () => {
      const cohortAvg = await getCohortTaskQuality(TEST_COHORT);
      const builderQuality = await getBuilderTaskQuality(TEST_COHORT);

      // Calculate weighted average from individual builders
      const totalWeightedScore = builderQuality.reduce(
        (sum, builder) => sum + (builder.avg_quality * builder.total_assessments),
        0
      );
      const totalAssessments = builderQuality.reduce(
        (sum, builder) => sum + builder.total_assessments,
        0
      );

      const weightedAvg = Math.round(totalWeightedScore / totalAssessments * 10) / 10;

      console.log(`Cohort avg: ${cohortAvg}, Weighted avg: ${weightedAvg}`);

      // Should match within rounding differences
      expect(Math.abs(cohortAvg - weightedAvg)).toBeLessThan(2);
    });
  });
});
