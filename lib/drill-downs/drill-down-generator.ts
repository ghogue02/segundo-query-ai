import { DrillDownSuggestion, DrillDownContext } from './types';
import {
  generateDetailDrillDowns,
  generateComparisonDrillDowns,
  generateCorrelationDrillDowns,
  generateTemporalDrillDowns,
  generateFilterDrillDowns
} from './pattern-library';

export function generateDrillDowns(context: DrillDownContext): DrillDownSuggestion[] {
  const suggestions: DrillDownSuggestion[] = [];

  // Pattern 1: Detail drill-downs (aggregate → individual)
  if (context.aggregationLevel !== 'individual' || context.resultCount === 1) {
    suggestions.push(...generateDetailDrillDowns(context));
  }

  // Pattern 2: Comparison drill-downs
  if (context.resultCount >= 2 && context.resultCount <= 50) {
    suggestions.push(...generateComparisonDrillDowns(context));
  }

  // Pattern 3: Correlation drill-downs (show related metrics)
  suggestions.push(...generateCorrelationDrillDowns(context));

  // Pattern 4: Temporal drill-downs (add time dimension)
  if (!context.hasTimeComponent && context.entityType !== 'mixed') {
    suggestions.push(...generateTemporalDrillDowns(context));
  }

  // Pattern 5: Filter drill-downs (segment/outliers)
  if (context.hasOutliers || context.resultCount > 10) {
    suggestions.push(...generateFilterDrillDowns(context));
  }

  // Sort by priority (highest first) and return top 3
  return suggestions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);
}

// Helper function to generate unique IDs for drill-downs
export function generateDrillDownId(): string {
  return `drill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
