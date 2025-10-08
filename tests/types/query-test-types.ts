/**
 * Type Definitions for Query Interface Tests
 * Comprehensive type definitions for test suite
 */

/**
 * Query API Request
 */
export interface QueryRequest {
  question: string;
  conversationHistory?: ConversationMessage[];
  isFollowUp?: boolean;
}

/**
 * Conversation Message
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

/**
 * Query API Response - Single Query
 */
export interface SingleQueryResponse {
  question: string;
  sql: string;
  explanation: string;
  chartType: ChartType;
  xAxis?: string;
  yAxis?: string;
  results: QueryResult[];
  insights: string[];
  error?: string;
  resultCount: number;
  multiQuery: false;
}

/**
 * Query API Response - Multi-Metric Query
 */
export interface MultiQueryResponse {
  question: string;
  multiQuery: true;
  metrics: QueryMetric[];
  error?: string;
}

/**
 * Query API Response - Clarification Needed
 */
export interface ClarificationResponse {
  needsClarification: true;
  clarificationQuestion: string;
  question: string;
}

/**
 * Union type for all possible query responses
 */
export type QueryResponse = SingleQueryResponse | MultiQueryResponse | ClarificationResponse;

/**
 * Chart Types
 */
export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'table';

/**
 * Query Metric (for multi-metric responses)
 */
export interface QueryMetric {
  id: string;
  label: string;
  sql: string;
  explanation: string;
  chartType: ChartType;
  xAxis?: string;
  yAxis?: string;
  results: QueryResult[];
  insights: string[];
  error?: string | null;
  resultCount: number;
}

/**
 * Generic Query Result Row
 */
export type QueryResult = Record<string, unknown>;

/**
 * Attendance Result
 */
export interface AttendanceResult extends Record<string, unknown> {
  user_id?: number;
  builder_name?: string;
  first_name?: string;
  last_name?: string;
  attendance_date?: string;
  attendance_rate?: number;
  attendance_pct?: number;
  rate?: number;
  days_attended?: number;
  total_days?: number;
  status?: string;
}

/**
 * Task Completion Result
 */
export interface TaskCompletionResult extends Record<string, unknown> {
  user_id?: number;
  builder_name?: string;
  first_name?: string;
  last_name?: string;
  task_id?: number;
  task_title?: string;
  tasks_completed?: number;
  total_tasks?: number;
  completion_pct?: number;
  completion_rate?: number;
}

/**
 * Performance Result
 */
export interface PerformanceResult extends Record<string, unknown> {
  user_id?: number;
  builder_name?: string;
  first_name?: string;
  last_name?: string;
  engagement_score?: number;
  performance_score?: number;
  score?: number;
  rank?: number;
}

/**
 * Test Result
 */
export interface TestResult {
  name: string;
  category: TestCategory;
  passed: boolean;
  duration: number;
  error?: string;
  details?: string;
  timestamp: string;
}

/**
 * Test Categories
 */
export type TestCategory =
  | 'attendance'
  | 'task-completion'
  | 'performance'
  | 'multi-metric'
  | 'sql-quality'
  | 'response-quality'
  | 'error-handling';

/**
 * Test Summary
 */
export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  duration: number;
  passRate: number;
  categories: CategorySummary[];
}

/**
 * Category Summary
 */
export interface CategorySummary {
  category: TestCategory;
  total: number;
  passed: number;
  failed: number;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * SQL Validation Result
 */
export interface SQLValidationResult extends ValidationResult {
  hasHardcodedValues: boolean;
  hardcodedValues: string[];
  hasDynamicSubqueries: boolean;
  hasCohortFilter: boolean;
  hasUserExclusions: boolean;
}

/**
 * Dynamic Check Result
 */
export interface DynamicCheckResult {
  hasDynamicDays: boolean;
  hasDynamicBuilders: boolean;
  hasDynamicTasks: boolean;
  hasHardcodedValues: boolean;
  hardcodedValues: string[];
}

/**
 * Query Metrics
 */
export interface QueryMetrics {
  hasSql: boolean;
  hasResults: boolean;
  hasChartType: boolean;
  hasInsights: boolean;
  resultCount: number;
  chartType?: ChartType;
  insightsCount: number;
}

/**
 * Test Configuration
 */
export interface TestConfig {
  apiBase: string;
  apiEndpoint: string;
  testCohort: string;
  excludedUserIds: number[];
  expectedActiveBuilders: number;
  timeout: number;
}

/**
 * Test Context
 */
export interface TestContext {
  config: TestConfig;
  results: TestResult[];
  startTime: number;
  endTime?: number;
}

/**
 * Test Output
 */
export interface TestOutput {
  timestamp: string;
  config: TestConfig;
  summary: TestSummary;
  results: TestResult[];
  errors: TestError[];
}

/**
 * Test Error
 */
export interface TestError {
  testName: string;
  category: TestCategory;
  error: string;
  stack?: string;
  timestamp: string;
}

/**
 * Health Check Response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected';
  claude: 'configured' | 'not-configured';
  timestamp: string;
}

/**
 * Database Metrics
 */
export interface DatabaseMetrics {
  totalCurriculumDays: number;
  totalTasks: number;
  activeBuilders: number;
  cohort: string;
}

/**
 * Test Assertion
 */
export interface TestAssertion {
  description: string;
  expected: unknown;
  actual: unknown;
  passed: boolean;
}

/**
 * Query Test Case
 */
export interface QueryTestCase {
  name: string;
  category: TestCategory;
  query: string;
  expectedChartType?: ChartType;
  expectedMinResults?: number;
  expectedMaxResults?: number;
  validations?: Array<(response: QueryResponse) => TestAssertion[]>;
}

/**
 * SQL Pattern
 */
export interface SQLPattern {
  name: string;
  pattern: RegExp;
  required: boolean;
  description: string;
}

/**
 * Benchmark Result
 */
export interface BenchmarkResult {
  queryName: string;
  duration: number;
  resultCount: number;
  sqlLength: number;
  timestamp: string;
}

/**
 * Comparison Result
 */
export interface ComparisonResult {
  testName: string;
  expected: number;
  actual: number;
  variance: number;
  passed: boolean;
  threshold: number;
}

/**
 * Type Guards
 */

export function isSingleQueryResponse(response: QueryResponse): response is SingleQueryResponse {
  return !('multiQuery' in response) || response.multiQuery === false;
}

export function isMultiQueryResponse(response: QueryResponse): response is MultiQueryResponse {
  return 'multiQuery' in response && response.multiQuery === true;
}

export function isClarificationResponse(response: QueryResponse): response is ClarificationResponse {
  return 'needsClarification' in response && response.needsClarification === true;
}

export function isAttendanceResult(result: QueryResult): result is AttendanceResult {
  return 'attendance_rate' in result || 'attendance_pct' in result || 'days_attended' in result;
}

export function isTaskCompletionResult(result: QueryResult): result is TaskCompletionResult {
  return 'completion_pct' in result || 'tasks_completed' in result;
}

export function isPerformanceResult(result: QueryResult): result is PerformanceResult {
  return 'engagement_score' in result || 'performance_score' in result;
}
