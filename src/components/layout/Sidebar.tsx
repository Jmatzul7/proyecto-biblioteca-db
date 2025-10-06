'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Inicio', href: '/', icon: '🏠', section: 'Principal' },
    { name: 'Libros', href: '/libros', icon: '📚', section: 'Biblioteca' },
    { name: 'Préstamos', href: '/libros/prestamos', icon: '📋', section: 'Administración' },
    { name: 'Mis Préstamos', href: '/libros/prestamos/mis-prestamos', icon: '👤', section: 'Mi Cuenta' },
  ];

  const isActive = (href: string) => pathname === href;

  const sections = navigation.reduce((acc: any[], item) => {
    const section = acc.find(s => s.name === item.section);
    if (section) {
      section.items.push(item);
    } else {
      acc.push({ name: item.section, items: [item] });
    }
    return acc;
  }, []);

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - AHORA ES 100vh SIN SCROLL */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 transform transition-transform duration-300 ease-in-out
        flex flex-col h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:z-0
      `}>
        {/* Header del Sidebar */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/20 h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">📚</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Biblioteca</h1>
              <p className="text-blue-200 text-xs">Sistema de Gestión</p>
            </div>
          </div>
          
          {/* Botón cerrar en móvil */}
          <button
            onClick={onClose}
            className="md:hidden text-white hover:text-cyan-300 transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navegación - CONTENIDO CENTRADO VERTICALMENTE */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="p-4 space-y-6 max-h-[60vh] overflow-hidden">
            {sections.map((section) => (
              <div key={section.name}>
                <h3 className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3 px-2">
                  {section.name}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item: any) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => window.innerWidth < 768 && onClose()}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-xl font-semibold transition-all duration-300 group ${
                        isActive(item.href)
                          ? 'bg-cyan-500 text-white shadow-lg'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="text-lg transition-transform duration-300 group-hover:scale-110">
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.name}</span>
                      {isActive(item.href) && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer del Sidebar */}
        <div className="flex-shrink-0 p-4 border-t border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              LM
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">Laura Mendoza</div>
              <div className="text-blue-200 text-xs truncate">Administrador</div>
            </div>
          </div>
          <a
            href="/login"
            className="flex items-center space-x-2 text-red-400 hover:text-red-300 font-semibold transition-colors duration-300 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </a>
        </div>
      </div>
    </>
  );
}