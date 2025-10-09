import { NextResponse } from 'next/server';

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    envVars: {
      POSTGRES_HOST: process.env.POSTGRES_HOST ? '✅ Set' : '❌ Missing',
      POSTGRES_PORT: process.env.POSTGRES_PORT ? '✅ Set' : '❌ Missing',
      POSTGRES_DB: process.env.POSTGRES_DB ? '✅ Set' : '❌ Missing',
      POSTGRES_USER: process.env.POSTGRES_USER ? '✅ Set' : '❌ Missing',
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ? '✅ Set' : '❌ Missing',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing',
    },
    values: {
      POSTGRES_HOST: process.env.POSTGRES_HOST || 'NOT SET',
      POSTGRES_PORT: process.env.POSTGRES_PORT || 'NOT SET',
      POSTGRES_DB: process.env.POSTGRES_DB || 'NOT SET',
    }
  };

  // Test database connection
  try {
    const { getPool } = await import('@/lib/db');
    const pool = getPool();
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    diagnostics.database = '✅ Connected';
  } catch (error) {
    diagnostics.database = `❌ Failed: ${error instanceof Error ? error.message : 'Unknown'}`;
  }

  return NextResponse.json(diagnostics);
}
