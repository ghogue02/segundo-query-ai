# Builder Profile Assessment API - Quick Reference

## API Endpoint

```
GET /api/builder/[id]/assessments
```

## Response Schema (TypeScript)

```typescript
interface BuilderAssessmentResponse {
  user_id: number;
  builder_name: string;
  cohort: string;

  summary: {
    overall_score: number;              // 0-100
    total_assessments: number;
    assessments_by_type: {
      project: number;
      problem_solution: number;
      video: number;
      quiz: number;
    };
    last_assessment_date: string;       // ISO date
  };

  rubric_breakdown: {
    technical_skills: number;           // 0-100
    business_value: number;
    project_mgmt: number;
    critical_thinking: number;
    professional_skills: number;
  };

  assessment_timeline: Array<{
    assessment_id: number;
    assessment_name: string;
    assessment_type: string;
    date: string;
    overall_score: number;
    technical_skills?: number;
    business_value?: number;
    critical_thinking?: number;
    professional_skills?: number;
  }>;

  individual_assessments: Array<{
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

  holistic_feedback: {
    strengths_summary: string;
    growth_areas_summary: string;
    included_assessments: string[];
    assessment_scores: Record<string, number>;
    analysis_timestamp: string;
  } | null;

  cohort_comparison: {
    overall_score_percentile: number;   // 0-100
    technical_skills_vs_avg: number;    // +/- difference
    business_value_vs_avg: number;
    critical_thinking_vs_avg: number;
    professional_skills_vs_avg: number;
  };
}
```

## Key BigQuery Queries

### 1. Get All Assessments for Builder

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

### 2. Get Holistic Feedback

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

### 3. Calculate Percentile Rank

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

## Sample Response (Haoxin Wang - user_id: 321)

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
    },
    {
      "assessment_id": 3,
      "assessment_name": "Video Demo",
      "assessment_type": "video",
      "date": "2025-09-29T10:00:00Z",
      "overall_score": 70,
      "technical_skills": 75,
      "professional_skills": 35
    }
  ],
  "holistic_feedback": {
    "strengths_summary": "Strong technical implementation skills with good business intuition. Shows consistent improvement across assessments.",
    "growth_areas_summary": "Focus on improving presentation skills and professional communication. Consider deeper critical thinking in problem analysis.",
    "included_assessments": ["Week 1 Project", "Problem Analysis", "Video Demo"],
    "assessment_scores": {
      "Week 1 Project": 55,
      "Problem Analysis": 65,
      "Video Demo": 70
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

## UI Components Needed

1. **AssessmentProfileSection** - Main container with tabs
2. **OverallScoreCard** - Big score display with percentile
3. **RubricRadarChart** - Pentagon chart showing 5 categories
4. **AssessmentTimelineChart** - Line chart showing score progression
5. **HolisticFeedbackCard** - AI-generated strengths/growth areas
6. **IndividualAssessmentsTable** - List with expandable details

## Files to Create

### Backend
- `/lib/services/bigquery-builder-profile.ts` - Main service
- `/app/api/builder/[id]/assessments/route.ts` - API endpoint

### Frontend
- `/components/builder-profile/AssessmentProfileSection.tsx`
- `/components/builder-profile/OverallScoreCard.tsx`
- `/components/builder-profile/RubricRadarChart.tsx`
- `/components/builder-profile/AssessmentTimelineChart.tsx`
- `/components/builder-profile/HolisticFeedbackCard.tsx`
- `/components/builder-profile/IndividualAssessmentsTable.tsx`

### Integration
- Update `/app/builder/[id]/page.tsx` to fetch and display assessment data

## Implementation Order

1. Create backend service (`bigquery-builder-profile.ts`)
2. Create API endpoint (`/api/builder/[id]/assessments`)
3. Test API with Postman/curl
4. Create UI components (start with OverallScoreCard)
5. Add charts (radar, timeline)
6. Add individual assessments table
7. Integrate into builder profile page
8. Add loading/error states
9. Test with production data
10. Deploy

---

**Status**: Design Complete - Ready for Implementation
**See**: `/docs/builder-profile-assessments-design.md` for full design document
