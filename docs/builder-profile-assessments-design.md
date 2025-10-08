# Builder Profile Assessment Design

## Overview

This document outlines the design for displaying individual builder assessment history and scores on their profile page. This is distinct from the cohort-level quality metrics dashboard and focuses on providing detailed, individual assessment insights for each builder.

---

## 1. API Endpoint Design

### Endpoint: `GET /api/builder/[id]/assessments`

**Purpose**: Fetch comprehensive assessment data for a single builder including:
- Overall quality score average
- Rubric category breakdown (5 categories)
- Assessment history timeline
- Strengths and weaknesses analysis
- Individual assessment details

### Request Parameters

```typescript
interface AssessmentRequest {
  id: string; // Builder user_id from URL params
  cohort?: string; // Optional, defaults to "September 2025"
}
```

### Response Schema

```typescript
interface BuilderAssessmentResponse {
  // Builder Identity
  user_id: number;
  builder_name: string;
  cohort: string;

  // Summary Statistics
  summary: {
    overall_score: number; // 0-100 scale, average across all assessments
    total_assessments: number;
    assessments_by_type: {
      project: number;
      problem_solution: number;
      video: number;
      quiz: number;
    };
    last_assessment_date: string; // ISO date
  };

  // Rubric Category Averages (for radar chart)
  rubric_breakdown: {
    technical_skills: number; // 0-100
    business_value: number; // 0-100
    project_mgmt: number; // 0-100
    critical_thinking: number; // 0-100
    professional_skills: number; // 0-100
  };

  // Assessment History Timeline (for line chart)
  assessment_timeline: AssessmentTimelineItem[];

  // Individual Assessment Details (for drill-down)
  individual_assessments: IndividualAssessment[];

  // Holistic Feedback (from BigQuery holistic table)
  holistic_feedback: {
    strengths_summary: string;
    growth_areas_summary: string;
    included_assessments: string[];
    assessment_scores: Record<string, number>;
    analysis_timestamp: string;
  } | null;

  // Comparative Metrics (vs cohort average)
  cohort_comparison: {
    overall_score_percentile: number; // 0-100
    technical_skills_vs_avg: number; // +/- from cohort avg
    business_value_vs_avg: number;
    critical_thinking_vs_avg: number;
    professional_skills_vs_avg: number;
  };
}

interface AssessmentTimelineItem {
  assessment_id: number;
  assessment_name: string;
  assessment_type: 'project' | 'problem_solution' | 'video' | 'quiz';
  date: string; // ISO date
  overall_score: number; // 0-100
  technical_skills?: number; // Optional, depends on assessment type
  business_value?: number;
  critical_thinking?: number;
  professional_skills?: number;
}

interface IndividualAssessment {
  assessment_id: number;
  assessment_name: string;
  assessment_type: 'project' | 'problem_solution' | 'video' | 'quiz';
  date: string;
  overall_score: number;

  // Type-specific data parsed from BigQuery
  rubric_scores: {
    technical_skills?: number;
    business_value?: number;
    project_mgmt?: number;
    critical_thinking?: number;
    professional_skills?: number;
  };

  // Detailed feedback
  strengths: string[];
  improvements: string[];

  // Type-specific metadata
  metadata: {
    // For projects
    github_url?: string;
    has_github?: boolean;
    submission_type?: string;

    // For videos
    video_url?: string;
    has_video?: boolean;
    transcript?: string;

    // For problem/solution
    problem_statement?: string;
    solution_description?: string;
  };
}
```

### Sample API Response

