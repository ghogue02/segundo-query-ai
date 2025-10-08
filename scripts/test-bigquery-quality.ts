#!/usr/bin/env tsx
/**
 * Test script to query actual BigQuery data and investigate quality score issue
 * Run with: npx tsx scripts/test-bigquery-quality.ts
 */

import { getBigQueryClient } from '../lib/services/bigquery';
import { getBuilderAverageQuality, getCohortQualityScores } from '../lib/services/bigquery';
import { getIndividualRubricBreakdown } from '../lib/services/bigquery-individual';

async function main() {
  console.log('=== TESTING BIGQUERY QUALITY SCORES ===\n');

  try {
    // Test 1: Raw data from comprehensive_assessment_analysis
    console.log('--- Test 1: Raw Assessment Data (First 5 builders) ---');
    const bq = getBigQueryClient();

    const rawQuery = `
      SELECT
        user_id,
        user_first_name,
        user_last_name,
        assessment_id,
        assessment_name,
        overall_score,
        assessment_type
      FROM \`pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis\`
      WHERE user_cohort = 'September 2025'
      ORDER BY user_id, assessment_id
      LIMIT 20
    `;

    const [rawRows] = await bq.query(rawQuery);
    console.table(rawRows.map((r: any) => ({
      user_id: r.user_id,
      name: `${r.user_first_name} ${r.user_last_name}`,
      assessment_id: r.assessment_id,
      assessment_name: r.assessment_name,
      type: r.assessment_type,
      overall_score: r.overall_score,
      score_100: Math.round(r.overall_score * 100)
    })));

    // Test 2: Check unique overall_score values
    console.log('\n--- Test 2: Distribution of overall_score values ---');
    const distributionQuery = `
      SELECT
        overall_score,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM \`pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis\`
      WHERE user_cohort = 'September 2025'
      GROUP BY overall_score
      ORDER BY overall_score DESC
    `;

    const [distRows] = await bq.query(distributionQuery);
    console.table(distRows.map((r: any) => ({
      overall_score: r.overall_score,
      score_100: Math.round(r.overall_score * 100),
      count: r.count,
      unique_users: r.unique_users
    })));

    // Test 3: Per-builder averages using getBuilderAverageQuality
    console.log('\n--- Test 3: Builder Average Quality (First 10) ---');
    const builderAvgs = await getBuilderAverageQuality('September 2025');
    console.table(builderAvgs.slice(0, 10).map(b => ({
      user_id: b.user_id,
      name: `${b.first_name} ${b.last_name}`,
      avg_quality_score: b.avg_quality_score,
      assessments_completed: b.assessments_completed
    })));

    // Test 4: Check if ALL builders have same score
    console.log('\n--- Test 4: Quality Score Distribution ---');
    const uniqueScores = new Set(builderAvgs.map(b => b.avg_quality_score));
    console.log(`Total builders: ${builderAvgs.length}`);
    console.log(`Unique quality scores: ${uniqueScores.size}`);
    console.log(`Unique score values:`, Array.from(uniqueScores).sort((a, b) => b - a));

    if (uniqueScores.size === 1) {
      console.log('\n⚠️  WARNING: All builders have THE SAME quality score!');
      console.log(`   Score: ${Array.from(uniqueScores)[0]}/100`);
    }

    // Test 5: Individual rubric breakdown
    console.log('\n--- Test 5: Individual Rubric Breakdown (First 5 builders) ---');
    const rubricBreakdown = await getIndividualRubricBreakdown('September 2025');
    console.table(rubricBreakdown.slice(0, 5).map(r => ({
      builder_name: r.builder_name,
      overall: r.overall_score,
      technical: r.technical_skills,
      business: r.business_value,
      project: r.project_mgmt,
      critical: r.critical_thinking,
      professional: r.professional_skills,
      assessments: r.assessments_count
    })));

    // Test 6: Check type_specific_data structure
    console.log('\n--- Test 6: Sample type_specific_data JSON ---');
    const jsonQuery = `
      SELECT
        user_id,
        user_first_name,
        assessment_type,
        type_specific_data
      FROM \`pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis\`
      WHERE user_cohort = 'September 2025'
        AND type_specific_data IS NOT NULL
      LIMIT 3
    `;

    const [jsonRows] = await bq.query(jsonQuery);
    jsonRows.forEach((row: any) => {
      console.log(`\nUser: ${row.user_first_name} (${row.user_id}), Type: ${row.assessment_type}`);
      try {
        const data = JSON.parse(row.type_specific_data);
        console.log('JSON structure keys:', Object.keys(data));
        if (data.section_breakdown) {
          console.log('  - section_breakdown:', Object.keys(data.section_breakdown));
        }
        if (data.rubric_scores) {
          console.log('  - rubric_scores:', Object.keys(data.rubric_scores));
        }
        if (data.technical_scores) {
          console.log('  - technical_scores:', Object.keys(data.technical_scores));
        }
        if (data.analysis_scores) {
          console.log('  - analysis_scores:', Object.keys(data.analysis_scores));
        }
      } catch (e) {
        console.log('  - Error parsing JSON:', e);
      }
    });

    // Test 7: Statistics on overall_score field
    console.log('\n--- Test 7: Overall Score Statistics ---');
    const statsQuery = `
      SELECT
        AVG(overall_score) as avg_score,
        MIN(overall_score) as min_score,
        MAX(overall_score) as max_score,
        STDDEV(overall_score) as stddev_score,
        COUNT(*) as total_assessments,
        COUNT(DISTINCT user_id) as unique_users
      FROM \`pursuit-ops.pilot_agent_public.comprehensive_assessment_analysis\`
      WHERE user_cohort = 'September 2025'
    `;

    const [statsRows] = await bq.query(statsQuery);
    const stats = statsRows[0];
    console.log('Raw score statistics (0-1 scale):');
    console.log(`  Average: ${stats.avg_score}`);
    console.log(`  Min: ${stats.min_score}`);
    console.log(`  Max: ${stats.max_score}`);
    console.log(`  Std Dev: ${stats.stddev_score}`);
    console.log(`\nConverted to 0-100 scale:`);
    console.log(`  Average: ${Math.round(stats.avg_score * 100)}/100`);
    console.log(`  Min: ${Math.round(stats.min_score * 100)}/100`);
    console.log(`  Max: ${Math.round(stats.max_score * 100)}/100`);
    console.log(`\nData coverage:`);
    console.log(`  Total assessments: ${stats.total_assessments}`);
    console.log(`  Unique users: ${stats.unique_users}`);

  } catch (error) {
    console.error('Error querying BigQuery:', error);
    process.exit(1);
  }
}

main();
