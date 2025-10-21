'use client';

import { useEffect, useState } from 'react';

interface Autor {
  AUTOR_ID: string;
  NOMBRE_AUTOR: string;
  NACIONALIDAD: string;
}

interface LoanDetails {
  USUARIO_ID: string;
  PRESTAMO_ID: string;
  LIBRO_ID: string;
  FECHA_PRESTAMO: string;
  FECHA_DEVOLUCION: string | null;
  ESTADO: string;
  USUARIO_NOMBRE: string;
  LIBRO_TITULO: string;
  AUTOR: Autor | string;
}

interface LoanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: LoanDetails | null;
  isMyLoan?: boolean;
}

export default function LoanDetailsModal({ isOpen, onClose, loan, isMyLoan = false }: LoanDetailsModalProps) {
  const [renovando, setRenovando] = useState(false);
  const [mensajeRenovacion, setMensajeRenovacion] = useState('');



  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      console.log('Modal abierto' + (loan ? ` para préstamo ID: ${loan.PRESTAMO_ID} ${loan.LIBRO_TITULO}` : ' sin préstamo'));
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !loan) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Pendiente';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

      // Función para obtener el nombre del autor de manera segura
  const getNombreAutor = () => {
    if (!loan) return '';
    
    if (typeof loan.AUTOR === 'string') {
      return loan.AUTOR;
    } else {
      return loan.AUTOR.NOMBRE_AUTOR;
    }
  };

    // Función para obtener la nacionalidad del autor de manera segura
  const getNacionalidadAutor = () => {
    if (!loan || typeof loan.AUTOR === 'string') {
      return '';
    }
    return loan.AUTOR.NACIONALIDAD;
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'PRESTADO':
        return 'text-yellow-400';
      case 'DEVUELTO':
        return 'text-green-400';
      case 'VENCIDO':
        return 'text-red-400';
      case 'DANIADO':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'PRESTADO':
        return '📖';
      case 'DEVUELTO':
        return '✅';
      case 'VENCIDO':
        return '⚠️';
      case 'DANIADO':
        return '❌';
      default:
        return '📋';
    }
  };

  // Función para renovar préstamo
  const handleRenovarPrestamo = async () => {
    if (!loan) return;

    setRenovando(true);
    setMensajeRenovacion('');

    try {
      const response = await fetch(`/api/prestamos/${loan.PRESTAMO_ID}/renovar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setMensajeRenovacion('success');
        // Cerrar el modal después de 2 segundos
        setTimeout(() => {
          onClose();
          // Recargar la página para mostrar los cambios
          window.location.reload();
        }, 2000);
      } else {
        setMensajeRenovacion(result.message || 'Error al renovar el préstamo');
      }
    } catch (error) {
      console.error('Error renovando préstamo:', error);
      setMensajeRenovacion('Error de conexión. Intenta nuevamente.');
    } finally {
      setRenovando(false);
    }
  };

  // Calcular nueva fecha estimada de renovación
  const calcularNuevaFecha = () => {
    const hoy = new Date();
    const nuevaFecha = new Date();
    nuevaFecha.setDate(hoy.getDate() + 15);
    return nuevaFecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calcular si se puede renovar
  const puedeRenovar = () => {
    if (!loan) return false;
    return loan.ESTADO === 'PRESTADO' && isMyLoan;
  };

  // Calcular días de retraso si está vencido
  const calculateDaysLate = () => {
    if (loan.ESTADO === 'PRESTADO' && loan.FECHA_DEVOLUCION) {
      const fechaDevolucion = new Date(loan.FECHA_DEVOLUCION);
      const hoy = new Date();
      if (hoy > fechaDevolucion) {
        const diffTime = Math.abs(hoy.getTime() - fechaDevolucion.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }
    return 0;
  };

  const diasRetraso = calculateDaysLate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white">Detalles del Préstamo</h2>
            <p className="text-blue-200 text-sm mt-1">
              {isMyLoan ? 'Información de tu préstamo' : 'Información completa del préstamo'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors duration-300 p-2 hover:bg-white/10 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Mensaje de éxito en renovación */}
          {mensajeRenovacion === 'success' && (
            <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4">
              <div className="flex items-center text-green-300">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold">¡Renovación Exitosa!</p>
                  <p className="text-sm mt-1">
                    Tu préstamo ha sido renovado. La nueva fecha de devolución es {calcularNuevaFecha()}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de error en renovación */}
          {mensajeRenovacion && mensajeRenovacion !== 'success' && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4">
              <div className="flex items-center text-red-300">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="font-semibold">Error en Renovación</p>
                  <p className="text-sm mt-1">{mensajeRenovacion}</p>
                </div>
              </div>
            </div>
          )}

          {/* Información de renovación disponible */}
          {puedeRenovar() && !mensajeRenovacion && (
            <div className="bg-cyan-500/20 border border-cyan-400/30 rounded-xl p-4">
              <div className="flex items-center text-cyan-300">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <div>
                  <p className="font-semibold">Renovación Disponible</p>
                  <p className="text-sm mt-1">
                    Puedes renovar este préstamo por 15 días más. La nueva fecha de devolución sería {calcularNuevaFecha()}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información del libro */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="text-2xl mr-3">📚</span>
              Información del Libro
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-300 font-medium">Título:</span>
                <span className="text-white text-right font-semibold">{loan.LIBRO_TITULO}</span>
              </div>
              {loan.AUTOR && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-300 font-medium">Autor:</span>
                  <span className="text-white"> {getNombreAutor()} - {getNacionalidadAutor() && `(${getNacionalidadAutor()})`}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-blue-300 font-medium">ID del Libro:</span>
                <span className="text-white font-mono">#{loan.LIBRO_ID}</span>
              </div>
            </div>
          </div>

          {/* Información del préstamo */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="text-2xl mr-3">📋</span>
              Información del Préstamo
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-300 font-medium">ID del Préstamo:</span>
                <span className="text-white font-mono">#{loan.PRESTAMO_ID}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-300 font-medium">Estado:</span>
                <span className={`${getStatusColor(loan.ESTADO)} font-semibold flex items-center`}>
                  <span className="text-xl mr-2">{getStatusIcon(loan.ESTADO)}</span>
                  {loan.ESTADO}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-300 font-medium">Fecha de Préstamo:</span>
                <span className="text-white">{formatDate(loan.FECHA_PRESTAMO)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-300 font-medium">
                  {loan.ESTADO === 'PRESTADO' ? 'Fecha Límite:' : 'Fecha de Devolución:'}
                </span>
                <span className={`${diasRetraso > 0 ? 'text-red-400 font-semibold' : 'text-white'}`}>
                  {formatDate(loan.FECHA_DEVOLUCION)}
                  {diasRetraso > 0 && ` (${diasRetraso} día${diasRetraso > 1 ? 's' : ''} de retraso)`}
                </span>
              </div>
            </div>
          </div>

          {/* Información del usuario */}
          {!isMyLoan && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">👤</span>
                Información del Usuario
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-300 font-medium">Nombre:</span>
                  <span className="text-white">{loan.USUARIO_NOMBRE}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-300 font-medium">ID de Usuario:</span>
                  <span className="text-white font-mono">#{loan.USUARIO_ID}</span>
                </div>
              </div>
            </div>
          )}

          {/* Información adicional según el estado */}
          {loan.ESTADO === 'PRESTADO' && diasRetraso > 0 && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4">
              <div className="flex items-center text-red-300">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="font-semibold">Préstamo Vencido</p>
                  <p className="text-sm mt-1">
                    Este préstamo tiene {diasRetraso} día{diasRetraso > 1 ? 's' : ''} de retraso. 
                    Por favor, regulariza la situación lo antes posible.
                  </p>
                </div>
              </div>
            </div>
          )}

          {loan.ESTADO === 'DEVUELTO' && (
            <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4">
              <div className="flex items-center text-green-300">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold">Préstamo Completado</p>
                  <p className="text-sm mt-1">
                    Este libro fue devuelto correctamente. ¡Gracias por usar nuestro servicio!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={renovando}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 border border-white/20 disabled:opacity-50"
            >
              {renovando ? 'Procesando...' : 'Cerrar'}
            </button>
            
            {puedeRenovar() && (
              <button 
                onClick={handleRenovarPrestamo}
                disabled={renovando}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
              >
                {renovando ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Renovando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Renovar Préstamo</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}