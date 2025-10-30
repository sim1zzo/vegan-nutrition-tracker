import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Registrazione from './components/Registrazione';

// Importa il tuo componente esistente
import TrackerNutrizionaleVegano from './vegan-tracker-pro-final'; // ← Aggiusta il path

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-2xl'>Caricamento...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to='/login' />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/registrazione' element={<Registrazione />} />
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <TrackerNutrizionaleVegano />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
