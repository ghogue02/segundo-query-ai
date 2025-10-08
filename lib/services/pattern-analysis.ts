/**
 * Pattern Analysis Service
 *
 * Analyzes cohort-level text patterns in task submissions.
 * Runs daily at 8am EST via cron job.
 *
 * Purpose: Find insights from aggregate data (76 builders × 107 tasks)
 * NOT for individual scoring (use BigQuery quality scores instead)
 */

import Anthropic from '@anthropic-ai/sdk';
import { executeQuery } from '@/lib/db';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Submission {
  user_id: number;
  first_name: string;
  last_name: string;
  thread_content: string;
  created_at: Date;
  word_count: number;
}

interface PatternAnalysisResult {
  task_id: number;
  cohort: string;
  total_submissions: number;
  interaction_patterns: {
    common_approaches: string[];
    avg_word_count: number;
    response_length: {
      min: number;
      max: number;
      median: number;
    };
    submission_times?: {
      peak_hour: number;
      weekend_pct: number;
    };
  };
  understanding_distribution: {
    deep: {
      count: number;
      percentage: number;
      indicators: string[];
    };
    partial: {
      count: number;
      percentage: number;
      indicators: string[];
    };
    struggling: {
      count: number;
      percentage: number;
      indicators: string[];
    };
  };
  quality_patterns: {
    high_quality_pct: number;
    medium_quality_pct: number;
    low_quality_pct: number;
    differentiators: string[];
  };
  red_flags: {
    short_responses?: {
      count: number;
      threshold: number;
      user_ids: number[];
    };
    similar_wording?: {
      groups: number;
      similarity_threshold: number;
    };
    common_misconceptions: Array<{
      misconception: string;
      occurrence_count: number;
    }>;
    ai_overuse_indicators?: {
      count: number;
      patterns: string[];
    };
  };
  recommendations: string[];
}

/**
 * Get all submissions for a specific task
 */
async function getTaskSubmissions(taskId: number, cohort: string): Promise<Submission[]> {
  const query = `
    SELECT
      ts.user_id,
      u.first_name,
      u.last_name,
      ts.thread_content,
      ts.created_at,
      LENGTH(ts.thread_content) as word_count
    FROM task_submissions ts
    JOIN users u ON ts.user_id = u.user_id
    WHERE ts.task_id = $1
      AND u.cohort = $2
      AND u.active = true
      AND u.user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332)
    ORDER BY ts.created_at ASC
  `;

  const submissions = await executeQuery<Submission>(query, [taskId, cohort]);
  return submissions;
}

/**
 * Get task details
 */
async function getTaskDetails(taskId: number) {
  const query = `
    SELECT
      id,
      task_title,
      task_description,
      task_type,
      learning_type,
      deliverable
    FROM tasks
    WHERE id = $1
  `;

  const results = await executeQuery(query, [taskId]);
  return results[0];
}

/**
 * Analyze cohort patterns using Claude AI
 */
async function analyzeWithClaude(
  task: any,
  submissions: Submission[]
): Promise<Omit<PatternAnalysisResult, 'task_id' | 'cohort' | 'total_submissions'>> {

  // Build submission summary (anonymized builder numbers)
  const submissionSummary = submissions.map((s, i) => ({
    builder_num: i + 1,
    word_count: s.word_count,
    text: s.thread_content.slice(0, 500), // First 500 chars to stay within limits
  }));

  const prompt = `
You are analyzing cohort-level patterns for a coding bootcamp task.

TASK DETAILS:
Title: ${task.task_title}
Description: ${task.task_description}
Type: ${task.task_type}
Expected Deliverable: ${task.deliverable}

COHORT SUBMISSIONS (${submissions.length} builders):
${JSON.stringify(submissionSummary, null, 2)}

Provide aggregate pattern analysis in this EXACT JSON format:

{
  "interaction_patterns": {
    "common_approaches": ["approach 1", "approach 2", "approach 3"],
    "avg_word_count": <number>,
    "response_length": {
      "min": <number>,
      "max": <number>,
      "median": <number>
    }
  },
  "understanding_distribution": {
    "deep": {
      "count": <number>,
      "percentage": <number>,
      "indicators": ["what shows deep understanding"]
    },
    "partial": {
      "count": <number>,
      "percentage": <number>,
      "indicators": ["what shows partial understanding"]
    },
    "struggling": {
      "count": <number>,
      "percentage": <number>,
      "indicators": ["what shows struggling"]
    }
  },
  "quality_patterns": {
    "high_quality_pct": <number>,
    "medium_quality_pct": <number>,
    "low_quality_pct": <number>,
    "differentiators": ["what makes responses high vs low quality"]
  },
  "red_flags": {
    "short_responses": {
      "count": <number of responses <50 words>,
      "threshold": 50,
      "user_ids": [<builder numbers with short responses>]
    },
    "similar_wording": {
      "groups": <number of groups with similar phrasing>,
      "similarity_threshold": 0.85
    },
    "common_misconceptions": [
      {
        "misconception": "specific misconception",
        "occurrence_count": <number>
      }
    ],
    "ai_overuse_indicators": {
      "count": <number of generic AI-style responses>,
      "patterns": ["generic phrases", "lack of personalization"]
    }
  },
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2",
    "Actionable recommendation 3"
  ]
}

Focus on PATTERNS across the cohort, not individual builders.
Identify what works well and what needs curriculum improvement.
`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: prompt
    }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  // Extract JSON from response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from Claude response');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Store pattern analysis results
 */
