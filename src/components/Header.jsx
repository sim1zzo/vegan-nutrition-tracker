import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  User,
  LogOut,
  Settings,
  Package,
  ChevronDown,
  CheckSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const paginaAttiva = location.pathname;

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

  // Helper per lo stile del menu
  const getMenuClass = (path) => {
    const base =
      'w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3';
    if (path === paginaAttiva) {
      return `${base} bg-green-50 text-green-700 font-semibold`;
    }
    return base;
  };

  if (!user) {
    return null; // Non mostrare l'header se l'utente non è loggato
  }

  return (
    <header className='bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40'>
      <div className='max-w-7xl mx-auto px-4 py-3'>
        <div className='flex items-center justify-between'>
          {/* Logo/Titolo e Navigazione Principale */}
          <div className='flex items-center gap-3'>
            <Link to='/' className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center'>
                <span className='text-white text-xl font-bold'>🌱</span>
              </div>
              <div>
                <h1 className='text-xl font-bold text-gray-800'>
                  Tracker Vegano
                </h1>
              </div>
            </Link>

            {/* Navigazione Desktop */}
            <nav className='hidden md:flex items-center gap-2 ml-6'>
              <Link
                to='/'
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  paginaAttiva === '/'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <CheckSquare className='w-4 h-4 inline-block mr-1.5' />
                Tracker
              </Link>
              <Link
                to='/alimenti'
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  paginaAttiva === '/alimenti'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Package className='w-4 h-4 inline-block mr-1.5' />I Miei
                Alimenti
              </Link>
            </nav>
          </div>

          {/* Profilo Utente (Dropdown) */}
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
                <div className='text-sm font-semibold text-gray-800'>
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
                {/* Info Profilo (visibile solo su mobile) */}
                <div className='px-4 py-3 border-b border-gray-100 md:hidden'>
                  <div className='font-semibold text-gray-800'>
                    {getNomeCompleto()}
                  </div>
                  <div className='text-sm text-gray-500 truncate'>
                    {user.email}
                  </div>
                </div>

                {/* Menu Items */}
                <div className='py-1'>
                  {/* Link per navigazione mobile/compatta */}
                  <Link
                    to='/'
                    onClick={() => setMenuOpen(false)}
                    className={`${getMenuClass('/')} md:hidden`}
                  >
                    <CheckSquare className='w-4 h-4' />
                    Tracker
                  </Link>
                  <Link
                    to='/alimenti'
                    onClick={() => setMenuOpen(false)}
                    className={`${getMenuClass('/alimenti')} md:hidden`}
                  >
                    <Package className='w-4 h-4' />I Miei Alimenti
                  </Link>

                  {/* Link Profilo e Impostazioni */}
                  <Link
                    to='/profilo'
                    onClick={() => setMenuOpen(false)}
                    className={getMenuClass('/profilo')}
                  >
                    <User className='w-4 h-4' />
                    Profilo
                  </Link>
                  <Link
                    to='/impostazioni'
                    onClick={() => setMenuOpen(false)}
                    className={getMenuClass('/impostazioni')}
                  >
                    <Settings className='w-4 h-4' />
                    Impostazioni
                  </Link>
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
