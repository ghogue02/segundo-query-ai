'use client';

import { useEffect, useState } from 'react';
import { Loader2, User, TrendingUp, Calendar, CheckCircle, X, Award, MessageSquare } from 'lucide-react';
import StatCard from '../shared/StatCard';
import ProgressBar from '../shared/ProgressBar';
import TimelineItem from '../shared/TimelineItem';

interface BuilderDetailPanelProps {
  builderId: number;
  isOpen: boolean;
  onClose: () => void;
  onTaskClick?: (taskId: number) => void;
}

interface BuilderProfile {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  cohort: string;
  days_attended: number;
  total_days: number; // Dynamic: total curriculum days for cohort
  attendance_percentage: number;
  punctuality_rate: number | null;
  tasks_completed: number;
  total_tasks: number; // Dynamic: total tasks for cohort
  completion_percentage: number;
  engagement_score: number;
  attendance: AttendanceRecord[];
  tasks: CompletedTask[];
  feedback: FeedbackRecord[];
}

interface AttendanceRecord {
  attendance_date: string;
  check_in_time: string;
  status: 'present' | 'late' | 'absent' | 'excused';
  late_arrival_minutes: number | null;
  day_number: number | null;
  day_type: string | null;
}

interface CompletedTask {
  task_id: number;
  task_title: string;
  task_type: string | null;
  day_number: number;
  completed_at: string;
  has_submission: boolean;
}

interface FeedbackRecord {
  day_number: number;
  week_number: number;
  referral_likelihood: number | null;
  what_we_did_well: string | null;
  what_to_improve: string | null;
  submitted_at: string;
}

