import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ALIMENTI_HARDCODED } from '../data/alimentiHardcoded'; //

const ModalAggiungiAlimento = ({ onClose, onSalva, pastoSelezionato }) => {
  const { api } = useAuth();
  const [alimentiDB, setAlimentiDB] = useState({});
  const [alimentiCustom, setAlimentiCustom] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [alimentoSelezionato, setAlimentoSelezionato] = useState('');
  const [quantita, setQuantita] = useState('');

  // Carica sia gli alimenti pubblici che quelli custom
  useEffect(() => {
    const caricaTuttiAlimenti = async () => {
      setLoading(true);
      try {
        // 1. Carica pubblici (usa fallback se fallisce)
        let pubblici = ALIMENTI_HARDCODED;
        try {
          const resPubblici = await api.get('/alimenti');
          if (resPubblici.data.alimenti) {
            pubblici = resPubblici.data.alimenti;
          }
        } catch (e) {
          console.warn('Server alimenti pubblici offline, uso fallback');
        }

        // 2. Carica custom
        let custom = {};
        try {
          const resCustom = await api.get('/alimenti/miei');
          if (resCustom.data.alimenti) {
            custom = resCustom.data.alimenti;
          }
        } catch (e) {
          console.warn('Impossibile caricare alimenti custom', e);
        }

        setAlimentiDB(pubblici);
        setAlimentiCustom(custom);
      } catch (error) {
        console.error('Errore caricamento alimenti:', error);
      } finally {
        setLoading(false);
      }
    };
    caricaTuttiAlimenti();
  }, [api]);

  // Combina e filtra gli alimenti
  const alimentiFiltrati = React.useMemo(() => {
    const dbCompleto = { ...alimentiDB, ...alimentiCustom };
    const tutti = Object.entries(dbCompleto);

    if (!searchTerm) {
      return tutti;
    }

    return tutti.filter(([nome, _dati]) =>
      nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [alimentiDB, alimentiCustom, searchTerm]);

  const alimentoCompleto = alimentoSelezionato
    ? { ...alimentiDB, ...alimentiCustom }[alimentoSelezionato]
    : null;

  const handleSalva = (e) => {
    e.preventDefault();
    if (!alimentoCompleto || !quantita) return;

    const q = parseFloat(quantita);
    const fattore = q / 100;

    // Calcola i nutrienti per la porzione
    const alimentoCalcolato = {
      nome: alimentoSelezionato,
      quantita: q,
      proteine: (alimentoCompleto.proteine || 0) * fattore,
      carboidrati: (alimentoCompleto.carboidrati || 0) * fattore,
      grassi: (alimentoCompleto.grassi || 0) * fattore,
      fibre: (alimentoCompleto.fibre || 0) * fattore,
      ferro: (alimentoCompleto.ferro || 0) * fattore,
      calcio: (alimentoCompleto.calcio || 0) * fattore,
      vitB12: (alimentoCompleto.vitB12 || 0) * fattore,
      vitB2: (alimentoCompleto.vitB2 || 0) * fattore,
      vitD: (alimentoCompleto.vitD || 0) * fattore,
      omega3: (alimentoCompleto.omega3 || 0) * fattore,
      iodio: (alimentoCompleto.iodio || 0) * fattore,
      zinco: (alimentoCompleto.zinco || 0) * fattore,
      calorie: (alimentoCompleto.calorie || 0) * fattore,
    };

    onSalva(alimentoCalcolato);
    onClose();
  };

  const selezionaPorzione = () => {
    if (alimentoCompleto && alimentoCompleto.porzione) {
      setQuantita(alimentoCompleto.porzione.toString());
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl max-w-lg w-full max-h-[80vh] flex flex-col'>
        <div className='flex items-center justify-between p-4 border-b'>
          <h2 className='text-xl font-bold'>
            Aggiungi Alimento a {pastoSelezionato}
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <form onSubmit={handleSalva} className='p-4 space-y-4 overflow-y-auto'>
          {/* Ricerca */}
          <div className='relative'>
            <Search className='w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2' />
            <input
              type='text'
              placeholder='Cerca alimento...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full p-3 pl-10 border-2 border-gray-300 rounded-lg'
            />
          </div>

          {/* Select Alimento */}
          <div>
            <label className='block text-sm font-semibold mb-2'>Alimento</label>
            <select
              value={alimentoSelezionato}
              onChange={(e) => setAlimentoSelezionato(e.target.value)}
              className='w-full p-3 border-2 border-gray-300 rounded-lg'
              disabled={loading}
            >
              <option value=''>
                {loading ? 'Caricamento...' : '-- Seleziona --'}
              </option>
              {/* Alimenti Custom */}
              {Object.keys(alimentiCustom).length > 0 && (
                <optgroup label='I Miei Alimenti'>
                  {alimentiFiltrati
                    .filter(([nome, _]) => alimentiCustom[nome])
                    .map(([nome, _]) => (
                      <option key={nome} value={nome}>
                        {nome}
                      </option>
                    ))}
                </optgroup>
              )}
              {/* Alimenti DB Pubblico */}
              <optgroup label='Database Pubblico'>
                {alimentiFiltrati
                  .filter(([nome, _]) => !alimentiCustom[nome])
                  .map(([nome, _]) => (
                    <option key={nome} value={nome}>
                      {nome}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Quantità */}
          {alimentoSelezionato && (
            <div>
              <label className='block text-sm font-semibold mb-2'>
                Quantità (g)
              </label>
              <div className='flex gap-2'>
                <input
                  type='number'
                  value={quantita}
                  onChange={(e) => setQuantita(e.target.value)}
                  className='w-full p-3 border-2 border-gray-300 rounded-lg'
                  placeholder='es. 100'
                  required
                />
                <button
                  type='button'
                  onClick={selezionaPorzione}
                  className='px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200'
                >
                  Porzione ({alimentoCompleto.porzione}g)
                </button>
              </div>
            </div>
          )}
        </form>

        <div className='p-4 border-t mt-auto'>
          <button
            type='submit'
            onClick={handleSalva}
            disabled={!alimentoSelezionato || !quantita}
            className='w-full p-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300'
          >
            Aggiungi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAggiungiAlimento;
