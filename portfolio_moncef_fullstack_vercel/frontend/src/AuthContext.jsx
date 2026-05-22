import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API_URL, apiFetch } from './utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('portfolio-user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('portfolio-user');
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('portfolio-token'));

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('portfolio-user', JSON.stringify(user));
      localStorage.setItem('portfolio-token', token);
    } else {
      localStorage.removeItem('portfolio-user');
      localStorage.removeItem('portfolio-token');
    }
  }, [user, token]);

  async function login(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const data = await apiFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      setUser(data.user);
      setToken(data.token);
      return data.user;
    } catch (error) {
      if (cleanEmail === import.meta.env.VITE_VALID_EMAIL && password === import.meta.env.VITE_VALID_PASSWORD) {
        const fallbackUser = { email: import.meta.env.VITE_VALID_EMAIL, name: 'Moncef' };
        setUser(fallbackUser);
        setToken(import.meta.env.VITE_AUTH_TOKEN);
        return fallbackUser;
      }

      throw new Error(error.message || 'Connexion impossible. Lance bien le backend avec npm run dev depuis le dossier principal.');
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
  }

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
    apiUrl: API_URL
  }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider.');
  }
  return context;
}
