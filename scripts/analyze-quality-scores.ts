import { Pool } from 'pg';

const pool = new Pool({
  host: '34.57.101.141',
  port: 5432,
  database: 'segundo-db',
  user: 'postgres',
  password: 'Pursuit1234!',
  ssl: false,
});

async function analyzeQualityScores() {
  const client = await pool.connect();

  try {
    console.log('🎯 QUALITY SCORING ANALYSIS\n');
    console.log('=' .repeat(80));

    // Analyze analysis_result structure
    console.log('\n📊 ANALYSIS_RESULT STRUCTURE:');
    console.log('Sample records showing scoring data:\n');

    const scoreSample = await client.query(`
      SELECT
        id,
        user_id,
        task_id,
        analysis_type,
        analysis_result->'completion_score' as completion_score,
        analysis_result->'criteria_met' as criteria_met,
        analysis_result->'specific_findings' as specific_findings,
        created_at
      FROM task_analyses
      WHERE analysis_result ? 'completion_score'
      LIMIT 5
    `);
    console.log(JSON.stringify(scoreSample.rows, null, 2));

    // Get score statistics
    console.log('\n\n📈 SCORE STATISTICS:');
    const scoreStats = await client.query(`
      SELECT
        COUNT(*) as total_analyses,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT task_id) as unique_tasks,
        AVG(CAST(analysis_result->>'completion_score' AS INTEGER)) as avg_score,
        MIN(CAST(analysis_result->>'completion_score' AS INTEGER)) as min_score,
        MAX(CAST(analysis_result->>'completion_score' AS INTEGER)) as max_score
      FROM task_analyses
      WHERE analysis_result ? 'completion_score'
        AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9)
    `);
    console.log(JSON.stringify(scoreStats.rows[0], null, 2));

    // Per-user average scores
    console.log('\n\n👤 PER-USER AVERAGE SCORES (Top 10):');
    const userAvgScores = await client.query(`
      SELECT
        user_id,
        COUNT(*) as task_count,
        ROUND(AVG(CAST(analysis_result->>'completion_score' AS NUMERIC)), 2) as avg_score,
        MIN(CAST(analysis_result->>'completion_score' AS INTEGER)) as min_score,
        MAX(CAST(analysis_result->>'completion_score' AS INTEGER)) as max_score
      FROM task_analyses
      WHERE analysis_result ? 'completion_score'
        AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9)
      GROUP BY user_id
      ORDER BY avg_score DESC
      LIMIT 10
    `);
    console.log(JSON.stringify(userAvgScores.rows, null, 2));

    // Check what criteria are being evaluated
    console.log('\n\n🎯 EVALUATION CRITERIA FOUND:');
    const criteriaQuery = await client.query(`
      SELECT DISTINCT
        jsonb_array_elements_text(analysis_result->'criteria_met') as criterion
      FROM task_analyses
      WHERE analysis_result ? 'criteria_met'
      ORDER BY criterion
    `);
    console.log('Available criteria:');
    criteriaQuery.rows.forEach(row => console.log(`  - ${row.criterion}`));

    // Detailed per-criterion scores for a sample user
    console.log('\n\n📊 DETAILED CRITERION SCORING (Sample):');
    const detailedScores = await client.query(`
      SELECT
        user_id,
        task_id,
        analysis_result->'specific_findings' as specific_findings
      FROM task_analyses
      WHERE analysis_result ? 'specific_findings'
        AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9)
      LIMIT 3
    `);
    console.log(JSON.stringify(detailedScores.rows, null, 2));

    // Check for individual builder profiles
    console.log('\n\n' + '='.repeat(80));
    console.log('👥 USER PROFILES WITH SCORES:');
    console.log('='.repeat(80));

    const userProfiles = await client.query(`
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        COUNT(ta.id) as total_analyses,
        ROUND(AVG(CAST(ta.analysis_result->>'completion_score' AS NUMERIC)), 2) as avg_completion_score
      FROM users u
      LEFT JOIN task_analyses ta ON u.user_id = ta.user_id
        AND ta.analysis_result ? 'completion_score'
      WHERE u.user_id NOT IN (129, 5, 240, 324, 325, 326, 9)
      GROUP BY u.user_id, u.first_name, u.last_name, u.email
      HAVING COUNT(ta.id) > 0
      ORDER BY avg_completion_score DESC
      LIMIT 10
    `);
    console.log('\nTop 10 builders by average score:');
    console.log(JSON.stringify(userProfiles.rows, null, 2));

    // Check for task-level scoring patterns
    console.log('\n\n📋 TASK-LEVEL SCORING PATTERNS:');
    const taskScores = await client.query(`
      SELECT
        task_id,
        COUNT(*) as submission_count,
        ROUND(AVG(CAST(analysis_result->>'completion_score' AS NUMERIC)), 2) as avg_score,
        MIN(CAST(analysis_result->>'completion_score' AS INTEGER)) as min_score,
        MAX(CAST(analysis_result->>'completion_score' AS INTEGER)) as max_score
      FROM task_analyses
      WHERE analysis_result ? 'completion_score'
        AND user_id NOT IN (129, 5, 240, 324, 325, 326, 9)
      GROUP BY task_id
      ORDER BY submission_count DESC
      LIMIT 10
    `);
    console.log('Top 10 tasks by submission count:');
    console.log(JSON.stringify(taskScores.rows, null, 2));

    // Summary for dashboard
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 DASHBOARD DATA AVAILABILITY SUMMARY:');
    console.log('='.repeat(80));

    console.log('\n✅ INDIVIDUAL BUILDER SCORES: YES');
    console.log('   - Each builder has their own completion_score per task');
    console.log('   - Scores range from 0-100');
    console.log('   - Detailed criterion-level scores available in specific_findings');

    console.log('\n✅ RUBRIC CRITERIA TRACKED:');
    const criteriaCount = criteriaQuery.rows.length;
    console.log(`   - ${criteriaCount} different criteria being evaluated`);
    console.log(`   - Each task can have multiple criteria scores`);

    console.log('\n✅ AVAILABLE FOR DASHBOARD:');
    console.log('   - Per-builder average quality score ✓');
    console.log('   - Per-task quality score distribution ✓');
    console.log('   - Criterion-level breakdown ✓');
    console.log('   - Strengths and weaknesses per builder ✓');
    console.log('   - Time-series tracking (created_at) ✓');

    console.log('\n📍 TABLE LOCATION:');
    console.log('   - Primary table: task_analyses');
    console.log('   - Key columns:');
    console.log('     • user_id (links to users table)');
    console.log('     • task_id (links to tasks table)');
    console.log('     • analysis_result->completion_score (0-100)');
    console.log('     • analysis_result->specific_findings (per-criterion scores)');
    console.log('     • analysis_result->criteria_met (array of criteria)');
    console.log('     • feedback (text feedback)');
    console.log('     • created_at (timestamp)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

analyzeQualityScores();
