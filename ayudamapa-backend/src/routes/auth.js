import express from 'express';
import { AppError } from '../middleware/errorHandler.js';
import { verifyJWT } from '../middleware/authMiddleware.js';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/passwordUtils.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokenUtils.js';
import { queryOne } from '../db/pool.js';
import { revokeToken, isTokenRevoked } from '../utils/tokenRevocation.js';

const router = express.Router();

/**
 * POST /auth/signup
 * Create a new user account with email/password
 * Stores user in PostgreSQL with hashed password
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    // Validate input
    if (!email || !password || !displayName) {
      console.log(`[AUTH_ERROR] Signup validation failed: missing required fields`);
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Email, contraseña y nombre son requeridos',
        message_en: 'Email, password, and display name are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`[AUTH_ERROR] Signup validation failed: invalid email format`);
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Email inválido',
        message_en: 'Invalid email format'
      });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      console.log(`[AUTH_ERROR] Signup validation failed: weak password`);
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'La contraseña no cumple con los requisitos de seguridad',
        message_en: 'Password does not meet security requirements',
        details: passwordValidation.errors
      });
    }

    // Check if user already exists
    const existingUser = await queryOne(
      'SELECT id FROM resilio_schema.users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser) {
      console.log(`[AUTH_ERROR] Signup failed: email already registered - email=${email}`);
      return res.status(400).json({
        error: 'AUTH_EMAIL_EXISTS',
        message: 'Este correo ya está registrado',
        message_en: 'This email is already registered'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in database
    const newUser = await queryOne(
      `INSERT INTO resilio_schema.users 
       (email, password_hash, display_name, role, language_preference, email_verified, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
       RETURNING id, email, display_name, role, language_preference`,
      [email.toLowerCase(), passwordHash, displayName, 'victim', 'es', false]
    );

    console.log(`[AUTH_SUCCESS] User created: email=${email}, user_id=${newUser.id}`);

    res.status(201).json({
      message: 'Cuenta creada. Ya puedes iniciar sesión',
      message_en: 'Account created. You can now log in',
      user: {
        id: newUser.id,
        email: newUser.email,
        display_name: newUser.display_name,
        role: newUser.role
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/login
 * Authenticate user with email and password
 * Returns JWT access token and refresh token cookie
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log(`[AUTH_ERROR] Login validation failed: missing email or password`);
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Email y contraseña son requeridos',
        message_en: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await queryOne(
      'SELECT id, email, password_hash, display_name, role, language_preference FROM resilio_schema.users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (!user) {
      console.log(`[AUTH_ERROR] Failed login attempt: user not found - email=${email}`);
      // Don't reveal if email exists or not (security best practice)
      return res.status(401).json({
        error: 'AUTH_INVALID_CREDENTIALS',
        message: 'Email o contraseña incorrectos',
        message_en: 'Invalid email or password'
      });
    }

    // Verify password
    const passwordMatches = await comparePassword(password, user.password_hash);

    if (!passwordMatches) {
      console.log(`[AUTH_ERROR] Failed login attempt: incorrect password - email=${email}`);
      return res.status(401).json({
        error: 'AUTH_INVALID_CREDENTIALS',
        message: 'Email o contraseña incorrectos',
        message_en: 'Invalid email or password'
      });
    }

    // Update last login timestamp
    await queryOne(
      'UPDATE resilio_schema.users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    console.log(`[AUTH_SUCCESS] User logged in: user_id=${user.id}, email=${email}`);

    // Store refresh token in HttpOnly cookie (XSS protection)
    // Refresh tokens must never be stored in localStorage/sessionStorage
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return only access token in JSON body (not refresh token)
    res.json({
      message: 'Login exitoso',
      message_en: 'Login successful',
      access_token: accessToken,
      expires_in: 900, // 15 minutes in seconds
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/logout
 * Logout user - revoke access token and clear refresh token cookie
 * Requires valid JWT token
 */
