// app/page.tsx
'use client';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-blue-200">Cargando...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 relative z-10 transform transition-all duration-500 hover:shadow-3xl">
        {/* Icono decorativo */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent mb-4 tracking-tight">
          Biblioteca Matzul
        </h1>
        
        <p className="text-lg text-blue-200 mb-8 leading-relaxed">
          {user 
            ? `Bienvenido de nuevo, ${user.nombre}` 
            : 'Bienvenido a tu biblioteca digital. Gestiona libros y préstamos de forma sencilla.'
          }
        </p>
        
        <ul className="flex flex-col space-y-4">
          {user ? (
            // Usuario loggeado - Solo mostrar Explorar Libros
            <li>
              <Link
                href="/home/libros"
                className="group w-full py-4 px-6 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Explorar Libros</span>
              </Link>
            </li>
          ) : (
            // Usuario no loggeado - Mostrar ambos botones
            <>
              <li>
                <Link
                  href="/login"
                  className="group w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Iniciar sesión</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/home"
                  className="group w-full py-4 px-6 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Explorar Libros</span>
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Footer decorativo */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-sm text-blue-300/70 text-center">
            {user ? 'Gestiona tu biblioteca' : 'Gestiona tu biblioteca con estilo'}
          </p>
        </div>
      </div>
    </section>
  );
}