import { DrillDownContext } from './types';

export function analyzeQueryContext(result: {
  question: string;
  sql?: string;
  results?: Record<string, unknown>[];
  multiQuery?: boolean;
  metrics?: Array<{ results: Record<string, unknown>[] }>;
}): DrillDownContext {
  const data = result.multiQuery && result.metrics
    ? (result.metrics[0]?.results || [])
    : (result.results || []);

  const keys = data.length > 0 ? Object.keys(data[0]) : [];
  const question = result.question.toLowerCase();
  const sql = (result.sql || '').toLowerCase();

  // Entity detection
  const entityType = detectEntityType(keys, question, sql);

  // Column classification
  const identifiedColumns = classifyColumns(keys, data);

  // Aggregation level detection
  const aggregationLevel = detectAggregationLevel(keys, identifiedColumns, data.length);

  // Metric type detection
  const metricType = detectMetricType(keys);

  // Time component detection
  const hasTimeComponent = detectTimeComponent(keys);

  // Grouping detection
  const hasGrouping = detectGrouping(keys, data);

  // Statistical analysis
  const stats = analyzeStatistics(data, identifiedColumns);

  return {
    entityType,
    aggregationLevel,
    metricType,
    resultCount: data.length,
    hasTimeComponent,
    hasGrouping,
    identifiedColumns,
    hasOutliers: stats.hasOutliers,
    hasTrends: stats.hasTrends,
    hasComparableGroups: stats.hasComparableGroups,
    originalQuestion: result.question,
    sqlQuery: result.sql || ''
  };
}

function detectEntityType(
  keys: string[],
  question: string,
  sql: string
): DrillDownContext['entityType'] {
  // Column-based detection
  if (keys.includes('task_id') || keys.includes('task_title')) return 'tasks';
  if (keys.includes('user_id') || keys.includes('first_name') || keys.includes('last_name')) return 'builders';
  if (keys.includes('attendance_date') || keys.includes('check_in_time')) return 'attendance';
  if (keys.includes('referral_likelihood') || keys.includes('what_we_did_well')) return 'feedback';

  // Question keyword detection
  if (question.includes('feedback') || question.includes('nps')) return 'feedback';
  if (question.includes('task') && !question.includes('completion')) return 'tasks';
  if (question.includes('builder') || question.includes('student') || question.includes('performer')) return 'builders';
  if (question.includes('attendance') || question.includes('absent') || question.includes('present')) return 'attendance';

  // SQL keyword detection
  if (sql.includes('builder_feedback')) return 'feedback';
  if (sql.includes('builder_attendance')) return 'attendance';

  return 'mixed';
}

function classifyColumns(
  keys: string[],
  data: Record<string, unknown>[]
): DrillDownContext['identifiedColumns'] {
  const idColumns: string[] = [];
  const nameColumns: string[] = [];
  const metricColumns: string[] = [];
  const dateColumns: string[] = [];

  keys.forEach(key => {
    const keyLower = key.toLowerCase();

    // ID columns
    if (keyLower.endsWith('_id') || keyLower === 'id') {
      idColumns.push(key);
    }
    // Name columns
    else if (keyLower.includes('name') || keyLower.includes('title') || keyLower === 'email') {
      nameColumns.push(key);
    }
    // Date columns
    else if (keyLower.includes('date') || keyLower.includes('time') || keyLower.includes('day')) {
      dateColumns.push(key);
    }
    // Metric columns (numeric)
    else if (data.length > 0) {
      const firstValue = data[0][key];
      if (typeof firstValue === 'number' || typeof firstValue === 'string' && !isNaN(parseFloat(String(firstValue)))) {
        metricColumns.push(key);
      }
    }
  });

  return { idColumns, nameColumns, metricColumns, dateColumns };
}

function detectAggregationLevel(
  keys: string[],
  columns: DrillDownContext['identifiedColumns'],
  resultCount: number
): DrillDownContext['aggregationLevel'] {
  // Individual: Has IDs and names (builder or task list)
  if (columns.idColumns.length > 0 && columns.nameColumns.length > 0 && resultCount > 1) {
    return 'individual';
  }

  // Daily: Has day-related columns
  if (keys.some(k => k.toLowerCase().includes('day_number') || k.toLowerCase().includes('day_date'))) {
    return 'daily';
  }

  // Weekly: Has week indicator
  if (keys.some(k => k.toLowerCase().includes('week'))) {
    return 'weekly';
  }

  // Monthly: Has month indicator
  if (keys.some(k => k.toLowerCase().includes('month'))) {
    return 'monthly';
  }

  // Overall: Single row aggregate
  if (resultCount === 1 && columns.metricColumns.length > 0) {
    return 'overall';
  }

  return 'individual';
}

function detectMetricType(keys: string[]): DrillDownContext['metricType'] {
  const metricKeys = keys.filter(k => {
    const kLower = k.toLowerCase();
    return kLower.includes('count') ||
      kLower.includes('rate') ||
      kLower.includes('percentage') ||
      kLower.includes('score') ||
      kLower.includes('avg') ||
      kLower.includes('total');
  });

  if (metricKeys.some(k => k.toLowerCase().includes('percentage') || k.toLowerCase().includes('rate'))) {
    return 'percentage';
  }
  if (metricKeys.some(k => k.toLowerCase().includes('count') || k.toLowerCase().includes('total'))) {
    return 'count';
  }
  if (metricKeys.some(k => k.toLowerCase().includes('score'))) {
    return 'score';
  }

  return 'mixed';
}

function detectTimeComponent(keys: string[]): boolean {
  return keys.some(k => {
    const kLower = k.toLowerCase();
    return kLower.includes('date') ||
      kLower.includes('day_number') ||
      kLower.includes('week') ||
      kLower.includes('month') ||
      kLower.includes('time');
  });
}

function detectGrouping(
  keys: string[],
  data: Record<string, unknown>[]
): boolean {
  if (data.length === 0) return false;

  // Check for categorical grouping (repeated values suggesting groups)
  const categoricalColumns = keys.filter(k => {
    const values = data.map(row => row[k]);
    const uniqueValues = new Set(values);
    // If unique values < half of rows and > 1, likely grouped data
    return uniqueValues.size < data.length / 2 && uniqueValues.size > 1;
  });

  return categoricalColumns.length > 0;
}

function analyzeStatistics(
  data: Record<string, unknown>[],
  columns: DrillDownContext['identifiedColumns']
): {
  hasOutliers: boolean;
  hasTrends: boolean;
  hasComparableGroups: boolean;
} {
  if (data.length < 3) {
    return { hasOutliers: false, hasTrends: false, hasComparableGroups: false };
  }

  // Check for outliers in metric columns
  let hasOutliers = false;
  columns.metricColumns.forEach(col => {
    const values = data.map(row => {
      const val = row[col];
      return typeof val === 'number' ? val : parseFloat(String(val));
    }).filter(v => !isNaN(v));

    if (values.length >= 5) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      // Outliers: values > 2 standard deviations from mean
      if (stdDev > 0 && values.some(v => Math.abs(v - mean) > 2 * stdDev)) {
        hasOutliers = true;
      }
    }
  });

  // Check for trends (time component + 5+ data points)
  const hasTrends = columns.dateColumns.length > 0 && data.length >= 5;

  // Check for comparable groups (reasonable number of distinct items)
  const hasComparableGroups = data.length >= 2 && data.length <= 50;

  return { hasOutliers, hasTrends, hasComparableGroups };
}
