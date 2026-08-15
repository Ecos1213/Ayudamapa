/**
 * Token Revocation Manager
 * Tracks revoked JWT tokens (by JTI) in PostgreSQL to prevent their reuse after logout or compromise
 * Uses database for persistent storage across server restarts
 */

import { query, queryOne } from '../db/pool.js';

/**
 * Add a token to the revocation denylist in the database
 * 
 * @param {string} jti - JWT ID to revoke
 * @param {string} userId - User ID who owns the token (optional)
 * @param {Date} expiresAt - Token expiration time (optional, defaults to 24h from now)
 */
export const revokeToken = async (jti, userId = null, expiresAt = null) => {
  try {
    if (!jti) return;

    // Default expiration to 24 hours from now if not specified
    const tokenExpiresAt = expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000);

    await query(
      `INSERT INTO resilio_schema.token_revocation (jti, user_id, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (jti) DO NOTHING`,
      [jti, userId, tokenExpiresAt]
    );

    console.log(`[AUTH_INFO] Token revoked: jti=${jti}, expires_at=${tokenExpiresAt.toISOString()}`);
  } catch (error) {
    console.error(`[AUTH_ERROR] Failed to revoke token: ${error.message}`);
    throw error;
  }
};

/**
 * Check if a token has been revoked
 * Queries the database for the JTI
 * 
 * @param {string} jti - JWT ID to check
 * @returns {Promise<boolean>} - True if token is revoked, false otherwise
 */
export const isTokenRevoked = async (jti) => {
  try {
    if (!jti) return false;

    const revocationRecord = await queryOne(
      `SELECT id, expires_at FROM resilio_schema.token_revocation 
       WHERE jti = $1 AND expires_at > NOW()`,
      [jti]
    );

    return !!revocationRecord;
  } catch (error) {
    console.error(`[AUTH_ERROR] Failed to check token revocation: ${error.message}`);
    // Fail safely - if we can't verify revocation, deny access
    return true;
  }
};

/**
 * Revoke all tokens for a user (used for forced logout or password change)
 * 
 * @param {string} userId - User ID whose tokens should be revoked
 */
export const revokeUserTokens = async (userId) => {
  try {
    const result = await query(
      `DELETE FROM resilio_schema.token_revocation 
       WHERE user_id = $1 OR expires_at <= NOW()`,
      [userId]
    );

    console.log(`[AUTH_INFO] Revoked tokens for user: ${userId}`);
    return result.rowCount;
  } catch (error) {
    console.error(`[AUTH_ERROR] Failed to revoke user tokens: ${error.message}`);
    throw error;
  }
};

/**
 * Clean up expired revocation records from the database
 * Called periodically to remove entries for tokens that have naturally expired
 * This prevents the table from growing unbounded
 */
export const cleanupExpiredRevocations = async () => {
  try {
    const result = await query(
      `DELETE FROM resilio_schema.token_revocation WHERE expires_at <= NOW()`
    );

    if (result.rowCount > 0) {
      console.log(`[AUTH_INFO] Cleaned up ${result.rowCount} expired token revocations`);
    }
  } catch (error) {
    console.error(`[AUTH_ERROR] Failed to cleanup expired revocations: ${error.message}`);
  }
};

/**
 * Get revocation statistics
 * @returns {Promise<Object>} Stats about current revocations
 */
export const getRevocationStats = async () => {
  try {
    const result = await queryOne(
      `SELECT 
        COUNT(*) as total_revoked,
        COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_revocations,
        MAX(revoked_at) as last_revocation_at
       FROM resilio_schema.token_revocation`
    );

    return result;
  } catch (error) {
    console.error(`[AUTH_ERROR] Failed to get revocation stats: ${error.message}`);
    return null;
  }
};

// Run cleanup periodically (every hour)
setInterval(async () => {
  await cleanupExpiredRevocations();
}, 60 * 60 * 1000);
