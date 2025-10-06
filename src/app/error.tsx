// app/error.tsx (para errores generales)
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <div className="text-9xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-8">
          ¡Error!
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">
          Algo salió mal
        </h1>
        
        <p className="text-xl text-blue-200 mb-8">
          Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
        </p>

        {error.digest && (
          <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 mb-6">
            <p className="text-red-300 text-sm">
              Error ID: <span className="font-mono">{error.digest}</span>
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-cyan-500 hover:bg-cyan-400 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            Intentar Nuevamente
          </button>
          
          <Link
            href="/"
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 border border-white/20"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}