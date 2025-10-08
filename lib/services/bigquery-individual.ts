/**
 * BigQuery Service - Individual Builder Rubric Breakdown
 * Extracts rubric scores per builder from comprehensive_assessment_analysis
 */

import { getBigQueryClient } from './bigquery';

export interface BuilderRubricScore {
  user_id: number;
  builder_name: string;
  technical_skills: number;
  business_value: number;
  project_mgmt: number;
  critical_thinking: number;
  professional_skills: number;
  overall_score: number;
  assessments_count: number;
}

/**
 * Get individual rubric breakdown for each builder
 * Parses type_specific_data JSON field from BigQuery
 */
export async function getIndividualRubricBreakdown(
  cohort: string = 'September 2025'
): Promise<BuilderRubricScore[]> {
  const bq = getBigQueryClient();

  const query = `
    SELECT
      user_id,
      user_first_name,
      user_last_name,
      overall_score,
      type_specific_data,
      assessment_type
    FROM \`pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis\`
    WHERE user_cohort = @cohort
      AND type_specific_data IS NOT NULL
    ORDER BY user_id, assessment_id
  `;

  const options = {
    query,
    params: { cohort },
  };

  const [rows] = await bq.query(options);

  // Aggregate rubric scores per builder
  const builderScores: Map<number, {
    name: string;
    technical: number[];
    business: number[];
    project: number[];
    critical: number[];
    professional: number[];
    overall: number[];
  }> = new Map();

  rows.forEach((row: any) => {
    const userId = row.user_id;
    const builderName = `${row.user_first_name} ${row.user_last_name}`;

    if (!builderScores.has(userId)) {
      builderScores.set(userId, {
        name: builderName,
        technical: [],
        business: [],
        project: [],
        critical: [],
        professional: [],
        overall: [],
      });
    }

    const builder = builderScores.get(userId)!;
    builder.overall.push(row.overall_score);

    // Parse type_specific_data JSON
    try {
      const data = JSON.parse(row.type_specific_data);
      const assessmentType = row.assessment_type;

      // Extract rubric scores based on assessment type
      // Different assessment types store scores in different JSON structures

      // 1. QUIZ TYPE: section_breakdown with named sections
      if (data.section_breakdown) {
        Object.entries(data.section_breakdown).forEach(([key, section]: [string, any]) => {
          const sectionName = section.name?.toLowerCase() || '';
          const score = section.score;

          if (sectionName.includes('technical') || sectionName.includes('programming')) {
            builder.technical.push(score);
          } else if (sectionName.includes('business') || sectionName.includes('value')) {
            builder.business.push(score);
          } else if (sectionName.includes('project') || sectionName.includes('management')) {
            builder.project.push(score);
          } else if (sectionName.includes('critical') || sectionName.includes('thinking')) {
            builder.critical.push(score);
          } else if (sectionName.includes('professional') || sectionName.includes('communication')) {
            builder.professional.push(score);
          }
        });
      }

      // 2. PROJECT TYPE: technical_scores object
      if (data.technical_scores) {
        // All project scores count as technical skills
        const techScores = Object.values(data.technical_scores) as number[];
        const avgTech = techScores.reduce((sum, val) => sum + val, 0) / techScores.length;
        builder.technical.push(avgTech);
      }

      // 3. PROBLEM/SOLUTION TYPE: analysis_scores object
      if (data.analysis_scores) {
        const scores = data.analysis_scores;

        // Map analysis_scores fields to rubric categories
        if (scores.technical_understanding !== undefined) {
          builder.technical.push(scores.technical_understanding);
        }
        if (scores.business_value !== undefined) {
          builder.business.push(scores.business_value);
        }
        if (scores.problem_clarity !== undefined || scores.solution_feasibility !== undefined) {
          // Average problem/solution clarity as critical thinking
          const criticalScores = [
            scores.problem_clarity,
            scores.solution_feasibility,
            scores.innovation
          ].filter((s): s is number => s !== undefined);

          if (criticalScores.length > 0) {
            const avg = criticalScores.reduce((sum, val) => sum + val, 0) / criticalScores.length;
            builder.critical.push(avg);
          }
        }
        if (scores.conversation_collaboration !== undefined) {
          builder.professional.push(scores.conversation_collaboration);
        }
      }

      // 4. VIDEO TYPE: assessment_scores object
      if (data.assessment_scores) {
        const scores = data.assessment_scores;

        // Map video assessment scores to rubric categories
        if (scores.technical_depth !== undefined) {
          builder.technical.push(scores.technical_depth);
        }
        if (scores.business_understanding !== undefined) {
          builder.business.push(scores.business_understanding);
        }
        if (scores.presentation_quality !== undefined || scores.clarity !== undefined) {
          // Communication/presentation skills
          const profScores = [
            scores.presentation_quality,
            scores.clarity,
            scores.persuasiveness
          ].filter((s): s is number => s !== undefined);

          if (profScores.length > 0) {
            const avg = profScores.reduce((sum, val) => sum + val, 0) / profScores.length;
            builder.professional.push(avg);
          }
        }
        if (scores.problem_framing !== undefined || scores.solution_quality !== undefined) {
          const criticalScores = [
            scores.problem_framing,
            scores.solution_quality,
            scores.innovation
          ].filter((s): s is number => s !== undefined);

          if (criticalScores.length > 0) {
            const avg = criticalScores.reduce((sum, val) => sum + val, 0) / criticalScores.length;
            builder.critical.push(avg);
          }
        }
      }

      // 5. DIRECT rubric_scores field (if exists in any assessment type)
      if (data.rubric_scores) {
        if (data.rubric_scores.technical_skills !== undefined) {
          builder.technical.push(data.rubric_scores.technical_skills);
        }
        if (data.rubric_scores.business_value !== undefined) {
          builder.business.push(data.rubric_scores.business_value);
        }
        if (data.rubric_scores.project_mgmt !== undefined) {
          builder.project.push(data.rubric_scores.project_mgmt);
        }
        if (data.rubric_scores.critical_thinking !== undefined) {
          builder.critical.push(data.rubric_scores.critical_thinking);
        }
        if (data.rubric_scores.professional_skills !== undefined) {
          builder.professional.push(data.rubric_scores.professional_skills);
        }
      }
    } catch (e) {
      console.error(`Error parsing type_specific_data for user ${userId}:`, e);
    }
  });

  // Calculate averages per builder
  const results: BuilderRubricScore[] = [];

  builderScores.forEach((scores, userId) => {
    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((sum, val) => sum + val, 0) / arr.length : 0;

    results.push({
      user_id: userId,
      builder_name: scores.name,
      technical_skills: Math.round(avg(scores.technical) * 100),
      business_value: Math.round(avg(scores.business) * 100),
      project_mgmt: Math.round(avg(scores.project) * 100),
      critical_thinking: Math.round(avg(scores.critical) * 100),
      professional_skills: Math.round(avg(scores.professional) * 100),
      overall_score: Math.round(avg(scores.overall) * 100),
      assessments_count: scores.overall.length,
    });
  });

  return results;
}

/**
 * Get cohort-level average rubric breakdown
 */
export async function getCohortAverageRubric(
  cohort: string = 'September 2025'
): Promise<{
  technical_skills: number;
  business_value: number;
  project_mgmt: number;
  critical_thinking: number;
  professional_skills: number;
}> {
  const individualScores = await getIndividualRubricBreakdown(cohort);

  if (individualScores.length === 0) {
    return {
      technical_skills: 0,
      business_value: 0,
      project_mgmt: 0,
      critical_thinking: 0,
      professional_skills: 0,
    };
  }

  const avg = (key: keyof BuilderRubricScore) =>
    individualScores.reduce((sum, builder) => sum + (builder[key] as number), 0) /
    individualScores.length;

  return {
    technical_skills: Math.round(avg('technical_skills')),
    business_value: Math.round(avg('business_value')),
    project_mgmt: Math.round(avg('project_mgmt')),
    critical_thinking: Math.round(avg('critical_thinking')),
    professional_skills: Math.round(avg('professional_skills')),
  };
}
