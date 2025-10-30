import React, { useState, useEffect } from 'react';
import { X, BookOpen, Save, Trash2, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ModalGestioneRicette = ({ onClose, pastoCorrente, onCaricaRicetta }) => {
  const { api } = useAuth();
  const [ricette, setRicette] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [nomeRicetta, setNomeRicetta] = useState('');
  const [vista, setVista] = useState('carica'); // 'carica' o 'salva'

  useEffect(() => {
    caricaRicette();
  }, []);

  const caricaRicette = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/ricette');
      setRicette(response.data.ricette || []);
    } catch (err) {
      setError('Impossibile caricare le ricette');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvaRicetta = async () => {
    if (!nomeRicetta || pastoCorrente.length === 0) {
      setError('Inserisci un nome e assicurati che il pasto non sia vuoto.');
      return;
    }
    setLoading(true);
    setError('');

    // Filtra solo i dati essenziali degli alimenti
    const alimentiRicetta = pastoCorrente.map((a) => ({
      nome: a.nome,
      quantita: a.quantita,
      proteine: a.proteine,
      carboidrati: a.carboidrati,
      grassi: a.grassi,
      calorie: a.calorie,
    }));

    try {
      const response = await api.post('/api/ricette', {
        nome: nomeRicetta,
        alimenti: alimentiRicetta,
      });
      setRicette(response.data.ricette);
      setVista('carica'); // Torna alla vista di caricamento
      setNomeRicetta('');
    } catch (err) {
      setError(err.response?.data?.message || 'Errore salvataggio ricetta');
    } finally {
      setLoading(false);
    }
  };

  const handleCaricaRicetta = (ricetta) => {
    onCaricaRicetta(ricetta);
    onClose();
  };

  const handleEliminaRicetta = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa ricetta?'))
      return;

    setLoading(true);
    try {
      const response = await api.delete(`/api/ricette/${id}`);
      setRicette(response.data.ricette);
    } catch (err) {
      setError('Errore eliminazione ricetta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl max-w-md w-full max-h-[80vh] flex flex-col'>
        <div className='flex items-center justify-between p-4 border-b'>
          <h2 className='text-xl font-bold flex items-center gap-2'>
            <BookOpen /> Gestione Ricette
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Tabs */}
        <div className='flex p-2 bg-gray-100 gap-2'>
          <button
            onClick={() => setVista('carica')}
            className={`flex-1 p-2 rounded-lg font-semibold ${
              vista === 'carica' ? 'bg-white shadow' : 'hover:bg-gray-200'
            }`}
          >
            Carica Ricetta
          </button>
          <button
            onClick={() => setVista('salva')}
            className={`flex-1 p-2 rounded-lg font-semibold ${
              vista === 'salva' ? 'bg-white shadow' : 'hover:bg-gray-200'
            }`}
          >
            Salva Pasto Corrente
          </button>
        </div>

        {/* Contenuto */}
        <div className='p-4 space-y-4 overflow-y-auto'>
          {error && <p className='text-red-500 text-sm'>{error}</p>}

          {/* Vista Carica Ricetta */}
          {vista === 'carica' && (
            <div className='space-y-2'>
              {loading && <Loader className='animate-spin mx-auto' />}
              {!loading && ricette.length === 0 && (
                <p className='text-gray-500 text-center py-4'>
                  Nessuna ricetta salvata.
                </p>
              )}
              {!loading &&
                ricette.map((ricetta) => (
                  <div
                    key={ricetta._id}
                    className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                  >
                    <div>
                      <p className='font-semibold'>{ricetta.nome}</p>
                      <p className='text-xs text-gray-500'>
                        {ricetta.alimenti.length} alimenti
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleCaricaRicetta(ricetta)}
                        className='p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200'
                      >
                        Carica
                      </button>
                      <button
                        onClick={() => handleEliminaRicetta(ricetta._id)}
                        className='p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Vista Salva Ricetta */}
          {vista === 'salva' && (
            <div className='space-y-4'>
              <p className='text-sm'>
                Salva i {pastoCorrente.length} alimenti di questo pasto come una
                nuova ricetta.
              </p>
              <div>
                <label className='block text-sm font-semibold mb-2'>
                  Nome Ricetta
                </label>
                <input
                  type='text'
                  value={nomeRicetta}
                  onChange={(e) => setNomeRicetta(e.target.value)}
                  placeholder='Es. Colazione Proteica'
                  className='w-full p-3 border-2 border-gray-300 rounded-lg'
                />
              </div>
              <button
                onClick={handleSalvaRicetta}
                disabled={loading || !nomeRicetta || pastoCorrente.length === 0}
                className='w-full p-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 disabled:bg-gray-300'
              >
                {loading ? 'Salvataggio...' : 'Salva Ricetta'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalGestioneRicette;
