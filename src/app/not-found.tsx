// app/not-found.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden relative">
      {/* Efecto de partículas interactivas */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(120, 119, 198, 0.15), transparent 80%)`
        }}
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        {/* Contenido principal */}
        <div className="max-w-2xl mx-auto">
          {/* Animación 404 */}
          <div className="relative mb-8">
            <div className="text-9xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              404
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400 rounded-full animate-ping"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-400 rounded-full animate-pulse"></div>
          </div>

          {/* Mensaje principal */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¡Página No Encontrada!
          </h1>
          
          <p className="text-xl text-blue-200 mb-8 leading-relaxed">
            Lo sentimos, la página que estás buscando no existe o ha sido movida. 
            Puede que hayas seguido un enlace incorrecto o la página haya sido eliminada.
          </p>

          {/* Ilustración animada */}
          <div className="mb-12 flex justify-center">
            <div className="relative w-48 h-48">
              {/* Libro flotante */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative animate-float">
                  <div className="w-24 h-32 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg shadow-2xl transform rotate-12">
                    <div className="absolute inset-2 bg-white/10 rounded-md backdrop-blur-sm border border-white/20"></div>
                    <div className="absolute top-4 left-3 w-18 h-1 bg-white/30 rounded"></div>
                    <div className="absolute top-8 left-3 w-14 h-1 bg-white/30 rounded"></div>
                    <div className="absolute top-12 left-3 w-16 h-1 bg-white/30 rounded"></div>
                  </div>
                  {/* Páginas */}
                  <div className="absolute top-0 -right-1 w-4 h-32 bg-gradient-to-r from-cyan-400/50 to-blue-400/50 rounded-r-lg"></div>
                </div>
              </div>
              
              {/* Lupa buscando */}
              <div className="absolute top-4 right-8 animate-bounce-slow">
                <div className="w-12 h-12 border-2 border-yellow-400 rounded-full">
                  <div className="absolute bottom-0 right-0 w-4 h-6 bg-yellow-400 transform rotate-45 origin-bottom-right"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Posibles causas */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              ¿Por qué podría estar pasando esto?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start">
                <div className="bg-cyan-500/20 rounded-lg p-2 mr-3">
                  <span className="text-cyan-400">🔗</span>
                </div>
                <div>
                  <p className="text-white font-medium">Enlace incorrecto</p>
                  <p className="text-blue-200 text-sm">El enlace que seguiste puede estar mal escrito</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-purple-500/20 rounded-lg p-2 mr-3">
                  <span className="text-purple-400">🚫</span>
                </div>
                <div>
                  <p className="text-white font-medium">Página eliminada</p>
                  <p className="text-blue-200 text-sm">La página puede haber sido movida o eliminada</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-500/20 rounded-lg p-2 mr-3">
                  <span className="text-blue-400">⌨️</span>
                </div>
                <div>
                  <p className="text-white font-medium">Error de escritura</p>
                  <p className="text-blue-200 text-sm">Verifica la URL en la barra de direcciones</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-500/20 rounded-lg p-2 mr-3">
                  <span className="text-green-400">🔄</span>
                </div>
                <div>
                  <p className="text-white font-medium">Actualización reciente</p>
                  <p className="text-blue-200 text-sm">El sitio puede haber sido actualizado recientemente</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/home"
              className="bg-cyan-500 hover:bg-cyan-400 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Volver al Inicio</span>
            </Link>
            
            <Link
              href="/home/libros"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 border border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Explorar Biblioteca</span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="bg-purple-500 hover:bg-purple-400 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Volver Atrás</span>
            </button>
          </div>


          {/* Enlaces rápidos */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-blue-200">
            <Link href="/home/libros" className="hover:text-cyan-300 transition-colors">Libros</Link>
            <Link href="/home/libros/prestamos" className="hover:text-cyan-300 transition-colors">Préstamos</Link>
            <Link href="/home/usuarios" className="hover:text-cyan-300 transition-colors">Usuarios</Link>
            <Link href="/home/libros/prestamos/mis-prestamos" className="hover:text-cyan-300 transition-colors">Mis Préstamos</Link>
          </div>
        </div>
      </div>

      {/* Efectos de fondo adicionales */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
    </div>
  );
}