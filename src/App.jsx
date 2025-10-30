import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Importa le Pagine
import ProtectedRoute from './components/ProtectedRoute'; // Il nostro layout protetto
import LoginForm from './components/LoginForm';
import Registrazione from './components/Registrazione';
import TrackerNutrizionaleVegano from './TrackerNutrizionaleVegano'; // Questa è la tua "Home"
import GestioneAlimenti from './components/GestioneAlimenti';
import Profilo from './components/Profilo'; // Dallo step precedente
import Impostazioni from './components/Impostazioni'; // Dallo step precedente

// Componente helper per le rotte pubbliche (Login/Registrazione)
// Impedisce a un utente loggato di vedere la pagina di login
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full'></div>
      </div>
    );
  }
  return user ? <Navigate to='/' replace /> : children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full'></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* --- Rotte Pubbliche (Solo per utenti non loggati) --- */}
      <Route
        path='/login'
        element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        }
      />
      <Route
        path='/registrazione'
        element={
          <PublicRoute>
            <Registrazione />
          </PublicRoute>
        }
      />

      {/* --- Rotte Protette (Solo per utenti loggati) --- */}
      {/* Tutte usano ProtectedRoute, che renderizza AppLayout (con Header) */}
      <Route element={<ProtectedRoute />}>
        <Route
          path='/'
          element={<TrackerNutrizionaleVegano />} // La tua Home
        />
        <Route
          path='/alimenti'
          element={<GestioneAlimenti />} // Endpoint per "I Miei Alimenti"
        />
        <Route
          path='/profilo'
          element={<Profilo />} // Endpoint per "Profilo"
        />
        <Route
          path='/impostazioni'
          element={<Impostazioni />} // Endpoint per "Impostazioni"
        />
      </Route>

      {/* Qualsiasi altra rotta non trovata, reindirizza alla home */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

export default App;
