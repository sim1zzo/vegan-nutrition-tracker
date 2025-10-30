import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Trash2, AlertTriangle, Moon, Sun, Bell } from 'lucide-react';

const Impostazioni = () => {
  const { user, aggiornaProfilo, eliminaAccount, logout } = useAuth();

  // Stato per le preferenze
  const [preferenze, setPreferenze] = useState(
    user.preferenze || {
      temaDark: false,
      lingua: 'it',
      notificheEmail: true,
    }
  );

  // Stato per la "danger zone"
  const [passwordEliminazione, setPasswordEliminazione] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Gestisce il cambio delle preferenze
  const handlePreferenzeChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setPreferenze((prev) => ({ ...prev, [name]: val }));
    setError('');
    setSuccess('');
  };

  // Salva le preferenze
  const handleSalvaPreferenze = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await aggiornaProfilo({ preferenze });

    if (result.success) {
      setSuccess(result.message || 'Impostazioni salvate!');
    } else {
      setError(result.message || 'Errore nel salvataggio.');
    }
    setLoading(false);
  };

  // Gestisce l'eliminazione dell'account
  const handleEliminaAccount = async () => {
    setError('');
    if (passwordEliminazione === '') {
      setError('Devi inserire la tua password per confermare.');
      return;
    }

    if (
      !window.confirm(
        'SEI ASSOLUTAMENTE SICURO? Questa azione è irreversibile e cancellerà tutti i tuoi dati (giornate, alimenti, profilo).'
      )
    ) {
      return;
    }

    setLoading(true);
    const result = await eliminaAccount(passwordEliminazione);

    if (!result.success) {
      setError(result.message || 'Errore. Password errata?');
      setLoading(false);
    }
    // Se ha successo, il contesto Auth si occuperà del logout e del redirect.
  };

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-8'>
      {/* Messaggi di stato */}
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
          {error}
        </div>
      )}
      {success && (
        <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg'>
          {success}
        </div>
      )}

      {/* === Sezione Preferenze === */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='p-6 border-b'>
          <h2 className='text-xl font-bold text-gray-800 flex items-center gap-3'>
            <Settings className='w-6 h-6 text-green-600' />
            Impostazioni App
          </h2>
          <p className='text-sm text-gray-600 mt-1'>
            Personalizza l'esperienza dell'applicazione.
          </p>
        </div>
        <div className='p-6 space-y-6'>
          {/* Tema Dark */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              {preferenze.temaDark ? (
                <Moon className='w-5 h-5 text-gray-700' />
              ) : (
                <Sun className='w-5 h-5 text-gray-700' />
              )}
              <div>
                <label htmlFor='temaDark' className='font-medium text-gray-800'>
                  Tema Scuro
                </label>
                <p className='text-xs text-gray-600'>
                  Attiva la modalità scura (richiede ricaricamento)
                </p>
              </div>
            </div>
            <label className='inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                name='temaDark'
                id='temaDark'
                checked={preferenze.temaDark}
                onChange={handlePreferenzeChange}
                className='sr-only peer'
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Notifiche Email */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Bell className='w-5 h-5 text-gray-700' />
              <div>
                <label
                  htmlFor='notificheEmail'
                  className='font-medium text-gray-800'
                >
                  Notifiche Email
                </label>
                <p className='text-xs text-gray-600'>
                  Ricevi report settimanali e avvisi
                </p>
              </div>
            </div>
            <label className='inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                name='notificheEmail'
                id='notificheEmail'
                checked={preferenze.notificheEmail}
                onChange={handlePreferenzeChange}
                className='sr-only peer'
              />
              <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Bottone Salva Preferenze */}
          <div className='flex justify-end'>
            <button
              onClick={handleSalvaPreferenze}
              disabled={loading}
              className='flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50'
            >
              {loading ? 'Salvataggio...' : 'Salva Impostazioni'}
            </button>
          </div>
        </div>
      </div>

      {/* === Sezione Danger Zone === */}
      <div className='bg-white rounded-lg shadow-sm border-2 border-red-300'>
        <div className='p-6 border-b border-red-200 bg-red-50 rounded-t-lg'>
          <h2 className='text-xl font-bold text-red-800 flex items-center gap-3'>
            <AlertTriangle className='w-6 h-6' />
            Danger Zone
          </h2>
          <p className='text-sm text-red-700 mt-1'>
            Azioni irreversibili. Procedi con cautela.
          </p>
        </div>
        <div className='p-6 space-y-4'>
          <h3 className='font-semibold text-gray-800'>Elimina Account</h3>
          <p className='text-sm text-gray-600'>
            Questa azione cancellerà permanentemente il tuo profilo, tutte le
            tue giornate salvate e i tuoi alimenti personalizzati. Non potrà
            essere annullata.
          </p>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Inserisci la tua password per confermare:
            </label>
            <input
              type='password'
              value={passwordEliminazione}
              onChange={(e) => {
                setPasswordEliminazione(e.target.value);
                setError('');
              }}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent'
              placeholder='La tua password'
            />
          </div>
          <div className='flex justify-end'>
            <button
              onClick={handleEliminaAccount}
              disabled={loading}
              className='flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50'
            >
              <Trash2 className='w-5 h-5' />
              {loading ? 'Eliminazione...' : 'Elimina il mio account'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottone Logout (già presente in Header, ma utile qui per completezza) */}
      <div className='text-center mt-4'>
        <button
          onClick={logout}
          className='text-gray-500 hover:text-red-600 text-sm font-medium'
        >
          Esegui Logout
        </button>
      </div>
    </div>
  );
};

export default Impostazioni;
