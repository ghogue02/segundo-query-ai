import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function executeQuery<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Get total curriculum days for a specific cohort
 * This is used to dynamically calculate attendance percentages
 */
export async function getTotalCurriculumDays(cohort: string = 'September 2025'): Promise<number> {
  try {
    const result = await executeQuery<{ count: string }>(
      'SELECT COUNT(*) as count FROM curriculum_days WHERE cohort = $1',
      [cohort]
    );
    return parseInt(result[0]?.count || '0', 10);
  } catch (error) {
    console.error('Error fetching curriculum days count:', error);
    // Fallback to 18 if query fails
    return 18;
  }
}
