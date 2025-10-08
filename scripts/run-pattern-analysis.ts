/**
 * Daily Pattern Analysis Script
 * Runs at 8am EST via cron job
 *
 * Usage:
 *   npm run pattern-analysis
 *
 * Or add to crontab:
 *   0 8 * * * cd /path/to/segundo-query-ai && npm run pattern-analysis
 */

import { runDailyPatternAnalysis } from '../lib/services/pattern-analysis';

async function main() {
  console.log('========================================');
  console.log('Daily Pattern Analysis - Starting');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST`);
  console.log('========================================\n');

  try {
    await runDailyPatternAnalysis('September 2025');

    console.log('\n========================================');
    console.log('Daily Pattern Analysis - Complete');
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('\n========================================');
    console.error('Daily Pattern Analysis - Failed');
    console.error('Error:', error);
    console.error('========================================');

    process.exit(1);
  }
}

main();
