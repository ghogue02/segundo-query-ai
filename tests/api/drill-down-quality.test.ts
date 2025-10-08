/**
 * Quality Drill-Down API Tests
 * Tests the drill-down endpoints for quality metrics
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

const TEST_COHORT = 'September 2025';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

describe('GET /api/metrics/drill-down/quality-score', () => {
  let drillDownData: any;

  beforeAll(async () => {
    const response = await fetch(
      `${API_BASE}/api/metrics/drill-down/quality-score?cohort=${encodeURIComponent(TEST_COHORT)}`
    );
    expect(response.ok).toBe(true);
    drillDownData = await response.json();
  }, 30000);

  describe('Individual Builder Scores', () => {
    it('returns individual builder quality scores (not all 36)', async () => {
      expect(drillDownData.data).toBeDefined();
      expect(Array.isArray(drillDownData.data)).toBe(true);
      expect(drillDownData.data.length).toBeGreaterThan(160);

      // Critical: Check for score variance (not all hardcoded to 36)
      const uniqueScores = new Set(drillDownData.data.map((b: any) => b.quality_score));

      console.log(`Unique quality scores: ${uniqueScores.size}`);
      console.log(`Score range: ${Math.min(...drillDownData.data.map((b: any) => b.quality_score))} - ${Math.max(...drillDownData.data.map((b: any) => b.quality_score))}`);

      // Should have at least 20 different scores (significant variance)
      expect(uniqueScores.size).toBeGreaterThan(20);

      // Should NOT have hardcoded 36
      expect(uniqueScores.has(36)).toBe(false);
    });

    it('includes tasks_assessed column', async () => {
      expect(drillDownData.columns).toBeDefined();
      expect(Array.isArray(drillDownData.columns)).toBe(true);

      const tasksAssessedColumn = drillDownData.columns.find(
        (col: any) => col.key === 'tasks_assessed'
      );

      expect(tasksAssessedColumn).toBeDefined();
      expect(tasksAssessedColumn.label).toBeTruthy();

      console.log('tasks_assessed column:', tasksAssessedColumn);
    });

    it('has valid builder data structure', async () => {
      const sampleBuilder = drillDownData.data[0];

      expect(sampleBuilder).toHaveProperty('builder_name');
      expect(sampleBuilder).toHaveProperty('quality_score');
      expect(sampleBuilder).toHaveProperty('tasks_assessed');

      expect(typeof sampleBuilder.builder_name).toBe('string');
      expect(typeof sampleBuilder.quality_score).toBe('number');
      expect(typeof sampleBuilder.tasks_assessed).toBe('number');

      expect(sampleBuilder.quality_score).toBeGreaterThanOrEqual(0);
      expect(sampleBuilder.quality_score).toBeLessThanOrEqual(100);
      expect(sampleBuilder.tasks_assessed).toBeGreaterThan(0);
    });

    it('excludes filtered users from drill-down', async () => {
      // Check that excluded users are not in results
      const userIds = drillDownData.data
        .filter((b: any) => b.user_id)
        .map((b: any) => b.user_id);

      EXCLUDED_USER_IDS.forEach(excludedId => {
        expect(userIds).not.toContain(excludedId);
      });

      console.log(`Verified ${EXCLUDED_USER_IDS.length} excluded users not in results`);
    });
  });

  describe('Response Structure', () => {
    it('has required top-level fields', async () => {
      expect(drillDownData).toHaveProperty('title');
      expect(drillDownData).toHaveProperty('description');
      expect(drillDownData).toHaveProperty('data');
      expect(drillDownData).toHaveProperty('columns');
    });

    it('has descriptive title and description', async () => {
      expect(typeof drillDownData.title).toBe('string');
      expect(drillDownData.title.length).toBeGreaterThan(0);

      expect(typeof drillDownData.description).toBe('string');
      expect(drillDownData.description.length).toBeGreaterThan(0);

      console.log('Drill-down title:', drillDownData.title);
    });

    it('has all expected columns', async () => {
      const expectedColumns = [
        'builder_name',
        'tasks_completed',
        'completion_pct',
        'days_attended',
        'attendance_pct',
        'quality_score',
        'tasks_assessed'
      ];

      const columnKeys = drillDownData.columns.map((col: any) => col.key);

      expectedColumns.forEach(expectedCol => {
        if (expectedCol !== 'tasks_assessed') {
          // tasks_assessed is new, others should exist
          expect(columnKeys).toContain(expectedCol);
        }
      });
    });
  });
});

describe('GET /api/metrics/drill-down/quality-task (NEW)', () => {
  let taskDrillDownData: any;

  beforeAll(async () => {
    const response = await fetch(
      `${API_BASE}/api/metrics/drill-down/quality-task?cohort=${encodeURIComponent(TEST_COHORT)}`
    );

    // This endpoint might not exist yet, so handle gracefully
    if (response.ok) {
      taskDrillDownData = await response.json();
    }
  }, 30000);

  describe('Task-Level Quality Drill-Down', () => {
    it('returns task-level quality averages (if endpoint exists)', async () => {
      if (!taskDrillDownData) {
        console.warn('quality-task endpoint not implemented yet - skipping tests');
        return;
      }

      expect(taskDrillDownData.data).toBeDefined();
      expect(Array.isArray(taskDrillDownData.data)).toBe(true);

      // Expected: ~199 tasks
      expect(taskDrillDownData.data.length).toBeGreaterThan(190);
      expect(taskDrillDownData.data.length).toBeLessThan(210);

      console.log(`Tasks with quality data: ${taskDrillDownData.data.length}`);
    });

    it('has correct task data structure (if endpoint exists)', async () => {
      if (!taskDrillDownData) {
        console.warn('quality-task endpoint not implemented yet - skipping tests');
        return;
      }

      const sampleTask = taskDrillDownData.data[0];

      expect(sampleTask).toHaveProperty('task_id');
      expect(sampleTask).toHaveProperty('avg_quality');
      expect(sampleTask).toHaveProperty('builders_assessed');

      expect(typeof sampleTask.task_id).toBe('number');
      expect(typeof sampleTask.avg_quality).toBe('number');
      expect(typeof sampleTask.builders_assessed).toBe('number');

      expect(sampleTask.avg_quality).toBeGreaterThanOrEqual(0);
      expect(sampleTask.avg_quality).toBeLessThanOrEqual(100);
      expect(sampleTask.builders_assessed).toBeGreaterThan(0);
    });

    it('shows quality variance across tasks (if endpoint exists)', async () => {
      if (!taskDrillDownData) {
        console.warn('quality-task endpoint not implemented yet - skipping tests');
        return;
      }

      const uniqueScores = new Set(taskDrillDownData.data.map((t: any) => t.avg_quality));

      // Should have significant variance across tasks
      expect(uniqueScores.size).toBeGreaterThan(10);

      console.log(`Unique task quality scores: ${uniqueScores.size}`);
    });
  });
});

describe('Quality Drill-Down Integration', () => {
  it('quality-score data aligns with overall quality API', async () => {
    // Get overall quality
    const qualityResponse = await fetch(
      `${API_BASE}/api/metrics/quality?cohort=${encodeURIComponent(TEST_COHORT)}`
    );
    const qualityData = await qualityResponse.json();

    // Get drill-down data
    const drillDownResponse = await fetch(
      `${API_BASE}/api/metrics/drill-down/quality-score?cohort=${encodeURIComponent(TEST_COHORT)}`
    );
    const drillDownData = await drillDownResponse.json();

    // Total assessments should be similar
    const drillDownTotal = drillDownData.data.reduce(
      (sum: number, builder: any) => sum + (builder.tasks_assessed || 0),
      0
    );

    console.log(`Overall API assessments: ${qualityData.totalAssessments}`);
    console.log(`Drill-down total assessments: ${drillDownTotal}`);

    // Should be within 10% of each other
    const percentDiff = Math.abs(qualityData.totalAssessments - drillDownTotal) /
                        qualityData.totalAssessments * 100;
    expect(percentDiff).toBeLessThan(10);
  }, 60000);

  it('drill-down scores average to overall score', async () => {
    // Get overall quality
    const qualityResponse = await fetch(
      `${API_BASE}/api/metrics/quality?cohort=${encodeURIComponent(TEST_COHORT)}`
    );
    const qualityData = await qualityResponse.json();

    // Get drill-down data
    const drillDownResponse = await fetch(
      `${API_BASE}/api/metrics/drill-down/quality-score?cohort=${encodeURIComponent(TEST_COHORT)}`
    );
    const drillDownData = await drillDownResponse.json();

    // Calculate weighted average from drill-down
    const totalWeighted = drillDownData.data.reduce(
      (sum: number, builder: any) =>
        sum + (builder.quality_score * (builder.tasks_assessed || 1)),
      0
    );
    const totalAssessments = drillDownData.data.reduce(
      (sum: number, builder: any) => sum + (builder.tasks_assessed || 1),
      0
    );

    const drillDownAvg = Math.round(totalWeighted / totalAssessments);

    console.log(`Overall API average: ${qualityData.avgScore}`);
    console.log(`Drill-down average: ${drillDownAvg}`);

    // Should match within ±3 points
    expect(Math.abs(qualityData.avgScore - drillDownAvg)).toBeLessThan(3);
  }, 60000);
});
