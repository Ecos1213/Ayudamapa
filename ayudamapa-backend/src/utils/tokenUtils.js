import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a new access token
 * Follows OWASP JWT security guidelines:
 * - Short-lived (15 minutes)
 * - Strict algorithm validation
 * - Includes standard claims (iss, aud, exp, iat, sub)
 * - Includes JTI for revocation tracking
 *
 * @param {string} userId - User ID to include in token
 * @param {string} email - User email to include in token
 * @param {string} role - User role to include in token
 * @returns {string} JWT access token
 */
export const generateAccessToken = (userId, email, role) => {
  const jti = uuidv4(); // Unique token ID for revocation tracking

  const token = jwt.sign(
    {
      sub: userId, // Subject (user ID)
      email: email,
      role: role,
      jti: jti // JWT ID for revocation
    },
    process.env.JWT_ACCESS_SECRET || 'dev-secret-key',
    {
      algorithm: 'HS256', // Explicit algorithm - prevents algorithm confusion attacks
      expiresIn: '15m', // Short-lived access token
      issuer: process.env.JWT_ISSUER || 'auth.yourdomain.com',
      audience: process.env.JWT_AUDIENCE || 'api.yourdomain.com',
      notBefore: '0s'
    }
  );

  return token;
};

/**
 * Generate a new refresh token
 * Follows OWASP JWT security guidelines:
 * - Longer-lived (7 days) - stored in HttpOnly cookie only
 * - Includes JTI for rotation tracking
 *
 * @param {string} userId - User ID to include in token
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (userId) => {
  const jti = uuidv4(); // Unique token ID for rotation tracking

  const token = jwt.sign(
    {
      sub: userId,
      jti: jti // JWT ID for rotation tracking
    },
    process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
    {
      algorithm: 'HS256',
      expiresIn: '7d', // Longer-lived refresh token
      issuer: process.env.JWT_ISSUER || 'auth.yourdomain.com',
      audience: process.env.JWT_AUDIENCE || 'api.yourdomain.com'
    }
  );

  return token;
};

/**
 * Verify and decode an access token
 * Enforces strict validation:
 * - Algorithm whitelist (prevents algorithm confusion attacks)
 * - Issuer validation
 * - Audience validation
 * - Expiration validation
 *
 * @param {string} token - Token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'dev-secret-key',
      {
        algorithms: ['HS256'], // Explicit whitelist - prevents algorithm confusion attacks
        issuer: process.env.JWT_ISSUER || 'auth.yourdomain.com',
        audience: process.env.JWT_AUDIENCE || 'api.yourdomain.com'
      }
    );
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Verify and decode a refresh token
 * Used when refreshing access tokens
 *
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
      {
        algorithms: ['HS256'],
        issuer: process.env.JWT_ISSUER || 'auth.yourdomain.com',
        audience: process.env.JWT_AUDIENCE || 'api.yourdomain.com'
      }
    );
  } catch (error) {
    throw new Error(`Refresh token verification failed: ${error.message}`);
  }
};

/**
 * Decode token without verification (for debugging)
 * WARNING: Only use for logging/debugging - never trust unverified tokens for auth decisions
 *
 * @param {string} token - Token to decode
 * @returns {Object} Decoded token payload (unverified)
 */
export const decodeTokenUnverified = (token) => {
  return jwt.decode(token);
};
