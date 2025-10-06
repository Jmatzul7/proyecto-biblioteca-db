// app/home/libros/prestamos/mis-prestamos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import MyLoanList from '@/components/prestamo/misprestamos/MyLoanList';
import LoanStatusTabs from '@/components/prestamo/misprestamos/LoanStatusTabs';
import UserProfile from '@/components/prestamo/misprestamos/UserProfile';
import LoanDetailsModal from '@/components/prestamo/LoanDetailsModal';

interface MyLoan {
  USUARIO_ID: string;
  USUARIO_NOMBRE: string;
  LIBRO_ID: string;
  LIBRO_TITULO: string;
  AUTOR: string;
  PRESTAMO_ID: string;
  FECHA_PRESTAMO: string;
  FECHA_DEVOLUCION: string | null;
  ESTADO: string;
}

export default function MyLoansPage() {
  const { user } = useAuth(); // Obtener información del usuario loggeado
  const [loans, setLoans] = useState<MyLoan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<MyLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedLoan, setSelectedLoan] = useState<MyLoan | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Datos dinámicos del usuario loggeado
  const userData = user ? {
    nombre: user.nombre,
    usuario: user.usuario_login,
    prestamosActivos: loans.filter(loan => loan.ESTADO === 'PRESTADO').length,
    prestamosTotales: loans.length
  } : {
    nombre: "",
    usuario: "",
    prestamosActivos: 0,
    prestamosTotales: 0
  };

  // Cargar préstamos al montar el componente
  useEffect(() => {
    if (user) {
      fetchMyLoans();
    }
  }, [user]);

  // Filtrar préstamos cuando cambie la pestaña activa
  useEffect(() => {
    filterLoans();
  }, [loans, activeTab]);

  const fetchMyLoans = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Usar el ID del usuario loggeado
      const response = await fetch(`/api/prestamos/usuario/${user.usuario_id}`);
      const result = await response.json();

      if (result.status === 'success') {
        setLoans(result.data);
      } else {
        console.error('Error fetching user loans:', result.message);
        // Si hay error, mostrar array vacío
        setLoans([]);
      }
    } catch (error) {
      console.error('Error fetching user loans:', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const filterLoans = () => {
    let filtered = loans;

    switch (activeTab) {
      case 'active':
        filtered = loans.filter(loan => loan.ESTADO === 'PRESTADO');
        break;
      case 'returned':
        filtered = loans.filter(loan => loan.ESTADO === 'DEVUELTO');
        break;
      case 'all':
      default:
        filtered = loans;
        break;
    }

    filtered.sort((a, b) => new Date(b.FECHA_PRESTAMO).getTime() - new Date(a.FECHA_PRESTAMO).getTime());
    setFilteredLoans(filtered);
  };

  // Función para manejar el clic en "Detalles"
  const handleShowDetails = (loan: MyLoan) => {
    setSelectedLoan(loan);
    setShowDetailsModal(true);
  };

  // Función para cerrar el modal
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedLoan(null);
  };

  const stats = {
    active: loans.filter(loan => loan.ESTADO === 'PRESTADO').length,
    returned: loans.filter(loan => loan.ESTADO === 'DEVUELTO').length,
    all: loans.length
  };

  const handleRefresh = () => {
    fetchMyLoans();
  };

  // Preparar datos para el modal
  const loanDetails = selectedLoan ? {
    ...selectedLoan,
    LIBRO_TITULO: selectedLoan.LIBRO_TITULO,
    USUARIO_NOMBRE: selectedLoan.USUARIO_NOMBRE
  } : null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                Mis Préstamos
              </h1>
              <p className="text-blue-200">Gestiona y consulta tu historial de préstamos</p>
              {user && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-sm text-blue-300">Bienvenido:</span>
                  <span className="text-sm bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                    {user.nombre}
                  </span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="mt-4 lg:mt-0 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Cargando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Actualizar
                </>
              )}
            </button>
          </div>

          {/* Perfil del usuario */}
          <UserProfile userData={userData} />

          {/* Pestañas de estado */}
          <div className="my-8">
            <LoanStatusTabs 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              stats={stats}
            />
          </div>

          {/* Lista de préstamos */}
          <MyLoanList 
            loans={filteredLoans} 
            loading={loading}
            onShowDetails={handleShowDetails}
          />

          {/* Modal de detalles */}
          <LoanDetailsModal 
            isOpen={showDetailsModal}
            onClose={handleCloseDetailsModal}
            loan={loanDetails}
            isMyLoan={true}
          />

          {/* Información adicional */}
          {stats.active > 0 && (
            <div className="mt-8 bg-yellow-500/20 border border-yellow-400/50 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-yellow-300 font-semibold">Recordatorio importante</h4>
                  <p className="text-yellow-200 text-sm mt-1">
                    Tienes {stats.active} préstamo(s) activo(s). Recuerda devolver los libros antes de la fecha límite para evitar multas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje cuando no hay préstamos */}
          {!loading && loans.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl text-white font-semibold mb-2">No tienes préstamos</h3>
              <p className="text-blue-200 mb-6">Comienza explorando nuestra biblioteca para encontrar libros interesantes.</p>
              <a
                href="/home/libros"
                className="inline-flex items-center justify-center px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
              >
                Explorar Biblioteca
              </a>
            </div>
          )}

          {/* Botones de acción */}
          {loans.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <a
                href="/home/libros"
                className="inline-flex items-center justify-center px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Explorar Más Libros
              </a>
              
              <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 border border-white/20"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Inicio
              </a>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}