```json
{
  "user_id": 321,
  "builder_name": "Haoxin Wang",
  "cohort": "September 2025",
  "summary": {
    "overall_score": 62,
    "total_assessments": 6,
    "assessments_by_type": {
      "project": 2,
      "problem_solution": 2,
      "video": 2,
      "quiz": 0
    },
    "last_assessment_date": "2025-09-30T10:00:00Z"
  },
  "rubric_breakdown": {
    "technical_skills": 74,
    "business_value": 78,
    "project_mgmt": 0,
    "critical_thinking": 68,
    "professional_skills": 33
  },
  "assessment_timeline": [
    {
      "assessment_id": 1,
      "assessment_name": "Week 1 Project",
      "assessment_type": "project",
      "date": "2025-09-15T10:00:00Z",
      "overall_score": 55,
      "technical_skills": 60
    },
    {
      "assessment_id": 2,
      "assessment_name": "Problem Analysis",
      "assessment_type": "problem_solution",
      "date": "2025-09-22T10:00:00Z",
      "overall_score": 65,
      "business_value": 70,
      "critical_thinking": 60
    }
  ],
  "individual_assessments": [
    {
      "assessment_id": 1,
      "assessment_name": "Week 1 Project",
      "assessment_type": "project",
      "date": "2025-09-15T10:00:00Z",
      "overall_score": 55,
      "rubric_scores": {
        "technical_skills": 60
      },
      "strengths": [
        "Clean code organization",
        "Good error handling"
      ],
      "improvements": [
        "Add more comments",
        "Improve test coverage"
      ],
      "metadata": {
        "github_url": "https://github.com/user/project",
        "has_github": true,
        "submission_type": "both"
      }
    }
  ],
  "holistic_feedback": {
    "strengths_summary": "Strong technical implementation skills, good business intuition",
    "growth_areas_summary": "Focus on improving presentation skills and critical thinking",
    "included_assessments": ["Week 1 Project", "Problem Analysis", "Video Demo"],
    "assessment_scores": {
      "Week 1 Project": 55,
      "Problem Analysis": 65
    },
    "analysis_timestamp": "2025-09-30T12:00:00Z"
  },
  "cohort_comparison": {
    "overall_score_percentile": 75,
    "technical_skills_vs_avg": 42,
    "business_value_vs_avg": 19,
    "critical_thinking_vs_avg": 35,
    "professional_skills_vs_avg": -2
  }
}
```

---

## 2. BigQuery Queries

### Query 1: Get Individual Assessment History

```sql
SELECT
  assessment_id,
  assessment_name,
  assessment_type,
  overall_score,
  type_specific_data,
  created_at as assessment_date
FROM `pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis`
WHERE user_id = @userId
  AND user_cohort = @cohort
ORDER BY assessment_id ASC
```

**Purpose**: Fetch all assessments for timeline and individual details

### Query 2: Get Holistic Feedback

```sql
SELECT
  total_assessments,
  average_score,
  strengths_summary,
  growth_areas_summary,
  included_assessments,
  assessment_scores,
  analysis_timestamp
FROM `pursuit-ops.pilot_agent_public.holistic_assessment_feedback`
WHERE user_id = @userId
```

**Purpose**: Fetch AI-generated holistic feedback summary

### Query 3: Get Cohort Percentile

```sql
WITH cohort_scores AS (
  SELECT
    user_id,
    AVG(overall_score) as avg_score
  FROM `pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis`
  WHERE user_cohort = @cohort
  GROUP BY user_id
),
ranked_scores AS (
  SELECT
    user_id,
    avg_score,
    PERCENT_RANK() OVER (ORDER BY avg_score) as percentile
  FROM cohort_scores
)
SELECT percentile
FROM ranked_scores
WHERE user_id = @userId
```

**Purpose**: Calculate builder's percentile rank within cohort

---

## 3. Service Layer Implementation

### File: `/lib/services/bigquery-builder-profile.ts`

