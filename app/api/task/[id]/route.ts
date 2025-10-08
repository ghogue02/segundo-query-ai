import { NextRequest, NextResponse } from 'next/server';
import { getTaskDetail, getTaskBuilders, getTaskSubmissionPreviews } from '@/lib/queries/taskQueries';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const taskId = parseInt(params.id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: 'Invalid task ID' },
        { status: 400 }
      );
    }

    // Fetch all task data in parallel
    const [taskDetail, builders, submissions] = await Promise.all([
      getTaskDetail(taskId),
      getTaskBuilders(taskId),
      getTaskSubmissionPreviews(taskId)
    ]);

    if (!taskDetail) {
      return NextResponse.json(
        { error: 'Task not found or not in September 2025 cohort' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...taskDetail,
      builders,
      submissions
    });
  } catch (error) {
    console.error('Task API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
