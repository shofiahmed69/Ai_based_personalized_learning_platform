import { Pool, PoolClient, QueryResultRow } from 'pg';
import { env } from './env';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    if (!env.databaseUrl) {
      throw new Error('DATABASE_URL is not set. Copy .env.example to .env and configure.');
    }
    pool = new Pool({
      connectionString: env.databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

/**
 * Run a parameterized query. Use this for all DB access to avoid SQL injection.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: unknown[]
): Promise<T[]> {
  const result = await getPool().query<T>(text, values);
  return result.rows;
}

/**
 * Get a client for transactions. Caller must release with client.release().
 */
export async function getClient(): Promise<PoolClient> {
  return getPool().connect();
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
