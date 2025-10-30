import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- 1. IMPORTA
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        {' '}
        {/* <-- 2. AVVOLGI L'APP */}
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
