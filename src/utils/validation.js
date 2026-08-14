/**
 * Validation utilities for API requests
 */

/**
 * Validate pin creation data
 */
export const validatePinData = (data) => {
  const errors = {};

  // Location validation
  if (!data.latitude || !data.longitude) {
    errors.location = 'Location coordinates are required';
  } else if (
    typeof data.latitude !== 'number' ||
    typeof data.longitude !== 'number'
  ) {
    errors.location = 'Invalid coordinate format';
  } else if (
    data.latitude < -90 ||
    data.latitude > 90 ||
    data.longitude < -180 ||
    data.longitude > 180
  ) {
    errors.location = 'Coordinates out of valid range';
  }

  // Type validation
  const validTypes = ['damage', 'supply', 'volunteer'];
  if (!data.type || !validTypes.includes(data.type)) {
    errors.type = `Type must be one of: ${validTypes.join(', ')}`;
  }

  // Severity validation
  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (data.severity && !validSeverities.includes(data.severity)) {
    errors.severity = `Severity must be one of: ${validSeverities.join(', ')}`;
  }

  // Description validation
  if (!data.description || data.description.trim().length === 0) {
    errors.description = 'Description is required';
  } else if (data.description.length > 5000) {
    errors.description = 'Description too long (max 5000 characters)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate coordinates format (lat, lng)
 */
export const validateCoordinates = (latitude, longitude) => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return false;
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return false;
  }
  return true;
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters',
    };
  }
  // Optional: Add more strength requirements
  return { isValid: true };
};

/**
 * Map API error codes to user-friendly messages
 */
export const mapErrorToUserMessage = (error) => {
  if (!error) {
    return 'An unexpected error occurred';
  }

  // Handle network errors
  if (error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your connection.';
  }

  // Handle specific API error codes
  const errorMap = {
    INVALID_EMAIL: 'Invalid email address',
    EMAIL_ALREADY_EXISTS: 'This email is already registered',
    INVALID_CREDENTIALS: 'Invalid email or password',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    INVALID_TOKEN: 'Invalid or expired token',
    UNAUTHORIZED: 'You do not have permission to perform this action',
    FORBIDDEN: 'Access denied',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Please check your input and try again',
    CONFLICT: 'This resource already exists',
    RATE_LIMIT: 'Too many requests. Please try again later.',
    SERVER_ERROR: 'Server error. Please try again later.',
  };

  return errorMap[error.code] || error.message || 'An error occurred';
};

/**
 * Handle mutation errors with proper messaging
 */
export const handleMutationError = (error) => {
  console.error('Mutation error:', error);

  return {
    userMessage: mapErrorToUserMessage(error),
    code: error.code || 'UNKNOWN_ERROR',
    status: error.status,
    details: error.details,
  };
};

/**
 * Retry strategy for failed requests
 */
export const getRetryDelay = (attemptIndex) => {
  // Exponential backoff: 1s, 2s, 4s...
  return Math.min(1000 * Math.pow(2, attemptIndex), 30000);
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error) => {
  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
    return true;
  }

  // Server errors (5xx)
  if (error.status >= 500) {
    return true;
  }

  // Rate limiting
  if (error.status === 429) {
    return true;
  }

  // Request timeout
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return true;
  }

  return false;
};
