export interface DrillDownContext {
  // Query metadata
  entityType: 'tasks' | 'builders' | 'attendance' | 'feedback' | 'submissions' | 'mixed';
  aggregationLevel: 'individual' | 'daily' | 'weekly' | 'monthly' | 'overall';
  metricType: 'count' | 'percentage' | 'rate' | 'score' | 'trend' | 'mixed';

  // Result characteristics
  resultCount: number;
  hasTimeComponent: boolean;
  hasGrouping: boolean;

  // Data properties
  identifiedColumns: {
    idColumns: string[];
    nameColumns: string[];
    metricColumns: string[];
    dateColumns: string[];
  };

  // Statistical insights
  hasOutliers: boolean;
  hasTrends: boolean;
  hasComparableGroups: boolean;

  // Original query info
  originalQuestion: string;
  sqlQuery: string;
}

export interface DrillDownSuggestion {
  id: string;
  label: string;
  icon: string;
  query: string;
  queryType: 'detail' | 'comparison' | 'correlation' | 'filter' | 'temporal';
  expectedChartType: 'bar' | 'line' | 'pie' | 'table';
  priority: number;
  description: string;
}

export interface StackedResult {
  id: string;
  question: string;
  result: {
    question: string;
    sql?: string;
    explanation?: string;
    chartType?: string;
    xAxis?: string;
    yAxis?: string;
    results?: Record<string, unknown>[];
    insights?: string[];
    error?: string;
    resultCount?: number;
    multiQuery?: boolean;
    metrics?: Array<{
      id: string;
      label: string;
      sql: string;
      explanation: string;
      chartType: string;
      xAxis?: string;
      yAxis?: string;
      results: Record<string, unknown>[];
      insights: string[];
      error?: string;
      resultCount: number;
    }>;
  };
  drillDowns: DrillDownSuggestion[];
  depth: number;
  parentId?: string;
}
