import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  Calendar,
  Coffee,
  Apple,
  Utensils,
  Cookie,
  Moon,
  Plus,
  Trash2,
  Activity,
  AlertCircle,
  RefreshCw,
  ChevronLeft, // <-- Importato
  ChevronRight, // <-- Importato
  Save, // <-- Importato
  CalendarDays, // <-- Importato
} from 'lucide-react';
import { useAuth } from './context/AuthContext';

// Database alimenti fallback (INVARIATO)
const ALIMENTI_FALLBACK = {
  // ... (stesso contenuto di prima)
  'Avena (fiocchi)': {
    categoria: 'colazione',
    proteine: 13.2,
    carboidrati: 58.7,
    grassi: 7,
    fibre: 10.1,
    ferro: 3.8,
    calcio: 53,
    vitB12: 0,
    vitB2: 0.13,
    vitD: 0,
    omega3: 0,
    iodio: 0.5,
    zinco: 3,
    calorie: 389,
    porzione: 40,
  },
  'Latte di soia': {
    categoria: 'colazione',
    proteine: 3.3,
    carboidrati: 1.8,
    grassi: 1.9,
    fibre: 0.6,
    ferro: 0.6,
    calcio: 120,
    vitB12: 0.4,
    vitB2: 0.1,
    vitD: 0.75,
    omega3: 0.1,
    iodio: 2,
    zinco: 0.3,
    calorie: 33,
    porzione: 200,
  },
  'Pane integrale': {
    categoria: 'colazione',
    proteine: 7.5,
    carboidrati: 50,
    grassi: 1.5,
    fibre: 7,
    ferro: 2.5,
    calcio: 30,
    vitB12: 0,
    vitB2: 0.16,
    vitD: 0,
    omega3: 0,
    iodio: 2.5,
    zinco: 1.8,
    calorie: 247,
    porzione: 50,
  },
  'Lenticchie rosse': {
    categoria: 'pranzo',
    proteine: 9,
    carboidrati: 20.8,
    grassi: 0.4,
    fibre: 7.9,
    ferro: 3.3,
    calcio: 19,
    vitB12: 0,
    vitB2: 0.07,
    vitD: 0,
    omega3: 0.04,
    iodio: 1,
    zinco: 1.3,
    calorie: 116,
    porzione: 150,
  },
  'Pasta integrale': {
    categoria: 'pranzo',
    proteine: 4.5,
    carboidrati: 23,
    grassi: 0.5,
    fibre: 3.5,
    ferro: 1.2,
    calcio: 10,
    vitB12: 0,
    vitB2: 0.05,
    vitD: 0,
    omega3: 0,
    iodio: 0.5,
    zinco: 0.8,
    calorie: 112,
    porzione: 80,
  },
  'Riso integrale': {
    categoria: 'pranzo',
    proteine: 2.6,
    carboidrati: 23,
    grassi: 0.9,
    fibre: 1.8,
    ferro: 0.4,
    calcio: 10,
    vitB12: 0,
    vitB2: 0.01,
    vitD: 0,
    omega3: 0,
    iodio: 0.5,
    zinco: 0.6,
    calorie: 111,
    porzione: 150,
  },
  Ceci: {
    categoria: 'pranzo',
    proteine: 8.9,
    carboidrati: 27.4,
    grassi: 2.6,
    fibre: 7.6,
    ferro: 2.9,
    calcio: 49,
    vitB12: 0,
    vitB2: 0.06,
    vitD: 0,
    omega3: 0.04,
    iodio: 1.5,
    zinco: 1.5,
    calorie: 164,
    porzione: 150,
  },
};

// Stato iniziale pasti vuoto
const PASTI_VUOTI = {
  colazione: [],
  spuntinoMattina: [],
  pranzo: [],
  spuntinoPomeriggio: [],
  cena: [],
};

