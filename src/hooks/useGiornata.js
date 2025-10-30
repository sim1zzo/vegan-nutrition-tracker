import { useState, useEffect, useCallback } from 'react';
import { giornateAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useGiornata = (data) => {
  const [giornata, setGiornata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const { user } = useAuth();

  // Carica giornata
  const caricaGiornata = useCallback(async () => {
    if (!user || !data) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: response } = await giornateAPI.getGiornataByData(data);

      if (response.giornate && response.giornate.length > 0) {
        setGiornata(response.giornate[0]);
      } else {
        const nuovaGiornata = await creaGiornataVuota(data);
        setGiornata(nuovaGiornata);
      }
    } catch (err) {
      console.error('Errore caricamento:', err);
      setError(err.response?.data?.message || 'Errore caricamento');
    } finally {
      setLoading(false);
    }
  }, [data, user]);

  // Crea giornata vuota
  const creaGiornataVuota = async (data) => {
    const { data: response } = await giornateAPI.creaGiornata({
      data: new Date(data),
      pasti: {
        colazione: [],
        spuntinoMattina: [],
        pranzo: [],
        spuntinoPomeriggio: [],
        cena: [],
      },
      integratori: {
        colazione: [],
        spuntinoMattina: [],
        pranzo: [],
        spuntinoPomeriggio: [],
        cena: [],
      },
      totaliGiornalieri: {},
    });
    return response.giornata;
  };

  // Salva automaticamente (con debounce)
  const salvaGiornata = useCallback(async (giornataAggiornata) => {
    if (!giornataAggiornata?._id) return;

    setSalvando(true);
    try {
      const { data: response } = await giornateAPI.aggiornaGiornata(
        giornataAggiornata._id,
        giornataAggiornata
      );
      setGiornata(response.giornata);
    } catch (err) {
      console.error('Errore salvataggio:', err);
    } finally {
      setSalvando(false);
    }
  }, []);

  // Aggiungi alimento (con auto-save)
  const aggiungiAlimento = useCallback(
    async (pasto, alimento) => {
      if (!giornata) return;

      const nuovaGiornata = {
        ...giornata,
        pasti: {
          ...giornata.pasti,
          [pasto]: [...giornata.pasti[pasto], alimento],
        },
      };

      // Ricalcola totali
      nuovaGiornata.totaliGiornalieri = calcolaTotali(nuovaGiornata.pasti);

      setGiornata(nuovaGiornata);
      await salvaGiornata(nuovaGiornata);
    },
    [giornata, salvaGiornata]
  );

  // Rimuovi alimento
  const rimuoviAlimento = useCallback(
    async (pasto, index) => {
      if (!giornata) return;

      const nuovaGiornata = {
        ...giornata,
        pasti: {
          ...giornata.pasti,
          [pasto]: giornata.pasti[pasto].filter((_, i) => i !== index),
        },
      };

      nuovaGiornata.totaliGiornalieri = calcolaTotali(nuovaGiornata.pasti);

      setGiornata(nuovaGiornata);
      await salvaGiornata(nuovaGiornata);
    },
    [giornata, salvaGiornata]
  );

  // Aggiungi integratore
  const aggiungiIntegratore = useCallback(
    async (pasto, integratore) => {
      if (!giornata) return;

      const nuovaGiornata = {
        ...giornata,
        integratori: {
          ...giornata.integratori,
          [pasto]: [...giornata.integratori[pasto], integratore],
        },
      };

      setGiornata(nuovaGiornata);
      await salvaGiornata(nuovaGiornata);
    },
    [giornata, salvaGiornata]
  );

  // Rimuovi integratore
  const rimuoviIntegratore = useCallback(
    async (pasto, index) => {
      if (!giornata) return;

      const nuovaGiornata = {
        ...giornata,
        integratori: {
          ...giornata.integratori,
          [pasto]: giornata.integratori[pasto].filter((_, i) => i !== index),
        },
      };

      setGiornata(nuovaGiornata);
      await salvaGiornata(nuovaGiornata);
    },
    [giornata, salvaGiornata]
  );

  useEffect(() => {
    caricaGiornata();
  }, [caricaGiornata]);

  return {
    giornata,
    loading,
    error,
    salvando,
    aggiungiAlimento,
    rimuoviAlimento,
    aggiungiIntegratore,
    rimuoviIntegratore,
    ricarica: caricaGiornata,
  };
};

// Helper per calcolare totali
function calcolaTotali(pasti) {
  const totali = {
    proteine: 0,
    carboidrati: 0,
    grassi: 0,
    fibre: 0,
    ferro: 0,
    calcio: 0,
    vitB12: 0,
    vitB2: 0,
    vitD: 0,
    omega3: 0,
    iodio: 0,
    zinco: 0,
    calorie: 0,
  };

  Object.values(pasti)
    .flat()
    .forEach((alimento) => {
      Object.keys(totali).forEach((nutriente) => {
        totali[nutriente] += alimento[nutriente] || 0;
      });
    });

  return totali;
}
