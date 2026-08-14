import apiClient from '../utils/apiClient';

/**
 * Auth Service - Handles all authentication-related API calls
 */

// Store tokens in localStorage
const storeTokens = (accessToken) => {
  localStorage.setItem('accessToken', accessToken);
  // Refresh token is handled via HttpOnly cookie by backend
};

// Clear tokens from localStorage
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  // Refresh token cookie is cleared by backend on logout
};

/**
 * Handle user signup
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @returns {Promise<Object>} User profile and tokens
 */
export const handleSignup = async (email, password, displayName) => {
  try {
    const response = await apiClient.post('/auth/signup', {
      email,
      password,
      displayName,
    });

    const { user } = response.data;
    // Signup does not return tokens - user must login separately

    return {
      success: true,
      user,
    };
  } catch (error) {
    return {
      success: false,
      error: error.code || 'SIGNUP_FAILED',
      message: error.message,
    };
  }
};

/**
 * Handle user login
 * @param {string} email
 * @param {string} password
 * @param {boolean} rememberMe
 * @returns {Promise<Object>} User profile and tokens
 */
export const handleLogin = async (email, password, rememberMe = false) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    const { access_token: accessToken, user } = response.data;
    storeTokens(accessToken);

    // Store remember-me preference
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    }

    return {
      success: true,
      user,
      accessToken,
    };
  } catch (error) {
    return {
      success: false,
      error: error.code || 'LOGIN_FAILED',
      message: error.message,
    };
  }
};

/**
 * Handle user logout
 * @returns {Promise<Object>} Logout result
 */
export const handleLogout = async () => {
  try {
    // Call logout endpoint to invalidate token on backend
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
    // Clear tokens locally even if backend call fails
  }

  clearTokens();
  localStorage.removeItem('rememberMe');

  return {
    success: true,
  };
};

/**
 * Refresh JWT access token using refresh token cookie
 * Note: This is handled automatically by apiClient interceptor on 401 responses.
 * Use this function only if you need to manually trigger a refresh.
 * @returns {Promise<Object>} New access token
 */
export const handleRefresh = async () => {
  try {
    const response = await apiClient.post(
      '/auth/refresh',
      {},
      { withCredentials: true }
    );

    const { access_token: accessToken } = response.data;
    storeTokens(accessToken);

    return {
      success: true,
      accessToken,
    };
  } catch (error) {
    clearTokens();
    return {
      success: false,
      error: error.code || 'REFRESH_FAILED',
      message: error.message,
    };
  }
};

/**
 * Validate current token and get user profile
 * @returns {Promise<Object>} User profile
 */
export const validateToken = async () => {
  try {
    const response = await apiClient.get('/api/profile');
    return {
      success: true,
      user: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.code || 'VALIDATION_FAILED',
      message: error.message,
    };
  }
};

/**
 * Request password reset email
 * @param {string} email
 * @returns {Promise<Object>} Result
 */
export const handlePasswordReset = async (email) => {
  try {
    const response = await apiClient.post('/auth/reset-password', { email });
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.code || 'RESET_FAILED',
      message: error.message,
    };
  }
};

/**
 * Update user profile
 * @param {Object} updates - Fields to update (displayName, phoneNumber, languagePreference)
 * @returns {Promise<Object>} Updated user profile
 */
export const updateUserProfile = async (updates) => {
  try {
    const response = await apiClient.patch('/api/profile', updates);
    return {
      success: true,
      user: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.code || 'UPDATE_FAILED',
      message: error.message,
    };
  }
};
