import React, { useState, useMemo, useEffect } from 'react';
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
} from 'lucide-react';
import axios from 'axios';

// Database alimenti fallback (se MongoDB offline)
const ALIMENTI_FALLBACK = {
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

// ⭐ COMPONENTE PASTO CARD FUORI (fix hooks)
const PastoCard = ({
  titolo,
  tipoPasto,
  icona: Icona,
  pasti,
  alimenti,
  setModalePasto,
  rimuoviAlimento,
}) => {
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
    <div className='bg-white rounded-xl shadow-md p-4 border-2 border-gray-200'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <Icona className='w-5 h-5 text-green-600' />
          <h3 className='text-lg font-bold text-gray-800'>{titolo}</h3>
        </div>
        <button
          onClick={() => setModalePasto(tipoPasto)}
          className='p-2 bg-green-600 text-white rounded-lg hover:bg-green-700'
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
                className='flex justify-between items-center bg-gray-50 p-2 rounded-lg'
              >
                <div className='flex-1'>
                  <div className='font-semibold text-sm'>{item.nome}</div>
                  <div className='text-xs text-gray-600'>{item.quantita}g</div>
                </div>
                <button
                  onClick={() => rimuoviAlimento(tipoPasto, index)}
                  className='p-1 text-red-500 hover:bg-red-100 rounded'
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

// ⭐ COMPONENTE BARRA PROGRESSO FUORI (fix hooks)
const BarraProgresso = ({ label, valore, obiettivo, unita = 'g' }) => {
  const percentuale = Math.min((valore / obiettivo) * 100, 100);
  let colore = 'bg-green-500';
  if (percentuale < 70) colore = 'bg-red-500';
  else if (percentuale < 90) colore = 'bg-yellow-500';

  return (
    <div className='mb-3'>
      <div className='flex justify-between items-center mb-1'>
        <span className='text-sm font-semibold text-gray-700'>{label}</span>
        <span className='text-sm text-gray-600'>
          {valore.toFixed(1)}/{obiettivo} {unita}
        </span>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
        <div
          className={`h-3 transition-all duration-500 ${colore}`}
          style={{ width: `${percentuale}%` }}
        />
      </div>
    </div>
  );
};

const TrackerNutrizionaleVegano = () => {
  // Stati
  const [alimenti, setAlimenti] = useState(ALIMENTI_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [usaMongoDB, setUsaMongoDB] = useState(false);

  const [pasti, setPasti] = useState({
    colazione: [],
    spuntinoMattina: [],
    pranzo: [],
    spuntinoPomeriggio: [],
    cena: [],
  });

  const [modalePasto, setModalePasto] = useState(null);
  const [alimentoSelezionato, setAlimentoSelezionato] = useState('');
  const [quantita, setQuantita] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  const obiettivi = {
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

  // Carica alimenti da MongoDB
  useEffect(() => {
    const caricaAlimenti = async () => {
      try {
        console.log('🔄 Tentativo connessione MongoDB...');
        const response = await axios.get('/api/alimenti', { timeout: 10000 });

        console.log('📦 Risposta ricevuta:', response.data);

        if (
          response.data &&
          response.data.alimenti &&
          Object.keys(response.data.alimenti).length > 0
        ) {
          setAlimenti(response.data.alimenti);
          setUsaMongoDB(true);
          console.log(
            '✅ Connesso a MongoDB -',
            Object.keys(response.data.alimenti).length,
            'alimenti'
          );
        } else {
          console.warn('⚠️ Risposta API valida ma nessun alimento trovato');
          setAlimenti(ALIMENTI_FALLBACK);
          setUsaMongoDB(false);
        }
      } catch (error) {
        console.error('❌ Errore:', error.message);
        console.warn('⚠️ MongoDB non disponibile, uso alimenti locali');
        setAlimenti(ALIMENTI_FALLBACK);
        setUsaMongoDB(false);
      } finally {
        setLoading(false);
      }
    };

    caricaAlimenti();
  }, []);

  const totaliGiornalieri = useMemo(() => {
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

  const alimentiFiltrati = useMemo(() => {
    return Object.entries(alimenti).filter(([nome, alimento]) => {
      if (!modalePasto) return false;
      if (modalePasto === 'colazione')
        return alimento.categoria === 'colazione';
      if (
        modalePasto === 'spuntinoMattina' ||
        modalePasto === 'spuntinoPomeriggio'
      )
        return (
          alimento.categoria === 'colazione' ||
          alimento.categoria === 'spuntino'
        );
      if (searchTerm)
        return nome.toLowerCase().includes(searchTerm.toLowerCase());
      return true;
    });
  }, [alimenti, modalePasto, searchTerm]);

  // Loading
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Caricamento database alimenti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 p-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-6'>
          <div className='flex items-center justify-center gap-3 mb-3'>
            <Calendar className='w-10 h-10 text-green-600' />
            <h1 className='text-3xl md:text-4xl font-bold text-gray-800'>
              Tracker Nutrizionale Vegano
            </h1>
          </div>
          <p className='text-gray-600 text-sm'>
            Monitora tutti i macro e micronutrienti
          </p>

          {usaMongoDB ? (
            <div className='bg-green-100 border border-green-300 rounded-lg p-2 mt-2 max-w-md mx-auto'>
              <p className='text-xs text-green-800'>
                ✅ Connesso a MongoDB - {Object.keys(alimenti).length} alimenti
                disponibili
              </p>
            </div>
          ) : (
            <div className='bg-yellow-100 border border-yellow-300 rounded-lg p-2 mt-2 max-w-md mx-auto'>
              <p className='text-xs text-yellow-800'>
                ⚠️ Backend offline - Usando 7 alimenti locali
              </p>
            </div>
          )}
        </div>

        <div className='grid lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 space-y-4'>
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
          </div>

          <div className='space-y-4'>
            <div className='bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white'>
              <div className='flex items-center gap-2 mb-4'>
                <Activity className='w-6 h-6' />
                <h2 className='text-xl font-bold'>Totali Giornalieri</h2>
              </div>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>Proteine:</span>
                  <span className='font-bold'>
                    {totaliGiornalieri.proteine.toFixed(1)}g
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Carboidrati:</span>
                  <span className='font-bold'>
                    {totaliGiornalieri.carboidrati.toFixed(1)}g
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Grassi:</span>
                  <span className='font-bold'>
                    {totaliGiornalieri.grassi.toFixed(1)}g
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Calorie:</span>
                  <span className='font-bold'>
                    {totaliGiornalieri.calorie.toFixed(0)} kcal
                  </span>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-xl shadow-md p-5'>
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
          </div>
        </div>

        {modalePasto && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto'>
              <h2 className='text-2xl font-bold mb-4'>Aggiungi alimento</h2>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-semibold mb-2'>
                    Cerca alimento
                  </label>
                  <input
                    type='text'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder='Es: lenticchie...'
                    className='w-full p-2 border-2 border-gray-300 rounded-lg'
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold mb-2'>
                    Alimento ({alimentiFiltrati.length} risultati)
                  </label>
                  <select
                    value={alimentoSelezionato}
                    onChange={(e) => setAlimentoSelezionato(e.target.value)}
                    className='w-full p-2 border-2 border-gray-300 rounded-lg'
                  >
                    <option value=''>Seleziona...</option>
                    {alimentiFiltrati.map(([nome]) => (
                      <option key={nome} value={nome}>
                        {nome}
                      </option>
                    ))}
                  </select>
                </div>
                {alimentoSelezionato && (
                  <div>
                    <label className='block text-sm font-semibold mb-2'>
                      Quantità (grammi)
                    </label>
                    <input
                      type='number'
                      value={quantita}
                      onChange={(e) => setQuantita(Number(e.target.value))}
                      min='1'
                      step='10'
                      className='w-full p-2 border-2 border-gray-300 rounded-lg'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      Porzione standard:{' '}
                      {alimenti[alimentoSelezionato]?.porzione || 100}g
                    </p>
                  </div>
                )}
                <div className='flex gap-2'>
                  <button
                    onClick={() => {
                      setModalePasto(null);
                      setSearchTerm('');
                    }}
                    className='flex-1 p-2 bg-gray-200 rounded-lg hover:bg-gray-300'
                  >
                    Annulla
                  </button>
                  <button
                    onClick={aggiungiAlimento}
                    disabled={!alimentoSelezionato}
                    className='flex-1 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50'
                  >
                    Aggiungi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='text-center text-gray-600 mt-6 text-sm'>
          💾 {usaMongoDB ? 'MongoDB' : 'Database locale'} •{' '}
          {Object.keys(alimenti).length} alimenti
        </div>
      </div>
    </div>
  );
};

export default TrackerNutrizionaleVegano;
