import { useState, useEffect, useCallback } from 'react';
import { giornateAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Helper per calcolare totali (MODIFICATO)
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
    // Aggiunti per calcolo complementarità
    proteineComplementarita: 0,
    proteineEffettive: 0,
  };

  const tuttiGliAlimenti = Object.values(pasti).flat();

  tuttiGliAlimenti.forEach((alimento) => {
    Object.keys(totali).forEach((nutriente) => {
      // Escludi i campi calcolati
      if (
        nutriente !== 'proteineComplementarita' &&
        nutriente !== 'proteineEffettive'
      ) {
        totali[nutriente] += alimento[nutriente] || 0;
      }
    });
  });

  // --- INIZIO LOGICA COMPLEMENTARITÀ PROTEICA ---
  // (Basato sulla logica del tuo file vegan-tracker-pro-final.txt)
  const proteineLegumi = tuttiGliAlimenti
    .filter((a) =>
      a.nome.match(
        /lenticchie|ceci|fagioli|piselli|lupini|soia|edamame|tempeh|tofu/i
      )
    )
    .reduce((sum, a) => sum + a.proteine, 0);

  const proteineCereali = tuttiGliAlimenti
    .filter((a) =>
      a.nome.match(
        /pasta|riso|quinoa|farro|orzo|cous|miglio|grano|polenta|avena|pane/i
      )
    )
    .reduce((sum, a) => sum + a.proteine, 0);

  if (proteineLegumi > 0 && proteineCereali > 0) {
    // Il bonus del 23% è un po' alto, usiamo un più conservativo 15-20%
    // La logica del tuo file txt usava 0.23
    const bonus = Math.min(proteineLegumi, proteineCereali) * 0.23;
    totali.proteineComplementarita = bonus;
    totali.proteineEffettive = totali.proteine + bonus;
  } else {
    totali.proteineEffettive = totali.proteine;
  }
  // --- FINE LOGICA COMPLEMENTARITÀ PROTEICA ---

  // Arrotonda tutti i valori per pulizia
  for (const key in totali) {
    totali[key] = parseFloat(totali[key].toFixed(2));
  }

  return totali;
}

export const useGiornata = (data) => {
  const [giornata, setGiornata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const { user } = useAuth();

  // Carica giornata
  const caricaGiornata = useCallback(async () => {
    // ... (codice invariato) ...
  }, [data, user]);

  // Crea giornata vuota
  const creaGiornataVuota = async (data) => {
    // ... (codice invariato) ...
  };

  // Salva automaticamente
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

      // Ricalcola totali (ora include complementarità)
      nuovaGiornata.totaliGiornalieri = calcolaTotali(nuovaGiornata.pasti);

      setGiornata(nuovaGiornata);
      await salvaGiornata(nuovaGiornata);
    },
    [giornata, salvaGiornata]
  );

  // --- NUOVA FUNZIONE ---
  // Aggiungi Ricetta (un gruppo di alimenti)
  const aggiungiRicetta = useCallback(
    async (pasto, ricetta) => {
      if (!giornata || !ricetta || !ricetta.alimenti) return;

      // ricetta.alimenti è un array di alimenti da aggiungere
      const alimentiDaAggiungere = ricetta.alimenti;

      const nuovaGiornata = {
        ...giornata,
        pasti: {
          ...giornata.pasti,
          [pasto]: [...giornata.pasti[pasto], ...alimentiDaAggiungere],
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
      // ... (codice invariato) ...
      // Ricalcola totali
      nuovaGiornata.totaliGiornalieri = calcolaTotali(nuovaGiornata.pasti);
      // ... (codice invariato) ...
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

      // Nota: gli integratori non ricalcolano i totali nutrizionali
      // se non li mappi nel modello Alimento.
      // Per ora, li salviamo separatamente.
      // Se vuoi che B12/Ferro da integratori contino, devi
      // aggiungerli come "Alimento" di categoria "integratore".
      // Per ora seguiamo il tuo modello GiornataAlimentare.
      setGiornata(nuovaGiornata);
      await salvaGiornata(nuovaGiornata);
    },
    [giornata, salvaGiornata]
  );

  // Rimuovi integratore
  const rimuoviIntegratore = useCallback(
    async (pasto, index) => {
      // ... (codice invariato) ...
    },
    [giornata, salvaGiornata]
  );

  // --- NUOVA FUNZIONE ---
  // Copia giornata precedente
  const copiaGiornoPrecedente = useCallback(
    async (dataDiOggi) => {
      if (!user) return;

      const ieri = new Date(dataDiOggi);
      ieri.setDate(ieri.getDate() - 1);
      const dataIeri = ieri.toISOString().split('T')[0];

      try {
        const { data: response } = await giornateAPI.getGiornataByData(
          dataIeri
        );
        if (response.giornate && response.giornate.length > 0) {
          const giornataIeri = response.giornate[0];

          // Crea una NUOVA giornata (non aggiornare quella di ieri)
          // Rimuovendo _id e cambiando la data
          delete giornataIeri._id;
          delete giornataIeri.createdAt;
          delete giornataIeri.updatedAt;
          giornataIeri.data = new Date(dataDiOggi); // Imposta la data a oggi

          // Sovrascrivi la giornata corrente (se esiste) o creane una nuova
          if (giornata && giornata._id) {
            // Aggiorna
            const { data: updatedResponse } =
              await giornateAPI.aggiornaGiornata(giornata._id, giornataIeri);
            setGiornata(updatedResponse.giornata);
          } else {
            // Crea
            const { data: createdResponse } = await giornateAPI.creaGiornata(
              giornataIeri
            );
            setGiornata(createdResponse.giornata);
          }
        } else {
          console.log('Nessun dato trovato per ieri.');
        }
      } catch (err) {
        console.error('Errore nel copiare la giornata:', err);
      }
    },
    [user, giornata]
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
    aggiungiRicetta, // Esponi nuova funzione
    copiaGiornoPrecedente, // Esponi nuova funzione
    ricarica: caricaGiornata,
  };
};