```typescript
import { getBigQueryClient } from './bigquery';
import { getIndividualRubricBreakdown } from './bigquery-individual';
import { getHolisticFeedback } from './bigquery';

export interface BuilderProfileAssessments {
  user_id: number;
  builder_name: string;
  cohort: string;
  summary: AssessmentSummary;
  rubric_breakdown: RubricBreakdown;
  assessment_timeline: AssessmentTimelineItem[];
  individual_assessments: IndividualAssessment[];
  holistic_feedback: HolisticFeedback | null;
  cohort_comparison: CohortComparison;
}

export async function getBuilderAssessmentProfile(
  userId: number,
  cohort: string = 'September 2025'
): Promise<BuilderProfileAssessments | null> {
  const bq = getBigQueryClient();

  // Query 1: Get all assessments for this builder
  const assessmentQuery = `
    SELECT
      assessment_id,
      assessment_name,
      assessment_type,
      overall_score,
      type_specific_data,
      created_at as assessment_date
    FROM \`pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis\`
    WHERE user_id = @userId
      AND user_cohort = @cohort
    ORDER BY assessment_id ASC
  `;

  const [assessments] = await bq.query({
    query: assessmentQuery,
    params: { userId, cohort }
  });

  if (assessments.length === 0) {
    return null; // No assessments found
  }

  // Parse assessment timeline and individual details
  const timeline: AssessmentTimelineItem[] = [];
  const individualAssessments: IndividualAssessment[] = [];
  const builderName = assessments[0]?.user_first_name + ' ' + assessments[0]?.user_last_name;

  let totalScore = 0;
  const assessmentsByType = {
    project: 0,
    problem_solution: 0,
    video: 0,
    quiz: 0
  };

  assessments.forEach((row: any) => {
    const overallScore = Math.round(row.overall_score * 100);
    totalScore += overallScore;
    assessmentsByType[row.assessment_type as keyof typeof assessmentsByType]++;

    // Parse type_specific_data for rubric scores
    const typeData = JSON.parse(row.type_specific_data || '{}');
    const rubricScores = parseRubricScores(row.assessment_type, typeData);

    // Timeline item (simplified)
    timeline.push({
      assessment_id: row.assessment_id,
      assessment_name: row.assessment_name,
      assessment_type: row.assessment_type,
      date: row.assessment_date,
      overall_score: overallScore,
      ...rubricScores
    });

    // Individual assessment (detailed)
    individualAssessments.push({
      assessment_id: row.assessment_id,
      assessment_name: row.assessment_name,
      assessment_type: row.assessment_type,
      date: row.assessment_date,
      overall_score: overallScore,
      rubric_scores: rubricScores,
      strengths: typeData.strengths || [],
      improvements: typeData.improvements || [],
      metadata: extractMetadata(row.assessment_type, typeData)
    });
  });

  // Get rubric breakdown from existing service
  const rubricData = await getIndividualRubricBreakdown(cohort);
  const builderRubric = rubricData.find(b => b.user_id === userId);

  // Get holistic feedback
  const holisticFeedback = await getHolisticFeedback(userId);

  // Get cohort comparison
  const cohortComparison = await getCohortComparison(userId, cohort, builderRubric);

  return {
    user_id: userId,
    builder_name: builderName,
    cohort,
    summary: {
      overall_score: Math.round(totalScore / assessments.length),
      total_assessments: assessments.length,
      assessments_by_type: assessmentsByType,
      last_assessment_date: assessments[assessments.length - 1].assessment_date
    },
    rubric_breakdown: {
      technical_skills: builderRubric?.technical_skills || 0,
      business_value: builderRubric?.business_value || 0,
      project_mgmt: builderRubric?.project_mgmt || 0,
      critical_thinking: builderRubric?.critical_thinking || 0,
      professional_skills: builderRubric?.professional_skills || 0
    },
    assessment_timeline: timeline,
    individual_assessments: individualAssessments,
    holistic_feedback: holisticFeedback ? {
      strengths_summary: holisticFeedback.strengths_summary,
      growth_areas_summary: holisticFeedback.growth_areas_summary,
      included_assessments: holisticFeedback.included_assessments,
      assessment_scores: holisticFeedback.assessment_scores,
      analysis_timestamp: holisticFeedback.analysis_timestamp
    } : null,
    cohort_comparison
  };
}

