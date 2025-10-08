'use client';

import { useEffect, useState } from 'react';
import { Loader2, Clock, Users, FileText, X, Calendar, BarChart3 } from 'lucide-react';
import StatCard from '../shared/StatCard';
import ProgressBar from '../shared/ProgressBar';

interface TaskDetailPanelProps {
  taskId: number;
  isOpen: boolean;
  onClose: () => void;
  onBuilderClick?: (builderId: number) => void;
}

interface TaskDetail {
  id: number;
  task_title: string;
  intro: string | null;
  task_type: string | null;
  duration_minutes: number | null;
  task_mode: string | null;
  ai_helper_mode: string | null;
  deliverable_type: string | null;
  start_time: string;
  end_time: string;
  block_category: string | null;
  day_number: number;
  day_date: string;
  day_type: string;
  daily_goal: string | null;
  completed_count: number;
  submission_count: number;
  thread_count: number;
  completion_percentage: number;
  active_builder_count: number;
  builders: BuilderCompletion[];
  submissions: TaskSubmissionPreview[];
}

interface BuilderCompletion {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  has_submission: boolean;
  has_thread: boolean;
  completed_at: string | null;
}

interface TaskSubmissionPreview {
  user_id: number;
  first_name: string;
  last_name: string;
  content_preview: string;
  submitted_at: string;
}

export default function TaskDetailPanel({ taskId, isOpen, onClose, onBuilderClick }: TaskDetailPanelProps) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !taskId) return;

    async function fetchTask() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/task/${taskId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch task details');
        }
        const data = await response.json();
        setTask(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchTask();
  }, [taskId, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {task && (
            <div className="text-sm text-gray-500 mt-1">
              Day {task.day_number} • {new Date(task.day_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading task details...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {task && (
            <>
              {/* Task Overview */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
                <h3 className="font-bold text-xl text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  {task.task_title}
                </h3>
                {task.intro && (
                  <p className="text-sm text-gray-700 mb-4">{task.intro}</p>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {task.task_type && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium text-gray-900 bg-white px-2 py-1 rounded">{task.task_type}</span>
                    </div>
                  )}
                  {task.duration_minutes && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{task.duration_minutes} minutes</span>
                    </div>
                  )}
                  {task.task_mode && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Mode:</span>
                      <span className="font-medium text-gray-900 bg-white px-2 py-1 rounded">{task.task_mode}</span>
                    </div>
                  )}
                  {task.ai_helper_mode && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">AI Helper:</span>
                      <span className="font-medium text-gray-900 bg-white px-2 py-1 rounded">{task.ai_helper_mode}</span>
                    </div>
                  )}
                  {task.block_category && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{task.block_category}</span>
                    </div>
                  )}
                  {task.deliverable_type && task.deliverable_type !== 'none' && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Deliverable:</span>
                      <span className="font-medium text-gray-900 bg-white px-2 py-1 rounded">{task.deliverable_type}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Completion Statistics */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Completion Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <StatCard
                    label="Builders Completed"
                    value={`${task.completed_count}/${task.active_builder_count}`}
                    icon={<Users className="w-5 h-5" />}
                    colorScheme={task.completion_percentage >= 80 ? 'green' : task.completion_percentage >= 60 ? 'blue' : 'yellow'}
                  />
                  <StatCard
                    label="Completion Rate"
                    value={`${task.completion_percentage}%`}
                    icon={<BarChart3 className="w-5 h-5" />}
                    colorScheme={task.completion_percentage >= 80 ? 'green' : task.completion_percentage >= 60 ? 'blue' : 'yellow'}
                  />
                </div>
                <ProgressBar
                  value={task.completed_count}
                  max={task.active_builder_count}
                  label="Progress"
                  showPercentage={true}
                />
                <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <p>• {task.submission_count} formal submission{task.submission_count !== 1 ? 's' : ''}</p>
                  <p>• {task.thread_count} conversation thread{task.thread_count !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Builders Who Completed */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Builders Who Completed ({task.builders.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {task.builders.length === 0 ? (
                    <p className="text-gray-500 text-sm">No builders have completed this task yet.</p>
                  ) : (
                    task.builders.map((builder) => (
                      <button
                        key={builder.user_id}
                        onClick={() => onBuilderClick?.(builder.user_id)}
                        className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 group-hover:text-blue-700 truncate">
                              {builder.first_name} {builder.last_name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">{builder.email}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs ml-3">
                            {builder.has_submission && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">📝 Submitted</span>
                            )}
                            {builder.has_thread && !builder.has_submission && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">💬 Thread</span>
                            )}
                          </div>
                        </div>
                        {builder.completed_at && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(builder.completed_at).toLocaleString()}
                          </p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Submission Previews */}
              {task.submissions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Submissions</h3>
                  <div className="space-y-3">
                    {task.submissions.map((submission) => (
                      <div key={`${submission.user_id}-${submission.submitted_at}`} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm text-gray-900">
                            {submission.first_name} {submission.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 italic">
                          &ldquo;{submission.content_preview}...&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