export default function BuilderDetailPanel({ builderId, isOpen, onClose, onTaskClick }: BuilderDetailPanelProps) {
  const [builder, setBuilder] = useState<BuilderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllAttendance, setShowAllAttendance] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);

  useEffect(() => {
    if (!isOpen || !builderId) return;

    async function fetchBuilder() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/builder/${builderId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch builder details');
        }
        const data = await response.json();
        setBuilder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchBuilder();
  }, [builderId, isOpen]);

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
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {builder ? `${builder.first_name} ${builder.last_name}` : 'Builder Profile'}
                </h2>
                {builder && (
                  <p className="text-blue-100 text-sm">{builder.email}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading builder profile...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {builder && (
            <>
              {/* Engagement Score Overview */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-bold text-2xl text-gray-900">
                      {builder.engagement_score}%
                    </h3>
                    <p className="text-sm text-gray-600">Overall Engagement Score</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-white rounded p-3 text-center">
                    <p className="text-gray-500 text-xs mb-1">Attendance</p>
                    <p className="font-bold text-lg text-gray-900">{builder.attendance_percentage}%</p>
                  </div>
                  <div className="bg-white rounded p-3 text-center">
                    <p className="text-gray-500 text-xs mb-1">Tasks</p>
                    <p className="font-bold text-lg text-gray-900">{builder.completion_percentage}%</p>
                  </div>
                  <div className="bg-white rounded p-3 text-center">
                    <p className="text-gray-500 text-xs mb-1">Punctuality</p>
                    <p className="font-bold text-lg text-gray-900">
                      {builder.punctuality_rate !== null && builder.punctuality_rate !== undefined
                        ? typeof builder.punctuality_rate === 'number'
                          ? builder.punctuality_rate.toFixed(2)
                          : parseFloat(String(builder.punctuality_rate)).toFixed(2)
                        : '0'}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    label="Attendance"
                    value={`${builder.days_attended}/${builder.total_days}`}
                    icon={<Calendar className="w-5 h-5" />}
                    colorScheme={builder.attendance_percentage >= 90 ? 'green' : builder.attendance_percentage >= 70 ? 'blue' : 'yellow'}
                  />
                  <StatCard
                    label="Tasks Completed"
                    value={`${builder.tasks_completed}/${builder.total_tasks}`}
                    icon={<CheckCircle className="w-5 h-5" />}
                    colorScheme={builder.completion_percentage >= 80 ? 'green' : builder.completion_percentage >= 60 ? 'blue' : 'yellow'}
                  />
                </div>
              </div>

              {/* Attendance Timeline */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Attendance Timeline ({builder.attendance.length} days)
                </h3>
                <ProgressBar
                  value={builder.days_attended}
                  max={builder.total_days}
                  label={`${builder.days_attended}/${builder.total_days} days attended`}
                  showPercentage={true}
                />
                <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                  {(showAllAttendance ? builder.attendance : builder.attendance.slice(-10)).reverse().map((record) => {
                    // Recalculate late minutes on-the-fly in EST
                    const checkInTime = new Date(record.check_in_time);
                    const dayOfWeek = new Date(record.attendance_date).getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sun=0, Sat=6

                    let calculatedLateMinutes = 0;
                    if (record.status === 'late') {
                      const hours = checkInTime.getHours();
                      const minutes = checkInTime.getMinutes();
                      const totalMinutes = hours * 60 + minutes;

                      if (isWeekend) {
                        // Weekend cutoff: 10:00 AM (600 minutes)
                        calculatedLateMinutes = Math.max(0, totalMinutes - 600);
                      } else {
                        // Weekday cutoff: 6:30 PM (1110 minutes)
                        calculatedLateMinutes = Math.max(0, totalMinutes - 1110);
                      }
                    }

                    return (
                      <TimelineItem
                        key={record.attendance_date}
                        date={record.attendance_date}
                        time={checkInTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        status={record.status}
                        label={`Day ${record.day_number || '?'} - ${record.day_type || 'Unknown'}`}
                        lateMinutes={calculatedLateMinutes}
                      />
                    );
                  })}
                  {builder.attendance.length > 10 && (
                    <div className="mt-3 text-center">
                      <button
                        onClick={() => setShowAllAttendance(!showAllAttendance)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        {showAllAttendance ? `Show Recent 10` : `Show All ${builder.attendance.length} Days`}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Task Completion */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Completed Tasks ({builder.tasks.length}/{builder.total_tasks})
                </h3>
                <ProgressBar
                  value={builder.tasks_completed}
                  max={builder.total_tasks}
                  label="Task completion progress"
                  showPercentage={true}
                />
                <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                  {(showAllTasks ? builder.tasks : builder.tasks.slice(-15)).reverse().map((task) => (
                    <div
                      key={task.task_id}
                      onClick={() => {
                        console.log('Clicking task from builder panel:', task.task_id);
                        onTaskClick?.(task.task_id);
                      }}
                      className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 group-hover:text-blue-700 truncate">
                            {task.task_title}
                          </p>
                          <p className="text-xs text-gray-500">
                            Day {task.day_number} • {task.task_type || 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          {task.has_submission && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">📝</span>
                          )}
                          {!task.has_submission && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">💬</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {builder.tasks.length > 15 && (
                    <div className="mt-3 text-center">
                      <button
                        onClick={() => setShowAllTasks(!showAllTasks)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        {showAllTasks ? `Show Recent 15` : `Show All ${builder.tasks.length} Tasks`}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Weekly Feedback */}
              {builder.feedback.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    Weekly Feedback ({builder.feedback.length})
                  </h3>
                  <div className="space-y-3">
                    {builder.feedback.map((fb) => (
                      <div key={fb.day_number} className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm text-gray-900">
                            Week {fb.week_number} (Day {fb.day_number})
                          </span>
                          {fb.referral_likelihood !== null && (
                            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                              NPS: {fb.referral_likelihood}/10
                            </span>
                          )}
                        </div>
                        {fb.what_we_did_well && (
                          <div className="mb-2">
                            <p className="text-xs font-semibold text-green-700 mb-1">✅ What we did well:</p>
                            <p className="text-sm text-gray-700 italic">&ldquo;{fb.what_we_did_well}&rdquo;</p>
                          </div>
                        )}
                        {fb.what_to_improve && (
                          <div>
                            <p className="text-xs font-semibold text-orange-700 mb-1">💡 What to improve:</p>
                            <p className="text-sm text-gray-700 italic">&ldquo;{fb.what_to_improve}&rdquo;</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Submitted: {new Date(fb.submitted_at).toLocaleDateString()}
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
