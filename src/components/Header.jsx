import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, Package, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Chiudi menu cliccando fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Genera iniziali per avatar
  const getInitials = () => {
    if (!user) return '?';
    const nome = user.nome || '';
    const cognome = user.cognome || '';
    return (
      `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() ||
      nome.charAt(0).toUpperCase()
    );
  };

  // Ottieni nome completo
  const getNomeCompleto = () => {
    if (!user) return 'Ospite';
    return `${user.nome} ${user.cognome || ''}`.trim();
  };

  if (!user) {
    return null; // Header non mostrato se non loggato
  }

  return (
    <header className='bg-white shadow-sm border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          {/* Logo/Titolo */}
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center'>
              <span className='text-white text-xl font-bold'>🌱</span>
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-800'>
                Tracker Vegano
              </h1>
              <p className='text-xs text-gray-500'>
                Il tuo nutrizionista personale
              </p>
            </div>
          </div>

          {/* Profilo Utente */}
          <div className='relative' ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className='flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors'
            >
              {/* Avatar */}
              <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm'>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={getNomeCompleto()}
                    className='w-full h-full rounded-full object-cover'
                  />
                ) : (
                  getInitials()
                )}
              </div>

              {/* Info Utente */}
              <div className='hidden md:block text-left'>
                <div className='font-semibold text-gray-800 text-sm'>
                  {getNomeCompleto()}
                </div>
                <div className='text-xs text-gray-500'>{user.email}</div>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  menuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className='absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50'>
                {/* Info Profilo */}
                <div className='px-4 py-3 border-b border-gray-100'>
                  <div className='font-semibold text-gray-800'>
                    {getNomeCompleto()}
                  </div>
                  <div className='text-sm text-gray-500'>{user.email}</div>
                  <div className='text-xs text-gray-400 mt-1'>
                    Peso: {user.peso}kg • Attività: {user.livelloAttivita}x
                  </div>
                </div>

                {/* Menu Items */}
                <div className='py-1'>
                  <button
                    onClick={() => {
                      onNavigate?.('profilo');
                      setMenuOpen(false);
                    }}
                    className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3'
                  >
                    <User className='w-4 h-4' />
                    Profilo
                  </button>

                  <button
                    onClick={() => {
                      onNavigate?.('alimenti');
                      setMenuOpen(false);
                    }}
                    className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3'
                  >
                    <Package className='w-4 h-4' />I Miei Alimenti
                  </button>

                  <button
                    onClick={() => {
                      onNavigate?.('impostazioni');
                      setMenuOpen(false);
                    }}
                    className='w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3'
                  >
                    <Settings className='w-4 h-4' />
                    Impostazioni
                  </button>
                </div>

                {/* Logout */}
                <div className='border-t border-gray-100 pt-1'>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3'
                  >
                    <LogOut className='w-4 h-4' />
                    Esci
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
