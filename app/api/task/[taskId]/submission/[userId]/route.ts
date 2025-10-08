import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

interface TaskSubmission {
  content: string;
  created_at: string;
}

interface ConversationMessage {
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

interface TaskThread {
  thread_id: number;
  messages: ConversationMessage[];
}

interface SubmissionData {
  user_id: number;
  first_name: string;
  last_name: string;
  task_id: number;
  task_title: string;
  submission?: {
    content: string;
    created_at: string;
  };
  thread?: {
    thread_id: number;
    messages: ConversationMessage[];
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ taskId: string; userId: string }> }
) {
  try {
    const params = await context.params;
    const taskId = parseInt(params.taskId);
    const userId = parseInt(params.userId);

    if (isNaN(taskId) || isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid task ID or user ID' },
        { status: 400 }
      );
    }

    // Get user and task info
    const userTaskQuery = `
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        t.id as task_id,
        t.task_title
      FROM users u
      CROSS JOIN tasks t
      WHERE u.user_id = $1
        AND t.id = $2
        AND u.cohort = 'September 2025'
        AND u.active = true
    `;

    const userTaskResults = await executeQuery<{
      user_id: number;
      first_name: string;
      last_name: string;
      task_id: number;
      task_title: string;
    }>(userTaskQuery, [userId, taskId]);

    if (userTaskResults.length === 0) {
      return NextResponse.json(
        { error: 'User or task not found' },
        { status: 404 }
      );
    }

    const userTask = userTaskResults[0];

    // Get submission if exists
    const submissionQuery = `
      SELECT content, created_at
      FROM task_submissions
      WHERE user_id = $1 AND task_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const submissionResults = await executeQuery<TaskSubmission>(
      submissionQuery,
      [userId, taskId]
    );

    // Get thread and messages if exists
    const threadQuery = `
      SELECT tt.thread_id
      FROM task_threads tt
      WHERE tt.user_id = $1 AND tt.task_id = $2
      LIMIT 1
    `;

    const threadResults = await executeQuery<{ thread_id: number }>(
      threadQuery,
      [userId, taskId]
    );

    let thread: TaskThread | undefined;

    if (threadResults.length > 0) {
      const threadId = threadResults[0].thread_id;

      const messagesQuery = `
        SELECT content, role, created_at
        FROM conversation_messages
        WHERE thread_id = $1
        ORDER BY created_at ASC
      `;

      const messages = await executeQuery<ConversationMessage>(
        messagesQuery,
        [threadId]
      );

      thread = {
        thread_id: threadId,
        messages,
      };
    }

    const response: SubmissionData = {
      user_id: userTask.user_id,
      first_name: userTask.first_name,
      last_name: userTask.last_name,
      task_id: userTask.task_id,
      task_title: userTask.task_title,
    };

    if (submissionResults.length > 0) {
      response.submission = submissionResults[0];
    }

    if (thread) {
      response.thread = thread;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Task submission API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
