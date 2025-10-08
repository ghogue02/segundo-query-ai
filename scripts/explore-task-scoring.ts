import { Pool } from 'pg';

const pool = new Pool({
  host: '34.57.101.141',
  port: 5432,
  database: 'segundo-db',
  user: 'postgres',
  password: 'Pursuit1234!',
  ssl: false,
});

async function exploreTaskScoring() {
  const client = await pool.connect();

  try {
    console.log('🎯 TASK ANALYSES TABLE - QUALITY SCORING\n');
    console.log('=' .repeat(80));

    // Get task_analyses schema
    console.log('\n📐 TASK_ANALYSES SCHEMA:');
    const schemaResult = await client.query(`
      SELECT
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'task_analyses'
      ORDER BY ordinal_position
    `);
    schemaResult.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
    });

    // Count rows
    const countResult = await client.query(`SELECT COUNT(*) as count FROM task_analyses`);
    console.log(`\n📊 Total Records: ${countResult.rows[0].count}`);

    // Sample data
    console.log('\n📄 SAMPLE RECORDS (first 3):');
    const sampleResult = await client.query(`
      SELECT * FROM task_analyses
      ORDER BY created_at DESC
      LIMIT 3
    `);
    console.log(JSON.stringify(sampleResult.rows, null, 2));

    // Check for scoring columns
    console.log('\n\n🎯 SCORING ANALYSIS:');
    const scoreCheck = await client.query(`
      SELECT
        COUNT(*) as total_records,
        COUNT(CASE WHEN quality_scores IS NOT NULL THEN 1 END) as records_with_scores,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT task_id) as unique_tasks
      FROM task_analyses
    `);
    console.log(JSON.stringify(scoreCheck.rows[0], null, 2));

    // Sample quality_scores JSON structure
    console.log('\n\n📊 QUALITY_SCORES STRUCTURE (sample):');
    const qualityScoresSample = await client.query(`
      SELECT
        analysis_id,
        user_id,
        task_id,
        quality_scores
      FROM task_analyses
      WHERE quality_scores IS NOT NULL
      LIMIT 3
    `);
    console.log(JSON.stringify(qualityScoresSample.rows, null, 2));

    // Check for user aggregation
    console.log('\n\n👤 PER-USER SCORING CHECK:');
    const userScores = await client.query(`
      SELECT
        user_id,
        COUNT(*) as task_count,
        COUNT(CASE WHEN quality_scores IS NOT NULL THEN 1 END) as scored_tasks
      FROM task_analyses
      WHERE user_id IS NOT NULL
      GROUP BY user_id
      ORDER BY scored_tasks DESC
      LIMIT 10
    `);
    console.log('Top 10 users by scored tasks:');
    console.log(JSON.stringify(userScores.rows, null, 2));

    // Check task_pattern_analysis
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 TASK_PATTERN_ANALYSIS TABLE');
    console.log('='.repeat(80));

    const patternSchema = await client.query(`
      SELECT
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'task_pattern_analysis'
      ORDER BY ordinal_position
    `);
    console.log('\n📐 SCHEMA:');
    patternSchema.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
    });

    const patternCount = await client.query(`SELECT COUNT(*) as count FROM task_pattern_analysis`);
    console.log(`\n📊 Total Records: ${patternCount.rows[0].count}`);

    console.log('\n📄 SAMPLE RECORDS (first 2):');
    const patternSample = await client.query(`
      SELECT * FROM task_pattern_analysis
      LIMIT 2
    `);
    console.log(JSON.stringify(patternSample.rows, null, 2));

    // Check for relationships between tables
    console.log('\n\n' + '='.repeat(80));
    console.log('🔗 TABLE RELATIONSHIPS');
    console.log('='.repeat(80));

    // Users table
    console.log('\n👥 Users with task analyses:');
    const userStats = await client.query(`
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        COUNT(ta.analysis_id) as analysis_count
      FROM users u
      LEFT JOIN task_analyses ta ON u.user_id = ta.user_id
      WHERE u.user_id NOT IN (129, 5, 240, 324, 325, 326, 9)
      GROUP BY u.user_id, u.first_name, u.last_name
      HAVING COUNT(ta.analysis_id) > 0
      ORDER BY analysis_count DESC
      LIMIT 5
    `);
    console.log(JSON.stringify(userStats.rows, null, 2));

    // Check for any aggregate/summary tables
    console.log('\n\n🔍 SEARCHING FOR AGGREGATE/SUMMARY TABLES:');
    const aggregateTables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (
          table_name ILIKE '%summary%'
          OR table_name ILIKE '%aggregate%'
          OR table_name ILIKE '%metric%'
        )
      ORDER BY table_name
    `);
    if (aggregateTables.rows.length > 0) {
      aggregateTables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    } else {
      console.log('  No aggregate/summary tables found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

exploreTaskScoring();
