import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('http://127.0.0.1:5000/api/auth/me', {
            headers: { 'x-auth-token': token }
          });
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const register = async (name, email, password) => {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProgress = async (progress) => {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://127.0.0.1:5000/api/auth/progress', { progress }, {
         headers: { 'x-auth-token': token }
      });
      setUser({...user, progress: res.data});
  }

  const toggleCandidate = async (candidate) => {
    const token = localStorage.getItem('token');
    const res = await axios.put('http://127.0.0.1:5000/api/auth/save-candidate', { candidate }, {
       headers: { 'x-auth-token': token }
    });
    setUser({...user, savedCandidates: res.data});
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateProgress, toggleCandidate }}>
      {children}
    </AuthContext.Provider>
  );
};
