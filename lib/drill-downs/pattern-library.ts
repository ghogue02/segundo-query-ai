import { DrillDownSuggestion, DrillDownContext } from './types';

// Pre-defined drill-down patterns organized by context

export function generateDetailDrillDowns(context: DrillDownContext): DrillDownSuggestion[] {
  const suggestions: DrillDownSuggestion[] = [];

  switch (context.entityType) {
    case 'feedback':
      suggestions.push({
        id: 'feedback-detail-builders',
        label: 'Show builders who submitted',
        icon: '🔍',
        query: 'Show me the complete list of builders who submitted Weekly Feedback, including their names, submission dates, and NPS scores',
        queryType: 'detail',
        expectedChartType: 'table',
        priority: 10,
        description: 'View individual builder feedback submissions with details'
      });
      suggestions.push({
        id: 'feedback-detail-comments',
        label: 'View feedback comments',
        icon: '💬',
        query: 'Show me the actual feedback comments (what_we_did_well and what_to_improve) from Weekly Feedback submissions, grouped by builder',
        queryType: 'detail',
        expectedChartType: 'table',
        priority: 8,
        description: 'Read qualitative feedback from builders'
      });
      break;

    case 'attendance':
      suggestions.push({
        id: 'attendance-detail-records',
        label: 'View individual attendance records',
        icon: '🔍',
        query: context.hasTimeComponent
          ? 'Show me detailed attendance records for each builder during this time period, including check-in times and late arrivals'
          : 'Show me detailed attendance records with builder names, dates, check-in times, and punctuality status',
        queryType: 'detail',
        expectedChartType: 'table',
        priority: 9,
        description: 'See who attended with complete check-in details'
      });
      break;

    case 'tasks':
      if (context.aggregationLevel === 'overall' || context.aggregationLevel === 'daily') {
        suggestions.push({
          id: 'task-detail-breakdown',
          label: 'View task-by-task completion',
          icon: '📋',
          query: 'Show me completion rates for each individual task with task titles, types, and completion percentages',
          queryType: 'detail',
          expectedChartType: 'table',
          priority: 9,
          description: 'Break down by individual tasks'
        });
      } else {
        suggestions.push({
          id: 'task-detail-builders',
          label: 'Show builders who completed these',
          icon: '🔍',
          query: 'Show me which builders completed or missed these specific tasks',
          queryType: 'detail',
          expectedChartType: 'table',
          priority: 10,
          description: 'See individual builder completion status'
        });
      }
      break;

    case 'builders':
      suggestions.push({
        id: 'builder-detail-metrics',
        label: 'View complete builder profiles',
        icon: '👤',
        query: 'Show me detailed profiles for these builders including attendance percentage, task completion, punctuality rate, and engagement score',
        queryType: 'detail',
        expectedChartType: 'table',
        priority: 9,
        description: 'Full breakdown of all metrics per builder'
      });
      break;
  }

  return suggestions;
}

