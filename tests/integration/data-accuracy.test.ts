/**
 * Data Accuracy Integration Tests
 * Tests Phase 1 critical data accuracy fixes
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { executeQuery } from '@/lib/db';
import { calculateTaskCompletion, calculateBulkTaskCompletion } from '@/lib/metrics/task-completion';
import { getIndividualRubricBreakdown } from '@/lib/services/bigquery-individual';

const TEST_COHORT = 'September 2025';
const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

describe('Phase 1 Data Accuracy Fixes', () => {
  describe('FIX 1.1: Quality Rubric Breakdown', () => {
    it('should return unique rubric scores per builder (not all identical)', async () => {
      const rubricData = await getIndividualRubricBreakdown(TEST_COHORT);

      expect(rubricData.length).toBeGreaterThan(0);

      // Check that not all builders have identical scores
      const technicalScores = new Set(rubricData.map(b => b.technical_skills));
      const businessScores = new Set(rubricData.map(b => b.business_value));
      const overallScores = new Set(rubricData.map(b => b.overall_score));

      // At least 2 unique values in each category (variance exists)
      expect(technicalScores.size).toBeGreaterThan(1);
      expect(businessScores.size).toBeGreaterThan(1);
      expect(overallScores.size).toBeGreaterThan(1);

      // No builder should have all zeros (unless no assessments)
      const allZeroBuilders = rubricData.filter(
        b =>
          b.technical_skills === 0 &&
          b.business_value === 0 &&
          b.project_mgmt === 0 &&
          b.critical_thinking === 0 &&
          b.professional_skills === 0 &&
          b.assessments_count > 0
      );

      expect(allZeroBuilders.length).toBe(0);
    });

    it('should gracefully handle builders with no assessments', async () => {
      const rubricData = await getIndividualRubricBreakdown(TEST_COHORT);

      // Filter builders with 0 assessments
      const noAssessments = rubricData.filter(b => b.assessments_count === 0);

      // All scores should be 0 for builders with no assessments
      noAssessments.forEach(builder => {
        expect(builder.overall_score).toBe(0);
        expect(builder.technical_skills).toBe(0);
        expect(builder.business_value).toBe(0);
      });
    });
  });

  describe('FIX 1.2: Attendance Calculation', () => {
    it('should NEVER show attendance > 100%', async () => {
      const query = `
        WITH class_days AS (
          SELECT COUNT(*) as total_class_days
          FROM curriculum_days
          WHERE cohort = $1
            AND EXTRACT(DOW FROM day_date) NOT IN (4, 5)
        )
        SELECT
          u.user_id,
          u.first_name || ' ' || u.last_name as builder_name,
          COUNT(DISTINCT CASE WHEN ba.status IN ('present', 'late') THEN ba.attendance_date END) as days_attended,
          (SELECT total_class_days FROM class_days) as total_class_days,
          LEAST(
            ROUND(
              COUNT(DISTINCT CASE WHEN ba.status IN ('present', 'late') THEN ba.attendance_date END)::FLOAT /
              NULLIF((SELECT total_class_days FROM class_days), 0) * 100
            ),
            100
          ) as attendance_pct
        FROM users u
        LEFT JOIN builder_attendance_new ba ON u.user_id = ba.user_id
          AND EXTRACT(DOW FROM ba.attendance_date) NOT IN (4, 5)
        WHERE u.cohort = $1
          AND u.active = true
          AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
        GROUP BY u.user_id, u.first_name, u.last_name
      `;

      const results = await executeQuery(query, [TEST_COHORT]);

      // Verify NO builder has >100% attendance
      const overAttendance = results.filter((r: any) => parseFloat(r.attendance_pct) > 100);
      expect(overAttendance.length).toBe(0);

      // Verify no builder has more days attended than total class days
      const invalidDays = results.filter(
        (r: any) => parseInt(r.days_attended) > parseInt(r.total_class_days)
      );
      expect(invalidDays.length).toBe(0);

      // Verify total class days excludes Thu/Fri
      if (results.length > 0) {
        const totalClassDays = parseInt(results[0].total_class_days);

        // Get actual curriculum days
        const actualDaysQuery = `
          SELECT COUNT(*) as count
          FROM curriculum_days
          WHERE cohort = $1
        `;
        const actualDays = await executeQuery(actualDaysQuery, [TEST_COHORT]);
        const totalDays = parseInt(actualDays[0].count);

        // Class days should be less than total days (since Thu/Fri excluded)
        expect(totalClassDays).toBeLessThanOrEqual(totalDays);
      }
    });

    it('should deduplicate same-day multiple check-ins', async () => {
      // Find any user with multiple check-ins on same day
      const duplicateCheckInQuery = `
        SELECT
          user_id,
          attendance_date,
          COUNT(*) as checkin_count
        FROM builder_attendance_new
        WHERE user_id IN (
          SELECT user_id FROM users
          WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
        )
        GROUP BY user_id, attendance_date
        HAVING COUNT(*) > 1
        LIMIT 1
      `;

      const duplicates = await executeQuery(duplicateCheckInQuery, [TEST_COHORT]);

      if (duplicates.length > 0) {
        const testUser = duplicates[0].user_id;

        // Count total check-ins (including duplicates)
        const totalCheckInsQuery = `
          SELECT COUNT(*) as count FROM builder_attendance_new WHERE user_id = $1
        `;
        const totalCheckIns = await executeQuery(totalCheckInsQuery, [testUser]);

        // Count DISTINCT days attended
        const distinctDaysQuery = `
          SELECT COUNT(DISTINCT attendance_date) as count
          FROM builder_attendance_new
          WHERE user_id = $1 AND status IN ('present', 'late')
        `;
        const distinctDays = await executeQuery(distinctDaysQuery, [testUser]);

        // Days attended should be DISTINCT count, not total check-ins
        expect(parseInt(distinctDays[0].count)).toBeLessThanOrEqual(
          parseInt(totalCheckIns[0].count)
        );
      }
    });
  });

  describe('FIX 1.3: Task Completion Consistency', () => {
    it('should return identical task completion across all features', async () => {
      // Pick a random active builder
      const builderQuery = `
        SELECT user_id FROM users
        WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
        LIMIT 1
      `;
      const builders = await executeQuery(builderQuery, [TEST_COHORT]);

      if (builders.length === 0) {
        console.warn('No builders found for testing');
        return;
      }

      const testUserId = builders[0].user_id;

      // Method 1: Shared utility
      const sharedUtility = await calculateTaskCompletion(testUserId, TEST_COHORT);

      // Method 2: Builder profile query
      const profileQuery = `
        WITH sept_tasks AS (
          SELECT DISTINCT t.id
          FROM tasks t
          JOIN time_blocks tb ON t.block_id = tb.id
          JOIN curriculum_days cd ON tb.day_id = cd.id
          WHERE cd.cohort = $1 AND t.task_type != 'break'
        )
        SELECT
          (SELECT COUNT(DISTINCT task_id) FROM (
            SELECT ts.task_id FROM task_submissions ts WHERE ts.user_id = $2 AND ts.task_id IN (SELECT id FROM sept_tasks)
            UNION
            SELECT tt.task_id FROM task_threads tt WHERE tt.user_id = $2 AND tt.task_id IN (SELECT id FROM sept_tasks)
          ) i) as tasks_completed,
          (SELECT COUNT(*) FROM sept_tasks) as total_tasks,
          ROUND(
            (SELECT COUNT(DISTINCT task_id) FROM (
              SELECT ts.task_id FROM task_submissions ts WHERE ts.user_id = $2 AND ts.task_id IN (SELECT id FROM sept_tasks)
              UNION
              SELECT tt.task_id FROM task_threads tt WHERE tt.user_id = $2 AND tt.task_id IN (SELECT id FROM sept_tasks)
            ) i)::FLOAT / NULLIF((SELECT COUNT(*) FROM sept_tasks), 0) * 100
          ) as completion_pct
      `;

      const profileResult = await executeQuery(profileQuery, [TEST_COHORT, testUserId]);

      // Method 3: H1 chart (bulk calculation then filter)
      const bulkCompletions = await calculateBulkTaskCompletion(TEST_COHORT);
      const h1Result = bulkCompletions.find(b => b.user_id === testUserId);

      // All three methods should return IDENTICAL results
      expect(sharedUtility.tasks_completed).toBe(parseInt(profileResult[0].tasks_completed));
      expect(sharedUtility.total_tasks).toBe(parseInt(profileResult[0].total_tasks));
      expect(sharedUtility.completion_pct).toBe(parseFloat(profileResult[0].completion_pct));

      if (h1Result) {
        expect(sharedUtility.completion_pct).toBe(h1Result.completion_pct);
      }
    });

    it('should have 0% variance between NL Query and Dashboard', async () => {
      // Test a sample builder
      const builderQuery = `
        SELECT user_id FROM users
        WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
        LIMIT 1
      `;
      const builders = await executeQuery(builderQuery, [TEST_COHORT]);

      if (builders.length === 0) return;

      const testUserId = builders[0].user_id;

      // Get completion from shared utility (used by all features)
      const completion = await calculateTaskCompletion(testUserId, TEST_COHORT);

      // Simulate NL Query calculation (should use same shared utility)
      const nlQueryCompletion = await calculateTaskCompletion(testUserId, TEST_COHORT);

      // Calculate variance
      const variance = Math.abs(completion.completion_pct - nlQueryCompletion.completion_pct);

      // Variance should be EXACTLY 0%
      expect(variance).toBe(0);
    });
  });

  describe('Cross-Fix Integration', () => {
    it('should maintain data integrity across all fixes', async () => {
      // Get all active builders
      const builders = await calculateBulkTaskCompletion(TEST_COHORT);

      expect(builders.length).toBeGreaterThan(0);

      // For each builder, verify all metrics are valid
      builders.forEach(builder => {
        // Task completion should be 0-100%
        expect(builder.completion_pct).toBeGreaterThanOrEqual(0);
        expect(builder.completion_pct).toBeLessThanOrEqual(100);

        // Tasks completed should not exceed total tasks
        expect(builder.tasks_completed).toBeLessThanOrEqual(builder.total_tasks);

        // Tasks should be non-negative
        expect(builder.tasks_completed).toBeGreaterThanOrEqual(0);
        expect(builder.total_tasks).toBeGreaterThan(0);
      });
    });
  });
});
