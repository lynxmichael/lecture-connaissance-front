import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

<<<<<<< HEAD
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try { await api.post('/logout'); } catch (_) {}
=======
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try { await api.post('/logout'); } catch { /* token déjà invalide */ }
>>>>>>> 294c6dc (Initial commit)
    localStorage.removeItem('token');
    setUser(null);
  }, []);

<<<<<<< HEAD
=======
  // Recharge les infos utilisateur depuis l'API.
  // Utilisé après un paiement pour débloquer l'app immédiatement.
  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('token')) return null;
    try {
      const res = await api.get('/user');
      setUser(res.data);
      return res.data;
    } catch (e) {
      // Déconnexion uniquement si le token est refusé (401). Une simple
      // coupure réseau ne doit pas déconnecter l'utilisateur.
      if (e.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
      return null;
    }
  }, []);

>>>>>>> 294c6dc (Initial commit)
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) { if (mounted) setLoading(false); return; }
      try {
        const res = await api.get('/user');
        if (mounted) setUser(res.data);
<<<<<<< HEAD
      } catch {
        if (mounted) { localStorage.removeItem('token'); }
=======
      } catch (e) {
        if (mounted && e.response?.status === 401) localStorage.removeItem('token');
>>>>>>> 294c6dc (Initial commit)
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

<<<<<<< HEAD
=======
  // Une route a répondu « abonnement suspendu » (403 SUBSCRIPTION_*) :
  // on recharge l'utilisateur → l'écran de renouvellement s'affiche.
  useEffect(() => {
    const onBlocked = () => { refreshUser(); };
    window.addEventListener('subscription:blocked', onBlocked);
    return () => window.removeEventListener('subscription:blocked', onBlocked);
  }, [refreshUser]);

>>>>>>> 294c6dc (Initial commit)
  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
<<<<<<< HEAD
    return res.data.user; // retourne le user pour la redirection dans LoginPage
=======
    return res.data.user;
>>>>>>> 294c6dc (Initial commit)
  };

  const register = async (data) => {
    const res = await api.post('/register', data);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
=======
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, refreshUser }}>
>>>>>>> 294c6dc (Initial commit)
      {children}
    </AuthContext.Provider>
  );
};
