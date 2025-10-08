export interface QueryTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  question: string;
}

export const queryTemplates: QueryTemplate[] = [
  // Attendance Queries
  {
    id: 'att-today',
    title: "Today's Attendance",
    description: "Current day attendance count and percentage",
    category: 'Attendance',
    question: "What is today's attendance rate?"
  },
  {
    id: 'att-week',
    title: 'Weekly Attendance Trend',
    description: 'Attendance rates for the past week',
    category: 'Attendance',
    question: "Show me attendance rates for the last 7 days"
  },
  {
    id: 'att-late',
    title: 'Late Arrivals',
    description: 'Builders with frequent late arrivals',
    category: 'Attendance',
    question: "Which builders have been late more than 3 times?"
  },
  {
    id: 'att-perfect',
    title: 'Perfect Attendance',
    description: 'Builders with 100% attendance',
    category: 'Attendance',
    question: "Who has perfect attendance so far?"
  },

  // Task Completion Queries
  {
    id: 'task-completion',
    title: 'Overall Task Completion',
    description: 'Task completion rate across all builders',
    category: 'Tasks',
    question: "What is the overall task completion rate?"
  },
  {
    id: 'task-low',
    title: 'Low Completion Tasks',
    description: 'Tasks with completion rates below 70%',
    category: 'Tasks',
    question: "Which tasks have the lowest completion rates?"
  },
  {
    id: 'task-builder',
    title: 'Builder Task Progress',
    description: 'Individual builder task completion',
    category: 'Tasks',
    question: "Show me task completion by builder"
  },
  {
    id: 'task-type',
    title: 'Completion by Task Type',
    description: 'Completion rates grouped by task type',
    category: 'Tasks',
    question: "Compare completion rates across different task types"
  },

  // Engagement Queries
  {
    id: 'eng-active',
    title: 'Most Engaged Builders',
    description: 'Top builders by attendance and task completion',
    category: 'Engagement',
    question: "Who are the top 10 most engaged builders?"
  },
  {
    id: 'eng-risk',
    title: 'At-Risk Builders',
    description: 'Builders with low engagement metrics',
    category: 'Engagement',
    question: "Which builders might need additional support?"
  },
  {
    id: 'eng-conversation',
    title: 'Conversation Activity',
    description: 'Message counts by builder',
    category: 'Engagement',
    question: "Show me conversation activity by builder"
  },

  // Feedback Queries
  {
    id: 'feed-nps',
    title: 'Referral Likelihood Trend',
    description: 'Weekly NPS/referral scores',
    category: 'Feedback',
    question: "Show me referral likelihood scores over time"
  },
  {
    id: 'feed-recent',
    title: 'Recent Feedback',
    description: 'Latest feedback submissions',
    category: 'Feedback',
    question: "What's the most recent feedback from builders?"
  },
  {
    id: 'feed-improve',
    title: 'Improvement Themes',
    description: 'Common themes in improvement feedback',
    category: 'Feedback',
    question: "What are the common themes in improvement suggestions?"
  },

  // Curriculum Queries
  {
    id: 'curr-days',
    title: 'Curriculum Overview',
    description: 'List of all curriculum days with goals',
    category: 'Curriculum',
    question: "Show me all curriculum days with their goals"
  },
  {
    id: 'curr-engagement',
    title: 'Engagement by Day',
    description: 'Which days had highest/lowest engagement',
    category: 'Curriculum',
    question: "Which curriculum days had the highest engagement?"
  },
  {
    id: 'curr-tasks',
    title: 'Tasks per Day',
    description: 'Count of tasks for each curriculum day',
    category: 'Curriculum',
    question: "How many tasks are in each curriculum day?"
  },

  // Performance Queries
  {
    id: 'perf-top',
    title: 'Top Performers',
    description: 'Builders with highest overall scores',
    category: 'Performance',
    question: "Who are the top 10 performers overall?"
  },
  {
    id: 'perf-improve',
    title: 'Most Improved',
    description: 'Builders with biggest improvement over time',
    category: 'Performance',
    question: "Which builders have improved the most?"
  },
  {
    id: 'perf-correlation',
    title: 'Attendance vs Task Completion',
    description: 'Correlation between attendance and tasks',
    category: 'Performance',
    question: "Is there a correlation between attendance and task completion?"
  }
];

export function getTemplatesByCategory(): Record<string, QueryTemplate[]> {
  const categorized: Record<string, QueryTemplate[]> = {};

  queryTemplates.forEach(template => {
    if (!categorized[template.category]) {
      categorized[template.category] = [];
    }
    categorized[template.category].push(template);
  });

  return categorized;
}

export function getTemplateById(id: string): QueryTemplate | undefined {
  return queryTemplates.find(t => t.id === id);
}
