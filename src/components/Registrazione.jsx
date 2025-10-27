import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Registrazione = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confermaPassword: '',
  });
  const [error, setError] = useState('');
  const { registrazione } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confermaPassword) {
      setError('Le password non coincidono');
      return;
    }

    const result = await registrazione({
      nome: formData.nome,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100'>
      <div className='bg-white p-8 rounded-xl shadow-lg w-full max-w-md'>
        <h1 className='text-3xl font-bold text-center mb-6 text-green-700'>
          🌱 Registrazione
        </h1>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-semibold mb-2'>Nome</label>
            <input
              type='text'
              name='nome'
              value={formData.nome}
              onChange={handleChange}
              className='w-full p-3 border-2 border-gray-300 rounded-lg'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-semibold mb-2'>Email</label>
            <input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              className='w-full p-3 border-2 border-gray-300 rounded-lg'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-semibold mb-2'>Password</label>
            <input
              type='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              className='w-full p-3 border-2 border-gray-300 rounded-lg'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-semibold mb-2'>
              Conferma Password
            </label>
            <input
              type='password'
              name='confermaPassword'
              value={formData.confermaPassword}
              onChange={handleChange}
              className='w-full p-3 border-2 border-gray-300 rounded-lg'
              required
            />
          </div>

          {error && (
            <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
              {error}
            </div>
          )}

          <button
            type='submit'
            className='w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700'
          >
            Registrati
          </button>
        </form>

        <p className='text-center mt-4 text-sm'>
          Hai già un account?{' '}
          <button
            onClick={() => navigate('/login')}
            className='text-green-600 font-semibold hover:underline'
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Registrazione;
