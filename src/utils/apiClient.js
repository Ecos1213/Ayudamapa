import axios from 'axios';

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  withCredentials: true, // Send cookies with all requests (needed for HttpOnly refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint with credentials to send HttpOnly refresh token cookie
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { access_token: newAccessToken } = refreshResponse.data;

        // Store new access token
        localStorage.setItem('accessToken', newAccessToken);
        // Refresh token is automatically managed in HttpOnly cookie by backend

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        // Lazy load store to avoid circular dependency
        try {
          const { useAppStore } = await import('../store/useAppStore');
          useAppStore.getState().clearUser();
        } catch (e) {
          console.error('Failed to clear user:', e);
        }
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 - unauthorized action
    if (error.response?.status === 403) {
      localStorage.removeItem('accessToken');
      // Lazy load store to avoid circular dependency
      try {
        const { useAppStore } = await import('../store/useAppStore');
        useAppStore.getState().clearUser();
      } catch (e) {
        console.error('Failed to clear user:', e);
      }
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
      });
    }

    // Map error response to standard format
    const errorResponse = error.response?.data || {};
    return Promise.reject({
      code: errorResponse.error || 'UNKNOWN_ERROR',
      message: errorResponse.message || error.message,
      status: error.response?.status,
      details: errorResponse.details,
    });
  }
);

export default apiClient;
