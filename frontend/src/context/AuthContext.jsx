import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

export const AuthContext = createContext(null);

/**
 * Retrieves the stored JWT from localStorage.
 * @returns {string|null}
 */
const getToken = () => localStorage.getItem('token');

/**
 * Builds the standard auth header used by protected API calls.
 * Supports the updated backend's dual-header scheme.
 * @returns {object}
 */
const authHeader = () => {
  const token = getToken();
  return token
    ? { Authorization: `Bearer ${token}`, 'x-auth-token': token }
    : {};
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [authError, setAuthError] = useState(null);
  const [quizResults, setQuizResults] = useState(() => {
    try {
      const saved = localStorage.getItem('quizResults');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ── Rehydrate session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const rehydrate = async () => {
      const token = getToken();
      if (!token) { setLoading(false); return; }

      try {
        const res = await axios.get(`${API_URL}/auth/me`, { headers: authHeader() });
        // New API wraps user in { success, data }
        setUser(res.data?.data || res.data);
      } catch (err) {
        // Token expired or invalid — clear storage
        localStorage.removeItem('token');
        if (err.response?.status === 401) {
          setAuthError('Your session has expired. Please log in again.');
        }
      } finally {
        setLoading(false);
      }
    };
    rehydrate();
  }, []);

  // ── Auth actions ────────────────────────────────────────────────────────────

  /**
   * Authenticates a user and stores the token.
   * @param {string} email
   * @param {string} password
   */
  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      // Backend returns { success, token, user }
      const { token, user: userData } = res.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      return true;
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.error || (data?.errors && data.errors.join(' ')) || 'Authentication failed. Please check your credentials.';
      setAuthError(msg);
      throw err; // Re-throw so the UI can handle the local state if needed
    }
  }, []);

  /**
   * Registers a new user account.
   * @param {string} name
   * @param {string} email
   * @param {string} password
   */
  const register = useCallback(async (name, email, password) => {
    setAuthError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      return true;
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.error || (data?.errors && data.errors.join(' ')) || 'Registration failed. Please try again.';
      setAuthError(msg);
      throw err;
    }
  }, []);

  /**
   * Clears the session and logs the user out.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setAuthError(null);
  }, []);

  /**
   * Updates the voter's self-reported readiness progress.
   * @param {object} progress
   */
  const updateProgress = useCallback(async (progress) => {
    const res = await axios.put(
      `${API_URL}/auth/progress`,
      { progress },
      { headers: authHeader() }
    );
    // New API returns { success, data: progress }
    setUser((prev) => ({ ...prev, progress: res.data?.data || res.data }));
  }, []);

  /**
   * Adds or removes a candidate from the user's saved watchlist.
   * @param {object} candidate
   */
  const toggleCandidate = useCallback(async (candidate) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await axios.put(
        `${API_URL}/auth/save-candidate`,
        { candidate },
        { headers: authHeader() }
      );
      // New API returns { success, data: savedCandidates }
      setUser((prev) => ({ ...prev, savedCandidates: res.data?.data || res.data }));
    } catch (err) {
      console.error('[AuthContext] Failed to toggle saved candidate:', err.message);
    }
  }, []);

  /**
   * Persists quiz results to state and localStorage.
   * @param {object} results
   */
  const saveQuizResults = useCallback((results) => {
    setQuizResults(results);
    try {
      localStorage.setItem('quizResults', JSON.stringify(results));
    } catch {
      console.warn('[AuthContext] Could not persist quiz results to localStorage.');
    }
  }, []);

  const value = {
    user,
    loading,
    authError,
    login,
    register,
    logout,
    updateProgress,
    toggleCandidate,
    quizResults,
    saveQuizResults,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
