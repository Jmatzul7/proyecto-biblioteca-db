// components/Navbar.tsx
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Navegación base para todos los usuarios (pública)
  const publicNavigation = [
    { name: 'Inicio', href: '/', icon: '🏠', section: 'Principal' },
    { name: 'Libros', href: '/home/libros', icon: '📚', section: 'Biblioteca' },
  ];

  // Navegación adicional para usuarios loggeados
  const authenticatedNavigation = [
    { name: 'Mis Préstamos', href: '/home/libros/prestamos/mis-prestamos', icon: '👤', section: 'Mi Cuenta' },
  ];

  // Navegación adicional para administradores o bibliotecarios
  const adminNavigation = [
    { name: 'Préstamos', href: '/home/libros/prestamos', icon: '📋', section: 'Administración' },
    { name: 'Usuarios', href: '/home/usuarios', icon: '👥', section: 'Usuarios' },
  ];

    // Navegación adicional para administradores o bibliotecarios
  const bibliotecarioNavigation = [
    { name: 'Préstamos', href: '/home/libros/prestamos', icon: '📋', section: 'Administración' },
  ];

  // Combinar navegación según el estado de autenticación y rol
  let navigation = [...publicNavigation];
  if (user) {
    navigation = [...navigation, ...authenticatedNavigation];
    if (user.nombre_rol === 'Administrador') {
      navigation = [...navigation, ...adminNavigation];
    }else if (user.nombre_rol === 'Bibliotecario') {
    navigation = [...navigation, ...bibliotecarioNavigation];
  }

  }
  const isActive = (href: string) => pathname === href;

  // Función para obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Función para obtener color según el rol
  const getRoleColor = (rol: string) => {
    switch (rol) {
      case 'Administrador':
        return 'from-red-400 to-red-500';
      case 'Bibliotecario':
        return 'from-green-400 to-green-500';
      default:
        return 'from-cyan-400 to-blue-500';
    }
  };

  return (
    <>
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">📚</span>
                </div>
                <span className="text-white font-bold text-xl hidden sm:block">
                  Biblioteca Matzul
                </span>
              </a>
            </div>

            {/* Navegación Desktop */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    isActive(item.href)
                      ? 'bg-cyan-500 text-white shadow-lg transform scale-105'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </a>
              ))}
            </div>

            {/* User Menu Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                // Usuario loggeado
                <>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${getRoleColor(user.nombre_rol)} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                      {getInitials(user.nombre)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-semibold">
                        {user.nombre.split(' ')[0]}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.nombre_rol === 'Administrador' 
                          ? 'bg-red-500/20 text-red-300' 
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {user.nombre_rol}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                // Usuario NO loggeado - Mostrar botón de Login
                <a
                  href="/login"
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Iniciar Sesión</span>
                </a>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-cyan-300 transition-colors duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/10 backdrop-blur-lg border-t border-white/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                    isActive(item.href)
                      ? 'bg-cyan-500 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </a>
              ))}
              
              {/* Mobile User Info o Login */}
              <div className="border-t border-white/20 pt-3 mt-3">
                {user ? (
                  // Usuario loggeado en móvil
                  <>
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <div className={`w-10 h-10 bg-gradient-to-r ${getRoleColor(user.nombre_rol)} rounded-full flex items-center justify-center text-white font-bold`}>
                        {getInitials(user.nombre)}
                      </div>
                      <div>
                        <div className="text-white font-semibold">{user.nombre}</div>
                        <div className="text-blue-200 text-sm">{user.usuario_login}</div>
                        <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
                          user.nombre_rol === 'Administrador' 
                            ? 'bg-red-500/20 text-red-300' 
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {user.nombre_rol}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-3 py-2 text-red-400 hover:text-red-300 font-semibold transition-colors duration-300"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  // Usuario NO loggeado en móvil
                  <a
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 flex items-center space-x-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Iniciar Sesión</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}