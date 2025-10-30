import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Weight,
  Activity,
  Calendar,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginForm = ({ onSuccess }) => {
  const { login, registrazione } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    confermaPassword: '',
    peso: '',
    altezza: '',
    eta: '',
    sesso: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Reset errore quando l'utente modifica
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const result = await login(formData.email, formData.password);

        if (result.success) {
          onSuccess?.();
        } else {
          setError(result.message);
        }
      } else {
        // REGISTRAZIONE

        // Validazioni
        if (
          !formData.nome ||
          !formData.email ||
          !formData.password ||
          !formData.peso
        ) {
          setError('Compila tutti i campi obbligatori');
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confermaPassword) {
          setError('Le password non corrispondono');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('La password deve essere di almeno 6 caratteri');
          setLoading(false);
          return;
        }

        const result = await registrazione({
          nome: formData.nome,
          cognome: formData.cognome,
          email: formData.email,
          password: formData.password,
          peso: parseFloat(formData.peso),
          altezza: formData.altezza ? parseInt(formData.altezza) : undefined,
          eta: formData.eta ? parseInt(formData.eta) : undefined,
          sesso: formData.sesso || undefined,
        });

        if (result.success) {
          onSuccess?.();
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('Si è verificato un errore. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        {/* Card */}
        <div className='bg-white rounded-2xl shadow-xl p-8'>
          {/* Logo */}
          <div className='text-center mb-8'>
            <div className='w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-3xl'>🌱</span>
            </div>
            <h1 className='text-2xl font-bold text-gray-800'>
              Tracker Nutrizionale Vegano
            </h1>
            <p className='text-gray-600 text-sm mt-2'>
              {isLogin ? 'Accedi al tuo account' : 'Crea un nuovo account'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm'>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Registrazione: Nome e Cognome */}
            {!isLogin && (
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Nome *
                  </label>
                  <div className='relative'>
                    <User className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                    <input
                      type='text'
                      name='nome'
                      value={formData.nome}
                      onChange={handleChange}
                      className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                      placeholder='Mario'
                      required={!isLogin}
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Cognome
                  </label>
                  <input
                    type='text'
                    name='cognome'
                    value={formData.cognome}
                    onChange={handleChange}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    placeholder='Rossi'
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Email *
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  placeholder='mario@example.com'
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Password *
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                <input
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  placeholder='••••••'
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Registrazione: Conferma Password */}
            {!isLogin && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Conferma Password *
                </label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                  <input
                    type='password'
                    name='confermaPassword'
                    value={formData.confermaPassword}
                    onChange={handleChange}
                    className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                    placeholder='••••••'
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Registrazione: Dati Fisici */}
            {!isLogin && (
              <>
                <div className='grid grid-cols-3 gap-3'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Peso (kg) *
                    </label>
                    <div className='relative'>
                      <Weight className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                      <input
                        type='number'
                        name='peso'
                        value={formData.peso}
                        onChange={handleChange}
                        className='w-full pl-9 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                        placeholder='70'
                        min='30'
                        max='300'
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Altezza (cm)
                    </label>
                    <div className='relative'>
                      <Activity className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                      <input
                        type='number'
                        name='altezza'
                        value={formData.altezza}
                        onChange={handleChange}
                        className='w-full pl-9 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                        placeholder='175'
                        min='100'
                        max='250'
                      />
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Età
                    </label>
                    <div className='relative'>
                      <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                      <input
                        type='number'
                        name='eta'
                        value={formData.eta}
                        onChange={handleChange}
                        className='w-full pl-9 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
                        placeholder='30'
                        min='10'
                        max='120'
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Sesso
                  </label>
                  <div className='relative'>
                    <Users className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                    <select
                      name='sesso'
                      value={formData.sesso}
                      onChange={handleChange}
                      className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none'
                    >
                      <option value=''>Seleziona...</option>
                      <option value='M'>Maschio</option>
                      <option value='F'>Femmina</option>
                      <option value='altro'>Altro</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading}
              className='w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Caricamento...' : isLogin ? 'Accedi' : 'Registrati'}
            </button>
          </form>

          {/* Toggle Login/Registrazione */}
          <div className='mt-6 text-center'>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({
                  nome: '',
                  cognome: '',
                  email: '',
                  password: '',
                  confermaPassword: '',
                  peso: '',
                  altezza: '',
                  eta: '',
                  sesso: '',
                });
              }}
              className='text-green-600 hover:text-green-700 font-medium text-sm'
            >
              {isLogin
                ? 'Non hai un account? Registrati'
                : 'Hai già un account? Accedi'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className='text-center text-gray-500 text-xs mt-6'>
          Tracker Nutrizionale Vegano © 2025
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
