import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import GestioneAlimenti from './components/GestioneAlimenti';
import TrackerNutrizionaleVegano from './TrackerNutrizionaleVegano'; // Il tuo componente esistente
import Profilo from './components/Profilo'; // <-- NUOVO IMPORT
import Impostazioni from './components/Impostazioni'; // <-- NUOVO IMPORT

function App() {
  const { user, loading } = useAuth();
  const [paginaCorrente, setPaginaCorrente] = useState('tracker');

  // Aggiungiamo uno state per forzare il ricaricamento degli alimenti
  // quando uno nuovo viene creato da GestioneAlimenti
  const [refreshKey, setRefreshKey] = useState(0);

  // Mostra loading
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full'></div>
      </div>
    );
  }

  // Se non loggato, mostra login
  if (!user) {
    // Passiamo onSuccess per reindirizzare al tracker dopo il login/registrazione
    return <LoginForm onSuccess={() => setPaginaCorrente('tracker')} />;
  }

  // Funzione per renderizzare la pagina corrente
  const renderPagina = () => {
    switch (paginaCorrente) {
      case 'tracker':
        // Passiamo il refreshKey per far ricaricare gli alimenti
        return <TrackerNutrizionaleVegano key={refreshKey} />;
      case 'alimenti':
        return (
          <GestioneAlimenti
            onClose={() => setPaginaCorrente('tracker')}
            onAlimentoCreato={(alimento) => {
              console.log('Nuovo alimento creato:', alimento);
              // Cambia il key per forzare il re-render del Tracker
              setRefreshKey((k) => k + 1);
              setPaginaCorrente('tracker'); // Torna al tracker
            }}
          />
        );
      case 'profilo':
        return <Profilo />; // <-- NUOVO
      case 'impostazioni':
        return <Impostazioni />; // <-- NUOVO
      default:
        return <TrackerNutrizionaleVegano key={refreshKey} />;
    }
  };

  // Utente loggato - mostra app
  return (
    <div className='min-h-screen bg-gray-50'>
      <Header onNavigate={setPaginaCorrente} />
      <main>{renderPagina()}</main>
    </div>
  );
}

export default App;
