import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

// Wraps the app, exposing the current user + login/register/logout helpers.
// Reads/writes the JWT to localStorage so refreshes keep the session alive.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('pp_user');
    const token = localStorage.getItem('pp_token');
    if (storedUser && token) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const persistSession = (data) => {
    localStorage.setItem('pp_token', data.token);
    const { token, ...userData } = data;
    localStorage.setItem('pp_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persistSession(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    persistSession(data);
    return data;
  };

  // Used by the OAuth callback page: we already have a valid JWT (minted by
  // the backend after Google/GitHub/Microsoft login), just need the profile.
  const loginWithToken = async (token) => {
    localStorage.setItem('pp_token', token);
    const { data } = await api.get('/auth/me');
    localStorage.setItem('pp_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
