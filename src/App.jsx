import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import GestioneAlimenti from './components/GestioneAlimenti';
import TrackerNutrizionaleVegano from './TrackerNutrizionaleVegano'; // Il tuo componente esistente

function App() {
  const { user, loading } = useAuth();
  const [paginaCorrente, setPaginaCorrente] = useState('tracker');

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
    return <LoginForm onSuccess={() => console.log('Login effettuato!')} />;
  }

  // Utente loggato - mostra app
  return (
    <div className='min-h-screen bg-gray-50'>
      <Header onNavigate={setPaginaCorrente} />

      {paginaCorrente === 'tracker' && <TrackerNutrizionaleVegano />}

      {paginaCorrente === 'alimenti' && (
        <GestioneAlimenti
          onClose={() => setPaginaCorrente('tracker')}
          onAlimentoCreato={(alimento) => {
            console.log('Nuovo alimento creato:', alimento);
            // Ricarica gli alimenti nel tracker se necessario
          }}
        />
      )}

      {paginaCorrente === 'profilo' && (
        <div className='max-w-4xl mx-auto p-6'>
          <h1 className='text-2xl font-bold mb-4'>Profilo Utente</h1>
          {/* Implementa qui il componente profilo */}
        </div>
      )}
    </div>
  );
}

export default App;