function parseRubricScores(assessmentType: string, typeData: any): Record<string, number> {
  const scores: Record<string, number> = {};

  // Use same parsing logic from bigquery-individual.ts
  if (assessmentType === 'project' && typeData.technical_scores) {
    const techValues = Object.values(typeData.technical_scores) as number[];
    scores.technical_skills = Math.round(
      (techValues.reduce((sum, val) => sum + val, 0) / techValues.length) * 100
    );
  }

  if (assessmentType === 'problem_solution' && typeData.analysis_scores) {
    if (typeData.analysis_scores.technical_understanding !== undefined) {
      scores.technical_skills = Math.round(typeData.analysis_scores.technical_understanding * 100);
    }
    if (typeData.analysis_scores.business_value !== undefined) {
      scores.business_value = Math.round(typeData.analysis_scores.business_value * 100);
    }
    // Add critical_thinking, professional_skills similarly...
  }

  // Add video and quiz parsing...

  return scores;
}

function extractMetadata(assessmentType: string, typeData: any): any {
  if (assessmentType === 'project') {
    return {
      github_url: typeData.github_url,
      has_github: typeData.has_github,
      submission_type: typeData.submission_type
    };
  }

  if (assessmentType === 'video') {
    return {
      video_url: typeData.video_url,
      has_video: typeData.has_video_url,
      transcript: typeData.transcript
    };
  }

  if (assessmentType === 'problem_solution') {
    return {
      problem_statement: typeData.problem_statement,
      solution_description: typeData.solution_description
    };
  }

  return {};
}

async function getCohortComparison(
  userId: number,
  cohort: string,
  builderRubric: any
): Promise<CohortComparison> {
  const bq = getBigQueryClient();

  // Get percentile rank
  const percentileQuery = `
    WITH cohort_scores AS (
      SELECT
        user_id,
        AVG(overall_score) as avg_score
      FROM \`pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis\`
      WHERE user_cohort = @cohort
      GROUP BY user_id
    ),
    ranked_scores AS (
      SELECT
        user_id,
        avg_score,
        PERCENT_RANK() OVER (ORDER BY avg_score) as percentile
      FROM cohort_scores
    )
    SELECT percentile
    FROM ranked_scores
    WHERE user_id = @userId
  `;

  const [percentileResult] = await bq.query({
    query: percentileQuery,
    params: { userId, cohort }
  });

  // Get cohort averages from existing service
  const { getCohortAverageRubric } = await import('./bigquery-individual');
  const cohortAvg = await getCohortAverageRubric(cohort);

  return {
    overall_score_percentile: Math.round((percentileResult[0]?.percentile || 0) * 100),
    technical_skills_vs_avg: builderRubric?.technical_skills - cohortAvg.technical_skills,
    business_value_vs_avg: builderRubric?.business_value - cohortAvg.business_value,
    critical_thinking_vs_avg: builderRubric?.critical_thinking - cohortAvg.critical_thinking,
    professional_skills_vs_avg: builderRubric?.professional_skills - cohortAvg.professional_skills
  };
}
```

---

## 4. UI Component Structure

### Component Hierarchy

```
/app/builder/[id]/page.tsx
├── BuilderProfileHeader (existing)
├── KPIOverviewCards (existing)
├── AssessmentProfileSection (NEW)
│   ├── OverallScoreCard
│   ├── RubricRadarChart
│   ├── AssessmentTimelineChart
│   ├── HolisticFeedbackCard
│   └── IndividualAssessmentsTable
└── AttendanceAndTasksSection (existing)
```

### Component: AssessmentProfileSection

**File**: `/components/builder-profile/AssessmentProfileSection.tsx`

```typescript
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverallScoreCard } from './OverallScoreCard';
import { RubricRadarChart } from './RubricRadarChart';
import { AssessmentTimelineChart } from './AssessmentTimelineChart';
import { HolisticFeedbackCard } from './HolisticFeedbackCard';
import { IndividualAssessmentsTable } from './IndividualAssessmentsTable';
import type { BuilderProfileAssessments } from '@/lib/services/bigquery-builder-profile';

