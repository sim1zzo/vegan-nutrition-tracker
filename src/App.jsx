import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Importa le Pagine
import ProtectedRoute from './components/ProtectedRoute'; // Il nostro layout protetto
import LoginForm from './components/LoginForm';
import Registrazione from './components/Registrazione';
import TrackerNutrizionaleVegano from './TrackerNutrizionaleVegano'; // Questa è la tua "Home"
import GestioneAlimenti from './components/GestioneAlimenti';
import Profilo from './components/Profilo';
import Impostazioni from './components/Impostazioni';
import GraficiAndamento from './components/GraficiAndamento'; // <-- IMPORTA
// (Puoi creare un componente "PaginaStorico" se vuoi, o linkare al tracker con date)

// Componente helper per le rotte pubbliche (Login/Registrazione)
const PublicRoute = ({ children }) => {
  // ... (codice invariato) ...
};

// Componente wrapper per Modal (per usarli come pagine)
const GraficiPage = () => (
  <GraficiAndamento onClose={() => window.history.back()} />
);
// (In alternativa, puoi creare una pagina vera e propria che importa GraficiAndamento)

function App() {
  const { user, loading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    // ... (codice invariato) ...
  }

  // Se non loggato, mostra login
  if (!user) {
    return (
      <Routes>
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
        {/* Se non loggato, qualsiasi altra rotta reindirizza a /login */}
        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    );
  }

  // Utente loggato
  return (
    <Routes>
      {/* --- Rotte Protette (Solo per utenti loggati) --- */}
      <Route element={<ProtectedRoute />}>
        <Route
          path='/'
          element={<TrackerNutrizionaleVegano key={refreshKey} />} // La tua Home
        />
        <Route
          path='/alimenti'
          element={
            <GestioneAlimenti
              onAlimentoCreato={() => setRefreshKey((k) => k + 1)}
            />
          }
        />
        <Route path='/profilo' element={<Profilo />} />
        <Route path='/impostazioni' element={<Impostazioni />} />
        {/* --- NUOVE ROTTE --- */}
        <Route
          path='/grafici'
          element={<GraficiPage />} // Pagina per i grafici
        />
        {/* Per lo "Storico", non serve una nuova pagina. 
          Il componente `CalendarioNavigazione` carica già i giorni passati 
          semplicemente cambiando l'URL a /?data=...
          Se vuoi una lista, puoi creare un componente <Storico />
        */}
      </Route>

      {/* Qualsiasi altra rotta non trovata, reindirizza alla home */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

export default App;
