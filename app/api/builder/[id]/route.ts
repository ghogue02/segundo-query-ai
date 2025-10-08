import { NextRequest, NextResponse } from 'next/server';
import {
  getBuilderProfile,
  getBuilderAttendance,
  getBuilderCompletedTasks,
  getBuilderFeedback,
  getBuilderQualityAssessments
} from '@/lib/queries/builderQueries';
import { getBuilderTaskQuality } from '@/lib/services/task-quality';
import { getIndividualRubricBreakdown } from '@/lib/services/bigquery-individual';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const builderId = parseInt(params.id);

    if (isNaN(builderId)) {
      return NextResponse.json(
        { error: 'Invalid builder ID' },
        { status: 400 }
      );
    }

    // CRITICAL: Block access to excluded builders (staff/duplicates)
    const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];
    if (EXCLUDED_USER_IDS.includes(builderId)) {
      return NextResponse.json(
        { error: 'Builder not found', message: `Builder ID ${builderId} does not exist` },
        { status: 404 }
      );
    }

    const cohort = 'September 2025';

    // Fetch all builder data in parallel
    const [
      profile,
      attendance,
      tasks,
      feedback,
      builderQuality,
      qualityAssessments
    ] = await Promise.all([
      getBuilderProfile(builderId),
      getBuilderAttendance(builderId),
      getBuilderCompletedTasks(builderId),
      getBuilderFeedback(builderId),
      getBuilderTaskQuality(cohort),
      getBuilderQualityAssessments(builderId, cohort)
    ]);

    if (!profile) {
      return NextResponse.json(
        { error: 'Builder not found or not in September 2025 cohort' },
        { status: 404 }
      );
    }

    // Get individual quality score for this builder
    // CRITICAL: PostgreSQL ROUND() returns NUMERIC as string - must parse to number
    const quality = builderQuality.find(q => q.user_id === builderId);
    const quality_score = quality?.avg_quality ? Number(quality.avg_quality) : 0;
    const tasks_assessed = quality?.tasks_assessed ? Number(quality.tasks_assessed) : 0;

    // Try to fetch rubric breakdown from BigQuery (may fail if not available)
    let rubricBreakdown = null;
    try {
      const allRubrics = await getIndividualRubricBreakdown(cohort);
      rubricBreakdown = allRubrics.find(r => r.user_id === builderId) || null;
    } catch (error) {
      console.warn('BigQuery rubric breakdown not available:', error);
      // Continue without rubric breakdown
    }

    // Parse all numeric fields to prevent hydration mismatches
    // PostgreSQL returns numeric types as strings in JSON responses
    const parsedProfile = {
      ...profile,
      days_attended: Number(profile.days_attended) || 0,
      total_days: Number(profile.total_days) || 0,
      attendance_percentage: Number(profile.attendance_percentage) || 0,
      punctuality_rate: profile.punctuality_rate !== null ? Number(profile.punctuality_rate) : null,
      tasks_completed: Number(profile.tasks_completed) || 0,
      total_tasks: Number(profile.total_tasks) || 0,
      completion_percentage: Number(profile.completion_percentage) || 0,
      engagement_score: Number(profile.engagement_score) || 0
    };

    return NextResponse.json({
      ...parsedProfile,
      quality_score,
      tasks_assessed,
      attendance,
      tasks,
      feedback,
      quality_assessments: qualityAssessments,
      rubric_breakdown: rubricBreakdown
    });
  } catch (error) {
    console.error('Builder API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