interface Props {
  assessments: BuilderProfileAssessments;
}

export function AssessmentProfileSection({ assessments }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Assessment History</h2>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverallScoreCard
          score={assessments.summary.overall_score}
          totalAssessments={assessments.summary.total_assessments}
          percentile={assessments.cohort_comparison.overall_score_percentile}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Assessments Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {assessments.summary.total_assessments}
            </div>
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <div>Projects: {assessments.summary.assessments_by_type.project}</div>
              <div>Problem/Solution: {assessments.summary.assessments_by_type.problem_solution}</div>
              <div>Videos: {assessments.summary.assessments_by_type.video}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Last Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {new Date(assessments.summary.last_assessment_date).toLocaleDateString()}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Most recent evaluation
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="details">Individual Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RubricRadarChart rubric={assessments.rubric_breakdown} />
            <HolisticFeedbackCard feedback={assessments.holistic_feedback} />
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <AssessmentTimelineChart timeline={assessments.assessment_timeline} />
        </TabsContent>

        <TabsContent value="details">
          <IndividualAssessmentsTable
            assessments={assessments.individual_assessments}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Component: OverallScoreCard

**File**: `/components/builder-profile/OverallScoreCard.tsx`

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  score: number;
  totalAssessments: number;
  percentile: number;
}

export function OverallScoreCard({ score, totalAssessments, percentile }: Props) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (percentile: number) => {
    if (percentile >= 75) return { label: 'Top Performer', variant: 'default' as const };
    if (percentile >= 50) return { label: 'Above Average', variant: 'secondary' as const };
    if (percentile >= 25) return { label: 'On Track', variant: 'secondary' as const };
    return { label: 'Needs Support', variant: 'destructive' as const };
  };

  const performance = getPerformanceLabel(percentile);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-600">
          Overall Quality Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
          {score}
          <span className="text-2xl text-gray-400">/100</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Badge variant={performance.variant}>
            {performance.label}
          </Badge>
          <span className="text-xs text-gray-500">
            {percentile}th percentile
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Based on {totalAssessments} assessments
        </div>
      </CardContent>
    </Card>
  );
}
```

### Component: RubricRadarChart

**File**: `/components/builder-profile/RubricRadarChart.tsx`

```typescript
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface Props {
  rubric: {
    technical_skills: number;
    business_value: number;
    project_mgmt: number;
    critical_thinking: number;
    professional_skills: number;
  };
}