// ⭐ COMPONENTE PASTO CARD (INVARIATO)
const PastoCard = ({
  titolo,
  tipoPasto,
  icona: Icona,
  pasti,
  alimenti,
  setModalePasto,
  rimuoviAlimento,
}) => {
  // ... (stesso contenuto di prima)
  const alimentiPasto = pasti[tipoPasto] || [];

  const totaliPasto = useMemo(() => {
    let tot = { proteine: 0, carboidrati: 0, grassi: 0, calorie: 0 };
    alimentiPasto.forEach((item) => {
      const alimento = alimenti[item.nome];
      if (!alimento) return;
      const molt = item.quantita / 100;
      tot.proteine += (alimento.proteine || 0) * molt;
      tot.carboidrati += (alimento.carboidrati || 0) * molt;
      tot.grassi += (alimento.grassi || 0) * molt;
      tot.calorie += (alimento.calorie || 0) * molt;
    });
    return tot;
  }, [alimentiPasto, alimenti]);

  return (
    <div className='bg-white rounded-xl shadow-md p-4 border-2 border-gray-200 hover:border-green-300 transition-colors'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <Icona className='w-5 h-5 text-green-600' />
          <h3 className='text-lg font-bold text-gray-800'>{titolo}</h3>
        </div>
        <button
          onClick={() => setModalePasto(tipoPasto)}
          className='p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
          title='Aggiungi alimento'
        >
          <Plus className='w-4 h-4' />
        </button>
      </div>
      {alimentiPasto.length === 0 ? (
        <p className='text-gray-400 text-sm text-center py-4'>
          Nessun alimento aggiunto
        </p>
      ) : (
        <>
          <div className='space-y-2 mb-3'>
            {alimentiPasto.map((item, index) => (
              <div
                key={index}
                className='flex justify-between items-center bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors'
              >
                <div className='flex-1'>
                  <div className='font-semibold text-sm text-gray-800'>
                    {item.nome}
                  </div>
                  <div className='text-xs text-gray-600'>{item.quantita}g</div>
                </div>
                <button
                  onClick={() => rimuoviAlimento(tipoPasto, index)}
                  className='p-1 text-red-500 hover:bg-red-100 rounded transition-colors'
                  title='Rimuovi'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            ))}
          </div>
          <div className='bg-green-50 p-3 rounded-lg grid grid-cols-4 gap-2 text-xs'>
            <div>
              <div className='text-gray-600'>Prot.</div>
              <div className='font-bold text-green-700'>
                {totaliPasto.proteine.toFixed(1)}g
              </div>
            </div>
            <div>
              <div className='text-gray-600'>Carb.</div>
              <div className='font-bold text-green-700'>
                {totaliPasto.carboidrati.toFixed(1)}g
              </div>
            </div>
            <div>
              <div className='text-gray-600'>Grassi</div>
              <div className='font-bold text-green-700'>
                {totaliPasto.grassi.toFixed(1)}g
              </div>
            </div>
            <div>
              <div className='text-gray-600'>Kcal</div>
              <div className='font-bold text-green-700'>
                {totaliPasto.calorie.toFixed(0)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ⭐ COMPONENTE BARRA PROGRESSO (INVARIATO)
const BarraProgresso = ({ label, valore, obiettivo, unita = 'g' }) => {
  // ... (stesso contenuto di prima)
  const percentuale = Math.min((valore / obiettivo) * 100, 100);
  let colore = 'bg-green-500';
  let testoColore = 'text-green-600';

  if (percentuale < 70) {
    colore = 'bg-red-500';
    testoColore = 'text-red-600';
  } else if (percentuale < 90) {
    colore = 'bg-yellow-500';
    testoColore = 'text-yellow-600';
  }

  return (
    <div className='mb-3'>
      <div className='flex justify-between items-center mb-1'>
        <span className='text-sm font-semibold text-gray-700'>{label}</span>
        <span className={`text-sm font-medium ${testoColore}`}>
          {valore.toFixed(1)}/{obiettivo.toFixed(1)} {unita}
        </span>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
        <div
          className={`h-3 transition-all duration-500 ${colore}`}
          style={{ width: `${percentuale}%` }}
        />
      </div>
      {percentuale < 70 && (
        <div className='flex items-center gap-1 mt-1'>
          <AlertCircle className='w-3 h-3 text-red-500' />
          <span className='text-xs text-red-600'>
            Sotto il 70% dell'obiettivo
          </span>
        </div>
      )}
    </div>
  );
};

// ⭐ FUNZIONI HELPER DATA
const formattaData = (date) => {
  return date.toISOString().split('T')[0]; // Ritorna YYYY-MM-DD
};

const formattaDataUI = (date) => {
  const oggi = new Date();
  const ieri = new Date(oggi);
  ieri.setDate(ieri.getDate() - 1);

  if (formattaData(date) === formattaData(oggi)) return 'Oggi';
  if (formattaData(date) === formattaData(ieri)) return 'Ieri';

  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
  });
};

// ⭐ COMPONENTE PRINCIPALE (MODIFICATO)
const TrackerNutrizionaleVegano = () => {
  const { user, api } = useAuth();

  // Stati
  const [alimenti, setAlimenti] = useState(ALIMENTI_FALLBACK);
  const [isLoadingAlimenti, setIsLoadingAlimenti] = useState(true);
  const [usaMongoDB, setUsaMongoDB] = useState(false);
  const [numeroAlimentiPersonali, setNumeroAlimentiPersonali] = useState(0);

  const [pasti, setPasti] = useState(PASTI_VUOTI);

  // Stati per data e salvataggio
  const [dataSelezionata, setDataSelezionata] = useState(new Date());
  const [isLoadingTracker, setIsLoadingTracker] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Stati modale (invariati)
  const [modalePasto, setModalePasto] = useState(null);
  const [alimentoSelezionato, setAlimentoSelezionato] = useState('');
  const [quantita, setQuantita] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  // Obiettivi (invariato)
  const obiettivi = user?.obiettivi || {
    proteine: 77,
    carboidrati: 280,
    grassi: 60,
    fibre: 35,
    ferro: 18,
    calcio: 1000,
    vitB12: 2.4,
    vitB2: 1.3,
    vitD: 15,
    omega3: 1.6,
    iodio: 150,
    zinco: 11,
    calorie: 2200,
  };

  // Carica alimenti da MongoDB (solo al cambio utente)
  useEffect(() => {
    caricaAlimenti();
  }, [user]);

  // Carica i dati del tracker (al cambio utente o data)
  useEffect(() => {
    if (user) {
      caricaTrackerDelGiorno(dataSelezionata);
    } else {
      // Se l'utente fa logout, resetta i pasti
      setPasti(PASTI_VUOTI);
      setIsLoadingTracker(false);
    }
  }, [user, dataSelezionata]);

  const caricaAlimenti = async () => {
    try {
      setIsLoadingAlimenti(true);
      console.log('🔄 Caricamento alimenti...');

      const publicResponse = await api.get('/alimenti');
      let alimentiPubblici = publicResponse.data?.alimenti || {};

      if (user) {
        try {
          const myResponse = await api.get('/alimenti/miei');
          const alimentiPersonali = myResponse.data?.alimenti || {};
          const numeroPersonali = Object.keys(alimentiPersonali).length;
          setNumeroAlimentiPersonali(numeroPersonali);

          setAlimenti({ ...alimentiPubblici, ...alimentiPersonali });
          setUsaMongoDB(true);
          console.log(
            `✅ Caricati ${
              Object.keys(alimentiPubblici).length
            } pubblici + ${numeroPersonali} personalizzati`
          );
          return;
        } catch (error) {
          console.warn(
            '⚠️ Errore caricamento alimenti personalizzati:',
            error.message
          );
        }
      }

      if (Object.keys(alimentiPubblici).length > 0) {
        setAlimenti(alimentiPubblici);
        setUsaMongoDB(true);
        setNumeroAlimentiPersonali(0);
        console.log(
          `✅ Caricati ${
            Object.keys(alimentiPubblici).length
          } alimenti pubblici`
        );
      } else {
        throw new Error('Nessun alimento disponibile dal server');
      }
    } catch (error) {
      console.error('❌ Errore caricamento alimenti:', error.message);
      console.warn('⚠️ Uso alimenti fallback locali');
      setAlimenti(ALIMENTI_FALLBACK);
      setUsaMongoDB(false);
      setNumeroAlimentiPersonali(0);
    } finally {
      setIsLoadingAlimenti(false);
    }
  };

  // ⭐ [NUOVO] Carica i pasti salvati per il giorno selezionato
  const caricaTrackerDelGiorno = async (data) => {
    setIsLoadingTracker(true);
    setIsInitialLoad(true); // Impedisce salvataggio al caricamento
    const dataStringa = formattaData(data);
    console.log(`🔄 Caricamento tracker per il ${dataStringa}...`);

    try {
      const response = await api.get(`/tracker/${dataStringa}`);
      if (response.data && response.data.pasti) {
        setPasti(response.data.pasti);
        console.log(`✅ Dati tracker caricati per ${dataStringa}`);
      } else {
        // Nessun dato per oggi, resetta
        setPasti(PASTI_VUOTI);
        console.log(
          `ℹ️ Nessun dato trovato per ${dataStringa}, inizio giornata.`
        );
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // 404 è normale, significa che non c'è ancora un tracker per quel giorno
        setPasti(PASTI_VUOTI);
        console.log(
          `ℹ️ Nessun dato (404) per ${dataStringa}, inizio giornata.`
        );
      } else {
        console.error('❌ Errore caricamento tracker:', error.message);
        // Potresti voler gestire l'errore in modo diverso, es. mostrare un toast
      }
    } finally {
      setIsLoadingTracker(false);
      // Aspetta un attimo prima di abilitare il salvataggio
      setTimeout(() => setIsInitialLoad(false), 500);
    }
  };

  // ⭐ [NUOVO] Hook per il salvataggio automatico (debounced)
  const saveTimeoutRef = useRef(null);

  const salvaTrackerDebounced = useCallback(() => {
    // Pulisci timeout precedente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Imposta un nuovo timeout
    saveTimeoutRef.current = setTimeout(async () => {
      if (isInitialLoad) return; // Non salvare durante il caricamento iniziale

      setIsSaving(true);
      const dataStringa = formattaData(dataSelezionata);
      console.log(`💾 Salvataggio dati per ${dataStringa}...`);

      try {
        // Uso POST per 'upsert' (crea o aggiorna)
        await api.post('/tracker', { data: dataStringa, pasti: pasti });
        console.log('✅ Dati salvati');
      } catch (error) {
        console.error('❌ Errore salvataggio tracker:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1500); // Aspetta 1.5s dall'ultima modifica prima di salvare
  }, [pasti, dataSelezionata, api, isInitialLoad]);

  // Triggera il salvataggio debounced ogni volta che 'pasti' cambia
  useEffect(() => {
    if (isInitialLoad) return; // Non salvare al primo caricamento
    salvaTrackerDebounced();

    // Cleanup del timeout se il componente viene smontato
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [pasti, isInitialLoad, salvaTrackerDebounced]);

  // Calcola totali giornalieri (invariato)
  const totaliGiornalieri = useMemo(() => {
    // ... (stesso contenuto di prima)
    let totali = {
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
      .forEach((item) => {
        const alimento = alimenti[item.nome];
        if (!alimento) return;
        const molt = item.quantita / 100;
        Object.keys(totali).forEach((nutriente) => {
          totali[nutriente] += (alimento[nutriente] || 0) * molt;
        });
      });

    return totali;
  }, [pasti, alimenti]);

  // Funzioni aggiungi/rimuovi alimento (invariate)
  const aggiungiAlimento = () => {
    if (!alimentoSelezionato || !modalePasto) return;
    setPasti((prev) => ({
      ...prev,
      [modalePasto]: [
        ...prev[modalePasto],
        { nome: alimentoSelezionato, quantita },
      ],
    }));
    setAlimentoSelezionato('');
    setQuantita(100);
    setModalePasto(null);
    setSearchTerm('');
  };

  const rimuoviAlimento = (pasto, index) => {
    setPasti((prev) => ({
      ...prev,
      [pasto]: prev[pasto].filter((_, i) => i !== index),
    }));
  };

  // Alimenti filtrati per modale (invariato)
  const alimentiFiltrati = useMemo(() => {
    // ... (stesso contenuto di prima)
    return Object.entries(alimenti).filter(([nome, alimento]) => {
      if (!modalePasto) return false;

      // Filtra per categoria in base al pasto
      let categoriaMatch = true;
      if (modalePasto === 'colazione') {
        categoriaMatch = alimento.categoria === 'colazione';
      } else if (
        modalePasto === 'spuntinoMattina' ||
        modalePasto === 'spuntinoPomeriggio'
      ) {
        categoriaMatch =
          alimento.categoria === 'colazione' ||
          alimento.categoria === 'spuntino';
      }

      // Filtra per termine di ricerca
      if (searchTerm) {
        const termineMatch = nome
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return categoriaMatch && termineMatch;
      }

      return categoriaMatch;
    });
  }, [alimenti, modalePasto, searchTerm]);

  // ⭐ [NUOVO] Funzione per cambiare giorno
  const cambiaGiorno = (giorni) => {
    setDataSelezionata((dataAttuale) => {
      const nuovaData = new Date(dataAttuale);
      nuovaData.setDate(nuovaData.getDate() + giorni);
      return nuovaData;
    });
  };

  const vaiAdOggi = () => {
    setDataSelezionata(new Date());
  };

  // Loading
  if (isLoadingAlimenti) {
    // ... (stesso contenuto di prima)
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4'></div>
          <p className='text-gray-600 font-medium'>
            Caricamento database alimenti...
          </p>
          {user && (
            <p className='text-sm text-gray-500 mt-2'>
              Recupero i tuoi alimenti personalizzati
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 p-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-6'>
          {/* ⭐ [MODIFICATO] Navigazione Data */}
          <div className='flex items-center justify-center gap-2 mb-3'>
            <button
              onClick={() => cambiaGiorno(-1)}
              className='p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100'
            >
              <ChevronLeft className='w-5 h-5 text-gray-700' />
            </button>
            <button
              onClick={vaiAdOggi}
              className='px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center gap-2'
            >
              <CalendarDays className='w-5 h-5 text-green-600' />
              <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>
                {formattaDataUI(dataSelezionata)}
              </h1>
            </button>
            <button
              onClick={() => cambiaGiorno(1)}
              className='p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100'
            >
              <ChevronRight className='w-5 h-5 text-gray-700' />
            </button>
          </div>
          <p className='text-gray-600 text-sm'>
            Monitora tutti i macro e micronutrienti • Database completo
          </p>

          {/* Status Database */}
          <div className='flex items-center justify-center gap-3 mt-3'>
            {usaMongoDB ? (
              <div className='bg-green-100 border border-green-300 rounded-lg px-4 py-2 inline-flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                <p className='text-xs text-green-800 font-medium'>
                  ✅ Connesso a MongoDB • {Object.keys(alimenti).length}{' '}
                  alimenti
                  {numeroAlimentiPersonali > 0 &&
                    ` (${numeroAlimentiPersonali} personalizzati)`}
                </p>
              </div>
            ) : (
              // ... (status offline invariato)
              <div className='bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2 inline-flex items-center gap-2'>
                <AlertCircle className='w-4 h-4 text-yellow-600' />
                <p className='text-xs text-yellow-800 font-medium'>
                  ⚠️ Backend offline • Usando {Object.keys(alimenti).length}{' '}
                  alimenti locali
                </p>
              </div>
            )}

            <button
              onClick={caricaAlimenti}
              className='p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
              title='Ricarica alimenti'
            >
              <RefreshCw className='w-4 h-4 text-gray-600' />
            </button>

            {/* ⭐ [NUOVO] Indicatore Salvataggio */}
            {isSaving && (
              <div
                className='flex items-center gap-1 text-gray-500'
                title='Salvataggio...'
              >
                <Save className='w-4 h-4 animate-pulse' />
                <span className='text-xs'>Salvo...</span>
              </div>
            )}
          </div>
        </div>

        {/* Grid Principale */}
        <div className='grid lg:grid-cols-3 gap-6'>
          {/* Colonna Pasti */}
          <div className='lg:col-span-2 space-y-4'>
            {/* ⭐ [MODIFICATO] Mostra loading se sta caricando il tracker */}
            {isLoadingTracker ? (
              <div className='h-96 flex items-center justify-center bg-white rounded-xl shadow-md'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-600'></div>
              </div>
            ) : (
              <>
                <PastoCard
                  titolo='☀️ Colazione'
                  tipoPasto='colazione'
                  icona={Coffee}
                  pasti={pasti}
                  alimenti={alimenti}
                  setModalePasto={setModalePasto}
                  rimuoviAlimento={rimuoviAlimento}
                />
                <PastoCard
                  titolo='🍎 Spuntino Mattina'
                  tipoPasto='spuntinoMattina'
                  icona={Apple}
                  pasti={pasti}
                  alimenti={alimenti}
                  setModalePasto={setModalePasto}
                  rimuoviAlimento={rimuoviAlimento}
                />
                <PastoCard
                  titolo='🍽️ Pranzo'
                  tipoPasto='pranzo'
                  icona={Utensils}
                  pasti={pasti}
                  alimenti={alimenti}
                  setModalePasto={setModalePasto}
                  rimuoviAlimento={rimuoviAlimento}
                />
                <PastoCard
                  titolo='🍪 Spuntino Pomeriggio'
                  tipoPasto='spuntinoPomeriggio'
                  icona={Cookie}
                  pasti={pasti}
                  alimenti={alimenti}
                  setModalePasto={setModalePasto}
                  rimuoviAlimento={rimuoviAlimento}
                />
                <PastoCard
                  titolo='🌙 Cena'
                  tipoPasto='cena'
                  icona={Moon}
                  pasti={pasti}
                  alimenti={alimenti}
                  setModalePasto={setModalePasto}
                  rimuoviAlimento={rimuoviAlimento}
                />
              </>
            )}
          </div>

          {/* Colonna Riepilogo (INVARIATA) */}
          <div className='space-y-4'>
            {/* Card Totali */}
            <div className='bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white'>
              {/* ... (contenuto invariato) */}
              <div className='flex items-center gap-2 mb-4'>
                <Activity className='w-6 h-6' />
                <h2 className='text-xl font-bold'>Totali Giornalieri</h2>
              </div>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between items-center'>
                  <span>Proteine:</span>
                  <span className='font-bold text-lg'>
                    {totaliGiornalieri.proteine.toFixed(1)}g
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span>Carboidrati:</span>
                  <span className='font-bold text-lg'>
                    {totaliGiornalieri.carboidrati.toFixed(1)}g
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span>Grassi:</span>
                  <span className='font-bold text-lg'>
                    {totaliGiornalieri.grassi.toFixed(1)}g
                  </span>
                </div>
                <div className='flex justify-between items-center border-t border-green-400 pt-2 mt-2'>
                  <span>Calorie:</span>
                  <span className='font-bold text-xl'>
                    {totaliGiornalieri.calorie.toFixed(0)} kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Card Progressi */}
            <div className='bg-white rounded-xl shadow-md p-5'>
              {/* ... (contenuto invariato) */}
              <h3 className='text-lg font-bold mb-4 text-gray-800'>
                📊 Progressi Nutrienti
              </h3>
              <BarraProgresso
                label='Proteine'
                valore={totaliGiornalieri.proteine}
                obiettivo={obiettivi.proteine}
              />
              <BarraProgresso
                label='Carboidrati'
                valore={totaliGiornalieri.carboidrati}
                obiettivo={obiettivi.carboidrati}
              />
              <BarraProgresso
                label='Grassi'
                valore={totaliGiornalieri.grassi}
                obiettivo={obiettivi.grassi}
              />
              <BarraProgresso
                label='Fibre'
                valore={totaliGiornalieri.fibre}
                obiettivo={obiettivi.fibre}
              />
              <BarraProgresso
                label='Ferro'
                valore={totaliGiornalieri.ferro}
                obiettivo={obiettivi.ferro}
                unita='mg'
              />
              <BarraProgresso
                label='Calcio'
                valore={totaliGiornalieri.calcio}
                obiettivo={obiettivi.calcio}
                unita='mg'
              />
              <BarraProgresso
                label='Vitamina B12'
                valore={totaliGiornalieri.vitB12}
                obiettivo={obiettivi.vitB12}
                unita='mcg'
              />
              <BarraProgresso
                label='Zinco'
                valore={totaliGiornalieri.zinco}
                obiettivo={obiettivi.zinco}
                unita='mg'
              />
            </div>

            {/* Info Utente (INVARIATO) */}
            {user && (
              <div className='bg-blue-50 border border-blue-200 rounded-xl p-4'>
                {/* ... (contenuto invariato) */}
                <div className='flex items-center gap-2 mb-2'>
                  <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm'>
                    {user.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className='font-semibold text-blue-900 text-sm'>
                      {user.nome}
                    </div>
                    <div className='text-xs text-blue-600'>
                      Peso: {user.peso}kg • Att: {user.livelloAttivita}x
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Aggiungi Alimento (INVARIATO) */}
        {modalePasto && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn'>
            <div className='bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl'>
              {/* ... (contenuto invariato) */}
              <h2 className='text-2xl font-bold mb-4 text-gray-800'>
                Aggiungi alimento
              </h2>
              <div className='space-y-4'>
                {/* Ricerca */}
                <div>
                  <label className='block text-sm font-semibold mb-2 text-gray-700'>
                    🔍 Cerca alimento
                  </label>
                  <input
                    type='text'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder='Es: lenticchie, avena...'
                    className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all'
                    autoFocus
                  />
                </div>

                {/* Select Alimento */}
                <div>
                  <label className='block text-sm font-semibold mb-2 text-gray-700'>
                    🍽️ Alimento ({alimentiFiltrati.length} disponibili)
                  </label>
                  <select
                    value={alimentoSelezionato}
                    onChange={(e) => setAlimentoSelezionato(e.target.value)}
                    className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all'
                  >
                    <option value=''>Seleziona un alimento...</option>
                    {alimentiFiltrati.map(([nome]) => (
                      <option key={nome} value={nome}>
                        {nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantità */}
                {alimentoSelezionato && (
                  <div>
                    <label className='block text-sm font-semibold mb-2 text-gray-700'>
                      ⚖️ Quantità (grammi)
                    </label>
                    <input
                      type='number'
                      value={quantita}
                      onChange={(e) => setQuantita(Number(e.target.value))}
                      min='1'
                      step='10'
                      className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all'
                    />
                    <p className='text-xs text-gray-500 mt-2 flex items-center gap-1'>
                      💡 Porzione standard:{' '}
                      <span className='font-semibold'>
                        {alimenti[alimentoSelezionato]?.porzione || 100}g
                      </span>
                    </p>

                    {/* Preview Nutrienti */}
                    <div className='mt-3 bg-gray-50 p-3 rounded-lg'>
                      <div className='text-xs font-semibold text-gray-600 mb-2'>
                        Valori nutrizionali per {quantita}g:
                      </div>
                      <div className='grid grid-cols-3 gap-2 text-xs'>
                        <div>
                          <span className='text-gray-500'>Prot:</span>
                          <span className='font-bold ml-1'>
                            {(
                              (alimenti[alimentoSelezionato]?.proteine || 0) *
                              (quantita / 100)
                            ).toFixed(1)}
                            g
                          </span>
                        </div>
                        <div>
                          <span className='text-gray-500'>Carb:</span>
                          <span className='font-bold ml-1'>
                            {(
                              (alimenti[alimentoSelezionato]?.carboidrati ||
                                0) *
                              (quantita / 100)
                            ).toFixed(1)}
                            g
                          </span>
                        </div>
                        <div>
                          <span className='text-gray-500'>Kcal:</span>
                          <span className='font-bold ml-1'>
                            {(
                              (alimenti[alimentoSelezionato]?.calorie || 0) *
                              (quantita / 100)
                            ).toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className='flex gap-3 pt-2'>
                  <button
                    onClick={() => {
                      setModalePasto(null);
                      setSearchTerm('');
                      setAlimentoSelezionato('');
                      setQuantita(100);
                    }}
                    className='flex-1 p-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors'
                  >
                    Annulla
                  </button>
                  <button
                    onClick={aggiungiAlimento}
                    disabled={!alimentoSelezionato}
                    className='flex-1 p-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    Aggiungi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info (INVARIATO) */}
        <div className='text-center text-gray-600 mt-6 text-sm space-y-1'>
          {/* ... (contenuto invariato) */}
          <div className='flex items-center justify-center gap-4'>
            <span>💾 {usaMongoDB ? 'MongoDB' : 'Database locale'}</span>
            <span>•</span>
            <span>{Object.keys(alimenti).length} alimenti totali</span>
            {numeroAlimentiPersonali > 0 && (
              <>
                <span>•</span>
                <span className='text-green-600 font-semibold'>
                  {numeroAlimentiPersonali} personalizzati
                </span>
              </>
            )}
          </div>
          <p className='text-xs text-gray-500'>
            Tracker Nutrizionale Vegano © 2025 • Creato da Simone Izzo
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackerNutrizionaleVegano;
