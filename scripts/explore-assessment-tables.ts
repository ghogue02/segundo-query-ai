import { Pool } from 'pg';

const pool = new Pool({
  host: '34.57.101.141',
  port: 5432,
  database: 'segundo-db',
  user: 'postgres',
  password: 'Pursuit1234!',
  ssl: false,
});

async function exploreDatabase() {
  const client = await pool.connect();

  try {
    console.log('🔍 EXPLORING ASSESSMENT/SCORING TABLES\n');
    console.log('=' .repeat(80));

    // 1. List ALL tables
    console.log('\n📋 ALL TABLES IN DATABASE:\n');
    const allTablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    allTablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`));

    // 2. Search for assessment-related tables
    console.log('\n\n🎯 ASSESSMENT-RELATED TABLES:\n');
    const assessmentTables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (
          table_name ILIKE '%assessment%'
          OR table_name ILIKE '%score%'
          OR table_name ILIKE '%grade%'
          OR table_name ILIKE '%quality%'
          OR table_name ILIKE '%rubric%'
          OR table_name ILIKE '%analysis%'
          OR table_name ILIKE '%metric%'
        )
      ORDER BY table_name
    `);

    if (assessmentTables.rows.length === 0) {
      console.log('  ⚠️  No tables found with assessment-related names');
    } else {
      assessmentTables.rows.forEach(row => console.log(`  ✅ ${row.table_name}`));
    }

    // 3. Explore each assessment-related table
    for (const table of assessmentTables.rows) {
      const tableName = table.table_name;
      console.log(`\n\n${'='.repeat(80)}`);
      console.log(`📊 TABLE: ${tableName}`);
      console.log('='.repeat(80));

      // Get schema
      console.log('\n📐 SCHEMA:');
      const schemaResult = await client.query(`
        SELECT
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      schemaResult.rows.forEach(col => {
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  ${col.column_name}: ${col.data_type}${length} ${nullable}${defaultVal}`);
      });

      // Get row count
      const countResult = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      const rowCount = countResult.rows[0].count;
      console.log(`\n📈 ROW COUNT: ${rowCount}`);

      // Get sample data
      if (rowCount > 0) {
        console.log('\n📄 SAMPLE DATA (first 5 rows):');
        const sampleResult = await client.query(`SELECT * FROM "${tableName}" LIMIT 5`);
        console.log(JSON.stringify(sampleResult.rows, null, 2));

        // Check for user relationships
        const hasUserId = schemaResult.rows.some(col =>
          col.column_name.toLowerCase().includes('user')
        );
        if (hasUserId) {
          console.log('\n👤 USER RELATIONSHIP: Table contains user reference');
          const userColumns = schemaResult.rows
            .filter(col => col.column_name.toLowerCase().includes('user'))
            .map(col => col.column_name);
          console.log(`   User columns: ${userColumns.join(', ')}`);
        }
      }
    }

    // 4. Check for views
    console.log('\n\n' + '='.repeat(80));
    console.log('👁️  VIEWS (Calculated Fields):');
    console.log('='.repeat(80));
    const viewsResult = await client.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (viewsResult.rows.length === 0) {
      console.log('  ⚠️  No views found');
    } else {
      viewsResult.rows.forEach(row => console.log(`  - ${row.table_name}`));
    }

    // 5. Look for score-related columns in other tables
    console.log('\n\n' + '='.repeat(80));
    console.log('🔎 SCORE-RELATED COLUMNS IN ALL TABLES:');
    console.log('='.repeat(80));
    const scoreColumnsResult = await client.query(`
      SELECT
        table_name,
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND (
          column_name ILIKE '%score%'
          OR column_name ILIKE '%grade%'
          OR column_name ILIKE '%rating%'
          OR column_name ILIKE '%quality%'
        )
      ORDER BY table_name, column_name
    `);

    if (scoreColumnsResult.rows.length === 0) {
      console.log('  ⚠️  No score-related columns found');
    } else {
      let currentTable = '';
      scoreColumnsResult.rows.forEach(row => {
        if (row.table_name !== currentTable) {
          currentTable = row.table_name;
          console.log(`\n  📋 ${row.table_name}:`);
        }
        console.log(`     - ${row.column_name} (${row.data_type})`);
      });
    }

  } catch (error) {
    console.error('❌ Error exploring database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

exploreDatabase();
