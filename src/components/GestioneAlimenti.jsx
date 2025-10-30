import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Package,
  Globe,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Stato iniziale pulito per il form
const initialState = {
  nome: '',
  categoria: 'pranzo',
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
  porzione: 100,
  isPublico: false, // Flag per la visibilità
};

const GestioneAlimenti = ({ onClose, onAlimentoCreato }) => {
  const { api } = useAuth();
  const [alimenti, setAlimenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAperto, setModalAperto] = useState(false);
  const [alimentoCorrente, setAlimentoCorrente] = useState(null);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState(initialState);

  // Carica alimenti personalizzati
  useEffect(() => {
    caricaAlimenti();
  }, []);

  const caricaAlimenti = async () => {
    try {
      setLoading(true);
      // La rotta 'miei' ora restituisce un array completo
      const response = await api.get('/alimenti/miei');
      setAlimenti(response.data.alimentiArray || []);
    } catch (error) {
      console.error('Errore caricamento alimenti:', error);
      setError('Errore nel caricamento degli alimenti');
    } finally {
      setLoading(false);
    }
  };

  // Gestore modifiche form (gestisce testo, numeri e checkbox)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let val;
    if (type === 'checkbox') {
      val = checked;
    } else if (type === 'number') {
      // Permette all'utente di cancellare il campo (diventa stringa vuota)
      // Verrà convertito in 0 prima di salvare
      val = value === '' ? '' : value;
    } else {
      val = value;
    }

    setFormData({
      ...formData,
      [name]: val,
    });
  };

  // Helper per assicurarsi che i tipi di dato siano corretti prima dell'invio
  const parseFormPrimaDiSalvare = (dati) => {
    const datiPuliti = { ...dati };
    for (const key in datiPuliti) {
      // Converte tutti i campi numerici (anche stringhe vuote) in numeri (0)
      if (key !== 'nome' && key !== 'categoria' && key !== 'isPublico') {
        datiPuliti[key] = parseFloat(datiPuliti[key]) || 0;
      }
    }
    // Assicura che gli altri campi siano del tipo corretto
    datiPuliti.nome = String(datiPuliti.nome).trim();
    datiPuliti.categoria = String(datiPuliti.categoria);
    datiPuliti.isPublico = Boolean(datiPuliti.isPublico);

    return datiPuliti;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const datiDaInviare = parseFormPrimaDiSalvare(formData);

    if (!datiDaInviare.nome || !datiDaInviare.categoria) {
      setError('Nome e Categoria sono obbligatori.');
      return;
    }

    try {
      if (alimentoCorrente) {
        // UPDATE
        const response = await api.put(
          `/alimenti/${alimentoCorrente._id}`,
          datiDaInviare
        );
        setAlimenti(
          alimenti.map((a) =>
            a._id === alimentoCorrente._id ? response.data.alimento : a
          )
        );
      } else {
        // CREATE
        const response = await api.post('/alimenti', datiDaInviare);
        setAlimenti([...alimenti, response.data.alimento]);
        onAlimentoCreato?.(response.data.alimento);
      }

      resetForm();
      setModalAperto(false);
    } catch (error) {
      setError(
        error.response?.data?.message || "Errore nel salvataggio dell'alimento"
      );
    }
  };

  const handleElimina = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo alimento?'))
      return;

    try {
      await api.delete(`/alimenti/${id}`);
      setAlimenti(alimenti.filter((a) => a._id !== id));
    } catch (error) {
      setError("Errore nell'eliminazione dell'alimento");
    }
  };

  const handleModifica = (alimento) => {
    setAlimentoCorrente(alimento);
    // Popola il form con i dati dell'alimento
    setFormData({
      nome: alimento.nome || '',
      categoria: alimento.categoria || 'pranzo',
      proteine: alimento.proteine || 0,
      carboidrati: alimento.carboidrati || 0,
      grassi: alimento.grassi || 0,
      fibre: alimento.fibre || 0,
      ferro: alimento.ferro || 0,
      calcio: alimento.calcio || 0,
      vitB12: alimento.vitB12 || 0,
      vitB2: alimento.vitB2 || 0,
      vitD: alimento.vitD || 0,
      omega3: alimento.omega3 || 0,
      iodio: alimento.iodio || 0,
      zinco: alimento.zinco || 0,
      calorie: alimento.calorie || 0,
      porzione: alimento.porzione || 100,
      isPublico: alimento.isPublico || false, // Popola il flag
    });
    setModalAperto(true);
  };

  const handleNuovo = () => {
    resetForm();
    setModalAperto(true);
  };

  const resetForm = () => {
    setAlimentoCorrente(null);
    setFormData(initialState); // Usa lo stato iniziale pulito
    setError('');
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center'>
                <Package className='w-6 h-6 text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-gray-800'>
                  I Miei Alimenti
                </h1>
                <p className='text-gray-600 text-sm'>
                  Gestisci i tuoi alimenti personalizzati
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={handleNuovo}
                className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all'
              >
                <Plus className='w-5 h-5' />
                Nuovo Alimento
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className='px-4 py-2 text-gray-600 hover:text-gray-800'
                >
                  <X className='w-6 h-6' />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4'>
            {error}
          </div>
        )}

        {/* Lista Alimenti */}
        <div className='bg-white rounded-lg shadow-sm p-6'>
          {loading ? (
            <div className='text-center py-12'>
              <div className='animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto'></div>
              <p className='text-gray-500 mt-3'>Caricamento...</p>
            </div>
          ) : alimenti.length === 0 ? (
            <div className='text-center py-12'>
              <Package className='w-16 h-16 text-gray-300 mx-auto mb-4' />
              <p className='text-gray-500 text-lg'>
                Nessun alimento personalizzato
              </p>
              <p className='text-gray-400 text-sm mt-2'>
                Crea il tuo primo alimento per iniziare
              </p>
            </div>
          ) : (
            <div className='grid gap-4'>
              {alimenti.map((alimento) => (
                <div
                  key={alimento._id}
                  className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2 flex-wrap'>
                        <h3 className='font-semibold text-lg text-gray-800'>
                          {alimento.nome}
                        </h3>
                        <span className='text-xs bg-green-100 text-green-700 px-2 py-1 rounded'>
                          {alimento.categoria}
                        </span>
                        {/* BADGE PUBBLICO/PRIVATO */}
                        {alimento.isPublico ? (
                          <span className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1'>
                            <Globe className='w-3 h-3' />
                            Pubblico
                            {/* Mostra lo stato di verifica */}
                            {!alimento.verificato && (
                              <span className='ml-1 flex items-center gap-1 text-yellow-700'>
                                (<AlertTriangle className='w-3 h-3' /> In
                                verifica)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className='text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1'>
                            <Lock className='w-3 h-3' /> Privato
                          </span>
                        )}
                      </div>

                      {/* Valori Nutrizionali */}
                      <div className='grid grid-cols-4 md:grid-cols-8 gap-3 mt-3'>
                        <div className='text-center'>
                          <div className='text-xs text-gray-500'>Proteine</div>
                          <div className='font-semibold text-sm text-blue-600'>
                            {alimento.proteine}g
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-xs text-gray-500'>Carbo</div>
                          <div className='font-semibold text-sm text-green-600'>
                            {alimento.carboidrati}g
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-xs text-gray-500'>Grassi</div>
                          <div className='font-semibold text-sm text-yellow-600'>
                            {alimento.grassi}g
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-xs text-gray-500'>Calorie</div>
                          <div className='font-semibold text-sm text-purple-600'>
                            {alimento.calorie}
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-xs text-gray-500'>Ferro</div>
                          <div className='font-semibold text-sm text-red-600'>
                            {alimento.ferro}mg
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-xs text-gray-500'>Calcio</div>
                          <div className='font-semibold text-sm text-orange-600'>
                            {alimento.calcio}mg
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-xs text-gray-500'>B12</div>
                          <div className='font-semibold text-sm text-pink-600'>
                            {alimento.vitB12}µg
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-xs text-gray-500'>Porzione</div>
                          <div className='font-semibold text-sm text-gray-700'>
                            {alimento.porzione}g
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Azioni */}
                    <div className='flex items-center gap-2 ml-4'>
                      <button
                        onClick={() => handleModifica(alimento)}
                        className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                      >
                        <Edit2 className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleElimina(alimento._id)}
                        className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                      >
                        <Trash2 className='w-5 h-5' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Crea/Modifica Alimento */}
      {modalAperto && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10'>
              <h2 className='text-xl font-bold text-gray-800'>
                {alimentoCorrente ? 'Modifica Alimento' : 'Nuovo Alimento'}
              </h2>
              <button
                onClick={() => {
                  setModalAperto(false);
                  resetForm();
                }}
                className='text-gray-500 hover:text-gray-700'
              >
                <X className='w-6 h-6' />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='p-6 space-y-6'>
              {/* Nome e Categoria */}
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Nome Alimento *
                  </label>
                  <input
                    type='text'
                    name='nome'
                    value={formData.nome}
                    onChange={handleChange}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    placeholder='Es: Mio Burger Vegano'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Categoria *
                  </label>
                  <select
                    name='categoria'
                    value={formData.categoria}
                    onChange={handleChange}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    required
                  >
                    <option value='colazione'>Colazione</option>
                    <option value='pranzo'>Pranzo/Cena</option>
                    <option value='spuntino'>Spuntino</option>
                    <option value='verdura'>Verdura</option>
                    <option value='condimento'>Condimento</option>
                    <option value='integratore'>Integratore</option>
                  </select>
                </div>
              </div>

              {/* Porzione e Visibilità */}
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Porzione Standard (g) *
                  </label>
                  <input
                    type='number'
                    name='porzione'
                    value={formData.porzione}
                    onChange={handleChange}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                    step='1'
                    min='1'
                    placeholder='100'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Visibilità
                  </label>
                  <div className='flex items-center gap-3 bg-gray-50 border border-gray-200 p-3 rounded-lg h-full'>
                    <input
                      type='checkbox'
                      name='isPublico'
                      id='isPublico'
                      checked={formData.isPublico}
                      onChange={handleChange}
                      className='h-5 w-5 text-green-600 rounded focus:ring-green-500'
                    />
                    <div>
                      <label
                        htmlFor='isPublico'
                        className='font-medium text-gray-800'
                      >
                        Rendi Pubblico
                      </label>
                      <p className='text-xs text-gray-600'>
                        Proponi questo alimento per il database pubblico
                        (richiede verifica).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Macronutrienti */}
              <div>
                <h3 className='font-semibold text-gray-800 mb-3'>
                  Macronutrienti (per 100g)
                </h3>
                <div className='grid md:grid-cols-4 gap-4'>
                  <div>
                    <label className='block text-sm text-gray-600 mb-1'>
                      Proteine (g)
                    </label>
                    <input
                      type='number'
                      name='proteine'
                      value={formData.proteine}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                      step='0.1'
                      min='0'
                      placeholder='0'
                    />
                  </div>
                  <div>
                    <label className='block text-sm text-gray-600 mb-1'>
                      Carboidrati (g)
                    </label>
                    <input
                      type='number'
                      name='carboidrati'
                      value={formData.carboidrati}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                      step='0.1'
                      min='0'
                      placeholder='0'
                    />
                  </div>
                  <div>
                    <label className='block text-sm text-gray-600 mb-1'>
                      Grassi (g)
                    </label>
                    <input
                      type='number'
                      name='grassi'
                      value={formData.grassi}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                      step='0.1'
                      min='0'
                      placeholder='0'
                    />
                  </div>
                  <div>
                    <label className='block text-sm text-gray-600 mb-1'>
                      Fibre (g)
                    </label>
                    <input
                      type='number'
                      name='fibre'
                      value={formData.fibre}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                      step='0.1'
                      min='0'
                      placeholder='0'
                    />
                  </div>
                </div>
              </div>

              {/* Micronutrienti */}
              <div>
                <h3 className='font-semibold text-gray-800 mb-3'>
                  Micronutrienti (per 100g)
                </h3>
                <div className='grid md:grid-cols-4 gap-4'>
                  <div>
                    <label className='block text-sm text-gray-600 mb-1'>
                      Ferro (mg)
                    </label>
                    <input
                      type='number'
                      name='ferro'
                      value={formData.ferro}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                      step='0.1'
                      min='0'
                      placeholder='0'
                    />
                  </div>
                  <div>
                    <label className='block text-sm text-gray-600 mb-1'>
                      Calcio (mg)
                    </label>
                    <input
                      type='number'
                      name='calcio'
                      value={formData.calcio}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                      step='0.1'
                      min='0'
                      placeholder='0'
                    />
                  </div>
                  <div>
                    <label className='block text-sm text-gray-600 mb-1'>
                      Zinco (mg)
                    </label>
                    <input
                      type='number'
                      name='zinco'
                      value={formData.zinco}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                      step='0.1'
                      min='0'
                      placeholder='0'
                    />
                  </div>
                  <div>
                    <label className='block text-sm text-gray-600 mb-1'>
                      Iodio (µg)
                    </label>
                    <input
                      type='number'
                      name='iodio'
                      value={formData.iodio}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                      step='0.1'
                      min='0'
                      placeholder='0'
                    />
                  </div>
                </div>
              </div>

              {/* Vitamine */}
              <div>
                <h3 className='font-semibold text-gray-800 mb-3'>
                  Vitamine (per 100g)
                </h3>
                <div className='grid md:grid-cols-4 gap-4'>
                  <div>
                    <label className='block text-sm text-gray-600 mb-1'>
                      Vitamina B12 (µg)
                    </label>
                    <input
                      type='number'
                      name='vitB12'
                      value={formData.vitB12}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                      step='0.1'
                      min='0'
                      placeholder='0'
                    />
                  </div>
                  <div>
                    <label className='block text-sm text-gray-600 mb-1'>
                      Vitamina B2 (mg)
                    </label>
                    <input
                      type='number'
                      name='vitB2'
                      value={formData.vitB2}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                      step='0.01'
                      min='0'
                      placeholder='0'
                    />
                  </div>
                  <div>
                    <label className='block text-sm text-gray-600 mb-1'>
                      Vitamina D (µg)
                    </label>
                    <input
                      type='number'
                      name='vitD'
                      value={formData.vitD}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                      step='0.1'
                      min='0'
                      placeholder='0'
                    />
                  </div>
                  <div>
                    <label className='block text-sm text-gray-600 mb-1'>
                      Omega-3 (g)
                    </label>
                    <input
                      type='number'
                      name='omega3'
                      value={formData.omega3}
                      onChange={handleChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                      step='0.1'
                      min='0'
                      placeholder='0'
                    />
                  </div>
                </div>
              </div>

              {/* Calorie */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Calorie (kcal per 100g)
                </label>
                <input
                  type='number'
                  name='calorie'
                  value={formData.calorie}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg'
                  step='1'
                  min='0'
                  placeholder='0'
                />
              </div>

              {/* Buttons */}
              <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
                <button
                  type='button'
                  onClick={() => {
                    setModalAperto(false);
                    resetForm();
                  }}
                  className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  Annulla
                </button>
                <button
                  type='submit'
                  className='flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all'
                >
                  <Save className='w-5 h-5' />
                  {alimentoCorrente ? 'Salva Modifiche' : 'Crea Alimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestioneAlimenti;
