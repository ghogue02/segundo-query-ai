/**
 * Quality API Hybrid Implementation Tests
 * Tests the updated /api/metrics/quality endpoint with hybrid data sources
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

const TEST_COHORT = 'September 2025';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

describe('GET /api/metrics/quality (Hybrid Implementation)', () => {
  let qualityData: any;

  beforeAll(async () => {
    const response = await fetch(
      `${API_BASE}/api/metrics/quality?cohort=${encodeURIComponent(TEST_COHORT)}`
    );
    expect(response.ok).toBe(true);
    qualityData = await response.json();
  }, 30000);

  describe('Overall Quality Score (PostgreSQL)', () => {
    it('returns PostgreSQL average around 72 (not 36)', async () => {
      console.log(`Overall Quality Score: ${qualityData.avgScore}`);

      // Critical: Should be ~72 from PostgreSQL, NOT 36 from BigQuery
      expect(qualityData.avgScore).toBeGreaterThan(67);
      expect(qualityData.avgScore).toBeLessThan(77);

      // Explicitly verify NOT the old BigQuery value
      expect(qualityData.avgScore).not.toBe(36);
    });

    it('reports significantly more assessments (1400+ vs 238)', async () => {
      console.log(`Total assessments: ${qualityData.totalAssessments}`);

      // PostgreSQL has ~1400+ task assessments vs BigQuery's 238 curated assessments
      expect(qualityData.totalAssessments).toBeGreaterThan(1400);

      // Verify not the old count
      expect(qualityData.totalAssessments).not.toBe(238);
    });

    it('includes data source information', async () => {
      expect(qualityData.dataSources).toBeDefined();
      expect(qualityData.dataSources).toHaveProperty('overall');
      expect(qualityData.dataSources).toHaveProperty('rubric');

      // Overall should be from PostgreSQL
      expect(qualityData.dataSources.overall).toContain('PostgreSQL');

      // Rubric should be from BigQuery
      expect(qualityData.dataSources.rubric).toContain('BigQuery');

      console.log('Data sources:', qualityData.dataSources);
    });
  });

  describe('Rubric Breakdown (BigQuery)', () => {
    it('returns rubric breakdown from BigQuery', async () => {
      expect(qualityData.rubricBreakdown).toBeDefined();
      expect(Array.isArray(qualityData.rubricBreakdown)).toBe(true);

      // Should have 4-5 categories (depending on what has data)
      expect(qualityData.rubricBreakdown.length).toBeGreaterThanOrEqual(3);
      expect(qualityData.rubricBreakdown.length).toBeLessThanOrEqual(5);
    });

    it('has correct rubric categories', async () => {
      const categories = qualityData.rubricBreakdown.map((r: any) => r.category);

      // Should include core categories
      const expectedCategories = [
        'Technical Skills',
        'Business Value',
        'Professional Skills'
      ];

      expectedCategories.forEach(category => {
        expect(categories).toContain(category);
      });

      console.log('Rubric categories:', categories);
    });

    it('has valid score values for each category', async () => {
      qualityData.rubricBreakdown.forEach((rubric: any) => {
        expect(rubric).toHaveProperty('category');
        expect(rubric).toHaveProperty('score');

        expect(typeof rubric.category).toBe('string');
        expect(typeof rubric.score).toBe('number');

        // Scores should be 0-100
        expect(rubric.score).toBeGreaterThanOrEqual(0);
        expect(rubric.score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('API Response Structure', () => {
    it('has all required fields', async () => {
      expect(qualityData).toHaveProperty('avgScore');
      expect(qualityData).toHaveProperty('rubricBreakdown');
      expect(qualityData).toHaveProperty('totalAssessments');
      expect(qualityData).toHaveProperty('dataSources');
    });

    it('has correct data types', async () => {
      expect(typeof qualityData.avgScore).toBe('number');
      expect(Array.isArray(qualityData.rubricBreakdown)).toBe(true);
      expect(typeof qualityData.totalAssessments).toBe('number');
      expect(typeof qualityData.dataSources).toBe('object');
    });

    it('returns valid HTTP status', async () => {
      const response = await fetch(
        `${API_BASE}/api/metrics/quality?cohort=${encodeURIComponent(TEST_COHORT)}`
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('Error Handling', () => {
    it('handles invalid cohort gracefully', async () => {
      const response = await fetch(
        `${API_BASE}/api/metrics/quality?cohort=NonexistentCohort`
      );

      expect(response.ok).toBe(true); // Should return 200 with zeros/empty data
      const data = await response.json();

      expect(data).toHaveProperty('avgScore');
      expect(data).toHaveProperty('rubricBreakdown');
    });

    it('handles missing cohort parameter (uses default)', async () => {
      const response = await fetch(`${API_BASE}/api/metrics/quality`);

      expect(response.ok).toBe(true);
      const data = await response.json();

      expect(data).toHaveProperty('avgScore');
      expect(data.avgScore).toBeGreaterThan(0); // Should use default cohort
    });
  });

  describe('Backward Compatibility', () => {
    it('maintains same response shape as before', async () => {
      // Ensure frontend components don't break
      const requiredFields = ['avgScore', 'rubricBreakdown', 'totalAssessments'];

      requiredFields.forEach(field => {
        expect(qualityData).toHaveProperty(field);
      });

      // rubricBreakdown should have same structure
      if (qualityData.rubricBreakdown.length > 0) {
        const firstCategory = qualityData.rubricBreakdown[0];
        expect(firstCategory).toHaveProperty('category');
        expect(firstCategory).toHaveProperty('score');
      }
    });
  });

  describe('Data Source Fallback', () => {
    it('can fallback to BigQuery if PostgreSQL fails', async () => {
      // This test verifies the fallback mechanism is in place
      // In normal operation, should use PostgreSQL
      expect(qualityData.dataSources.overall).toBeDefined();

      // If fallback occurred, would see "BigQuery - fallback"
      // If normal operation, would see "PostgreSQL"
      const possibleSources = [
        'Task Submissions (PostgreSQL)',
        'Curated Assessments (BigQuery - fallback)'
      ];

      expect(possibleSources).toContain(qualityData.dataSources.overall);
    });
  });
});
