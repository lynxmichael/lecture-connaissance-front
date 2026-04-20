import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try { await api.post('/logout'); } catch (_) {}
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) { if (mounted) setLoading(false); return; }
      try {
        const res = await api.get('/user');
        if (mounted) setUser(res.data);
      } catch {
        if (mounted) { localStorage.removeItem('token'); }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user; // retourne le user pour la redirection dans LoginPage
  };

  const register = async (data) => {
    const res = await api.post('/register', data);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
