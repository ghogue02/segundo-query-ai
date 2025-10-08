/**
 * Integration Tests for Rubric Category Breakdown Fix
 *
 * Tests verify that all builders show unique category score sets
 * and that the radar chart receives proper data with variance.
 */

import { getIndividualRubricBreakdown, getCohortAverageRubric } from '../../lib/services/bigquery-individual';
import { describe, it, expect } from '@jest/globals';

describe('Rubric Category Breakdown', () => {
  const cohort = 'September 2025';

  describe('Individual Builder Scores', () => {
    it('should return rubric scores for all builders', async () => {
      const results = await getIndividualRubricBreakdown(cohort);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should have at least 61 builders with scores', async () => {
      const results = await getIndividualRubricBreakdown(cohort);

      // Should have 61+ active builders (excluding staff/inactive)
      expect(results.length).toBeGreaterThanOrEqual(61);
    });

    it('should have all required fields for each builder', async () => {
      const results = await getIndividualRubricBreakdown(cohort);

      const firstBuilder = results[0];
      expect(firstBuilder).toHaveProperty('user_id');
      expect(firstBuilder).toHaveProperty('builder_name');
      expect(firstBuilder).toHaveProperty('technical_skills');
      expect(firstBuilder).toHaveProperty('business_value');
      expect(firstBuilder).toHaveProperty('project_mgmt');
      expect(firstBuilder).toHaveProperty('critical_thinking');
      expect(firstBuilder).toHaveProperty('professional_skills');
      expect(firstBuilder).toHaveProperty('overall_score');
      expect(firstBuilder).toHaveProperty('assessments_count');
    });

    it('should have at least one non-zero category score per builder', async () => {
      const results = await getIndividualRubricBreakdown(cohort);

      const buildersWithAllZeros = results.filter(builder =>
        builder.technical_skills === 0 &&
        builder.business_value === 0 &&
        builder.project_mgmt === 0 &&
        builder.critical_thinking === 0 &&
        builder.professional_skills === 0
      );

      // No builder should have ALL zeros (unless they have no assessments)
      const buildersWithScoresButAllZeros = buildersWithAllZeros.filter(
        b => b.assessments_count > 0
      );

      expect(buildersWithScoresButAllZeros.length).toBe(0);
    });

    it('should have unique category score sets (variance exists)', async () => {
      const results = await getIndividualRubricBreakdown(cohort);

      // Create signature for each builder's category scores
      const signatures = results.map(builder =>
        `${builder.technical_skills}-${builder.business_value}-${builder.critical_thinking}-${builder.professional_skills}`
      );

      // At least 80% should have unique signatures (not all identical)
      const uniqueSignatures = new Set(signatures);
      const uniqueRatio = uniqueSignatures.size / signatures.length;

      expect(uniqueRatio).toBeGreaterThan(0.8);
    });

    it('should have at least 80% of builders with 3+ non-zero categories', async () => {
      const results = await getIndividualRubricBreakdown(cohort);

      const buildersWithMultipleCategories = results.filter(builder => {
        const nonZeroCount = [
          builder.technical_skills,
          builder.business_value,
          builder.critical_thinking,
          builder.professional_skills,
        ].filter(score => score > 0).length;

        return nonZeroCount >= 3;
      });

      const ratio = buildersWithMultipleCategories.length / results.length;
      expect(ratio).toBeGreaterThanOrEqual(0.8);
    });

    it('should have realistic score values (0-100 range)', async () => {
      const results = await getIndividualRubricBreakdown(cohort);

      results.forEach(builder => {
        expect(builder.technical_skills).toBeGreaterThanOrEqual(0);
        expect(builder.technical_skills).toBeLessThanOrEqual(100);

        expect(builder.business_value).toBeGreaterThanOrEqual(0);
        expect(builder.business_value).toBeLessThanOrEqual(100);

        expect(builder.critical_thinking).toBeGreaterThanOrEqual(0);
        expect(builder.critical_thinking).toBeLessThanOrEqual(100);

        expect(builder.professional_skills).toBeGreaterThanOrEqual(0);
        expect(builder.professional_skills).toBeLessThanOrEqual(100);

        expect(builder.overall_score).toBeGreaterThanOrEqual(0);
        expect(builder.overall_score).toBeLessThanOrEqual(100);
      });
    });

    it('should correctly calculate overall score from assessments', async () => {
      const results = await getIndividualRubricBreakdown(cohort);

      // Filter builders with assessments
      const buildersWithAssessments = results.filter(b => b.assessments_count > 0);

      expect(buildersWithAssessments.length).toBeGreaterThan(0);

      // All builders with assessments should have overall score > 0
      buildersWithAssessments.forEach(builder => {
        expect(builder.overall_score).toBeGreaterThan(0);
      });
    });
  });

  describe('Cohort Average Rubric', () => {
    it('should return cohort-level average rubric scores', async () => {
      const avg = await getCohortAverageRubric(cohort);

      expect(avg).toBeDefined();
      expect(avg).toHaveProperty('technical_skills');
      expect(avg).toHaveProperty('business_value');
      expect(avg).toHaveProperty('project_mgmt');
      expect(avg).toHaveProperty('critical_thinking');
      expect(avg).toHaveProperty('professional_skills');
    });

    it('should have non-zero scores for at least 3 categories', async () => {
      const avg = await getCohortAverageRubric(cohort);

      const nonZeroCategories = [
        avg.technical_skills,
        avg.business_value,
        avg.critical_thinking,
        avg.professional_skills,
      ].filter(score => score > 0);

      expect(nonZeroCategories.length).toBeGreaterThanOrEqual(3);
    });

    it('should have variance between category scores (not flat)', async () => {
      const avg = await getCohortAverageRubric(cohort);

      const scores = [
        avg.technical_skills,
        avg.business_value,
        avg.critical_thinking,
        avg.professional_skills,
      ];

      // Calculate standard deviation
      const mean = scores.reduce((sum, val) => sum + val, 0) / scores.length;
      const variance = scores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / scores.length;
      const stdDev = Math.sqrt(variance);

      // Standard deviation should be > 5 (not all identical scores)
      expect(stdDev).toBeGreaterThan(5);
    });

    it('should match expected ranges based on sample data', async () => {
      const avg = await getCohortAverageRubric(cohort);

      // Based on our API test, we know:
      // Technical: 32, Business: 59, Critical: 33, Professional: 35
      // These are approximate, so use ranges

      expect(avg.technical_skills).toBeGreaterThan(20);
      expect(avg.technical_skills).toBeLessThan(50);

      expect(avg.business_value).toBeGreaterThan(40);
      expect(avg.business_value).toBeLessThan(80);

      expect(avg.critical_thinking).toBeGreaterThan(20);
      expect(avg.critical_thinking).toBeLessThan(50);

      expect(avg.professional_skills).toBeGreaterThan(20);
      expect(avg.professional_skills).toBeLessThan(50);
    });
  });

  describe('Assessment Type Coverage', () => {
    it('should extract scores from project assessments', async () => {
      const results = await getIndividualRubricBreakdown(cohort);

      // Find builders with project assessments (should have technical scores)
      const buildersWithTechnical = results.filter(b => b.technical_skills > 0);

      expect(buildersWithTechnical.length).toBeGreaterThan(30);
    });

    it('should extract scores from problem/solution assessments', async () => {
      const results = await getIndividualRubricBreakdown(cohort);

      // Problem/solution should contribute to business_value and critical_thinking
      const buildersWithBusiness = results.filter(b => b.business_value > 0);
      const buildersWithCritical = results.filter(b => b.critical_thinking > 0);

      expect(buildersWithBusiness.length).toBeGreaterThan(30);
      expect(buildersWithCritical.length).toBeGreaterThan(30);
    });

    it('should extract scores from video assessments', async () => {
      const results = await getIndividualRubricBreakdown(cohort);

      // Videos should contribute to professional_skills
      const buildersWithProfessional = results.filter(b => b.professional_skills > 0);

      expect(buildersWithProfessional.length).toBeGreaterThan(30);
    });
  });

  describe('Data Quality', () => {
    it('should have consistent builder names', async () => {
      const results = await getIndividualRubricBreakdown(cohort);

      results.forEach(builder => {
        expect(builder.builder_name).toBeTruthy();
        expect(builder.builder_name.length).toBeGreaterThan(0);
        expect(builder.builder_name).not.toBe('undefined undefined');
      });
    });

    it('should have valid user IDs', async () => {
      const results = await getIndividualRubricBreakdown(cohort);

      results.forEach(builder => {
        expect(typeof builder.user_id).toBe('number');
        expect(builder.user_id).toBeGreaterThan(0);
      });
    });

    it('should have assessment counts that match data', async () => {
      const results = await getIndividualRubricBreakdown(cohort);

      results.forEach(builder => {
        expect(builder.assessments_count).toBeGreaterThanOrEqual(0);

        // If there are assessments, there should be an overall score
        if (builder.assessments_count > 0) {
          expect(builder.overall_score).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Known Builder Validation', () => {
    it('should show correct scores for Haoxin Wang (user_id: 321)', async () => {
      const results = await getIndividualRubricBreakdown(cohort);
      const haoxin = results.find(b => b.user_id === 321);

      expect(haoxin).toBeDefined();
      expect(haoxin?.builder_name).toBe('Haoxin Wang');

      // Based on our API test
      expect(haoxin?.technical_skills).toBeGreaterThan(60);
      expect(haoxin?.business_value).toBeGreaterThan(60);
      expect(haoxin?.critical_thinking).toBeGreaterThan(60);
      expect(haoxin?.professional_skills).toBeGreaterThan(0);
    });

    it('should show correct scores for Brian Williams (user_id: 322)', async () => {
      const results = await getIndividualRubricBreakdown(cohort);
      const brian = results.find(b => b.user_id === 322);

      expect(brian).toBeDefined();
      expect(brian?.builder_name).toBe('Brian Williams');

      expect(brian?.technical_skills).toBeGreaterThan(60);
      expect(brian?.business_value).toBeGreaterThan(60);
      expect(brian?.critical_thinking).toBeGreaterThan(40);
      expect(brian?.professional_skills).toBeGreaterThan(0);
    });
  });
});
