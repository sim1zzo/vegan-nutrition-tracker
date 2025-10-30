import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Weight,
  Activity,
  Calendar,
  Users,
  Lock,
  Save,
  AlertCircle,
} from 'lucide-react';

const Profilo = () => {
  const { user, aggiornaProfilo, cambiaPassword } = useAuth();

  // Stato per i dati del profilo
  const [formData, setFormData] = useState({
    nome: user.nome || '',
    cognome: user.cognome || '',
    email: user.email || '',
    peso: user.peso || 0,
    altezza: user.altezza || 0,
    eta: user.eta || 0,
    sesso: user.sesso || '',
    livelloAttivita: user.livelloAttivita || 1.55,
  });

  // Stato per la password
  const [passwordData, setPasswordData] = useState({
    passwordCorrente: '',
    nuovaPassword: '',
    confermaPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
    setError('');
    setSuccess('');
  };

  // Gestisce salvataggio dati profilo
  const handleSubmitProfilo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const datiDaAggiornare = {
      nome: formData.nome,
      cognome: formData.cognome,
      peso: parseFloat(formData.peso),
      altezza: parseInt(formData.altezza),
      eta: parseInt(formData.eta),
      sesso: formData.sesso,
      livelloAttivita: parseFloat(formData.livelloAttivita),
    };

    const result = await aggiornaProfilo(datiDaAggiornare);

    if (result.success) {
      setSuccess(result.message || 'Profilo aggiornato con successo!');
    } else {
      setError(result.message || "Errore durante l'aggiornamento.");
    }
    setLoading(false);
  };

  // Gestisce salvataggio nuova password
  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.nuovaPassword !== passwordData.confermaPassword) {
      setError('Le nuove password non coincidono');
      setLoading(false);
      return;
    }

    if (passwordData.nuovaPassword.length < 6) {
      setError('La nuova password deve essere di almeno 6 caratteri');
      setLoading(false);
      return;
    }

    const result = await cambiaPassword(
      passwordData.passwordCorrente,
      passwordData.nuovaPassword
    );

    if (result.success) {
      setSuccess(result.message || 'Password aggiornata con successo!');
      setPasswordData({
        passwordCorrente: '',
        nuovaPassword: '',
        confermaPassword: '',
      });
    } else {
      setError(result.message || "Errore durante l'aggiornamento.");
    }
    setLoading(false);
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

      {/* === Sezione Dati Personali === */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='p-6 border-b'>
          <h2 className='text-xl font-bold text-gray-800 flex items-center gap-3'>
            <User className='w-6 h-6 text-green-600' />
            Dati Personali e Fisici
          </h2>
          <p className='text-sm text-gray-600 mt-1'>
            Questi dati vengono usati per calcolare i tuoi obiettivi
            nutrizionali.
          </p>
        </div>
        <form onSubmit={handleSubmitProfilo} className='p-6 space-y-6'>
          <div className='grid md:grid-cols-2 gap-6'>
            {/* Nome */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Nome
              </label>
              <input
                type='text'
                name='nome'
                value={formData.nome}
                onChange={handleChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg'
              />
            </div>
            {/* Cognome */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Cognome
              </label>
              <input
                type='text'
                name='cognome'
                value={formData.cognome}
                onChange={handleChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg'
              />
            </div>
          </div>
          <div className='grid md:grid-cols-3 gap-6'>
            {/* Peso */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Peso (kg)
              </label>
              <input
                type='number'
                name='peso'
                value={formData.peso}
                onChange={handleChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg'
              />
            </div>
            {/* Altezza */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Altezza (cm)
              </label>
              <input
                type='number'
                name='altezza'
                value={formData.altezza}
                onChange={handleChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg'
              />
            </div>
            {/* Età */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Età
              </label>
              <input
                type='number'
                name='eta'
                value={formData.eta}
                onChange={handleChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg'
              />
            </div>
          </div>
          <div className='grid md:grid-cols-2 gap-6'>
            {/* Sesso */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Sesso
              </label>
              <select
                name='sesso'
                value={formData.sesso}
                onChange={handleChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg'
              >
                <option value=''>Non specificato</option>
                <option value='M'>Maschio</option>
                <option value='F'>Femmina</option>
              </select>
            </div>
            {/* Livello Attività */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Livello Attività Fisica
              </label>
              <select
                name='livelloAttivita'
                value={formData.livelloAttivita}
                onChange={handleChange}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg'
              >
                <option value={1.2}>Sedentario (ufficio)</option>
                <option value={1.375}>Leggero (1-3 gg/settimana)</option>
                <option value={1.55}>Moderato (3-5 gg/settimana)</option>
                <option value={1.725}>Intenso (6-7 gg/settimana)</option>
                <option value={1.9}>Molto intenso (lavoro fisico)</option>
              </select>
            </div>
          </div>
          {/* Email (non modificabile) */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Email (non modificabile)
            </label>
            <input
              type='email'
              name='email'
              value={formData.email}
              className='w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500'
              disabled
            />
          </div>

          {/* Bottone Salva */}
          <div className='flex justify-end'>
            <button
              type='submit'
              disabled={loading}
              className='flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50'
            >
              <Save className='w-5 h-5' />
              {loading ? 'Salvataggio...' : 'Salva Profilo'}
            </button>
          </div>
        </form>
      </div>

      {/* === Sezione Sicurezza / Password === */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='p-6 border-b'>
          <h2 className='text-xl font-bold text-gray-800 flex items-center gap-3'>
            <Lock className='w-6 h-6 text-green-600' />
            Sicurezza
          </h2>
          <p className='text-sm text-gray-600 mt-1'>
            Modifica la tua password di accesso.
          </p>
        </div>
        <form onSubmit={handleSubmitPassword} className='p-6 space-y-6'>
          {/* Password Corrente */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Password Corrente
            </label>
            <input
              type='password'
              name='passwordCorrente'
              value={passwordData.passwordCorrente}
              onChange={handlePasswordChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg'
              required
            />
          </div>
          {/* Nuova Password */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Nuova Password
            </label>
            <input
              type='password'
              name='nuovaPassword'
              value={passwordData.nuovaPassword}
              onChange={handlePasswordChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg'
              required
            />
          </div>
          {/* Conferma Nuova Password */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Conferma Nuova Password
            </label>
            <input
              type='password'
              name='confermaPassword'
              value={passwordData.confermaPassword}
              onChange={handlePasswordChange}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg'
              required
            />
          </div>

          {/* Bottone Salva Password */}
          <div className='flex justify-end'>
            <button
              type='submit'
              disabled={loading}
              className='flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50'
            >
              <Save className='w-5 h-5' />
              {loading ? 'Salvataggio...' : 'Aggiorna Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profilo;