export function RubricRadarChart({ rubric }: Props) {
  const data = [
    { category: 'Technical', value: rubric.technical_skills },
    { category: 'Business', value: rubric.business_value },
    { category: 'Project Mgmt', value: rubric.project_mgmt },
    { category: 'Critical Thinking', value: rubric.critical_thinking },
    { category: 'Professional', value: rubric.professional_skills }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rubric Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis domain={[0, 100]} />
            <Radar
              name="Score"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.6}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>

        {/* Category Details */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {data.map((item) => (
            <div key={item.category} className="flex justify-between">
              <span className="text-gray-600">{item.category}:</span>
              <span className="font-semibold">{item.value}/100</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Component: AssessmentTimelineChart

**File**: `/components/builder-profile/AssessmentTimelineChart.tsx`

```typescript
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Props {
  timeline: Array<{
    assessment_name: string;
    date: string;
    overall_score: number;
  }>;
}

export function AssessmentTimelineChart({ timeline }: Props) {
  const data = timeline.map((item) => ({
    name: item.assessment_name,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: item.overall_score
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Progression Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Overall Score"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Trend Analysis */}
        <div className="mt-4 text-sm text-gray-600">
          {timeline.length >= 2 && (
            <div>
              Trend: {timeline[timeline.length - 1].overall_score > timeline[0].overall_score ? (
                <span className="text-green-600 font-semibold">
                  ↑ Improving ({timeline[timeline.length - 1].overall_score - timeline[0].overall_score} points)
                </span>
              ) : (
                <span className="text-red-600 font-semibold">
                  ↓ Declining ({timeline[0].overall_score - timeline[timeline.length - 1].overall_score} points)
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Component: IndividualAssessmentsTable

**File**: `/components/builder-profile/IndividualAssessmentsTable.tsx`

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

interface Props {
  assessments: Array<{
    assessment_id: number;
    assessment_name: string;
    assessment_type: string;
    date: string;
    overall_score: number;
    rubric_scores: Record<string, number>;
    strengths: string[];
    improvements: string[];
    metadata: any;
  }>;
}

export function IndividualAssessmentsTable({ assessments }: Props) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-blue-100 text-blue-800';
      case 'problem_solution': return 'bg-purple-100 text-purple-800';
      case 'video': return 'bg-green-100 text-green-800';
      case 'quiz': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Individual Assessment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {assessments.map((assessment) => (
            <div
              key={assessment.assessment_id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{assessment.assessment_name}</h3>
                    <Badge className={getTypeColor(assessment.assessment_type)}>
                      {assessment.assessment_type.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span>{new Date(assessment.date).toLocaleDateString()}</span>
                    <span className="font-semibold text-lg">
                      Score: {assessment.overall_score}/100
                    </span>
                  </div>

                  {/* Rubric Scores Mini Display */}
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(assessment.rubric_scores).map(([key, value]) => (
                      <div key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {key.replace('_', ' ')}: {value}
                      </div>
                    ))}
                  </div>
                </div>

                {/* View Details Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">View Details</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{assessment.assessment_name}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Strengths</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {assessment.strengths.map((strength, idx) => (
                            <li key={idx}>{strength}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Areas for Improvement</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {assessment.improvements.map((improvement, idx) => (
                            <li key={idx}>{improvement}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Metadata (GitHub links, video URLs, etc.) */}
                      {assessment.metadata.github_url && (
                        <div>
                          <h4 className="font-semibold mb-2">Submission</h4>
                          <a
                            href={assessment.metadata.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View GitHub Repository →
                          </a>
                        </div>
                      )}

                      {assessment.metadata.video_url && (
                        <div>
                          <h4 className="font-semibold mb-2">Video Submission</h4>
                          <a
                            href={assessment.metadata.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Watch Video →
                          </a>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Component: HolisticFeedbackCard

**File**: `/components/builder-profile/HolisticFeedbackCard.tsx`

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  feedback: {
    strengths_summary: string;
    growth_areas_summary: string;
    included_assessments: string[];
    assessment_scores: Record<string, number>;
    analysis_timestamp: string;
  } | null;
}

export function HolisticFeedbackCard({ feedback }: Props) {
  if (!feedback) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holistic Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            No holistic feedback available yet. Complete more assessments.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holistic Feedback</CardTitle>
        <p className="text-xs text-gray-500">
          AI-generated summary based on {feedback.included_assessments.length} assessments
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <span className="text-green-600">✓</span> Strengths
          </h4>
          <p className="text-sm text-gray-700">{feedback.strengths_summary}</p>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <span className="text-yellow-600">↑</span> Growth Areas
          </h4>
          <p className="text-sm text-gray-700">{feedback.growth_areas_summary}</p>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(feedback.analysis_timestamp).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 5. Page Layout Mockup

### Desktop View (1440px)

```
┌─────────────────────────────────────────────────────────────────┐
│  Builder Profile Header                                          │
│  Haoxin Wang - September 2025 Cohort           [Back to Dashboard]│
└─────────────────────────────────────────────────────────────────┘

┌────────────────┬────────────────┬────────────────┬────────────────┐
│ Task Completion│   Attendance   │  Quality Score │     Status     │
│      85%       │      92%       │      62/100    │  Top Performer │
│  120/140 tasks │   18/19 days   │ out of 100     │  Engagement: 78│
└────────────────┴────────────────┴────────────────┴────────────────┘

═══════════════════════════════════════════════════════════════════
                        ASSESSMENT HISTORY
═══════════════════════════════════════════════════════════════════

┌────────────────────┬────────────────────┬────────────────────────┐
│  Overall Quality   │  Assessments       │   Last Assessment      │
│       62/100       │  Completed: 6      │   Sept 30, 2025        │
│ 75th percentile    │  Projects: 2       │   Most recent          │
│ [Top Performer]    │  Videos: 2         │                        │
└────────────────────┴────────────────────┴────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ [Overview] [Timeline] [Individual Assessments]                    │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────┬────────────────────────┐            │
│  │   Rubric Breakdown     │   Holistic Feedback    │            │
│  │                        │                        │            │
│  │     [Radar Chart]      │  Strengths:            │            │
│  │                        │  • Strong technical    │            │
│  │   Technical: 74        │  • Good business sense │            │
│  │   Business: 78         │                        │            │
│  │   Critical: 68         │  Growth Areas:         │            │
│  │   Professional: 33     │  • Presentation skills │            │
│  │   Project Mgmt: 0      │  • Documentation       │            │
│  └────────────────────────┴────────────────────────┘            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Attendance History (existing)   │   Completed Tasks (existing) │
└─────────────────────────────────────────────────────────────────┘
```

### Timeline Tab View

```
┌───────────────────────────────────────────────────────────────────┐
│ [Overview] [Timeline] [Individual Assessments]                    │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Score Progression Over Time                                      │
│                                                                   │
│  100 ┬─────────────────────────────────────────                 │
│      │                                        ●                   │
│   75 ┼                          ●────────●                       │
│      │               ●────────●                                  │
│   50 ┼────●────────●                                             │
│      │                                                           │
│   25 ┼                                                           │
│      │                                                           │
│    0 ┴───────────────────────────────────────                   │
│      Sep 15  Sep 22  Sep 29  Oct 6  Oct 13                       │
│                                                                   │
│  Trend: ↑ Improving (15 points since first assessment)           │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Individual Assessments Tab View

```
┌───────────────────────────────────────────────────────────────────┐
│ [Overview] [Timeline] [Individual Assessments]                    │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Week 1 Project                         [project]          │  │
│  │  Sept 15, 2025                  Score: 55/100              │  │
│  │  technical_skills: 60                      [View Details]  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Problem Analysis             [problem_solution]           │  │
│  │  Sept 22, 2025                  Score: 65/100              │  │
│  │  business_value: 70  critical_thinking: 60 [View Details]  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Video Demo                              [video]           │  │
│  │  Sept 29, 2025                  Score: 70/100              │  │
│  │  technical: 75  professional: 35           [View Details]  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Checklist

### Phase 1: Backend (API & Services)
- [ ] Create `/lib/services/bigquery-builder-profile.ts`
- [ ] Implement `getBuilderAssessmentProfile()` function
- [ ] Implement rubric score parsing logic (reuse from bigquery-individual.ts)
- [ ] Implement cohort percentile calculation
- [ ] Create API route `/app/api/builder/[id]/assessments/route.ts`
- [ ] Add error handling for missing assessments
- [ ] Add excluded user filtering (staff/duplicates)
- [ ] Write unit tests for parsing functions
- [ ] Write integration tests for API endpoint

### Phase 2: UI Components
- [ ] Create `/components/builder-profile/AssessmentProfileSection.tsx`
- [ ] Create `/components/builder-profile/OverallScoreCard.tsx`
- [ ] Create `/components/builder-profile/RubricRadarChart.tsx`
- [ ] Create `/components/builder-profile/AssessmentTimelineChart.tsx`
- [ ] Create `/components/builder-profile/HolisticFeedbackCard.tsx`
- [ ] Create `/components/builder-profile/IndividualAssessmentsTable.tsx`
- [ ] Add tabs component integration
- [ ] Add dialog for assessment details
- [ ] Ensure responsive design (mobile, tablet, desktop)

### Phase 3: Integration
- [ ] Update `/app/builder/[id]/page.tsx` to fetch assessment data
- [ ] Add AssessmentProfileSection to builder profile page
- [ ] Connect API endpoint to frontend
- [ ] Add loading states
- [ ] Add error states (no assessments, API failure)
- [ ] Test with multiple builders (high/low performers)
- [ ] Verify BigQuery query performance

### Phase 4: Testing & Deployment
- [ ] Test with production BigQuery data
- [ ] Test excluded users return 404
- [ ] Test builders with 0 assessments
- [ ] Test builders with partial rubric data
- [ ] Verify radar chart displays correctly
- [ ] Verify timeline chart shows trends
- [ ] Run accessibility audit
- [ ] Performance testing (page load time)
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production

---

## 7. Key Design Decisions

### 1. **Reuse Existing BigQuery Services**
- Use `getIndividualRubricBreakdown()` for rubric data
- Use `getHolisticFeedback()` for AI summaries
- Only add new function for assessment timeline/details

### 2. **Tabbed Interface for Clarity**
- Overview tab: High-level radar chart + holistic feedback
- Timeline tab: Score progression over time
- Details tab: Individual assessment drill-down

### 3. **Cohort Comparison Context**
- Show percentile rank to provide context
- Show +/- difference from cohort average per rubric category
- Badge system (Top Performer, Above Average, etc.)

### 4. **Graceful Degradation**
- Show "No assessments yet" if zero assessments
- Show "Not enough data" if fewer than 2 assessments for timeline
- Show "No holistic feedback" if AI summary not generated yet

### 5. **Assessment Type Differentiation**
- Color-coded badges for project/video/problem/quiz
- Different metadata displayed per type (GitHub links, video URLs)
- Transparent about which rubric categories each assessment contributes to

---

## 8. Future Enhancements

1. **Comparison View**: Side-by-side comparison with another builder
2. **Export Report**: PDF export of assessment history
3. **Goals Tracking**: Set improvement goals per rubric category
4. **Peer Insights**: Anonymous comparison with similar builders
5. **Assessment Predictions**: ML model predicting next assessment score
6. **Rubric Deep-Dive**: Click category on radar chart to see contributing assessments
7. **Filters**: Filter assessments by type, date range, score threshold
8. **Comments**: Allow instructors to add notes on individual assessments

---

## 9. Performance Considerations

### BigQuery Optimization
- Single query for all assessment data (no N+1 queries)
- Cache holistic feedback (updates infrequently)
- Consider materialized view for cohort percentiles

### Frontend Optimization
- Lazy load detailed assessment data (only when dialog opened)
- Use React.memo for chart components
- Debounce tab switches
- Prefetch assessment data on hover over builder name

### Data Size Estimates
- Average builder: 6-10 assessments
- Average assessment JSON: 2-5 KB
- Total page data: ~30-50 KB
- Load time target: < 1.5 seconds

---

## 10. Accessibility

- [ ] All charts have aria-labels
- [ ] Color is not the only indicator (use patterns/text)
- [ ] Keyboard navigation for tabs
- [ ] Screen reader announcements for score changes
- [ ] High contrast mode support
- [ ] Focus indicators on interactive elements
- [ ] Semantic HTML (proper heading hierarchy)

---

**Document Status**: ✅ Design Complete - Ready for Implementation

**Created**: October 7, 2025
**Last Updated**: October 7, 2025
**Author**: Architecture Agent
