import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere usato all'interno di AuthProvider");
  }
  return context;
};

// Configura axios
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Crea istanza axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor per aggiungere token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Carica profilo utente all'avvio
  useEffect(() => {
    if (token) {
      caricaProfilo();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Carica profilo
  const caricaProfilo = async () => {
    try {
      const response = await api.get('/auth/profilo');
      setUser(response.data.user);
    } catch (error) {
      console.error('Errore caricamento profilo:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Registrazione
  const registrazione = async (dati) => {
    try {
      const response = await api.post('/auth/registrazione', dati);
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || 'Errore durante la registrazione',
      };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Errore durante il login',
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Aggiorna profilo
  const aggiornaProfilo = async (dati) => {
    try {
      const response = await api.put('/auth/profilo', dati);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Errore nell'aggiornamento del profilo",
      };
    }
  };

  const value = {
    user,
    loading,
    token,
    registrazione,
    login,
    logout,
    aggiornaProfilo,
    api, // Esponi api per uso in altri componenti
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
