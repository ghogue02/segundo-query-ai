/**
 * Query Validation Utilities
 * Validates SQL queries for dynamic values and best practices
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DynamicCheckResult {
  hasDynamicDays: boolean;
  hasDynamicBuilders: boolean;
  hasDynamicTasks: boolean;
  hasHardcodedValues: boolean;
  hardcodedValues: string[];
}

/**
 * Detect hardcoded denominators in SQL queries
 * These should be replaced with dynamic subqueries
 */
export function detectHardcodedDenominators(sql: string): string[] {
  const hardcoded: string[] = [];

  // Common hardcoded patterns to avoid
  const patterns = [
    /\/\s*1[78]\b/g,        // /17 or /18 (curriculum days)
    /\/\s*75\b/g,           // /75 (active builders)
    /\/\s*107\b/g,          // /107 (total tasks)
    /\/\s*\d{2,3}\b/g,      // Any two or three digit division
  ];

  patterns.forEach((pattern, index) => {
    const matches = sql.match(pattern);
    if (matches) {
      matches.forEach(match => {
        hardcoded.push(match.trim());
      });
    }
  });

  return [...new Set(hardcoded)]; // Remove duplicates
}

/**
 * Check if SQL uses dynamic subqueries for denominators
 */
export function hasDynamicSubqueries(sql: string): DynamicCheckResult {
  const lowerSql = sql.toLowerCase();

  return {
    hasDynamicDays: lowerSql.includes('curriculum_days') &&
                    lowerSql.includes('select count(*)'),
    hasDynamicBuilders: lowerSql.includes('from users') &&
                        lowerSql.includes('select count(*)'),
    hasDynamicTasks: lowerSql.includes('from tasks') &&
                     lowerSql.includes('select count(*)'),
    hasHardcodedValues: detectHardcodedDenominators(sql).length > 0,
    hardcodedValues: detectHardcodedDenominators(sql),
  };
}

/**
 * Validate SQL query for best practices
 */
export function validateSQLQuery(sql: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for hardcoded denominators
  const hardcoded = detectHardcodedDenominators(sql);
  if (hardcoded.length > 0) {
    errors.push(`Hardcoded denominators found: ${hardcoded.join(', ')}`);
  }

  // Check for cohort filtering
  if (!sql.toLowerCase().includes("cohort = 'september 2025'")) {
    errors.push('Missing cohort filter: cohort = \'September 2025\'');
  }

  // Check for excluded users
  const excludedIds = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];
  const hasExclusions = sql.toLowerCase().includes('user_id not in');
  if (sql.toLowerCase().includes('from users') && !hasExclusions) {
    warnings.push('Missing user exclusions (user_id NOT IN (...))');
  }

  // Check for duplicate attendance handling
  if (sql.toLowerCase().includes('attendance') &&
      !sql.toLowerCase().includes('distinct')) {
    warnings.push('Consider using DISTINCT for attendance dates to avoid duplicate check-ins');
  }

  // Check for LEAST() function in attendance calculations
  if (sql.toLowerCase().includes('attendance') &&
      sql.includes('/') &&
      !sql.toLowerCase().includes('least')) {
    warnings.push('Consider using LEAST() to cap attendance at 100%');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extract metrics from query response
 */
export interface QueryMetrics {
  hasSql: boolean;
  hasResults: boolean;
  hasChartType: boolean;
  hasInsights: boolean;
  resultCount: number;
  chartType?: string;
  insightsCount: number;
}

export function extractQueryMetrics(response: any): QueryMetrics {
  return {
    hasSql: !!response.sql || (response.multiQuery && response.metrics?.length > 0),
    hasResults: !!response.results || (response.multiQuery && response.metrics?.some((m: any) => m.results?.length > 0)),
    hasChartType: !!response.chartType || (response.multiQuery && response.metrics?.some((m: any) => m.chartType)),
    hasInsights: !!response.insights?.length || (response.multiQuery && response.metrics?.some((m: any) => m.insights?.length)),
    resultCount: response.results?.length || 0,
    chartType: response.chartType,
    insightsCount: response.insights?.length || 0,
  };
}

/**
 * Validate multi-metric query response
 */
export function validateMultiMetricResponse(response: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!response.multiQuery) {
    return { isValid: true, errors, warnings };
  }

  if (!response.metrics || !Array.isArray(response.metrics)) {
    errors.push('Multi-query response missing metrics array');
    return { isValid: false, errors, warnings };
  }

  if (response.metrics.length === 0) {
    errors.push('Multi-query response has empty metrics array');
  }

  response.metrics.forEach((metric: any, index: number) => {
    if (!metric.id) {
      errors.push(`Metric ${index} missing id`);
    }
    if (!metric.label) {
      errors.push(`Metric ${index} missing label`);
    }
    if (!metric.sql) {
      errors.push(`Metric ${index} missing sql`);
    }
    if (!metric.chartType) {
      warnings.push(`Metric ${index} missing chartType`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Color codes for terminal output
 */
export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Format test result for console output
 */
export function formatTestResult(
  testName: string,
  passed: boolean,
  details?: string
): string {
  const icon = passed ? '✅' : '❌';
  const color = passed ? colors.green : colors.red;
  const status = passed ? 'PASS' : 'FAIL';

  let output = `${icon} ${color}${status}${colors.reset}: ${testName}`;
  if (details) {
    output += `\n   ${details}`;
  }
  return output;
}

/**
 * Generate test summary
 */
export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  duration: number;
}

export function formatTestSummary(summary: TestSummary): string {
  const passRate = summary.total > 0
    ? ((summary.passed / summary.total) * 100).toFixed(1)
    : '0.0';

  return `
${colors.bright}═══════════════════════════════════════${colors.reset}
${colors.bright}TEST SUMMARY${colors.reset}
${colors.bright}═══════════════════════════════════════${colors.reset}
${colors.green}✅ Passed:${colors.reset}  ${summary.passed}
${colors.red}❌ Failed:${colors.reset}  ${summary.failed}
${colors.yellow}⚠️  Warnings:${colors.reset} ${summary.warnings}
${colors.cyan}📊 Pass Rate:${colors.reset} ${passRate}%
${colors.cyan}⏱️  Duration:${colors.reset} ${summary.duration}ms
${colors.bright}═══════════════════════════════════════${colors.reset}
`;
}
