import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook for consuming the auth context.
 * Throws if used outside an AuthProvider.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
