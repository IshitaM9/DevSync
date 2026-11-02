import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (payload) => {
    const response = await api.post('/auth/login', payload);
    const { user: userData, token: accessToken } = response.data;
    setUser(userData);
    setToken(accessToken);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    return response.data;
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload);
    const { user: userData, token: accessToken } = response.data;
    setUser(userData);
    setToken(accessToken);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setToken(null);
      delete api.defaults.headers.common.Authorization;
    }
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    setUser,
    setToken,
    login,
    register,
    logout,
    setLoading
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
