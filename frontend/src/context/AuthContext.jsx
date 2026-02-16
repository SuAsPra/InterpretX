import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveAuth = (token, userData) => {
    localStorage.setItem('narrative_token', token);
    setUser(userData);
  };

  const clearAuth = () => {
    localStorage.removeItem('narrative_token');
    setUser(null);
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    saveAuth(data.token, data.user);
    return data.user;
  };

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    saveAuth(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    clearAuth();
  };

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (_error) {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('narrative_token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe();
  }, []);

  const value = useMemo(
    () => ({ user, loading, register, login, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
