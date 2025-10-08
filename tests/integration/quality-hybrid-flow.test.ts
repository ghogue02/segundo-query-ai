/**
 * Quality Hybrid Implementation - Full Flow Integration Tests
 * Tests the complete flow from API → Frontend display
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { getCohortTaskQuality, getBuilderTaskQuality } from '@/lib/services/task-quality';
import { getCohortAverageRubric } from '@/lib/services/bigquery-individual';

const TEST_COHORT = 'September 2025';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

describe('Quality Hybrid Implementation - Full Flow', () => {
  describe('Service Layer Integration', () => {
    it('PostgreSQL service provides task quality data', async () => {
      const cohortAvg = await getCohortTaskQuality(TEST_COHORT);

      expect(cohortAvg).toBeGreaterThan(67);
      expect(cohortAvg).toBeLessThan(77);

      console.log('PostgreSQL cohort average:', cohortAvg);
    }, 30000);

    it('BigQuery service provides rubric breakdown', async () => {
      const rubricAvg = await getCohortAverageRubric(TEST_COHORT);

      expect(rubricAvg).toBeDefined();
      expect(rubricAvg).toHaveProperty('technical_skills');
      expect(rubricAvg).toHaveProperty('business_value');
      expect(rubricAvg).toHaveProperty('professional_skills');

      console.log('BigQuery rubric averages:', rubricAvg);
    }, 30000);

    it('both services return data for same cohort', async () => {
      const [taskQuality, rubricData] = await Promise.all([
        getCohortTaskQuality(TEST_COHORT),
        getCohortAverageRubric(TEST_COHORT)
      ]);

      // Both should have valid data
      expect(taskQuality).toBeGreaterThan(0);
      expect(Object.values(rubricData).some(v => v > 0)).toBe(true);
    }, 60000);
  });

  describe('API Layer Integration', () => {
    it('quality API combines PostgreSQL + BigQuery data', async () => {
      const response = await fetch(
        `${API_BASE}/api/metrics/quality?cohort=${encodeURIComponent(TEST_COHORT)}`
      );

      expect(response.ok).toBe(true);
      const data = await response.json();

      // Should have overall score from PostgreSQL
      expect(data.avgScore).toBeGreaterThan(67);
      expect(data.avgScore).toBeLessThan(77);

      // Should have rubric breakdown from BigQuery
      expect(data.rubricBreakdown).toBeDefined();
      expect(data.rubricBreakdown.length).toBeGreaterThanOrEqual(3);

      // Should indicate hybrid sources
      expect(data.dataSources).toBeDefined();
      expect(data.dataSources.overall).toContain('PostgreSQL');
      expect(data.dataSources.rubric).toContain('BigQuery');

      console.log('API hybrid response:', {
        avgScore: data.avgScore,
        rubricCategories: data.rubricBreakdown.length,
        sources: data.dataSources
      });
    }, 30000);

    it('drill-down API provides individual builder scores', async () => {
      const response = await fetch(
        `${API_BASE}/api/metrics/drill-down/quality-score?cohort=${encodeURIComponent(TEST_COHORT)}`
      );

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data.data.length).toBeGreaterThan(160);

      // Verify not all hardcoded to 36
      const uniqueScores = new Set(data.data.map((b: any) => b.quality_score));
      expect(uniqueScores.size).toBeGreaterThan(20);
      expect(uniqueScores.has(36)).toBe(false);

      console.log('Drill-down builders:', data.data.length);
      console.log('Unique scores:', uniqueScores.size);
    }, 30000);
  });

  describe('Data Consistency Across Layers', () => {
    it('service layer average matches API average', async () => {
      // Get from service
      const serviceAvg = await getCohortTaskQuality(TEST_COHORT);

      // Get from API
      const response = await fetch(
        `${API_BASE}/api/metrics/quality?cohort=${encodeURIComponent(TEST_COHORT)}`
      );
      const apiData = await response.json();

      console.log('Service avg:', serviceAvg);
      console.log('API avg:', apiData.avgScore);

      // Should match (allowing for rounding)
      expect(Math.abs(serviceAvg - apiData.avgScore)).toBeLessThan(1);
    }, 60000);

    it('service builder scores match drill-down data', async () => {
      // Get from service
      const serviceBuilders = await getBuilderTaskQuality(TEST_COHORT);

      // Get from API
      const response = await fetch(
        `${API_BASE}/api/metrics/drill-down/quality-score?cohort=${encodeURIComponent(TEST_COHORT)}`
      );
      const apiData = await response.json();

      // Count should match
      console.log('Service builders:', serviceBuilders.length);
      console.log('API builders:', apiData.data.length);

      expect(Math.abs(serviceBuilders.length - apiData.data.length)).toBeLessThan(5);

      // Sample a few builders and verify scores match
      const sampleBuilders = serviceBuilders.slice(0, 5);
      sampleBuilders.forEach(serviceBuilder => {
        const apiBuilder = apiData.data.find(
          (b: any) => b.builder_name === serviceBuilder.builder_name
        );

        if (apiBuilder) {
          expect(Math.abs(serviceBuilder.avg_quality - apiBuilder.quality_score)).toBeLessThan(1);
        }
      });
    }, 60000);
  });

  describe('Frontend Display Scenarios', () => {
    it('Overall Quality Score card displays ~72 (not 36)', async () => {
      const response = await fetch(
        `${API_BASE}/api/metrics/quality?cohort=${encodeURIComponent(TEST_COHORT)}`
      );
      const data = await response.json();

      // This is what the KPI card will show
      const displayScore = data.avgScore;

      console.log('Quality Score card will display:', displayScore);

      expect(displayScore).toBeGreaterThan(67);
      expect(displayScore).toBeLessThan(77);
      expect(displayScore).not.toBe(36); // Not the old BigQuery value
    });

    it('Quality by Category chart shows valid rubric data', async () => {
      const response = await fetch(
        `${API_BASE}/api/metrics/quality?cohort=${encodeURIComponent(TEST_COHORT)}`
      );
      const data = await response.json();

      // This is what the radar chart will render
      const chartData = data.rubricBreakdown;

      console.log('Category chart data:', chartData);

      expect(chartData.length).toBeGreaterThanOrEqual(3);

      // All categories should have valid scores
      chartData.forEach((category: any) => {
        expect(category.score).toBeGreaterThanOrEqual(0);
        expect(category.score).toBeLessThanOrEqual(100);
      });
    });

    it('clicking Overall Quality Score opens correct drill-down', async () => {
      // 1. User sees Overall Quality Score: ~72
      const qualityResponse = await fetch(
        `${API_BASE}/api/metrics/quality?cohort=${encodeURIComponent(TEST_COHORT)}`
      );
      const qualityData = await qualityResponse.json();

      console.log('User sees Overall Quality Score:', qualityData.avgScore);

      // 2. User clicks, opens drill-down modal
      const drillDownResponse = await fetch(
        `${API_BASE}/api/metrics/drill-down/quality-score?cohort=${encodeURIComponent(TEST_COHORT)}`
      );
      const drillDownData = await drillDownResponse.json();

      console.log('Drill-down shows', drillDownData.data.length, 'builders');

      // 3. Modal shows individual builder scores with variance
      const uniqueScores = new Set(drillDownData.data.map((b: any) => b.quality_score));
      console.log('Score distribution:', uniqueScores.size, 'unique values');

      expect(uniqueScores.size).toBeGreaterThan(20); // Good variance
      expect(uniqueScores.has(36)).toBe(false); // Not hardcoded

      // 4. Modal includes tasks_assessed column
      const hasTasksAssessed = drillDownData.columns.some(
        (col: any) => col.key === 'tasks_assessed'
      );
      expect(hasTasksAssessed).toBe(true);
    }, 60000);

    it('Quality by Category still shows BigQuery rubric scores', async () => {
      const response = await fetch(
        `${API_BASE}/api/metrics/quality?cohort=${encodeURIComponent(TEST_COHORT)}`
      );
      const data = await response.json();

      // This chart should still use BigQuery curated assessments
      expect(data.rubricBreakdown.length).toBeGreaterThanOrEqual(3);

      // Verify data source
      expect(data.dataSources.rubric).toContain('BigQuery');

      console.log('Rubric breakdown (from BigQuery):', data.rubricBreakdown);
    });
  });

  describe('Data Quality Verification', () => {
    it('no hardcoded 36 values in entire flow', async () => {
      // Check service layer
      const builderQuality = await getBuilderTaskQuality(TEST_COHORT);
      const serviceHas36 = builderQuality.some(b => b.avg_quality === 36);
      expect(serviceHas36).toBe(false);

      // Check API layer
      const response = await fetch(
        `${API_BASE}/api/metrics/drill-down/quality-score?cohort=${encodeURIComponent(TEST_COHORT)}`
      );
      const apiData = await response.json();
      const apiHas36 = apiData.data.some((b: any) => b.quality_score === 36);
      expect(apiHas36).toBe(false);

      console.log('Verified no hardcoded 36 in service or API layers');
    }, 60000);

    it('PostgreSQL data is significantly richer than BigQuery', async () => {
      // Get PostgreSQL assessment count
      const qualityResponse = await fetch(
        `${API_BASE}/api/metrics/quality?cohort=${encodeURIComponent(TEST_COHORT)}`
      );
      const qualityData = await qualityResponse.json();

      console.log('PostgreSQL assessments:', qualityData.totalAssessments);

      // Should be ~1400+ vs BigQuery's ~238
      expect(qualityData.totalAssessments).toBeGreaterThan(1400);

      // At least 5x more data than curated BigQuery assessments
      expect(qualityData.totalAssessments).toBeGreaterThan(238 * 5);
    });

    it('all excluded users are filtered consistently', async () => {
      const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

      // Check service layer
      const serviceBuilders = await getBuilderTaskQuality(TEST_COHORT);
      const serviceExcluded = serviceBuilders.filter(b =>
        EXCLUDED_USER_IDS.includes(b.user_id)
      );
      expect(serviceExcluded.length).toBe(0);

      // Check API layer
      const response = await fetch(
        `${API_BASE}/api/metrics/drill-down/quality-score?cohort=${encodeURIComponent(TEST_COHORT)}`
      );
      const apiData = await response.json();
      const apiExcluded = apiData.data.filter((b: any) =>
        b.user_id && EXCLUDED_USER_IDS.includes(b.user_id)
      );
      expect(apiExcluded.length).toBe(0);

      console.log(`Verified ${EXCLUDED_USER_IDS.length} excluded users filtered in all layers`);
    }, 60000);
  });
});
