import { pool } from '../db/pool';

export async function revokeToken(jti: string, expiresAt: Date): Promise<void> {
  await pool.query(
    `INSERT INTO revoked_tokens (jti, expires_at)
     VALUES ($1, $2)
     ON CONFLICT (jti) DO NOTHING`,
    [jti, expiresAt]
  );
}

export async function isTokenRevoked(jti: string): Promise<boolean> {
  const { rows } = await pool.query(
    'SELECT 1 FROM revoked_tokens WHERE jti = $1',
    [jti]
  );
  return rows.length > 0;
}

/** Optional maintenance helper: delete revoked-token rows past their natural expiry. */
export async function purgeExpiredRevocations(): Promise<void> {
  await pool.query('DELETE FROM revoked_tokens WHERE expires_at < now()');
}
