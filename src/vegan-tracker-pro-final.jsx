import React, { useState, useMemo } from 'react';
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
import useAlimenti from './hooks/useAlimenti';

const TrackerNutrizionaleVegano = () => {
  // ⭐ NUOVO: Usa hook per caricare alimenti dal backend
  const {
    alimenti: ALIMENTI_DATABASE,
    loading: loadingAlimenti,
    useHardcoded,
    aggiungiAlimentoCustom,
    cercaAlimenti,
  } = useAlimenti();

  const [pasti, setPasti] = useState({
    colazione: [],
    spuntinoMattina: [],
    pranzo: [],
    spuntinoPomeriggio: [],
    cena: [],
  });

  const [modalePasto, setModalePasto] = useState(null);
  const [alimentoSelezionato, setAlimentoSelezionato] = useState('');
  const [quantita, setQuantita] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Mostra loading iniziale
  if (loadingAlimenti) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Caricamento database alimenti...</p>
        </div>
      </div>
    );
  }

  // Calcola totali (codice esistente invariato)
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
        const alimento = ALIMENTI_DATABASE[item.nome];
        const moltiplicatore = item.quantita / 100;

        Object.keys(totali).forEach((nutriente) => {
          totali[nutriente] += alimento[nutriente] * moltiplicatore;
        });
      });

    return totali;
  }, [pasti, ALIMENTI_DATABASE]);

  const aggiungiAlimento = () => {
    if (!alimentoSelezionato || !modalePasto) return;

    const nuovoItem = {
      nome: alimentoSelezionato,
      quantita: quantita,
    };

    setPasti((prev) => ({
      ...prev,
      [modalePasto]: [...prev[modalePasto], nuovoItem],
    }));

    setAlimentoSelezionato('');
    setQuantita(1);
  };

  // ⭐ NUOVO: Gestione alimento custom
  const handleAggiungiCustom = async (datiAlimento) => {
    const result = await aggiungiAlimentoCustom(datiAlimento);
    if (result.success) {
      alert('Alimento custom aggiunto con successo!');
      setShowAddCustom(false);
    } else {
      alert('Errore: ' + result.message);
    }
  };

  // ⭐ NUOVO: Filtro alimenti con ricerca
  const alimentiFiltrati = useMemo(() => {
    return Object.entries(ALIMENTI_DATABASE).filter(([nome, alimento]) => {
      if (!modalePasto) return false;

      // Filtro categoria come prima
      if (modalePasto === 'colazione')
        return alimento.categoria === 'colazione';
      if (
        modalePasto === 'spuntinoMattina' ||
        modalePasto === 'spuntinoPomeriggio'
      )
        return (
          alimento.categoria === 'spuntino' ||
          alimento.categoria === 'colazione'
        );

      // Filtro ricerca testuale
      if (searchTerm) {
        return nome.toLowerCase().includes(searchTerm.toLowerCase());
      }

      return true;
    });
  }, [ALIMENTI_DATABASE, modalePasto, searchTerm]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 p-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-6'>
          <div className='flex items-center justify-center gap-3 mb-3'>
            <Calendar className='w-10 h-10 text-green-600' />
            <h1 className='text-3xl md:text-4xl font-bold text-gray-800'>
              Tracker Nutrizionale Vegano
            </h1>
          </div>

          {/* ⭐ NUOVO: Indicatore fonte dati */}
          {useHardcoded && (
            <div className='bg-yellow-100 border border-yellow-300 rounded-lg p-2 mt-2 max-w-md mx-auto'>
              <p className='text-xs text-yellow-800'>
                ⚠️ Backend non disponibile - Usando database locale (offline)
              </p>
            </div>
          )}
        </div>

        {/* Modal aggiunta alimento (con ricerca) */}
        {modalePasto && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto'>
              <h2 className='text-2xl font-bold mb-4 text-gray-800'>
                Aggiungi alimento
              </h2>

              <div className='space-y-4'>
                {/* ⭐ NUOVO: Barra ricerca */}
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
                      {ALIMENTI_DATABASE[alimentoSelezionato].porzione}g
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
                    onClick={() => {
                      aggiungiAlimento();
                      setSearchTerm('');
                    }}
                    disabled={!alimentoSelezionato}
                    className='flex-1 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50'
                  >
                    Aggiungi
                  </button>
                </div>

                {/* ⭐ NUOVO: Bottone alimento custom */}
                {!useHardcoded && (
                  <button
                    onClick={() => setShowAddCustom(true)}
                    className='w-full p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm'
                  >
                    + Crea alimento personalizzato
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Resto del componente invariato... */}
        <div className='text-center text-gray-600 mt-6'>
          💾 Database: {useHardcoded ? 'Locale (Offline)' : 'MongoDB (Online)'}{' '}
          • {Object.keys(ALIMENTI_DATABASE).length} alimenti disponibili
        </div>
      </div>
    </div>
  );
};

export default TrackerNutrizionaleVegano;
