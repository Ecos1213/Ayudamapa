import { verifyAccessToken } from '../utils/tokenUtils.js';
import { isTokenRevoked } from '../utils/tokenRevocation.js';

/**
 * Middleware to verify JWT tokens
 * Extracts token from Authorization header, verifies signature, validates claims,
 * checks revocation status, and attaches user info to request
 * Follows OWASP JWT security guidelines:
 * - Enforces algorithm whitelist
 * - Validates issuer and audience
 * - Checks token expiration
 * - Checks revocation status
 */
export const verifyJWT = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`[AUTH_ERROR] Missing or invalid Authorization header: ${req.path}`);
      return res.status(401).json({
        error: 'AUTH_MISSING_TOKEN',
        message: 'Token faltante o inválido',
        message_en: 'Missing or invalid token'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token signature, algorithm, expiration, issuer, and audience
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (verifyError) {
      console.log(`[AUTH_ERROR] Token verification failed: ${verifyError.message}`);
      return res.status(401).json({
        error: 'AUTH_INVALID_TOKEN',
        message: 'Token inválido o expirado',
        message_en: 'Invalid or expired token'
      });
    }

    // Check if token has been revoked
    const jti = decoded.jti;
    const revoked = await isTokenRevoked(jti);
    if (revoked) {
      console.log(`[AUTH_ERROR] Token revoked: jti=${jti}`);
      return res.status(401).json({
        error: 'AUTH_INVALID_TOKEN',
        message: 'Token inválido o expirado',
        message_en: 'Invalid or expired token'
      });
    }

    // Extract user claims from token
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      jti: jti // Store JTI for revocation tracking
    };

    next();
  } catch (error) {
    console.error(`[AUTH_ERROR] Unexpected error in verifyJWT: ${error.message}`);
    res.status(500).json({
      error: 'AUTH_SERVER_ERROR',
      message: 'Error interno del servidor',
      message_en: 'Internal server error'
    });
  }
};

/**
 * Optional middleware to check if user has a specific role
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log(`[AUTH_ERROR] User not authenticated for role check`);
      return res.status(401).json({
        error: 'AUTH_MISSING_TOKEN',
        message: 'Autenticación requerida',
        message_en: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log(`[AUTH_DENIED] Unauthorized action: user_id=${req.user.id}, required_roles=${allowedRoles.join(',')}, user_role=${req.user.role}`);
      return res.status(403).json({
        error: 'AUTH_INSUFFICIENT_PERMISSIONS',
        message: 'No tienes permisos para esta acción',
        message_en: 'You do not have permission for this action'
      });
    }

    next();
  };
};
