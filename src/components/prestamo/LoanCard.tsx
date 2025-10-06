'use client';

import { useState } from 'react';
import LoanDetailsModal from './LoanDetailsModal';

interface Loan {
  USUARIO_ID: string;
  PRESTAMO_ID: string;
  USUARIO_NOMBRE: string;
  LIBRO_TITULO: string;
  FECHA_PRESTAMO: string;
  FECHA_DEVOLUCION: string | null;
  ESTADO: string;
  LIBRO_ID: string;
}

interface LoanCardProps {
  loan: Loan;
  onLoanUpdate?: () => void; // Nueva prop para actualizar la lista
}

export default function LoanCard({ loan, onLoanUpdate }: LoanCardProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'PRESTADO':
        return 'bg-yellow-500';
      case 'DEVUELTO':
        return 'bg-green-500';
      case 'VENCIDO':
        return 'bg-red-500';
      case 'DANIADO':
        return 'bg-red-700';
      default:
        return 'bg-gray-500';
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Pendiente';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOverdue = loan.ESTADO === 'PRESTADO' && loan.FECHA_DEVOLUCION && new Date(loan.FECHA_DEVOLUCION) < new Date();

  // Función para marcar como devuelto
  const handleMarkAsReturned = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/prestamos/${loan.PRESTAMO_ID}/return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'DEVUELTO',
          fecha_devolucion_real: new Date().toISOString()
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Notificar al componente padre para actualizar la lista
        if (onLoanUpdate) {
          onLoanUpdate();
        }
        setShowConfirmModal(false);
      } else {
        console.error('Error al marcar como devuelto:', result.message);
        alert('Error al marcar como devuelto: ' + result.message);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmModal = () => {
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-cyan-400/50 transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">
              {loan.LIBRO_TITULO}
            </h3>
            <p className="text-blue-200 text-sm mt-1">{loan.USUARIO_NOMBRE}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getStatusIcon(loan.ESTADO)}</span>
            <span className={`${getStatusColor(loan.ESTADO)} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
              {loan.ESTADO}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-300 font-medium">Préstamo</p>
            <p className="text-white">{formatDate(loan.FECHA_PRESTAMO)}</p>
          </div>
          <div>
            <p className="text-blue-300 font-medium">Devolución</p>
            <p className={`${!loan.FECHA_DEVOLUCION && loan.ESTADO === 'PRESTADO' && isOverdue ? 'text-red-400 font-semibold' : 'text-white'}`}>
              {formatDate(loan.FECHA_DEVOLUCION)}
              {!loan.FECHA_DEVOLUCION && loan.ESTADO === 'PRESTADO' && isOverdue && ' (Vencido)'}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
          <span className="text-blue-300 text-sm">ID: #{loan.PRESTAMO_ID}</span>
          
          <div className="flex space-x-2">
            {loan.ESTADO === 'PRESTADO' && (
              <button 
                onClick={handleOpenConfirmModal}
                disabled={loading}
                className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Marcar Devuelto</span>
                  </>
                )}
              </button>
            )}
            <button 
            onClick={() => setShowDetailsModal(true)}
            className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105">

              <span>Detalles</span>
            </button>
          </div>
        </div>
      </div>

            {/* Modal de detalles */}
      <LoanDetailsModal 
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        loan={loan}
        isMyLoan={false} // ← Para préstamos generales
      />

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
            <div className="p-6 border-b border-white/20">
              <h3 className="text-xl font-bold text-white">Confirmar Devolución</h3>
              <p className="text-blue-200 text-sm mt-1">¿Estás seguro de marcar este préstamo como devuelto?</p>
            </div>

            <div className="p-6 border-b border-white/20">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Detalles del préstamo:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-300">Libro:</span>
                    <span className="text-white">{loan.LIBRO_TITULO}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">Usuario:</span>
                    <span className="text-white">{loan.USUARIO_NOMBRE}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">Fecha préstamo:</span>
                    <span className="text-white">{formatDate(loan.FECHA_PRESTAMO)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">Fecha devolución:</span>
                    <span className="text-green-400">{new Date().toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCloseConfirmModal}
                disabled={loading}
                className="flex-1 bg-gray-500 hover:bg-gray-400 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleMarkAsReturned}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-400 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Confirmar Devolución</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}