router.post('/logout', verifyJWT, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const jti = req.user.jti;

    // Revoke the access token by adding its JTI to denylist
    await revokeToken(jti, userId);

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    console.log(`[AUTH_SUCCESS] User logged out: user_id=${userId}, jti=${jti}`);

    res.json({
      message: 'Sesión finalizada',
      message_en: 'Session ended'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token from cookie
 * Returns new access token and rotates refresh token
 * Implements refresh token rotation for security
 */
router.post('/refresh', async (req, res, next) => {
  try {
    // Get refresh token from HttpOnly cookie (not from request body)
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      console.log(`[AUTH_ERROR] Refresh token missing from cookie`);
      return res.status(401).json({
        error: 'AUTH_MISSING_REFRESH_TOKEN',
        message: 'Token de refresco faltante',
        message_en: 'Refresh token missing'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      console.log(`[AUTH_ERROR] Invalid refresh token: ${error.message}`);
      return res.status(401).json({
        error: 'AUTH_INVALID_REFRESH_TOKEN',
        message: 'Token de refresco inválido o expirado',
        message_en: 'Invalid or expired refresh token'
      });
    }

    // Check if refresh token has been revoked
    const revoked = await isTokenRevoked(decoded.jti);
    if (revoked) {
      console.log(`[AUTH_ERROR] Refresh token has been revoked: jti=${decoded.jti}`);
      return res.status(401).json({
        error: 'AUTH_INVALID_REFRESH_TOKEN',
        message: 'Token de refresco inválido o expirado',
        message_en: 'Invalid or expired refresh token'
      });
    }

    // Get user from database
    const user = await queryOne(
      'SELECT id, email, role FROM resilio_schema.users WHERE id = $1',
      [decoded.sub]
    );

    if (!user) {
      console.log(`[AUTH_ERROR] User not found for refresh token: user_id=${decoded.sub}`);
      return res.status(401).json({
        error: 'AUTH_INVALID_REFRESH_TOKEN',
        message: 'Token de refresco inválido o expirado',
        message_en: 'Invalid or expired refresh token'
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id, user.email, user.role);
    
    // Rotate refresh token (issue new one)
    const newRefreshToken = generateRefreshToken(user.id);

    // Revoke old refresh token (prevent reuse if leaked)
    await revokeToken(decoded.jti, user.id);

    console.log(`[AUTH_SUCCESS] Token refreshed: user_id=${user.id}`);

    // Update refresh token cookie with new token (refresh token rotation)
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return new access token in JSON body
    res.json({
      message: 'Token refrescado',
      message_en: 'Token refreshed',
      access_token: newAccessToken,
      expires_in: 900 // 15 minutes in seconds
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /auth/me
 * Get current user profile
 * Requires valid JWT token
 */
router.get('/me', verifyJWT, async (req, res, next) => {
  try {
    const user = await queryOne(
      'SELECT id, email, display_name, role, language_preference, email_verified, created_at, last_login_at FROM resilio_schema.users WHERE id = $1',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
        message_en: 'User not found'
      });
    }

    res.json({
      user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/password-change
 * Change user password
 * Requires valid JWT token
 */
router.post('/password-change', verifyJWT, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Contraseña actual y nueva son requeridas',
        message_en: 'Current and new password are required'
      });
    }

    // Get user
    const user = await queryOne(
      'SELECT password_hash FROM resilio_schema.users WHERE id = $1',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
        message_en: 'User not found'
      });
    }

    // Verify current password
    const passwordMatches = await comparePassword(currentPassword, user.password_hash);
    if (!passwordMatches) {
      console.log(`[AUTH_ERROR] Password change failed: incorrect current password - user_id=${userId}`);
      return res.status(401).json({
        error: 'AUTH_INVALID_CREDENTIALS',
        message: 'Contraseña actual incorrecta',
        message_en: 'Current password is incorrect'
      });
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'La nueva contraseña no cumple con los requisitos de seguridad',
        message_en: 'New password does not meet security requirements',
        details: passwordValidation.errors
      });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await queryOne(
      'UPDATE resilio_schema.users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );

    // Revoke all active tokens for this user (force re-login on all devices)
    await queryOne(
      'DELETE FROM resilio_schema.token_revocation WHERE user_id = $1',
      [userId]
    );

    console.log(`[AUTH_SUCCESS] Password changed: user_id=${userId}`);

    res.json({
      message: 'Contraseña cambiada exitosamente',
      message_en: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
