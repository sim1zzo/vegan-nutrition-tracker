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
  getGiornataByData: (data) => api.get('/giornate', { params: { data } }),
  creaGiornata: (dati) => api.post('/giornate', dati),
  aggiornaGiornata: (id, dati) => api.put(`/giornate/${id}`, dati),
};

export default api;
