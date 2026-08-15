/**
 * Central error handling middleware
 * Catches errors and returns formatted responses with localized error codes
 */
export const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  // Log the error
  const logMessage = `[ERROR] ${err.message} | Path: ${req.path} | Method: ${req.method} | Timestamp: ${timestamp}`;
  console.error(logMessage);

  // Determine status code and error response
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || 'INTERNAL_ERROR';
  let message = err.message || 'Error interno del servidor';
  let message_en = err.message_en || 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Datos inválidos';
    message_en = 'Invalid data';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'AUTH_INVALID_TOKEN';
    message = 'Token inválido o expirado';
    message_en = 'Invalid or expired token';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    errorCode = 'AUTH_INSUFFICIENT_PERMISSIONS';
    message = 'No tienes permisos para esta acción';
    message_en = 'You do not have permission for this action';
  }

  // Send error response
  res.status(statusCode).json({
    error: errorCode,
    message: message,
    message_en: message_en,
    timestamp: timestamp
  });
};

/**
 * Custom error class for structured error handling
 */
export class AppError extends Error {
  constructor(message, message_en, statusCode, errorCode) {
    super(message);
    this.message_en = message_en;
    this.statusCode = statusCode || 500;
    this.errorCode = errorCode || 'INTERNAL_ERROR';
  }
}
