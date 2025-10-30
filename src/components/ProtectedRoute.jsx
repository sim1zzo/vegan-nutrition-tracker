import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from './AppLayout'; // Importiamo il layout

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full'></div>
      </div>
    );
  }

  if (!user) {
    // Utente non loggato, reindirizza al login
    return <Navigate to='/login' replace />;
  }

  // Utente loggato, mostra il layout con la pagina richiesta
  return <AppLayout />;
};

export default ProtectedRoute;