export function generateComparisonDrillDowns(context: DrillDownContext): DrillDownSuggestion[] {
  const suggestions: DrillDownSuggestion[] = [];

  switch (context.entityType) {
    case 'feedback':
      suggestions.push({
        id: 'feedback-compare-weeks',
        label: 'Compare scores between weeks',
        icon: '📊',
        query: 'Compare the average NPS scores (referral_likelihood) between Day 9 and Day 14 Weekly Feedback, showing improvement or decline',
        queryType: 'comparison',
        expectedChartType: 'bar',
        priority: 9,
        description: 'See how feedback sentiment changed week-over-week'
      });
      suggestions.push({
        id: 'feedback-compare-response-rates',
        label: 'Compare submission rates by week',
        icon: '📈',
        query: 'Compare the number of builders who submitted feedback on Day 9 vs Day 14',
        queryType: 'comparison',
        expectedChartType: 'bar',
        priority: 7,
        description: 'Track feedback participation trends'
      });
      break;

    case 'attendance':
      if (context.hasTimeComponent) {
        suggestions.push({
          id: 'attendance-compare-periods',
          label: 'Compare to previous week',
          icon: '📈',
          query: 'Show me attendance rates for the previous week for comparison with the current results',
          queryType: 'comparison',
          expectedChartType: 'line',
          priority: 8,
          description: 'Compare attendance across time periods'
        });
      }
      suggestions.push({
        id: 'attendance-compare-weekday-weekend',
        label: 'Compare weekday vs weekend',
        icon: '📊',
        query: 'Compare average attendance rates between weekdays (Mon-Wed) and weekends (Sat-Sun)',
        queryType: 'comparison',
        expectedChartType: 'bar',
        priority: 7,
        description: 'See if weekends have different attendance patterns'
      });
      break;

    case 'tasks':
      suggestions.push({
        id: 'task-compare-types',
        label: 'Compare by task type',
        icon: '📊',
        query: 'Group these tasks by task_type (group vs individual) and show average completion rate for each type',
        queryType: 'comparison',
        expectedChartType: 'bar',
        priority: 8,
        description: 'See which task types have better completion'
      });
      suggestions.push({
        id: 'task-compare-modes',
        label: 'Compare by interaction mode',
        icon: '🎯',
        query: 'Group these tasks by task_mode (basic vs conversation) and ai_helper_mode to compare completion rates',
        queryType: 'comparison',
        expectedChartType: 'bar',
        priority: 7,
        description: 'Analyze how AI assistance affects completion'
      });
      break;

    case 'builders':
      if (context.resultCount >= 10) {
        suggestions.push({
          id: 'builder-compare-segments',
          label: 'Compare top vs bottom performers',
          icon: '⚖️',
          query: 'Compare key metrics (attendance, tasks, punctuality) between top 10% and bottom 10% of these builders',
          queryType: 'comparison',
          expectedChartType: 'bar',
          priority: 8,
          description: 'Identify performance gaps and patterns'
        });
      }
      break;
  }

  return suggestions;
}

export function generateCorrelationDrillDowns(context: DrillDownContext): DrillDownSuggestion[] {
  const suggestions: DrillDownSuggestion[] = [];

  switch (context.entityType) {
    case 'feedback':
      suggestions.push({
        id: 'feedback-attendance-correlation',
        label: 'Compare feedback vs attendance',
        icon: '🔗',
        query: 'Show the relationship between builders who submitted Weekly Feedback and their attendance rates - do engaged builders submit more feedback?',
        queryType: 'correlation',
        expectedChartType: 'table',
        priority: 7,
        description: 'Correlation between feedback participation and attendance'
      });
      suggestions.push({
        id: 'feedback-task-correlation',
        label: 'Compare feedback vs task completion',
        icon: '🔗',
        query: 'Show task completion rates for builders who did and didn\'t submit Weekly Feedback',
        queryType: 'correlation',
        expectedChartType: 'table',
        priority: 6,
        description: 'Does feedback correlate with task engagement?'
      });
      break;

    case 'attendance':
      suggestions.push({
        id: 'attendance-task-correlation',
        label: 'Show task completion rates',
        icon: '🔗',
        query: 'Show task completion percentages for the builders/days in this attendance data',
        queryType: 'correlation',
        expectedChartType: 'table',
        priority: 8,
        description: 'Does attendance predict task completion?'
      });
      break;

    case 'tasks':
      suggestions.push({
        id: 'task-engagement-correlation',
        label: 'Show builder engagement scores',
        icon: '🔗',
        query: 'Show the average engagement scores of builders who completed vs didn\'t complete these tasks',
        queryType: 'correlation',
        expectedChartType: 'bar',
        priority: 7,
        description: 'Are high-engagement builders completing more?'
      });
      suggestions.push({
        id: 'task-timing-correlation',
        label: 'Analyze task difficulty patterns',
        icon: '⏰',
        query: 'Show the duration_minutes, day_number, and ai_helper_mode for these tasks to identify difficulty or timing issues',
        queryType: 'correlation',
        expectedChartType: 'table',
        priority: 6,
        description: 'Find patterns in task characteristics'
      });
      break;

    case 'builders':
      suggestions.push({
        id: 'builder-all-metrics',
        label: 'Show all performance metrics',
        icon: '📊',
        query: 'Show attendance rate, task completion rate, punctuality, and engagement score for these builders in a comprehensive comparison table',
        queryType: 'correlation',
        expectedChartType: 'table',
        priority: 9,
        description: 'Complete performance dashboard'
      });
      break;
  }

  return suggestions;
}