async function storeAnalysis(
  taskId: number,
  cohort: string,
  totalSubmissions: number,
  analysis: Omit<PatternAnalysisResult, 'task_id' | 'cohort' | 'total_submissions'>
): Promise<void> {
  const query = `
    INSERT INTO task_pattern_analysis (
      task_id,
      cohort,
      total_submissions,
      analysis_date,
      interaction_patterns,
      understanding_distribution,
      quality_patterns,
      red_flags,
      recommendations
    ) VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6, $7, $8)
    ON CONFLICT (task_id, cohort, analysis_date)
    DO UPDATE SET
      total_submissions = EXCLUDED.total_submissions,
      interaction_patterns = EXCLUDED.interaction_patterns,
      understanding_distribution = EXCLUDED.understanding_distribution,
      quality_patterns = EXCLUDED.quality_patterns,
      red_flags = EXCLUDED.red_flags,
      recommendations = EXCLUDED.recommendations,
      analyzed_at = NOW()
  `;

  await executeQuery(query, [
    taskId,
    cohort,
    totalSubmissions,
    JSON.stringify(analysis.interaction_patterns),
    JSON.stringify(analysis.understanding_distribution),
    JSON.stringify(analysis.quality_patterns),
    JSON.stringify(analysis.red_flags),
    analysis.recommendations,
  ]);
}

/**
 * Main function: Analyze a single task
 */
export async function analyzeTaskPatterns(
  taskId: number,
  cohort: string = 'September 2025'
): Promise<PatternAnalysisResult> {
  console.log(`[Pattern Analysis] Starting analysis for task ${taskId}, cohort ${cohort}`);

  // Get submissions
  const submissions = await getTaskSubmissions(taskId, cohort);

  if (submissions.length === 0) {
    throw new Error(`No submissions found for task ${taskId}`);
  }

  if (submissions.length < 10) {
    console.log(`[Pattern Analysis] Skipping task ${taskId} - only ${submissions.length} submissions (need 10+)`);
    throw new Error('Insufficient submissions for pattern analysis');
  }

  // Get task details
  const task = await getTaskDetails(taskId);

  // Analyze with Claude
  const analysis = await analyzeWithClaude(task, submissions);

  // Store results
  await storeAnalysis(taskId, cohort, submissions.length, analysis);

  console.log(`[Pattern Analysis] Completed for task ${taskId}`);

  return {
    task_id: taskId,
    cohort,
    total_submissions: submissions.length,
    ...analysis,
  };
}

/**
 * Batch analysis: Analyze all tasks with recent submissions
 */
export async function runDailyPatternAnalysis(cohort: string = 'September 2025'): Promise<void> {
  console.log(`[Daily Pattern Analysis] Starting at ${new Date().toISOString()}`);

  // Get tasks with submissions in last 24 hours OR never analyzed
  const query = `
    SELECT DISTINCT t.id as task_id
    FROM tasks t
    JOIN task_submissions ts ON t.id = ts.task_id
    JOIN users u ON ts.user_id = u.user_id
    WHERE u.cohort = $1
      AND u.active = true
      AND (
        ts.created_at > NOW() - INTERVAL '24 hours'
        OR NOT EXISTS (
          SELECT 1 FROM task_pattern_analysis tpa
          WHERE tpa.task_id = t.id AND tpa.cohort = $1
        )
      )
    ORDER BY t.id
  `;

  const tasksToAnalyze = await executeQuery<{ task_id: number }>(query, [cohort]);

  console.log(`[Daily Pattern Analysis] Found ${tasksToAnalyze.length} tasks to analyze`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const { task_id } of tasksToAnalyze) {
    try {
      await analyzeTaskPatterns(task_id, cohort);
      successCount++;
    } catch (error: any) {
      if (error.message.includes('Insufficient submissions')) {
        skipCount++;
      } else {
        console.error(`[Pattern Analysis] Error analyzing task ${task_id}:`, error);
        errorCount++;
      }
    }
  }

  console.log(`[Daily Pattern Analysis] Complete. Success: ${successCount}, Skipped: ${skipCount}, Errors: ${errorCount}`);
}

/**
 * Get pattern analysis for a specific task
 */
export async function getTaskPatternAnalysis(
  taskId: number,
  cohort: string = 'September 2025'
): Promise<PatternAnalysisResult | null> {
  const query = `
    SELECT
      task_id,
      cohort,
      total_submissions,
      interaction_patterns,
      understanding_distribution,
      quality_patterns,
      red_flags,
      recommendations,
      analyzed_at
    FROM task_pattern_analysis
    WHERE task_id = $1 AND cohort = $2
    ORDER BY analysis_date DESC
    LIMIT 1
  `;

  const results = await executeQuery(query, [taskId, cohort]);

  if (results.length === 0) {
    return null;
  }

  return results[0] as unknown as PatternAnalysisResult;
}
