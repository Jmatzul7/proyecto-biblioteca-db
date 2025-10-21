'use client';
import { useState } from 'react';
import LoanDetailsModal from '../LoanDetailsModal';

interface Autor {
  AUTOR_ID: string;
  NOMBRE_AUTOR: string;
  NACIONALIDAD: string;
}

interface MyLoan {
  USUARIO_ID: string;
  NOMBRE_USUARIO: string;
  LIBRO_ID: string;
  LIBRO_TITULO: string;
  AUTOR: Autor | string; // ← Permitir tanto objeto como string
  PRESTAMO_ID: string;
  FECHA_PRESTAMO: string;
  FECHA_DEVOLUCION: string | null;
  ESTADO: string;
}

interface MyLoanCardProps {
  loan: MyLoan;
  onShowDetails?: (loan: MyLoan) => void;
}

export default function MyLoanCard({ loan, onShowDetails }: MyLoanCardProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleShowDetails = () => {
    if (onShowDetails) {
      onShowDetails(loan);
    }
  };

  // Función para obtener el nombre del autor de manera segura
  const getNombreAutor = () => {
    if (typeof loan.AUTOR === 'string') {
      return loan.AUTOR;
    } else {
      return loan.AUTOR.NOMBRE_AUTOR;
    }
  };

  const getStatusConfig = (estado: string) => {
    switch (estado) {
      case 'PRESTADO':
        return {
          color: 'bg-yellow-500',
          icon: '📖',
          text: 'En préstamo',
          action: true
        };
      case 'DEVUELTO':
        return {
          color: 'bg-green-500',
          icon: '✅',
          text: 'Devuelto',
          action: false
        };
      case 'VENCIDO':
        return {
          color: 'bg-red-500',
          icon: '⚠️',
          text: 'Vencido',
          action: true
        };
      default:
        return {
          color: 'bg-gray-500',
          icon: '📋',
          text: estado,
          action: false
        };
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Por devolver';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateDaysRemaining = (devolucionDate: string | null) => {
    if (!devolucionDate || loan.ESTADO === 'DEVUELTO') return null;
    
    const today = new Date();
    const devolucion = new Date(devolucionDate);
    const diffTime = devolucion.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const statusConfig = getStatusConfig(loan.ESTADO);
  const daysRemaining = calculateDaysRemaining(loan.FECHA_DEVOLUCION);
  const isOverdue = daysRemaining !== null && daysRemaining < 0;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-cyan-400/50 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
            {loan.LIBRO_TITULO}
          </h3>
          {/* CAMBIO AQUÍ: Usar la función getNombreAutor() */}
          <p className="text-blue-200 mb-1">por {getNombreAutor()}</p>
          
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <div>
              <span className="text-blue-300">Préstamo:</span>
              <span className="text-white ml-2">{formatDate(loan.FECHA_PRESTAMO)}</span>
            </div>
            <div>
              <span className="text-blue-300">Devolución:</span>
              <span className={`ml-2 ${isOverdue ? 'text-red-400 font-semibold' : 'text-white'}`}>
                {formatDate(loan.FECHA_DEVOLUCION)}
                {isOverdue && ' (Vencido)'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{statusConfig.icon}</span>
            <span className={`${statusConfig.color} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
              {statusConfig.text}
            </span>
          </div>
          
          {daysRemaining !== null && loan.ESTADO === 'PRESTADO' && (
            <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
              isOverdue 
                ? 'bg-red-500 text-white' 
                : daysRemaining <= 3 
                  ? 'bg-orange-500 text-white'
                  : 'bg-green-500 text-white'
            }`}>
              {isOverdue 
                ? `${Math.abs(daysRemaining)} días de retraso` 
                : `${daysRemaining} días restantes`
              }
            </div>
          )}
        </div>
      </div>

      {/* Barra de progreso para días restantes */}
      {daysRemaining !== null && loan.ESTADO === 'PRESTADO' && !isOverdue && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-blue-300 mb-1">
            <span>Tiempo restante</span>
            <span>{daysRemaining} días</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                daysRemaining <= 3 
                  ? 'bg-red-500' 
                  : daysRemaining <= 7 
                    ? 'bg-orange-500' 
                    : 'bg-green-500'
              }`}
              style={{ 
                width: `${Math.max(5, (daysRemaining / 30) * 100)}%` 
              }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
        <span className="text-blue-300 text-sm">ID Préstamo: #{loan.PRESTAMO_ID}</span>
        
        <div className="flex space-x-2">
            <button 
              onClick={handleShowDetails}
              className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Detalles</span>
            </button>
        </div>
      </div>
      <LoanDetailsModal 
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        loan={{
          ...loan,
          USUARIO_NOMBRE: loan.NOMBRE_USUARIO         
        }}
        isMyLoan={true} 
      />
    </div>
  );
}