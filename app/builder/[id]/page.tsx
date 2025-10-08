import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface BuilderData {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  cohort: string;
  days_attended: number;
  total_days: number;
  attendance_percentage: number;
  tasks_completed: number;
  total_tasks: number;
  completion_percentage: number;
  engagement_score: number;
  quality_score: number;
  tasks_assessed: number;
  attendance: Array<{
    attendance_date: string;
    status: string;
  }>;
  tasks: Array<{
    task_title: string;
    completed_at: string;
  }>;
  quality_assessments: Array<{
    task_id: number;
    block_title: string;
    score: number;
    assessed_at: string;
    analysis_type: string;
    day_number: number | null;
  }>;
  rubric_breakdown: {
    technical_skills: number;
    business_value: number;
    project_mgmt: number;
    critical_thinking: number;
    professional_skills: number;
    overall_score: number;
    assessments_count: number;
  } | null;
}

async function getBuilderData(userId: number): Promise<BuilderData | null> {
  try {
    // Import database functions directly (no fetch needed in SSR)
    const {
      getBuilderProfile,
      getBuilderAttendance,
      getBuilderCompletedTasks,
      getBuilderQualityAssessments
    } = await import('@/lib/queries/builderQueries');
    const { getBuilderTaskQuality } = await import('@/lib/services/task-quality');
    const { getIndividualRubricBreakdown } = await import('@/lib/services/bigquery-individual');

    const cohort = 'September 2025';
    const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

    // Check if builder is excluded
    if (EXCLUDED_USER_IDS.includes(userId)) {
      return null;
    }

    // Fetch all data in parallel
    const [
      profile,
      attendance,
      tasks,
      builderQuality,
      qualityAssessments,
      rubricData
    ] = await Promise.all([
      getBuilderProfile(userId),
      getBuilderAttendance(userId),
      getBuilderCompletedTasks(userId),
      getBuilderTaskQuality(cohort),
      getBuilderQualityAssessments(userId, cohort),
      getIndividualRubricBreakdown(cohort).catch(() => [])
    ]);

    if (!profile) {
      return null;
    }

    // Find this builder's quality score
    const quality = builderQuality.find(q => q.user_id === userId);
    const rubric = rubricData.find((r: any) => r.user_id === userId);

    return {
      ...profile,
      attendance,
      tasks,
      // CRITICAL: PostgreSQL ROUND() returns NUMERIC as string - must parse to number
      quality_score: quality?.avg_quality ? Number(quality.avg_quality) : 0,
      tasks_assessed: quality?.tasks_assessed ? Number(quality.tasks_assessed) : 0,
      quality_assessments: qualityAssessments,
      rubric_breakdown: rubric || null
    };
  } catch (error) {
    console.error('Error fetching builder data:', error);
    return null;
  }
}

export default async function BuilderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = parseInt(id);

  const builderData = await getBuilderData(userId);

  if (!builderData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Builder Not Found</h1>
            <p className="text-gray-600 mb-4">Builder ID {id} does not exist</p>
            <Link href="/metrics">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate status
  const status =
    builderData.engagement_score > 80
      ? 'Top Performer'
      : builderData.completion_percentage < 50 || builderData.attendance_percentage < 70
      ? 'Struggling'
      : 'On Track';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{builderData.first_name} {builderData.last_name}</h1>
            <p className="text-sm text-gray-300">Builder Profile - September 2025 Cohort</p>
          </div>
          <Link href="/metrics">
            <Button variant="secondary" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* KPI Overview */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Task Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(builderData.completion_percentage)}%</div>
              <p className="text-xs text-gray-500 mt-1">
                {builderData.tasks_completed}/{builderData.total_tasks || 107} tasks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(builderData.attendance_percentage)}%</div>
              <p className="text-xs text-gray-500 mt-1">
                {builderData.days_attended}/{builderData.total_days || 24} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Quality Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {builderData.quality_score > 0 ? builderData.quality_score.toFixed(1) : 'N/A'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {builderData.tasks_assessed > 0
                  ? `${builderData.tasks_assessed} task${builderData.tasks_assessed !== 1 ? 's' : ''} assessed`
                  : 'No assessments yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={status === 'Top Performer' ? 'default' : status === 'Struggling' ? 'destructive' : 'secondary'}>
                {status}
              </Badge>
              <p className="text-xs text-gray-500 mt-2">Engagement: {Math.round(builderData.engagement_score)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quality Assessment Section */}
        {builderData.quality_assessments && builderData.quality_assessments.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quality Assessment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {builderData.quality_assessments.map((assessment, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{assessment.block_title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {assessment.day_number && `Day ${assessment.day_number} • `}
                          {new Date(assessment.assessed_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 ml-4">
                        {assessment.score}
                        <span className="text-sm text-gray-400">/100</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rubric Breakdown (if available) */}
                {builderData.rubric_breakdown && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-4 text-gray-900">Rubric Score Breakdown</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="text-sm text-gray-600 mb-1">Technical Skills</div>
                        <div className="text-2xl font-bold text-blue-700">
                          {builderData.rubric_breakdown.technical_skills}%
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="text-sm text-gray-600 mb-1">Business Value</div>
                        <div className="text-2xl font-bold text-green-700">
                          {builderData.rubric_breakdown.business_value}%
                        </div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="text-sm text-gray-600 mb-1">Critical Thinking</div>
                        <div className="text-2xl font-bold text-purple-700">
                          {builderData.rubric_breakdown.critical_thinking}%
                        </div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <div className="text-sm text-gray-600 mb-1">Professional Skills</div>
                        <div className="text-2xl font-bold text-orange-700">
                          {builderData.rubric_breakdown.professional_skills}%
                        </div>
                      </div>
                      {builderData.rubric_breakdown.project_mgmt > 0 && (
                        <div className="bg-indigo-50 p-3 rounded col-span-2">
                          <div className="text-sm text-gray-600 mb-1">Project Management</div>
                          <div className="text-2xl font-bold text-indigo-700">
                            {builderData.rubric_breakdown.project_mgmt}%
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-xs text-gray-500 text-center">
                      Based on {builderData.rubric_breakdown.assessments_count} comprehensive assessment{builderData.rubric_breakdown.assessments_count !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 gap-6">
          {/* Attendance History */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {builderData.attendance.map((record, idx) => {
                  const statusColors = {
                    present: 'bg-green-100 text-green-800 border-green-200',
                    late: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    absent: 'bg-red-100 text-red-800 border-red-200',
                    excused: 'bg-gray-100 text-gray-600 border-gray-200',
                  };

                  return (
                    <div key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                      <span className="text-gray-700">
                        {new Date(record.attendance_date).toLocaleDateString()}
                      </span>
                      <Badge
                        className={statusColors[record.status as keyof typeof statusColors] || statusColors.absent}
                      >
                        {record.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {builderData.tasks.map((task, idx) => (
                  <div key={idx} className="text-sm border-b pb-2">
                    <div className="font-medium text-gray-900">{task.task_title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(task.completed_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
