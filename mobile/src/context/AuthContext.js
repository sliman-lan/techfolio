import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const t = await SecureStore.getItemAsync('token');
      const u = await SecureStore.getItemAsync('user');
      if (t) {
        setToken(t);
        api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
      }
      if (u) setUser(JSON.parse(u));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (token) {
        await SecureStore.setItemAsync('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        await SecureStore.deleteItemAsync('token');
        delete api.defaults.headers.common['Authorization'];
      }
    })();
  }, [token]);

  useEffect(() => {
    (async () => {
      if (user) await SecureStore.setItemAsync('user', JSON.stringify(user));
      else await SecureStore.deleteItemAsync('user');
    })();
  }, [user]);

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    const payload = res.data?.data || null;
    if (payload?.token) setToken(payload.token);
    if (payload) setUser({ _id: payload._id, name: payload.name, email: payload.email, role: payload.role });
    return res;
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    const p = res.data?.data || null;
    if (p?.token) setToken(p.token);
    if (p) setUser({ _id: p._id, name: p.name, email: p.email, role: p.role });
    return res;
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