export function generateTemporalDrillDowns(context: DrillDownContext): DrillDownSuggestion[] {
  const suggestions: DrillDownSuggestion[] = [];

  if (context.hasTimeComponent) return suggestions; // Already has time component

  switch (context.entityType) {
    case 'tasks':
      suggestions.push({
        id: 'task-trend-over-time',
        label: 'Show trend over time',
        icon: '📈',
        query: 'Show completion rates for these tasks over time (by day or week)',
        queryType: 'temporal',
        expectedChartType: 'line',
        priority: 8,
        description: 'Track how completion changed over time'
      });
      break;

    case 'builders':
      suggestions.push({
        id: 'builder-progress-trend',
        label: 'Show progress over time',
        icon: '📈',
        query: 'Show these builders\' performance trends (attendance and task completion) over the past 2-3 weeks',
        queryType: 'temporal',
        expectedChartType: 'line',
        priority: 7,
        description: 'Track individual builder progress'
      });
      break;

    case 'attendance':
      suggestions.push({
        id: 'attendance-trend',
        label: 'Show attendance trend',
        icon: '📈',
        query: 'Show daily attendance rates over time as a trend line',
        queryType: 'temporal',
        expectedChartType: 'line',
        priority: 8,
        description: 'Visualize attendance patterns'
      });
      break;
  }

  return suggestions;
}

export function generateFilterDrillDowns(context: DrillDownContext): DrillDownSuggestion[] {
  const suggestions: DrillDownSuggestion[] = [];

  if (context.hasOutliers) {
    if (context.entityType === 'tasks') {
      suggestions.push({
        id: 'task-filter-outliers',
        label: 'Focus on outlier tasks',
        icon: '⚠️',
        query: 'Show me tasks with unusually high (>80%) or unusually low (<30%) completion rates compared to the average',
        queryType: 'filter',
        expectedChartType: 'table',
        priority: 9,
        description: 'Highlight exceptional cases requiring attention'
      });
    }

    if (context.entityType === 'builders') {
      suggestions.push({
        id: 'builder-filter-atrisk',
        label: 'Filter at-risk builders only',
        icon: '⚠️',
        query: 'Show only builders who are at risk (attendance below 70% OR task completion below 50%)',
        queryType: 'filter',
        expectedChartType: 'table',
        priority: 10,
        description: 'Focus on builders needing immediate support'
      });
      suggestions.push({
        id: 'builder-filter-stars',
        label: 'Filter top performers only',
        icon: '⭐',
        query: 'Show only builders with excellent performance (engagement score above 85%)',
        queryType: 'filter',
        expectedChartType: 'table',
        priority: 8,
        description: 'Identify builders for recognition or mentorship'
      });
    }
  }

  if (context.resultCount > 20) {
    suggestions.push({
      id: 'filter-top-results',
      label: 'Show top 10 only',
      icon: '🔝',
      query: 'Show only the top 10 results from the current data based on the primary metric',
      queryType: 'filter',
      expectedChartType: 'table',
      priority: 6,
      description: 'Focus on highest performers/rates'
    });
    suggestions.push({
      id: 'filter-bottom-results',
      label: 'Show bottom 10 only',
      icon: '🔻',
      query: 'Show only the bottom 10 results from the current data that need attention',
      queryType: 'filter',
      expectedChartType: 'table',
      priority: 6,
      description: 'Focus on lowest performers/rates'
    });
  }

  if (context.entityType === 'attendance' && context.hasTimeComponent) {
    suggestions.push({
      id: 'attendance-filter-absent',
      label: 'Show absent builders',
      icon: '❌',
      query: 'Show me which specific builders were absent (not present or late) during this time period',
      queryType: 'filter',
      expectedChartType: 'table',
      priority: 9,
      description: 'List builders who missed class'
    });
    suggestions.push({
      id: 'attendance-filter-late',
      label: 'Show late arrivals only',
      icon: '⏰',
      query: 'Show me which builders arrived late during this period, including their late arrival times',
      queryType: 'filter',
        expectedChartType: 'table',
        priority: 7,
        description: 'Identify punctuality issues'
      });
  }

  if (context.entityType === 'tasks' && context.identifiedColumns.metricColumns.some(c => c.toLowerCase().includes('completion'))) {
    suggestions.push({
      id: 'task-filter-low-completion',
      label: 'Show only low completion (<30%)',
      icon: '🔻',
      query: 'Show only tasks with completion rates below 30% that may need curriculum redesign or additional support',
      queryType: 'filter',
      expectedChartType: 'table',
      priority: 8,
      description: 'Focus on struggling content'
    });
  }

  return suggestions;
}
