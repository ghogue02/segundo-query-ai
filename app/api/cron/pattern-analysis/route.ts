import { runDailyPatternAnalysis } from '@/lib/services/pattern-analysis';

/**
 * Vercel Cron Job - Daily Pattern Analysis
 * Runs at 8am EST (13:00 UTC) daily
 *
 * Triggered by Vercel Cron (see vercel.json)
 */
export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Cron] Starting daily pattern analysis...');

    await runDailyPatternAnalysis('September 2025');

    console.log('[Cron] Pattern analysis complete');

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      cohort: 'September 2025',
    });
  } catch (error: any) {
    console.error('[Cron] Pattern analysis failed:', error);

    return Response.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
