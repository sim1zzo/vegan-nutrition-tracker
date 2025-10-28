import { useState, useEffect } from 'react';
import axios from 'axios';

// Import alimenti hardcoded come fallback
import { ALIMENTI_HARDCODED } from '../data/alimentiHardcoded';

/**
 * Hook per caricare alimenti dal backend MongoDB
 * Con fallback agli alimenti hardcoded se il server non è disponibile
 */
export const useAlimenti = (filtri = {}) => {
  const [alimenti, setAlimenti] = useState(ALIMENTI_HARDCODED);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useHardcoded, setUseHardcoded] = useState(false);

  useEffect(() => {
    caricaAlimenti();
  }, [filtri.categoria, filtri.search]);

  const caricaAlimenti = async () => {
    setLoading(true);
    setError(null);

    try {
      // Costruisci query params
      const params = new URLSearchParams();
      if (filtri.categoria) params.append('categoria', filtri.categoria);
      if (filtri.search) params.append('search', filtri.search);
      if (filtri.altoProteico) params.append('altoProteico', 'true');
      if (filtri.ipocalorico) params.append('ipocalorico', 'true');

      const response = await axios.get(
        `/api/alimenti?${params.toString()}`,
        { timeout: 5000 } // Timeout 5 secondi
      );

      if (response.data.success) {
        setAlimenti(response.data.alimenti);
        setUseHardcoded(false);
        console.log('✅ Alimenti caricati dal backend');
      }
    } catch (err) {
      console.warn(
        '⚠️ Backend non disponibile, uso alimenti hardcoded:',
        err.message
      );
      setAlimenti(ALIMENTI_HARDCODED);
      setUseHardcoded(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const aggiungiAlimentoCustom = async (datiAlimento) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error(
          'Devi essere autenticato per aggiungere alimenti custom'
        );
      }

      const response = await axios.post('/api/alimenti', datiAlimento, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Ricarica alimenti
        await caricaAlimenti();
        return { success: true, alimento: response.data.alimento };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };

  const cercaAlimenti = async (query) => {
    try {
      const response = await axios.get(`/api/alimenti/ricerca?q=${query}`);
      return response.data.alimenti;
    } catch (err) {
      console.error('Errore ricerca:', err);
      // Fallback a ricerca locale
      return Object.entries(ALIMENTI_HARDCODED)
        .filter(([nome]) => nome.toLowerCase().includes(query.toLowerCase()))
        .map(([nome, dati]) => ({ nome, ...dati }));
    }
  };

  return {
    alimenti,
    loading,
    error,
    useHardcoded,
    ricarica: caricaAlimenti,
    aggiungiAlimentoCustom,
    cercaAlimenti,
  };
};

export default useAlimenti;
