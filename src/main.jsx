import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // ✅ importa il provider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      {' '}
      {/* ✅ avvolgi tutta l’app */}
      <App />
    </AuthProvider>
  </StrictMode>
);
