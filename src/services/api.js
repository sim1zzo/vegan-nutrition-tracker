import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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
  getGiornataByData: (data) => api.get('/giornate', { params: { data } }),
  creaGiornata: (dati) => api.post('/giornate', dati),
  aggiornaGiornata: (id, dati) => api.put(`/giornate/${id}`, dati),
};

// ==================== ALIMENTI ====================
export const alimentiAPI = {
  // GET tutti gli alimenti
  getAll: (params = {}) => api.get('/alimenti', { params }),

  // GET alimenti per categoria
  getByCategoria: (categoria) => api.get(`/alimenti/categoria/${categoria}`),

  // GET singolo alimento
  getById: (id) => api.get(`/alimenti/${id}`),

  // POST crea alimento custom
  create: (datiAlimento) => api.post('/alimenti', datiAlimento),

  // GET alimenti custom dell'utente
  getMiei: () => api.get('/alimenti/utente/miei'),

  // PUT aggiorna alimento
  update: (id, datiAlimento) => api.put(`/alimenti/${id}`, datiAlimento),

  // DELETE elimina alimento
  delete: (id) => api.delete(`/alimenti/${id}`),

  // GET ricerca avanzata
  ricerca: (query, filtri = {}) =>
    api.get('/alimenti/ricerca', { params: { q: query, ...filtri } }),
};

export default api;
