import express from 'express';
import { query, queryOne } from '../db/pool.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /api/profile
 * Get authenticated user's profile
 * Requires valid JWT token
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch user profile from users table
    const userData = await queryOne(
      `SELECT id, email, display_name, phone_number, role, language_preference, created_at 
       FROM resilio_schema.users WHERE id = $1`,
      [userId]
    );

    if (!userData) {
      console.log(`[ERROR] User not found in database: user_id=${userId}`);
      return res.status(404).json({
        error: 'PROFILE_NOT_FOUND',
        message: 'Perfil de usuario no encontrado',
        message_en: 'User profile not found'
      });
    }

    res.json({
      message: 'Perfil obtenido exitosamente',
      message_en: 'Profile retrieved successfully',
      user: {
        id: userData.id,
        email: userData.email,
        display_name: userData.display_name,
        phone_number: userData.phone_number,
        role: userData.role,
        language_preference: userData.language_preference,
        created_at: userData.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/profile
 * Update authenticated user's profile
 * Allows updating: display_name, phone_number, language_preference
 * Requires valid JWT token
 */
router.patch('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { display_name, phone_number, language_preference } = req.body;

    // Build update object with only allowed fields
    const updateData = {};
    
    if (display_name !== undefined) {
      if (typeof display_name !== 'string' || display_name.trim().length === 0) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Nombre debe ser una cadena no vacía',
          message_en: 'Display name must be a non-empty string'
        });
      }
      updateData.display_name = display_name.trim();
    }

    if (phone_number !== undefined) {
      if (phone_number !== null && typeof phone_number !== 'string') {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Teléfono debe ser una cadena o nulo',
          message_en: 'Phone number must be a string or null'
        });
      }
      updateData.phone_number = phone_number;
    }

    if (language_preference !== undefined) {
      if (!['es', 'en'].includes(language_preference)) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Preferencia de idioma debe ser "es" o "en"',
          message_en: 'Language preference must be "es" or "en"'
        });
      }
      updateData.language_preference = language_preference;
    }

    // Don't allow empty updates
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'No hay campos para actualizar',
        message_en: 'No fields to update'
      });
    }

    // Build dynamic UPDATE query
    const updateFields = Object.keys(updateData);
    const setClause = updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = [...Object.values(updateData), userId];

    // Update user profile in database
    await query(
      `UPDATE resilio_schema.users SET ${setClause} WHERE id = $${updateFields.length + 1}`,
      values
    );

    // Fetch updated user
    const updatedUser = await queryOne(
      `SELECT id, email, display_name, phone_number, role, language_preference 
       FROM resilio_schema.users WHERE id = $1`,
      [userId]
    );

    console.log(`[INFO] User profile updated: user_id=${userId}, fields=${Object.keys(updateData).join(',')}`);

    res.json({
      message: 'Perfil actualizado exitosamente',
      message_en: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        display_name: updatedUser.display_name,
        phone_number: updatedUser.phone_number,
        role: updatedUser.role,
        language_preference: updatedUser.language_preference
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
