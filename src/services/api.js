import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor per token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor errori
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authAPI = {
  registrazione: (dati) => api.post('/auth/registrazione', dati),
  login: (dati) => api.post('/auth/login', dati),
  getUtente: () => api.get('/auth/me'),
};

// ==================== GIORNATE ====================
export const giornateAPI = {
  // Modifica per accettare un oggetto di parametri per flessibilità
  getGiornate: (params) => api.get('/giornate', { params }),
  getGiornataByData: (data) => api.get('/giornate', { params: { data } }), // Mantieni per compatibilità se usata altrove
  creaGiornata: (dati) => api.post('/giornate', dati),
  aggiornaGiornata: (id, dati) => api.put(`/giornate/${id}`, dati),
};

// ==================== ALIMENTI ==================== // <-- NUOVO
export const alimentiAPI = {
  getAlimenti: () => api.get('/alimenti'),
  creaAlimento: (dati) => api.post('/alimenti', dati),
  aggiornaAlimento: (id, dati) => api.put(`/alimenti/${id}`, dati),
  eliminaAlimento: (id) => api.delete(`/alimenti/${id}`),
};

export default api;
