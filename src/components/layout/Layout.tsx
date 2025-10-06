'use client';

import { useState } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex flex-col">
      {/* Navbar - ALTURA FIJA */}
      <div className="flex-shrink-0 sticky top-0 z-50">
        <Navbar />
      </div>
      
      {/* Contenedor Principal - OCUPA EL RESTANTE */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Main Content - CONTENIDO SCROLLABLE */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 min-h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Botón flotante para abrir sidebar en móvil */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-4 left-4 z-40 md:hidden w-12 h-12 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
}