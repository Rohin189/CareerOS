import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, validate any stored token against the server
  useEffect(function () {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/auth/me')
      .then(function (res) { setUser(res.data.user || res.data); })
      .catch(function () {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(function () { setLoading(false); });
  }, []);

  async function establishSession(token) {
    localStorage.setItem('token', token);
    const res = await api.get('/auth/me');
    setUser(res.data.user || res.data);
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    await establishSession(res.data.token);
  }

  async function register(name, email, password) {
    await api.post('/auth/register', { name, email, password });
    await login(email, password);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
