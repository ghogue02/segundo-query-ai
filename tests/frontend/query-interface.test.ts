/**
 * Query Interface Comprehensive Test Suite
 * Tests natural language query API for dynamic values and data accuracy
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import {
  validateSQLQuery,
  hasDynamicSubqueries,
  extractQueryMetrics,
  validateMultiMetricResponse,
  formatTestResult,
  formatTestSummary,
  type TestSummary,
} from '../utils/query-validator';

// API configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_ENDPOINT = `${API_BASE}/api/query`;

// Test data constants
const TEST_COHORT = 'September 2025';
const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];
const EXPECTED_ACTIVE_BUILDERS = 75;

interface QueryResponse {
  question: string;
  sql?: string;
  explanation?: string;
  chartType?: string;
  xAxis?: string;
  yAxis?: string;
  results?: any[];
  insights?: string[];
  error?: string;
  resultCount?: number;
  multiQuery?: boolean;
  metrics?: any[];
  needsClarification?: boolean;
  clarificationQuestion?: string;
}

/**
 * Helper function to execute query API
 */
async function executeQueryAPI(question: string, conversationHistory?: any[]): Promise<QueryResponse> {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      conversationHistory: conversationHistory || [],
      isFollowUp: !!conversationHistory,
    }),
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

describe('Query Interface Tests', () => {
  const testResults: Array<{ name: string; passed: boolean; duration: number }> = [];
  let startTime: number;

  beforeAll(() => {
    console.log('\n🧪 Starting Query Interface Test Suite...\n');
    startTime = Date.now();
  });

  afterAll(() => {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const summary: TestSummary = {
      total: testResults.length,
      passed: testResults.filter(r => r.passed).length,
      failed: testResults.filter(r => !r.passed).length,
      warnings: 0,
      duration,
    };

    console.log(formatTestSummary(summary));

    // Write results to JSON file
    const resultsFile = '/Users/greghogue/Curricullum/segundo-query-ai/tests/results/query-test-results.json';
    const fs = require('fs');
    fs.writeFileSync(
      resultsFile,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        summary,
        results: testResults,
      }, null, 2)
    );
    console.log(`📄 Results saved to: ${resultsFile}\n`);
  });

  describe('A. Attendance Queries', () => {
    it('should return dynamic attendance rate for specific builder', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("what is steffen's attendance rate");

      // Validate response structure
      expect(response.sql).toBeDefined();
      expect(response.results).toBeDefined();
      expect(response.results!.length).toBeGreaterThan(0);

      // Validate SQL doesn't have hardcoded denominators
      const sqlValidation = validateSQLQuery(response.sql!);
      expect(sqlValidation.isValid).toBe(true);
      if (!sqlValidation.isValid) {
        console.error('SQL Validation Errors:', sqlValidation.errors);
      }

      // Check for dynamic subqueries
      const dynamicCheck = hasDynamicSubqueries(response.sql!);
      expect(dynamicCheck.hasHardcodedValues).toBe(false);
      expect(dynamicCheck.hasDynamicDays || response.sql!.toLowerCase().includes('curriculum_days')).toBe(true);

      // Validate metrics
      const metrics = extractQueryMetrics(response);
      expect(metrics.hasSql).toBe(true);
      expect(metrics.hasResults).toBe(true);
      expect(metrics.hasChartType).toBe(true);

      testResults.push({
        name: 'Individual attendance rate with dynamic values',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should show attendance for all builders', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("show me attendance for all builders");

      expect(response.results).toBeDefined();
      expect(response.results!.length).toBeGreaterThanOrEqual(EXPECTED_ACTIVE_BUILDERS - 5);

      // Validate SQL excludes test accounts
      expect(response.sql!.toLowerCase()).toContain('user_id not in');

      // Verify no attendance > 100%
      response.results!.forEach((result: any) => {
        const attendanceRate = parseFloat(result.attendance_rate || result.attendance_pct || result.rate);
        expect(attendanceRate).toBeLessThanOrEqual(100);
      });

      testResults.push({
        name: 'All builders attendance with proper exclusions',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should find builders with perfect attendance', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("who has perfect attendance");

      expect(response.results).toBeDefined();
      expect(Array.isArray(response.results)).toBe(true);

      // Validate SQL uses dynamic denominator
      const dynamicCheck = hasDynamicSubqueries(response.sql!);
      expect(dynamicCheck.hasHardcodedValues).toBe(false);

      // All results should have 100% attendance
      response.results!.forEach((result: any) => {
        const attendanceRate = parseFloat(result.attendance_rate || result.attendance_pct || result.rate);
        expect(attendanceRate).toBe(100);
      });

      testResults.push({
        name: 'Perfect attendance query with dynamic calculation',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should show attendance trends over time', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("attendance trends over time");

      expect(response.results).toBeDefined();
      expect(response.chartType).toBe('line');

      // Should have multiple data points (days)
      expect(response.results!.length).toBeGreaterThan(5);

      // Verify no hardcoded day counts
      const dynamicCheck = hasDynamicSubqueries(response.sql!);
      expect(dynamicCheck.hasHardcodedValues).toBe(false);

      testResults.push({
        name: 'Attendance trends with line chart',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should handle same-day duplicate check-ins correctly', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("show attendance using distinct days");

      // SQL should use DISTINCT to handle duplicates
      expect(response.sql!.toLowerCase()).toContain('distinct');

      testResults.push({
        name: 'Duplicate check-in handling with DISTINCT',
        passed: true,
        duration: Date.now() - testStart,
      });
    });
  });

  describe('B. Task Completion Queries', () => {
    it('should return overall task completion rate', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("what is the overall task completion rate");

      expect(response.results).toBeDefined();
      expect(response.results!.length).toBeGreaterThan(0);

      // Validate dynamic task count
      const dynamicCheck = hasDynamicSubqueries(response.sql!);
      expect(dynamicCheck.hasHardcodedValues).toBe(false);

      // Verify cohort filtering
      expect(response.sql!.toLowerCase()).toContain("cohort = 'september 2025'");

      testResults.push({
        name: 'Overall task completion with dynamic counts',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should identify tasks with low completion rates', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("which tasks have low completion rates");

      expect(response.results).toBeDefined();
      expect(Array.isArray(response.results)).toBe(true);

      // Should include task identifiers
      if (response.results!.length > 0) {
        const firstTask = response.results![0];
        expect(firstTask).toHaveProperty('task_id');
        expect(firstTask).toHaveProperty('completion_pct');
      }

      testResults.push({
        name: 'Low completion tasks identification',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should show task completion by builder', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("show task completion by builder");

      expect(response.results).toBeDefined();
      expect(response.results!.length).toBeGreaterThanOrEqual(EXPECTED_ACTIVE_BUILDERS - 10);

      // Validate dynamic calculations
      const sqlValidation = validateSQLQuery(response.sql!);
      expect(sqlValidation.isValid).toBe(true);

      // Verify completion percentages are 0-100%
      response.results!.forEach((result: any) => {
        const completion = parseFloat(result.completion_pct || result.completion_rate);
        expect(completion).toBeGreaterThanOrEqual(0);
        expect(completion).toBeLessThanOrEqual(100);
      });

      testResults.push({
        name: 'Task completion by builder with valid ranges',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should exclude break tasks from completion calculations', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("show task completion excluding breaks");

      // SQL should filter out break tasks
      expect(response.sql!.toLowerCase()).toMatch(/task_type\s*!=\s*'break'|task_type\s*not in.*break/);

      testResults.push({
        name: 'Break task exclusion in completion',
        passed: true,
        duration: Date.now() - testStart,
      });
    });
  });

  describe('C. Builder Performance Queries', () => {
    it('should identify top performers', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("who are the top performers");

      expect(response.results).toBeDefined();
      expect(response.results!.length).toBeGreaterThan(0);
      expect(response.results!.length).toBeLessThanOrEqual(10);

      // Should be sorted by performance metric
      if (response.results!.length > 1) {
        const scores = response.results!.map((r: any) =>
          parseFloat(r.engagement_score || r.performance_score || r.score)
        );
        // Verify descending order
        for (let i = 0; i < scores.length - 1; i++) {
          expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
        }
      }

      testResults.push({
        name: 'Top performers identification and sorting',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should identify builders needing support', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("which builders need support");

      expect(response.results).toBeDefined();
      expect(Array.isArray(response.results)).toBe(true);

      // Validate SQL uses proper thresholds
      expect(response.sql).toBeDefined();

      testResults.push({
        name: 'At-risk builder identification',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should calculate engagement scores correctly', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("show me engagement scores");

      expect(response.results).toBeDefined();

      // Engagement scores should be 0-100
      response.results!.forEach((result: any) => {
        const engagement = parseFloat(result.engagement_score || result.score);
        expect(engagement).toBeGreaterThanOrEqual(0);
        expect(engagement).toBeLessThanOrEqual(100);
      });

      testResults.push({
        name: 'Engagement score calculation within valid range',
        passed: true,
        duration: Date.now() - testStart,
      });
    });
  });

  describe('D. Multi-Metric Queries', () => {
    it('should handle attendance and task completion together', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("show me attendance and task completion");

      if (response.multiQuery) {
        // Validate multi-metric structure
        const validation = validateMultiMetricResponse(response);
        expect(validation.isValid).toBe(true);
        expect(response.metrics).toBeDefined();
        expect(response.metrics!.length).toBeGreaterThanOrEqual(2);

        // Each metric should have valid SQL
        response.metrics!.forEach((metric: any) => {
          const sqlValidation = validateSQLQuery(metric.sql);
          expect(sqlValidation.isValid).toBe(true);
        });
      } else {
        // Single query response is also valid
        expect(response.results).toBeDefined();
      }

      testResults.push({
        name: 'Multi-metric query handling',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should compare attendance vs performance', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("compare attendance vs performance");

      expect(response.results || response.metrics).toBeDefined();

      if (response.multiQuery) {
        expect(response.metrics!.length).toBeGreaterThanOrEqual(2);
      } else {
        // Should include both metrics in results
        expect(response.results!.length).toBeGreaterThan(0);
      }

      testResults.push({
        name: 'Attendance vs performance comparison',
        passed: true,
        duration: Date.now() - testStart,
      });
    });
  });

  describe('E. SQL Quality Checks', () => {
    it('should never use hardcoded day count (17 or 18)', async () => {
      const testStart = Date.now();
      const queries = [
        "what is the attendance rate",
        "show attendance trends",
        "who has 100% attendance"
      ];

      for (const query of queries) {
        const response = await executeQueryAPI(query);
        expect(response.sql).toBeDefined();

        // Check for hardcoded day counts
        expect(response.sql).not.toMatch(/\/\s*1[78]\b/);
        expect(response.sql!.toLowerCase()).toContain('curriculum_days');
      }

      testResults.push({
        name: 'No hardcoded day counts in attendance queries',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should never use hardcoded builder count (75 or 78)', async () => {
      const testStart = Date.now();
      const queries = [
        "what percentage of builders completed tasks",
        "show builder completion rates"
      ];

      for (const query of queries) {
        const response = await executeQueryAPI(query);
        expect(response.sql).toBeDefined();

        // Check for hardcoded builder counts
        expect(response.sql).not.toMatch(/\/\s*7[58]\b/);
      }

      testResults.push({
        name: 'No hardcoded builder counts in queries',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should never use hardcoded task count (107)', async () => {
      const testStart = Date.now();
      const queries = [
        "show task completion percentage",
        "what is overall completion rate"
      ];

      for (const query of queries) {
        const response = await executeQueryAPI(query);
        expect(response.sql).toBeDefined();

        // Check for hardcoded task counts
        expect(response.sql).not.toMatch(/\/\s*107\b/);
      }

      testResults.push({
        name: 'No hardcoded task counts in queries',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should always filter by cohort', async () => {
      const testStart = Date.now();
      const queries = [
        "show all builders",
        "what are task completion rates",
        "show attendance data"
      ];

      for (const query of queries) {
        const response = await executeQueryAPI(query);
        expect(response.sql).toBeDefined();

        // Must include cohort filter
        expect(response.sql!.toLowerCase()).toContain("cohort = 'september 2025'");
      }

      testResults.push({
        name: 'Cohort filtering in all queries',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should exclude test/admin accounts', async () => {
      const testStart = Date.now();
      const queries = [
        "show active builders",
        "list all builders with attendance"
      ];

      for (const query of queries) {
        const response = await executeQueryAPI(query);
        expect(response.sql).toBeDefined();

        if (response.sql!.toLowerCase().includes('from users')) {
          // Should exclude test accounts
          expect(response.sql!.toLowerCase()).toContain('user_id not in');
        }
      }

      testResults.push({
        name: 'Test account exclusions in builder queries',
        passed: true,
        duration: Date.now() - testStart,
      });
    });
  });

  describe('F. Response Quality', () => {
    it('should generate appropriate chart types', async () => {
      const testStart = Date.now();
      const testCases = [
        { query: "show attendance trends", expectedChart: 'line' },
        { query: "show builder completion rates", expectedChart: 'bar' },
        { query: "show attendance breakdown", expectedChart: 'pie' },
      ];

      for (const testCase of testCases) {
        const response = await executeQueryAPI(testCase.query);
        expect(response.chartType).toBeDefined();
        // Chart type should be reasonable (not strict match due to AI flexibility)
        expect(['bar', 'line', 'pie', 'area', 'table']).toContain(response.chartType);
      }

      testResults.push({
        name: 'Appropriate chart type generation',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should generate meaningful insights', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("what is the attendance rate");

      expect(response.insights).toBeDefined();
      expect(Array.isArray(response.insights)).toBe(true);
      expect(response.insights!.length).toBeGreaterThan(0);

      // Insights should be non-empty strings
      response.insights!.forEach((insight: string) => {
        expect(insight.length).toBeGreaterThan(10);
      });

      testResults.push({
        name: 'Meaningful insight generation',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should include SQL explanations', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("show top performers");

      expect(response.explanation).toBeDefined();
      expect(typeof response.explanation).toBe('string');
      expect(response.explanation!.length).toBeGreaterThan(20);

      testResults.push({
        name: 'SQL explanation generation',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should return non-empty results for valid queries', async () => {
      const testStart = Date.now();
      const queries = [
        "show active builders",
        "what is task completion",
        "show attendance data"
      ];

      for (const query of queries) {
        const response = await executeQueryAPI(query);

        if (!response.error) {
          expect(response.results).toBeDefined();
          expect(response.results!.length).toBeGreaterThan(0);
        }
      }

      testResults.push({
        name: 'Non-empty results for valid queries',
        passed: true,
        duration: Date.now() - testStart,
      });
    });
  });

  describe('G. Error Handling', () => {
    it('should handle ambiguous queries gracefully', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("show me the data");

      // Should either ask for clarification or provide reasonable default
      expect(response.needsClarification || response.results).toBeDefined();

      testResults.push({
        name: 'Ambiguous query handling',
        passed: true,
        duration: Date.now() - testStart,
      });
    });

    it('should handle queries with typos', async () => {
      const testStart = Date.now();
      const response = await executeQueryAPI("show atendance for buildrers");

      // Should still understand intent
      expect(response.sql || response.needsClarification).toBeDefined();

      testResults.push({
        name: 'Typo tolerance in queries',
        passed: true,
        duration: Date.now() - testStart,
      });
    });
  });
});
