import { useState, useEffect, useCallback } from 'react';
import { giornateAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';

export const useStorico = () => {
  const [storico, setStorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Carica ultimi N giorni
  const caricaUltimiGiorni = useCallback(
    async (numGiorni = 7) => {
      if (!user) return;

      setLoading(true);
      try {
        const dataFine = new Date().toISOString();
        const dataInizio = subDays(new Date(), numGiorni).toISOString();

        const { data } = await giornateAPI.getGiornate({
          dataInizio,
          dataFine,
        });

        setStorico(data.giornate || []);
      } catch (err) {
        console.error('Errore caricamento storico:', err);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Carica settimana corrente
  const caricaSettimanaCorrente = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const oggi = new Date();
      const dataInizio = startOfWeek(oggi, { weekStartsOn: 1 }).toISOString();
      const dataFine = endOfWeek(oggi, { weekStartsOn: 1 }).toISOString();

      const { data } = await giornateAPI.getGiornate({
        dataInizio,
        dataFine,
      });

      setStorico(data.giornate || []);
    } catch (err) {
      console.error('Errore caricamento settimana:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carica mese corrente
  const caricaMeseCorrente = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const oggi = new Date();
      const dataInizio = startOfMonth(oggi).toISOString();
      const dataFine = endOfMonth(oggi).toISOString();

      const { data } = await giornateAPI.getGiornate({
        dataInizio,
        dataFine,
      });

      setStorico(data.giornate || []);
    } catch (err) {
      console.error('Errore caricamento mese:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Calcola medie
  const calcolaMediaNutriente = useCallback(
    (nutriente) => {
      if (storico.length === 0) return 0;

      const somma = storico.reduce((acc, giornata) => {
        return acc + (giornata.totaliGiornalieri[nutriente] || 0);
      }, 0);

      return somma / storico.length;
    },
    [storico]
  );

  // Dati per grafici
  const getDatiGrafico = useCallback(
    (nutriente) => {
      return storico.map((giornata) => ({
        data: new Date(giornata.data).toLocaleDateString('it-IT', {
          day: '2-digit',
          month: '2-digit',
        }),
        valore: giornata.totaliGiornalieri[nutriente] || 0,
      }));
    },
    [storico]
  );

  return {
    storico,
    loading,
    caricaUltimiGiorni,
    caricaSettimanaCorrente,
    caricaMeseCorrente,
    calcolaMediaNutriente,
    getDatiGrafico,
  };
};
