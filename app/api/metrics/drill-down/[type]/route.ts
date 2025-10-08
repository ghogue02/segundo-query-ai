import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cohort = searchParams.get('cohort') || 'September 2025';
    const { type } = await params;

    let result;

    switch (type) {
      case 'attendance-today':
        result = await getAttendanceToday(cohort);
        break;
      case 'attendance-yesterday':
        result = await getAttendanceYesterday(cohort);
        break;
      case 'task-completion':
        result = await getTaskCompletion(cohort);
        break;
      case 'attendance-rate':
        result = await getAttendanceRateDetails(cohort);
        break;
      case 'need-intervention':
        result = await getNeedIntervention(cohort);
        break;
      case 'quality-score':
        result = await getQualityScoreDetails(cohort);
        break;
      case 'quality-task':  // NEW: Task-level quality drill-down
        result = await getTaskQualityDetails(cohort);
        break;
      case 'quality-rubric':
        result = await getQualityRubricDetails(cohort);
        break;
      case 'task-difficulty':
      case 'h7':
        result = await getTaskDifficultyDetails(cohort);
        break;
      case 'h1':
        result = await getH1Details(cohort);
        break;
      case 'h2':
        result = await getH2Details(cohort);
        break;
      case 'h4':
        result = await getH4Details(cohort);
        break;
      default:
        return NextResponse.json({ error: 'Unknown drill-down type' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Drill-down API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getAttendanceToday(cohort: string) {
  const query = `
    SELECT
      u.user_id,
      u.first_name || ' ' || u.last_name as builder_name,
      ba.check_in_time,
      ba.status,
      ba.late_arrival_minutes,
      DATE(ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') as attendance_date
    FROM builder_attendance_new ba
    JOIN users u ON ba.user_id = u.user_id
    WHERE ba.attendance_date = CURRENT_DATE
      AND ba.status IN ('present', 'late')
      AND u.cohort = $1
      AND u.active = true
      AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
    ORDER BY ba.check_in_time
  `;

  const data = await executeQuery(query, [cohort]);

  return {
    title: 'Attendance Today',
    description: `Builders who checked in today (${data.length} total)`,
    data,
    columns: [
      { key: 'builder_name', label: 'Builder' },
      { key: 'status', label: 'Status' },
      { key: 'check_in_time', label: 'Check-in Time', format: (v: string) => new Date(v).toLocaleTimeString() },
      { key: 'late_arrival_minutes', label: 'Late (min)', format: (v: number) => v || '0' },
    ],
  };
}

async function getAttendanceYesterday(cohort: string) {
  const query = `
    SELECT
      u.user_id,
      u.first_name || ' ' || u.last_name as builder_name,
      ba.check_in_time,
      ba.status,
      COALESCE(ba.late_arrival_minutes, 0) as late_arrival_minutes
    FROM builder_attendance_new ba
    JOIN users u ON ba.user_id = u.user_id
    WHERE DATE(ba.check_in_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York') = CURRENT_DATE - INTERVAL '1 day'
      AND ba.check_in_time < (CURRENT_DATE AT TIME ZONE 'America/New_York' - INTERVAL '1 day')::TIMESTAMP + INTERVAL '1 day' + INTERVAL '1 hour'
      AND ba.status IN ('present', 'late')
      AND u.cohort = $1
      AND u.active = true
      AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
    ORDER BY ba.check_in_time
  `;

  const data = await executeQuery(query, [cohort]);

  return {
    title: 'Attendance Yesterday',
    description: `Builders who checked in yesterday (${data.length} total)`,
    data,
    columns: [
      { key: 'builder_name', label: 'Builder' },
      { key: 'status', label: 'Status' },
      { key: 'check_in_time', label: 'Check-in Time', format: (v: string) => new Date(v).toLocaleTimeString() },
      { key: 'late_arrival_minutes', label: 'Late (min)', format: (v: number) => v || '0' },
    ],
  };
}

async function getTaskCompletion(cohort: string) {
  const query = `
    WITH sept_tasks AS (
      SELECT DISTINCT t.id, t.task_title
      FROM tasks t
      JOIN time_blocks tb ON t.block_id = tb.id
      JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE cd.cohort = $1
        AND cd.day_date >= DATE_TRUNC('week', CURRENT_DATE)
        AND cd.day_date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'
        AND t.task_type != 'break'
    ),
    task_interactions AS (
      SELECT
        st.id as task_id,
        st.task_title,
        COUNT(DISTINCT u.user_id) as builders_interacted,
        (SELECT COUNT(*) FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})) as total_builders
      FROM sept_tasks st
      LEFT JOIN (
        SELECT task_id, user_id FROM task_submissions WHERE task_id IN (SELECT id FROM sept_tasks)
        UNION
        SELECT task_id, user_id FROM task_threads WHERE task_id IN (SELECT id FROM sept_tasks)
      ) interactions ON st.id = interactions.task_id
      LEFT JOIN users u ON interactions.user_id = u.user_id
        AND u.cohort = $1
        AND u.active = true
        AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
      GROUP BY st.id, st.task_title
      ORDER BY builders_interacted DESC
    )
    SELECT
      task_title,
      builders_interacted,
      total_builders,
      ROUND((builders_interacted::FLOAT / NULLIF(total_builders, 0) * 100)::numeric, 1) as completion_pct
    FROM task_interactions
  `;

  const data = await executeQuery(query, [cohort]);

  return {
    title: 'Task Completion This Week',
    description: 'All tasks with engagement metrics',
    data,
    columns: [
      { key: 'task_title', label: 'Task' },
      { key: 'builders_interacted', label: 'Builders' },
      { key: 'total_builders', label: 'Total' },
      { key: 'completion_pct', label: 'Completion %', format: (v: number) => `${v}%` },
    ],
  };
}

async function getAttendanceRate(cohort: string) {
  const query = `
    WITH daily_attendance AS (
      SELECT
        ba.attendance_date,
        COUNT(DISTINCT ba.user_id) as attended,
        (SELECT COUNT(*) FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})) as total_builders,
        ROUND((COUNT(DISTINCT ba.user_id)::FLOAT / NULLIF((SELECT COUNT(*) FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})), 0) * 100)::numeric, 1) as attendance_pct
      FROM builder_attendance_new ba
      JOIN users u ON ba.user_id = u.user_id
      WHERE ba.attendance_date >= CURRENT_DATE - INTERVAL '7 days'
        AND ba.status IN ('present', 'late')
        AND u.cohort = $1
        AND u.active = true
        AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
        AND EXTRACT(DOW FROM ba.attendance_date) NOT IN (4, 5)
      GROUP BY ba.attendance_date
      ORDER BY ba.attendance_date DESC
    )
    SELECT * FROM daily_attendance
  `;

  const data = await executeQuery(query, [cohort]);

  return {
    title: '7-Day Class Attendance Rate',
    description: 'Daily attendance breakdown (excludes Thu/Fri)',
    data,
    columns: [
      { key: 'attendance_date', label: 'Date', format: (v: string) => new Date(v).toLocaleDateString() },
      { key: 'attended', label: 'Attended' },
      { key: 'total_builders', label: 'Total' },
      { key: 'attendance_pct', label: 'Rate', format: (v: number) => `${v}%` },
    ],
  };
}

async function getNeedIntervention(cohort: string) {
  const query = `
    WITH sept_tasks AS (
      SELECT DISTINCT t.id
      FROM tasks t
      JOIN time_blocks tb ON t.block_id = tb.id
      JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE cd.cohort = $1 AND t.task_type != 'break'
    ),
    builder_stats AS (
      SELECT
        u.user_id,
        u.first_name || ' ' || u.last_name as builder_name,
        (SELECT COUNT(DISTINCT task_id) FROM (
          SELECT ts.task_id FROM task_submissions ts WHERE ts.user_id = u.user_id AND ts.task_id IN (SELECT id FROM sept_tasks)
          UNION
          SELECT tt.task_id FROM task_threads tt WHERE tt.user_id = u.user_id AND tt.task_id IN (SELECT id FROM sept_tasks)
        ) interactions)::FLOAT / NULLIF((SELECT COUNT(*) FROM sept_tasks), 0) * 100 as completion_pct,
        COUNT(DISTINCT CASE WHEN ba.status IN ('present', 'late') THEN ba.attendance_date END)::FLOAT / NULLIF(
          (SELECT COUNT(*) FROM curriculum_days WHERE cohort = $1),
          0
        ) * 100 as attendance_pct
      FROM users u
      LEFT JOIN builder_attendance_new ba ON u.user_id = ba.user_id
      WHERE u.cohort = $1
        AND u.active = true
        AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
      GROUP BY u.user_id, u.first_name, u.last_name
    )
    SELECT
      user_id,
      builder_name,
      ROUND(completion_pct::numeric, 1) as completion_pct,
      ROUND(attendance_pct::numeric, 1) as attendance_pct,
      CASE
        WHEN completion_pct < 50 AND attendance_pct < 70 THEN 'Both low'
        WHEN completion_pct < 50 THEN 'Low completion'
        WHEN attendance_pct < 70 THEN 'Low attendance'
        ELSE 'Other'
      END as reason
    FROM builder_stats
    WHERE completion_pct < 50 OR attendance_pct < 70
    ORDER BY completion_pct ASC, attendance_pct ASC
  `;

  const data = await executeQuery(query, [cohort]);

  return {
    title: 'Builders Needing Intervention',
    description: `${data.length} builders flagged (<50% completion OR <70% attendance)`,
    data,
    columns: [
      { key: 'builder_name', label: 'Builder' }, // user_id will be used for linking
      { key: 'completion_pct', label: 'Task Completion', format: (v: number) => `${v}%` },
      { key: 'attendance_pct', label: 'Attendance', format: (v: number) => `${v}%` },
      { key: 'reason', label: 'Flag Reason' },
    ],
  };
}

// Helper to add user_id to results for builder linking
async function addUserIdsToResults(results: any[]) {
  // user_id should already be in results from query
  return results;
}

async function getQualityScoreDetails(cohort: string) {
  // Import quality service to get real per-builder quality scores
  const { getBuilderTaskQuality } = await import('@/lib/services/task-quality');

  // Get individual builder quality averages from PostgreSQL
  const builderQuality = await getBuilderTaskQuality(cohort);

  // Get task/attendance engagement data
  const query = `
    WITH sept_tasks AS (
      SELECT DISTINCT t.id
      FROM tasks t
      JOIN time_blocks tb ON t.block_id = tb.id
      JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE cd.cohort = $1 AND t.task_type != 'break'
    ),
    builder_engagement AS (
      SELECT
        u.user_id,
        u.first_name || ' ' || u.last_name as builder_name,
        (SELECT COUNT(DISTINCT task_id) FROM (
          SELECT ts.task_id FROM task_submissions ts WHERE ts.user_id = u.user_id AND ts.task_id IN (SELECT id FROM sept_tasks)
          UNION
          SELECT tt.task_id FROM task_threads tt WHERE tt.user_id = u.user_id AND tt.task_id IN (SELECT id FROM sept_tasks)
        ) interactions) as tasks_completed,
        (SELECT COUNT(*) FROM sept_tasks) as total_tasks,
        ROUND((SELECT COUNT(DISTINCT task_id) FROM (
          SELECT ts.task_id FROM task_submissions ts WHERE ts.user_id = u.user_id AND ts.task_id IN (SELECT id FROM sept_tasks)
          UNION
          SELECT tt.task_id FROM task_threads tt WHERE tt.user_id = u.user_id AND tt.task_id IN (SELECT id FROM sept_tasks)
        ) i)::FLOAT / NULLIF((SELECT COUNT(*) FROM sept_tasks), 0) * 100) as completion_pct,
        COUNT(DISTINCT CASE WHEN ba.status IN ('present', 'late') THEN ba.attendance_date END) as days_attended,
        ROUND(COUNT(DISTINCT CASE WHEN ba.status IN ('present', 'late') THEN ba.attendance_date END)::FLOAT / NULLIF(
          (SELECT COUNT(*) FROM curriculum_days WHERE cohort = $1), 0
        ) * 100) as attendance_pct
      FROM users u
      LEFT JOIN builder_attendance_new ba ON u.user_id = ba.user_id
      WHERE u.cohort = $1
        AND u.active = true
        AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
      GROUP BY u.user_id, u.first_name, u.last_name
    )
    SELECT
      user_id,
      builder_name,
      tasks_completed,
      total_tasks,
      completion_pct,
      days_attended,
      attendance_pct
    FROM builder_engagement
    ORDER BY completion_pct DESC, attendance_pct DESC
  `;

  const taskData = await executeQuery(query, [cohort]);

  // Merge with quality scores from PostgreSQL
  const data = taskData.map((builder: any) => {
    const quality = builderQuality.find(q => q.user_id === builder.user_id);
    return {
      builder_name: builder.builder_name,
      tasks_completed: builder.tasks_completed,
      completion_pct: builder.completion_pct,
      days_attended: builder.days_attended,
      attendance_pct: builder.attendance_pct,
      quality_score: quality?.avg_quality || 0,  // Real score from PostgreSQL!
      tasks_assessed: quality?.tasks_assessed || 0,
    };
  });

  return {
    title: 'Builder Performance Overview',
    description: `All ${data.length} builders with engagement and quality metrics`,
    data,
    columns: [
      { key: 'builder_name', label: 'Builder' },
      { key: 'tasks_completed', label: 'Tasks Done' },
      { key: 'completion_pct', label: 'Completion %', format: (v: number) => `${v}%` },
      { key: 'days_attended', label: 'Days Attended' },
      { key: 'attendance_pct', label: 'Attendance %', format: (v: number) => `${v}%` },
      { key: 'quality_score', label: 'Quality', format: (v: number) => `${v}/100` },
      { key: 'tasks_assessed', label: 'Assessments', format: (v: number) => v },
    ],
  };
}

async function getTaskQualityDetails(cohort: string) {
  // Import task-level quality function
  const { getTaskLevelQuality } = await import('@/lib/services/task-quality');

  // Get task-level quality scores from PostgreSQL
  const taskScores = await getTaskLevelQuality(cohort);

  // Handle empty results
  if (taskScores.length === 0) {
    return {
      title: 'Quality by Task',
      description: 'No task quality data available',
      data: [],
      columns: [
        { key: 'task_id', label: 'Task ID' },
        { key: 'task_title', label: 'Task' },
        { key: 'builders_assessed', label: 'Builders' },
        { key: 'avg_quality', label: 'Avg Quality', format: (v: number) => `${v}/100` },
        { key: 'total_assessments', label: 'Assessments' },
      ],
    };
  }

  // Get task titles from database
  const query = `
    SELECT
      t.id as task_id,
      t.task_title
    FROM tasks t
    JOIN time_blocks tb ON t.block_id = tb.id
    JOIN curriculum_days cd ON tb.day_id = cd.id
    WHERE cd.cohort = $1
      AND t.task_type != 'break'
      AND t.id IN (${taskScores.map(ts => ts.task_id).join(',')})
    ORDER BY t.id
  `;

  const taskTitles = await executeQuery(query, [cohort]);
  const titleMap = new Map(taskTitles.map((t: any) => [t.task_id, t.task_title]));

  // Merge task titles with quality data
  const data = taskScores.map(task => ({
    task_id: task.task_id,
    task_title: titleMap.get(task.task_id) || `Task ${task.task_id}`,
    builders_assessed: task.builders_assessed,
    avg_quality: task.avg_quality,
    total_assessments: task.total_assessments,
  }));

  return {
    title: 'Quality by Task',
    description: `Task-level quality scores across ${data.length} assessed tasks`,
    data,
    columns: [
      { key: 'task_id', label: 'Task ID' },
      { key: 'task_title', label: 'Task' },
      { key: 'builders_assessed', label: 'Builders' },
      { key: 'avg_quality', label: 'Avg Quality', format: (v: number) => `${v}/100` },
      { key: 'total_assessments', label: 'Assessments' },
    ],
  };
}

async function getQualityRubricDetails(cohort: string) {
  // Import individual rubric breakdown function
  const { getIndividualRubricBreakdown } = await import('@/lib/services/bigquery-individual');

  // Get individual builder rubric scores from BigQuery
  const builderRubrics = await getIndividualRubricBreakdown(cohort);

  // Get task completion for each builder
  const query = `
    WITH sept_tasks AS (
      SELECT DISTINCT t.id
      FROM tasks t
      JOIN time_blocks tb ON t.block_id = tb.id
      JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE cd.cohort = $1 AND t.task_type != 'break'
    )
    SELECT
      u.user_id,
      u.first_name || ' ' || u.last_name as builder_name,
      (SELECT COUNT(DISTINCT task_id) FROM (
        SELECT ts.task_id FROM task_submissions ts WHERE ts.user_id = u.user_id AND ts.task_id IN (SELECT id FROM sept_tasks)
        UNION
        SELECT tt.task_id FROM task_threads tt WHERE tt.user_id = u.user_id AND tt.task_id IN (SELECT id FROM sept_tasks)
      ) i) as tasks_completed
    FROM users u
    WHERE u.cohort = $1
      AND u.active = true
      AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
  `;

  const taskData = await executeQuery(query, [cohort]);

  // Merge rubric data with task completion
  const data = builderRubrics.map(rubric => {
    const taskInfo = taskData.find((t: any) => t.user_id === rubric.user_id);
    return {
      user_id: rubric.user_id,
      builder_name: rubric.builder_name,
      tasks_completed: taskInfo?.tasks_completed || 0,
      overall_score: rubric.overall_score,
      technical_skills: rubric.technical_skills,
      business_value: rubric.business_value,
      project_mgmt: rubric.project_mgmt,
      critical_thinking: rubric.critical_thinking,
      professional_skills: rubric.professional_skills,
      assessments_count: rubric.assessments_count,
    };
  }).sort((a, b) => b.overall_score - a.overall_score);

  return {
    title: 'Quality Rubric Breakdown by Builder',
    description: `Individual assessment rubric scores for ${data.length} builders (from BigQuery)`,
    data,
    columns: [
      { key: 'builder_name', label: 'Builder' },
      { key: 'assessments_count', label: 'Assessments' },
      { key: 'overall_score', label: 'Overall', format: (v: number) => `${v}/100` },
      { key: 'technical_skills', label: 'Technical', format: (v: number) => `${v}%` },
      { key: 'business_value', label: 'Business', format: (v: number) => `${v}%` },
      { key: 'project_mgmt', label: 'Project Mgmt', format: (v: number) => `${v}%` },
      { key: 'critical_thinking', label: 'Critical Think', format: (v: number) => `${v}%` },
      { key: 'professional_skills', label: 'Professional', format: (v: number) => `${v}%` },
    ],
  };
}

async function getTaskDifficultyDetails(cohort: string) {
  const query = `
    WITH sept_tasks AS (
      SELECT DISTINCT t.id, t.task_title
      FROM tasks t
      JOIN time_blocks tb ON t.block_id = tb.id
      JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE cd.cohort = $1 AND t.task_type != 'break'
    ),
    task_completion AS (
      SELECT
        st.id as task_id,
        st.task_title,
        (SELECT COUNT(DISTINCT user_id) FROM (
          SELECT ts.user_id FROM task_submissions ts WHERE ts.task_id = st.id AND ts.user_id IN (
            SELECT user_id FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
          )
          UNION
          SELECT tt.user_id FROM task_threads tt WHERE tt.task_id = st.id AND tt.user_id IN (
            SELECT user_id FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
          )
        ) interactions) as completed_count,
        (SELECT COUNT(*) FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})) as total_builders
      FROM sept_tasks st
    )
    SELECT
      task_title,
      completed_count,
      total_builders,
      ROUND((completed_count::FLOAT / NULLIF(total_builders, 0) * 100)::numeric, 1) as completion_rate,
      CASE
        WHEN (completed_count::FLOAT / NULLIF(total_builders, 0) * 100) >= 90 THEN 'Easy'
        WHEN (completed_count::FLOAT / NULLIF(total_builders, 0) * 100) >= 70 THEN 'Medium'
        WHEN (completed_count::FLOAT / NULLIF(total_builders, 0) * 100) >= 50 THEN 'Hard'
        ELSE 'Very Hard'
      END as difficulty
    FROM task_completion
    ORDER BY completion_rate ASC
  `;

  const data = await executeQuery(query, [cohort]);

  return {
    title: 'All Tasks by Difficulty',
    description: `${data.length} total tasks analyzed`,
    data,
    columns: [
      { key: 'task_title', label: 'Task' },
      { key: 'completed_count', label: 'Completed' },
      { key: 'total_builders', label: 'Total' },
      { key: 'completion_rate', label: 'Rate', format: (v: number) => `${v}%` },
      { key: 'difficulty', label: 'Difficulty' },
    ],
  };
}

async function getAttendanceRateDetails(cohort: string) {
  const query = `
    SELECT
      ba.attendance_date,
      COUNT(DISTINCT ba.user_id) as attended,
      (SELECT COUNT(*) FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})) as total_builders,
      ROUND((COUNT(DISTINCT ba.user_id)::FLOAT / NULLIF((SELECT COUNT(*) FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})), 0) * 100)::numeric, 1) as attendance_pct
    FROM builder_attendance_new ba
    JOIN users u ON ba.user_id = u.user_id
    WHERE ba.attendance_date >= CURRENT_DATE - INTERVAL '7 days'
      AND ba.status IN ('present', 'late')
      AND u.cohort = $1
      AND u.active = true
      AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
      AND EXTRACT(DOW FROM ba.attendance_date) NOT IN (4, 5)
    GROUP BY ba.attendance_date
    ORDER BY ba.attendance_date DESC
  `;

  const data = await executeQuery(query, [cohort]);

  return {
    title: '7-Day Class Attendance Rate',
    description: 'Daily attendance breakdown (excludes Thu/Fri)',
    data,
    columns: [
      { key: 'attendance_date', label: 'Date', format: (v: string) => new Date(v).toLocaleDateString() },
      { key: 'attended', label: 'Attended' },
      { key: 'total_builders', label: 'Total' },
      { key: 'attendance_pct', label: 'Rate', format: (v: number) => `${v}%` },
    ],
  };
}

async function getH1Details(cohort: string) {
  const query = `
    WITH sept_tasks AS (
      SELECT DISTINCT t.id FROM tasks t JOIN time_blocks tb ON t.block_id = tb.id JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE cd.cohort = $1 AND t.task_type != 'break'
    )
    SELECT
      u.user_id,
      u.first_name || ' ' || u.last_name as builder_name,
      ROUND(COUNT(DISTINCT CASE WHEN ba.status IN ('present', 'late') THEN ba.attendance_date END)::FLOAT / NULLIF(
        (SELECT COUNT(*) FROM curriculum_days WHERE cohort = $1), 0
      ) * 100) as attendance_pct,
      ROUND((SELECT COUNT(DISTINCT task_id) FROM (
        SELECT ts.task_id FROM task_submissions ts WHERE ts.user_id = u.user_id AND ts.task_id IN (SELECT id FROM sept_tasks)
        UNION
        SELECT tt.task_id FROM task_threads tt WHERE tt.user_id = u.user_id AND tt.task_id IN (SELECT id FROM sept_tasks)
      ) i)::FLOAT / NULLIF((SELECT COUNT(*) FROM sept_tasks), 0) * 100) as completion_pct
    FROM users u
    LEFT JOIN builder_attendance_new ba ON u.user_id = ba.user_id
    WHERE u.cohort = $1 AND u.active = true AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
    GROUP BY u.user_id, u.first_name, u.last_name
    ORDER BY attendance_pct DESC
  `;

  const data = await executeQuery(query, [cohort]);

  return {
    title: 'H1: Attendance vs Task Completion - All Builders',
    description: `${data.length} builders with attendance and completion data`,
    data,
    columns: [
      { key: 'builder_name', label: 'Builder' },
      { key: 'attendance_pct', label: 'Attendance %', format: (v: number) => `${v}%` },
      { key: 'completion_pct', label: 'Task Completion %', format: (v: number) => `${v}%` },
    ],
  };
}

async function getH2Details(cohort: string) {
  const query = `
    WITH week1_dates AS (
      SELECT MIN(day_date) as start_date, MAX(day_date) as end_date
      FROM (SELECT day_date FROM curriculum_days WHERE cohort = $1 ORDER BY day_date LIMIT 7) subq
    ),
    sept_tasks AS (
      SELECT DISTINCT t.id FROM tasks t JOIN time_blocks tb ON t.block_id = tb.id JOIN curriculum_days cd ON tb.day_id = cd.id
      WHERE cd.cohort = $1
    )
    SELECT
      u.user_id,
      u.first_name || ' ' || u.last_name as builder_name,
      (SELECT COUNT(DISTINCT task_id) FROM (
        SELECT ts.task_id FROM task_submissions ts WHERE ts.user_id = u.user_id AND ts.task_id IN (SELECT id FROM sept_tasks)
          AND ts.created_at::date BETWEEN (SELECT start_date FROM week1_dates) AND (SELECT end_date FROM week1_dates)
        UNION
        SELECT tt.task_id FROM task_threads tt WHERE tt.user_id = u.user_id AND tt.task_id IN (SELECT id FROM sept_tasks)
          AND tt.created_at::date BETWEEN (SELECT start_date FROM week1_dates) AND (SELECT end_date FROM week1_dates)
      ) i) as week1_submissions,
      (SELECT COUNT(DISTINCT task_id) FROM (
        SELECT ts.task_id FROM task_submissions ts WHERE ts.user_id = u.user_id AND ts.task_id IN (SELECT id FROM sept_tasks)
        UNION
        SELECT tt.task_id FROM task_threads tt WHERE tt.user_id = u.user_id AND tt.task_id IN (SELECT id FROM sept_tasks)
      ) i) as total_submissions
    FROM users u
    WHERE u.cohort = $1 AND u.active = true AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
    ORDER BY total_submissions DESC
  `;

  const data = await executeQuery(query, [cohort]);

  return {
    title: 'H2: Early Engagement - All Builders',
    description: `Week 1 activity vs overall engagement for ${data.length} builders`,
    data,
    columns: [
      { key: 'builder_name', label: 'Builder' },
      { key: 'week1_submissions', label: 'Week 1 Tasks' },
      { key: 'total_submissions', label: 'Total Tasks' },
    ],
  };
}

async function getH4Details(cohort: string) {
  // Query the same data directly instead of fetching from API
  const query = `
    WITH week_numbers AS (
      SELECT DISTINCT
        EXTRACT(WEEK FROM day_date) - EXTRACT(WEEK FROM (SELECT MIN(day_date) FROM curriculum_days WHERE cohort = $1)) + 1 as week_number,
        'Week ' || (EXTRACT(WEEK FROM day_date) - EXTRACT(WEEK FROM (SELECT MIN(day_date) FROM curriculum_days WHERE cohort = $1)) + 1) as week_label
      FROM curriculum_days
      WHERE cohort = $1 AND day_date < CURRENT_DATE
    ),
    builder_week_stats AS (
      SELECT
        wn.week_number,
        u.user_id,
        COUNT(DISTINCT CASE WHEN ts.task_id IS NOT NULL OR tt.task_id IS NOT NULL THEN COALESCE(ts.task_id, tt.task_id) END)::FLOAT /
        NULLIF(COUNT(DISTINCT t.id), 0) * 100 as builder_completion_pct
      FROM week_numbers wn
      CROSS JOIN users u
      CROSS JOIN curriculum_days cd
      LEFT JOIN time_blocks tb ON tb.day_id = cd.id
      LEFT JOIN tasks t ON t.block_id = tb.id AND t.task_type != 'break'
      LEFT JOIN task_submissions ts ON ts.task_id = t.id AND ts.user_id = u.user_id
      LEFT JOIN task_threads tt ON tt.task_id = t.id AND tt.user_id = u.user_id
      WHERE cd.cohort = $1
        AND EXTRACT(WEEK FROM cd.day_date) - EXTRACT(WEEK FROM (SELECT MIN(day_date) FROM curriculum_days WHERE cohort = $1)) + 1 = wn.week_number
        AND u.cohort = $1 AND u.active = true AND u.user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
      GROUP BY wn.week_number, u.user_id
    ),
    daily_attendance AS (
      SELECT
        EXTRACT(WEEK FROM cd.day_date) - EXTRACT(WEEK FROM (SELECT MIN(day_date) FROM curriculum_days WHERE cohort = $1)) + 1 as week_number,
        COUNT(DISTINCT ba.user_id)::FLOAT / NULLIF(
          (SELECT COUNT(*) FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})), 0
        ) * 100 as daily_attendance_pct
      FROM curriculum_days cd
      LEFT JOIN builder_attendance_new ba ON ba.attendance_date = cd.day_date
        AND ba.status IN ('present', 'late')
        AND ba.user_id IN (SELECT user_id FROM users WHERE cohort = $1 AND active = true AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')}))
      WHERE cd.cohort = $1 AND cd.day_date < CURRENT_DATE AND EXTRACT(DOW FROM cd.day_date) NOT IN (4, 5)
      GROUP BY cd.day_date, week_number
    )
    SELECT
      wn.week_number,
      wn.week_label,
      ROUND(COALESCE(AVG(bws.builder_completion_pct), 0)::numeric, 1) as completion_pct,
      ROUND(COALESCE((SELECT AVG(daily_attendance_pct) FROM daily_attendance WHERE week_number = wn.week_number), 0)::numeric, 1) as attendance_pct,
      COUNT(DISTINCT CASE WHEN bws.builder_completion_pct > 0 THEN bws.user_id END) as active_builders
    FROM week_numbers wn
    LEFT JOIN builder_week_stats bws ON bws.week_number = wn.week_number
    GROUP BY wn.week_number, wn.week_label
    ORDER BY wn.week_number
  `;

  const weeks = await executeQuery(query, [cohort]);

  return {
    title: 'Week-over-Week Performance Trends',
    description: `Weekly breakdown of task completion and attendance across ${weeks.length} completed weeks`,
    data: weeks,
    columns: [
      { key: 'week_label', label: 'Week' },
      { key: 'completion_pct', label: 'Task Completion %', format: (v: number) => `${v}%` },
      { key: 'attendance_pct', label: 'Attendance %', format: (v: number) => `${v}%` },
      { key: 'active_builders', label: 'Active Builders' },
    ],
  };
}
