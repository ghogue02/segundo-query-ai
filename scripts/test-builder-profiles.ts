#!/usr/bin/env tsx

/**
 * Builder Profile Error Handling Test Script
 * Tests 20 random builders to ensure error handling works correctly
 */

import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  host: '34.57.101.141',
  port: 5432,
  database: 'segundo-db',
  user: 'postgres',
  password: 'Pursuit1234!',
  ssl: false
});

// Test configuration
const EXCLUDED_USER_IDS = [129, 5, 240, 324, 325, 326, 9, 327, 329, 331, 330, 328, 332];
const TEST_COUNT = 20;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface TestResult {
  userId: number;
  success: boolean;
  error?: string;
  details?: any;
  responseTime: number;
}

// Get random builders from database
async function getRandomBuilders(count: number): Promise<number[]> {
  const query = `
    SELECT user_id
    FROM users
    WHERE cohort = 'September 2025'
      AND user_id NOT IN (${EXCLUDED_USER_IDS.join(',')})
    GROUP BY user_id
    ORDER BY RANDOM()
    LIMIT $1
  `;

  const result = await pool.query(query, [count]);
  return result.rows.map(row => row.user_id);
}

// Test individual builder profile
async function testBuilderProfile(userId: number): Promise<TestResult> {
  const startTime = Date.now();

  try {
    console.log(`\n🔍 Testing builder ${userId}...`);

    const response = await fetch(`${BASE_URL}/api/builder/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      console.log(`❌ Builder ${userId} failed: ${data.error}`);
      return {
        userId,
        success: false,
        error: data.error,
        details: data,
        responseTime
      };
    }

    // Validate required fields
    const requiredFields = [
      'user_id', 'first_name', 'last_name', 'email', 'cohort',
      'days_attended', 'total_days', 'attendance_percentage',
      'tasks_completed', 'total_tasks', 'completion_percentage',
      'engagement_score', 'quality_score', 'tasks_assessed',
      'attendance', 'tasks', 'quality_assessments'
    ];

    const missingFields = requiredFields.filter(field => !(field in data));

    if (missingFields.length > 0) {
      console.log(`⚠️  Builder ${userId} missing fields: ${missingFields.join(', ')}`);
      return {
        userId,
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        details: data,
        responseTime
      };
    }

    // Validate numeric fields are numbers (not strings or null)
    const numericFields = [
      'days_attended', 'total_days', 'attendance_percentage',
      'tasks_completed', 'total_tasks', 'completion_percentage',
      'engagement_score', 'quality_score', 'tasks_assessed'
    ];

    const invalidNumericFields = numericFields.filter(field => {
      const value = data[field];
      return typeof value !== 'number' || isNaN(value);
    });

    if (invalidNumericFields.length > 0) {
      console.log(`⚠️  Builder ${userId} invalid numeric fields: ${invalidNumericFields.join(', ')}`);
      return {
        userId,
        success: false,
        error: `Invalid numeric fields: ${invalidNumericFields.join(', ')}`,
        details: data,
        responseTime
      };
    }

    // Validate arrays
    if (!Array.isArray(data.attendance) || !Array.isArray(data.tasks) || !Array.isArray(data.quality_assessments)) {
      console.log(`⚠️  Builder ${userId} invalid array fields`);
      return {
        userId,
        success: false,
        error: 'Invalid array fields (attendance, tasks, or quality_assessments)',
        details: data,
        responseTime
      };
    }

    // Validate percentages are within 0-100
    const percentageFields = ['attendance_percentage', 'completion_percentage', 'engagement_score'];
    const invalidPercentages = percentageFields.filter(field => {
      const value = data[field];
      return value < 0 || value > 100;
    });

    if (invalidPercentages.length > 0) {
      console.log(`⚠️  Builder ${userId} percentages out of range: ${invalidPercentages.join(', ')}`);
      return {
        userId,
        success: false,
        error: `Percentages out of range (0-100): ${invalidPercentages.join(', ')}`,
        details: data,
        responseTime
      };
    }

    console.log(`✅ Builder ${userId} passed all validations (${responseTime}ms)`);
    console.log(`   - Name: ${data.first_name} ${data.last_name}`);
    console.log(`   - Attendance: ${data.attendance_percentage.toFixed(1)}% (${data.days_attended}/${data.total_days} days)`);
    console.log(`   - Completion: ${data.completion_percentage.toFixed(1)}% (${data.tasks_completed}/${data.total_tasks} tasks)`);
    console.log(`   - Quality: ${data.quality_score > 0 ? data.quality_score.toFixed(1) : 'N/A'} (${data.tasks_assessed} assessments)`);
    console.log(`   - Engagement: ${data.engagement_score.toFixed(1)}`);

    return {
      userId,
      success: true,
      responseTime
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(`💥 Builder ${userId} threw exception: ${error instanceof Error ? error.message : String(error)}`);

    return {
      userId,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
      responseTime
    };
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Builder Profile Error Handling Tests\n');
  console.log(`📊 Testing ${TEST_COUNT} random builders from September 2025 cohort`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`🚫 Excluding ${EXCLUDED_USER_IDS.length} staff/duplicate accounts\n`);

  try {
    // Get random builders
    console.log('🎲 Selecting random builders from database...');
    const builderIds = await getRandomBuilders(TEST_COUNT);
    console.log(`✓ Selected ${builderIds.length} builders: ${builderIds.join(', ')}\n`);

    // Test each builder
    const results: TestResult[] = [];
    for (const userId of builderIds) {
      const result = await testBuilderProfile(userId);
      results.push(result);

      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Generate summary
    console.log('\n\n📈 TEST SUMMARY');
    console.log('═'.repeat(80));

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    console.log(`\n✅ Successful: ${successCount}/${TEST_COUNT} (${((successCount/TEST_COUNT) * 100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failureCount}/${TEST_COUNT} (${((failureCount/TEST_COUNT) * 100).toFixed(1)}%)`);
    console.log(`⏱️  Average response time: ${avgResponseTime.toFixed(0)}ms`);

    if (failureCount > 0) {
      console.log('\n❌ FAILURES:');
      results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`\n   Builder ${r.userId}:`);
          console.log(`   - Error: ${r.error}`);
          if (r.details) {
            console.log(`   - Details: ${JSON.stringify(r.details, null, 2).split('\n').map(line => '     ' + line).join('\n')}`);
          }
        });
    }

    // Test specific edge cases
    console.log('\n\n🧪 TESTING EDGE CASES');
    console.log('═'.repeat(80));

    // Test excluded user
    console.log('\n1. Testing excluded user (should return 404)...');
    const excludedResult = await testBuilderProfile(EXCLUDED_USER_IDS[0]);
    if (!excludedResult.success && excludedResult.error?.includes('not found')) {
      console.log('   ✅ Correctly blocked excluded user');
    } else {
      console.log('   ❌ Failed to block excluded user');
    }

    // Test invalid user ID
    console.log('\n2. Testing invalid user ID (should return 400)...');
    try {
      const response = await fetch(`${BASE_URL}/api/builder/abc`, { method: 'GET' });
      if (response.status === 400) {
        console.log('   ✅ Correctly rejected invalid user ID');
      } else {
        console.log('   ❌ Failed to reject invalid user ID');
      }
    } catch (error) {
      console.log(`   ⚠️  Exception testing invalid ID: ${error}`);
    }

    // Test non-existent user
    console.log('\n3. Testing non-existent user (should return 404)...');
    const nonExistentResult = await testBuilderProfile(999999);
    if (!nonExistentResult.success && nonExistentResult.error?.includes('not found')) {
      console.log('   ✅ Correctly handled non-existent user');
    } else {
      console.log('   ❌ Failed to handle non-existent user');
    }

    console.log('\n\n✨ Tests completed!');

    process.exit(failureCount > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
