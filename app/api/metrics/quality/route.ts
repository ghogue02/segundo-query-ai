import { NextRequest, NextResponse } from 'next/server';
import { getCohortQualityScores } from '@/lib/services/bigquery';
import { getCohortAverageRubric } from '@/lib/services/bigquery-individual';
import { getCohortTaskQuality } from '@/lib/services/task-quality';

interface QualityResponse {
  avgScore: number;
  rubricBreakdown: Array<{ category: string; score: number; note?: string }>;
  totalAssessments: number;
  dataSources?: { overall: string; rubric: string };
  note?: string;
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cohort = searchParams.get('cohort') || 'September 2025';

    let avgScore = 0;
    let totalAssessments = 0;
    let dataSource = 'Task Submissions (PostgreSQL)';

    // HYBRID APPROACH: Get task-level quality average from PostgreSQL (for Overall Quality Score)
    try {
      avgScore = await getCohortTaskQuality(cohort);
      // Get total assessments count from PostgreSQL
      const { executeQuery } = await import('@/lib/db');
      const countResult = await executeQuery<{ count: string }>(
        `SELECT COUNT(*) as count
         FROM task_analyses ta
         JOIN users u ON ta.user_id = u.user_id
         WHERE u.cohort = $1
           AND u.user_id NOT IN (129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332)
           AND ta.analysis_result->>'completion_score' IS NOT NULL
           AND CAST(ta.analysis_result->>'completion_score' AS NUMERIC) BETWEEN 0 AND 100`,
        [cohort]
      );
      totalAssessments = parseInt(countResult[0]?.count || '0');
    } catch (pgError) {
      console.warn('PostgreSQL task quality failed, falling back to BigQuery:', pgError);
      // Fallback to BigQuery if PostgreSQL fails
      const qualityScores = await getCohortQualityScores(cohort);
      const totalScore = qualityScores.reduce(
        (sum: number, row: any) => sum + row.overall_score,
        0
      );
      avgScore = qualityScores.length > 0
        ? Math.round((totalScore / qualityScores.length) * 100)
        : 0;
      totalAssessments = qualityScores.length;
      dataSource = 'Curated Assessments (BigQuery - fallback)';
    }

    // Get rubric breakdown from BigQuery (for Quality by Category radar chart)
    let rubricAvg;
    let validRubricBreakdown: Array<{ category: string; score: number; note?: string }> = [];

    try {
      rubricAvg = await getCohortAverageRubric(cohort);

      // Transform rubric averages to chart format
      const rubricBreakdown = [
        { category: 'Technical Skills', score: rubricAvg.technical_skills },
        { category: 'Business Value', score: rubricAvg.business_value },
        { category: 'Project Management', score: rubricAvg.project_mgmt },
        { category: 'Critical Thinking', score: rubricAvg.critical_thinking },
        { category: 'Professional Skills', score: rubricAvg.professional_skills },
      ];

      // Filter out categories with 0 scores (no data yet)
      validRubricBreakdown = rubricBreakdown.filter(r => r.score > 0);
    } catch (bqError) {
      console.warn('BigQuery rubric breakdown failed:', bqError);
      // Set empty rubric breakdown if BigQuery fails
      validRubricBreakdown = [];
    }

    const response: QualityResponse = {
      avgScore: Math.round(avgScore),
      rubricBreakdown: validRubricBreakdown.length > 0 ? validRubricBreakdown : [
        { category: 'Technical Skills', score: 0, note: 'Data not yet available' },
        { category: 'Business Value', score: 0, note: 'Data not yet available' },
        { category: 'Professional Skills', score: 0, note: 'Data not yet available' }
      ],
      totalAssessments,
      dataSources: {
        overall: dataSource,
        rubric: 'Curated Assessments (BigQuery)'
      },
      note: validRubricBreakdown.length === 0 ? 'Category breakdown not yet available from BigQuery assessments' : undefined
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Quality API Error:', error);
    return NextResponse.json(
      {
        avgScore: 0,
        rubricBreakdown: [],
        totalAssessments: 0,
        error: 'Failed to fetch quality data',
      },
      { status: 500 }
    );
  }
}
