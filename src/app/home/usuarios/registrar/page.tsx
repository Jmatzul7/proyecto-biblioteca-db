'use client';

import { useState } from 'react';
import RegisterUserForm from '@/components/usuarios/RegisterUserForm';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';
import Link from 'next/link';

export default function RegistrarUsuarioPage() {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUserRegistered = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <ProtectedAdminRoute>
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Registrar Nuevo Usuario
            </h1>
            <p className="text-xl text-blue-200 max-w-2xl">
              Crea nuevas cuentas de usuario para el sistema de biblioteca
            </p>
          </div>
          
          <Link
            href="/home/usuarios"
            className="mt-4 lg:mt-0 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center border border-white/20"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Usuarios
          </Link>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-cyan-400 mb-2">🎯</div>
            <div className="text-blue-200">Registro Rápido</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2la p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-green-400 mb-2">🔐</div>
            <div className="text-blue-200">Contraseñas Seguras</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-purple-400 mb-2">👥</div>
            <div className="text-blue-200">Gestión de Roles</div>
          </div>
        </div>

        {/* Formulario de registro */}
        <RegisterUserForm onUserRegistered={handleUserRegistered} />

        {/* Mensaje de éxito persistente */}
        {showSuccess && (
          <div className="mt-6 bg-green-500/20 border border-green-400/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-green-300 font-semibold">¡Usuario Registrado Exitosamente!</h3>
                  <p className="text-green-200 text-sm mt-1">
                    El usuario ha sido creado y ya puede acceder al sistema.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSuccess(false)}
                className="text-green-300 hover:text-green-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Consideraciones Importantes
            </h3>
            <ul className="text-blue-200 text-sm space-y-2">
              <li>• Verifica que el nombre de usuario no exista previamente</li>
              <li>• Asigna roles según los permisos necesarios</li>
              <li>• La contraseña se almacena de forma segura</li>
              <li>• El usuario recibirá las credenciales proporcionadas</li>
            </ul>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <svg className="w-5 h-5 text-cyan-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Siguientes Pasos
            </h3>
            <ul className="text-blue-200 text-sm space-y-2">
              <li>• El usuario puede iniciar sesión inmediatamente</li>
              <li>• Revisa la lista de usuarios para gestionar cuentas</li>
              <li>• Puedes editar información del usuario después</li>
              <li>• Contacta al administrador para problemas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </ProtectedAdminRoute>
  );
}