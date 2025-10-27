import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100'>
      <div className='bg-white p-8 rounded-xl shadow-lg w-full max-w-md'>
        <h1 className='text-3xl font-bold text-center mb-6 text-green-700'>
          🌱 Nutrition Tracker
        </h1>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-semibold mb-2'>Email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-semibold mb-2'>Password</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500'
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
            className='w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition'
          >
            Login
          </button>
        </form>

        <p className='text-center mt-4 text-sm'>
          Non hai un account?{' '}
          <button
            onClick={() => navigate('/registrazione')}
            className='text-green-600 font-semibold hover:underline'
          >
            Registrati
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
