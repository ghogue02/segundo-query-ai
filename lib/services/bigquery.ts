/**
 * BigQuery Service
 * Connects to pursuit-ops BigQuery for quality scores
 */

import { BigQuery } from '@google-cloud/bigquery';

let bigquery: BigQuery | null = null;

export function getBigQueryClient() {
  if (!bigquery) {
    // Use service account JSON from environment or file
    if (process.env.GOOGLE_CREDENTIALS_BASE64) {
      const credentials = JSON.parse(
        Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString()
      );
      bigquery = new BigQuery({
        projectId: 'pursuit-ops',
        credentials,
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      bigquery = new BigQuery({
        projectId: 'pursuit-ops',
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });
    } else {
      throw new Error('BigQuery credentials not configured');
    }
  }
  return bigquery;
}

/**
 * Get quality scores for September 2025 cohort
 */
export async function getCohortQualityScores(cohort: string = 'September 2025') {
  const bq = getBigQueryClient();

  const query = `
    SELECT
      user_id,
      user_first_name,
      user_last_name,
      assessment_id,
      assessment_name,
      overall_score,
      type_specific_data
    FROM \`pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis\`
    WHERE user_cohort = @cohort
    ORDER BY user_id, assessment_id
  `;

  const options = {
    query,
    params: { cohort },
  };

  const [rows] = await bq.query(options);
  return rows;
}

/**
 * Get average quality score per builder
 */
export async function getBuilderAverageQuality(cohort: string = 'September 2025') {
  const bq = getBigQueryClient();

  const query = `
    SELECT
      user_id,
      user_first_name,
      user_last_name,
      AVG(overall_score) as avg_quality_score,
      COUNT(*) as assessments_completed
    FROM \`pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis\`
    WHERE user_cohort = @cohort
    GROUP BY user_id, user_first_name, user_last_name
    ORDER BY avg_quality_score DESC
  `;

  const options = {
    query,
    params: { cohort },
  };

  const [rows] = await bq.query(options);
  return rows.map((row: any) => ({
    user_id: row.user_id,
    first_name: row.user_first_name,
    last_name: row.user_last_name,
    avg_quality_score: Math.round(row.avg_quality_score * 100), // Convert to 0-100 scale
    assessments_completed: row.assessments_completed,
  }));
}

/**
 * Get rubric breakdown for cohort
 * Assessment 1 (Quiz) has section breakdowns
 */
export async function getRubricBreakdown(cohort: string = 'September 2025') {
  const bq = getBigQueryClient();

  const query = `
    SELECT
      type_specific_data
    FROM \`pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis\`
    WHERE user_cohort = @cohort
      AND assessment_type = 'quiz'
      AND type_specific_data IS NOT NULL
  `;

  const options = {
    query,
    params: { cohort },
  };

  const [rows] = await bq.query(options);

  // Aggregate section scores across all builders
  const sectionTotals: Record<string, { total: number; count: number; name: string }> = {};

  rows.forEach((row: any) => {
    try {
      const data = JSON.parse(row.type_specific_data);
      if (data.section_breakdown) {
        Object.entries(data.section_breakdown).forEach(([key, section]: [string, any]) => {
          if (!sectionTotals[key]) {
            sectionTotals[key] = { total: 0, count: 0, name: section.name };
          }
          sectionTotals[key].total += section.score;
          sectionTotals[key].count += 1;
        });
      }
    } catch (e) {
      console.error('Error parsing type_specific_data:', e);
    }
  });

  // Calculate averages
  const rubricScores = Object.entries(sectionTotals).map(([key, data]) => ({
    category: data.name,
    score: Math.round((data.total / data.count) * 100),
  }));

  return rubricScores;
}

/**
 * Get holistic feedback for a builder
 */
export async function getHolisticFeedback(userId: number) {
  const bq = getBigQueryClient();

  const query = `
    SELECT
      user_id,
      user_first_name,
      user_last_name,
      total_assessments,
      average_score,
      strengths_summary,
      growth_areas_summary,
      included_assessments,
      assessment_scores,
      analysis_timestamp
    FROM \`pursuit-ops.pilot_agent_public.holistic_assessment_feedback\`
    WHERE user_id = @userId
  `;

  const options = {
    query,
    params: { userId },
  };

  const [rows] = await bq.query(options);
  return rows[0] || null;
}

/**
 * Test BigQuery connection
 */
export async function testBigQueryConnection(): Promise<boolean> {
  try {
    const bq = getBigQueryClient();
    const query = 'SELECT 1 as test';
    await bq.query(query);
    return true;
  } catch (error) {
    console.error('BigQuery connection failed:', error);
    return false;
  }
}
