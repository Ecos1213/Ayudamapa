import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  handleSignup,
  handleLogin,
  handleLogout,
  handleRefresh,
  validateToken,
  updateUserProfile,
  handlePasswordReset,
} from '../services/authService';

/**
 * Custom hook for authentication
 * Provides user state and auth functions
 */
export const useAuth = () => {
  const { user, setUser, clearUser } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize auth on app load - check for valid tokens
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const rememberMe = localStorage.getItem('rememberMe');

      if (accessToken && (rememberMe || !rememberMe)) {
        setIsLoading(true);
        const result = await validateToken();

        if (result.success) {
          setUser(result.user);
        } else {
          // Token invalid, try to refresh
          const refreshResult = await handleRefresh();
          if (refreshResult.success) {
            const profileResult = await validateToken();
            if (profileResult.success) {
              setUser(profileResult.user);
            }
          } else {
            clearUser();
          }
        }
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [setUser, clearUser]);

  // Setup storage listener for logout across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken' && !e.newValue) {
        // Token was cleared in another tab
        clearUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [clearUser]);

  // Signup
  const signup = async (email, password, displayName) => {
    setIsLoading(true);
    setError(null);
    const result = await handleSignup(email, password, displayName);

    if (result.success) {
      setUser(result.user);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
    return result;
  };

  // Login
  const login = async (email, password, rememberMe = false) => {
    setIsLoading(true);
    setError(null);
    const result = await handleLogin(email, password, rememberMe);

    if (result.success) {
      setUser(result.user);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
    return result;
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    const result = await handleLogout();
    clearUser();
    setIsLoading(false);
    return result;
  };

  // Refresh token
  const refresh = async () => {
    return await handleRefresh();
  };

  // Update profile
  const updateProfile = async (updates) => {
    setIsLoading(true);
    setError(null);
    const result = await updateUserProfile(updates);

    if (result.success) {
      setUser(result.user);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
    return result;
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    setIsLoading(true);
    setError(null);
    const result = await handlePasswordReset(email);

    if (!result.success) {
      setError(result.message);
    }
    setIsLoading(false);
    return result;
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
    refresh,
    updateProfile,
    requestPasswordReset,
  };
};
