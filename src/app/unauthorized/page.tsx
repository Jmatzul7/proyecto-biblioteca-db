'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  const getErrorMessage = () => {
    if (!user) {
      return 'Necesitas iniciar sesión para acceder a esta página.';
    }
    
    switch (user.nombre_rol) {
      case 'Usuario':
        return 'Esta sección está restringida para administradores y bibliotecarios.';
      case 'Bibliotecario':
        return 'Esta sección está restringida exclusivamente para administradores.';
      default:
        return 'No tienes permisos para acceder a esta página.';
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 text-center">
        <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Acceso No Autorizado</h1>
        
        <p className="text-blue-200 mb-6">
          {getErrorMessage()}
        </p>

        {user && (
          <div className="mb-4 p-3 bg-white/5 rounded-lg">
            <p className="text-sm text-blue-200">Conectado como:</p>
            <p className="text-white font-semibold">{user.nombre} ({user.nombre_rol})</p>
          </div>
        )}

        <div className="space-y-3">
          <Link 
            href="/home/libros"
            className="block bg-cyan-500 hover:bg-cyan-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Volver a la Biblioteca
          </Link>
          
          {!user && (
            <Link 
              href="/login"
              className="block bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}