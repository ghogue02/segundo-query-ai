import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';

export async function GET() {
  const dbConnected = await testConnection();
  const claudeConfigured = !!process.env.ANTHROPIC_API_KEY &&
                          process.env.ANTHROPIC_API_KEY !== 'your-api-key-here';

  return NextResponse.json({
    status: dbConnected && claudeConfigured ? 'healthy' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    claude: claudeConfigured ? 'configured' : 'not configured',
    timestamp: new Date().toISOString()
  });
}
