'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Importar el hook
import ProtectedStaffRoute from '@/components/ProtectedStaffRoute'; // Importar el componente de protección
import LoanList from '@/components/prestamo/LoanList';

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

export default function PrestamosPage() {
  const { user } = useAuth(); // Obtener información del usuario
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado: '',
    usuario: '',
    libro: ''
  });

  // Función para cargar los préstamos
  const fetchLoans = async () => {
    try {
      setLoading(true);
      
      // Construir query parameters
      const params = new URLSearchParams();
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.usuario) params.append('usuario', filters.usuario);
      if (filters.libro) params.append('libro', filters.libro);

      const response = await fetch(`/api/prestamos?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setLoans(result.data);
        console.log('Loans loaded:', result.data);
      } else {
        console.error('Error fetching loans:', result.message);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar préstamos al montar el componente
  useEffect(() => {
    fetchLoans();
  }, []);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    fetchLoans();
  }, [filters]);

  // Función para manejar la actualización de préstamos
  const handleLoanUpdate = () => {
    fetchLoans(); // Recargar la lista completa
  };

  // Función para manejar cambios en los filtros
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Estadísticas
  const stats = {
    total: loans.length,
    prestados: loans.filter(loan => loan.ESTADO === 'PRESTADO').length,
    devueltos: loans.filter(loan => loan.ESTADO === 'DEVUELTO').length,
    vencidos: loans.filter(loan => loan.ESTADO === 'VENCIDO').length
  };

  return (
    <ProtectedStaffRoute>
      <div className="text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header con información del rol */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
                Gestión de Préstamos
              </h1>
              <p className="text-xl text-blue-200 max-w-2xl">
                Administra y realiza seguimiento de todos los préstamos de la biblioteca
              </p>
              {user && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-sm text-blue-300">Conectado como:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    user.nombre_rol === 'Administrador' 
                      ? 'bg-red-500/20 text-red-300' 
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {user.nombre} ({user.nombre_rol})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-cyan-400 mb-2">{stats.total}</div>
              <div className="text-blue-200">Total préstamos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.prestados}</div>
              <div className="text-blue-200">Activos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-green-400 mb-2">{stats.devueltos}</div>
              <div className="text-blue-200">Devueltos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-red-400 mb-2">{stats.vencidos}</div>
              <div className="text-blue-200">Vencidos</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Estado
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-xl text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option className='text-gray-600' value="">Todos los estados</option>
                  <option className='text-gray-600' value="PRESTADO">Prestado</option>
                  <option className='text-gray-600' value="DEVUELTO">Devuelto</option>
                  <option className='text-gray-600' value="VENCIDO">Vencido</option>
                  <option className='text-gray-600' value="DANIADO">Dañado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Buscar por usuario
                </label>
                <input
                  type="text"
                  value={filters.usuario}
                  onChange={(e) => handleFilterChange('usuario', e.target.value)}
                  placeholder="Nombre del usuario..."
                  className="w-full bg-white/5 border border-white/20 rounded-xl text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">
                  Buscar por libro
                </label>
                <input
                  type="text"
                  value={filters.libro}
                  onChange={(e) => handleFilterChange('libro', e.target.value)}
                  placeholder="Título del libro..."
                  className="w-full bg-white/5 border border-white/20 rounded-xl text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Lista de préstamos */}
          <LoanList 
            loans={loans} 
            loading={loading}
            onLoanUpdate={handleLoanUpdate}
          />
        </div>
      </div>
    </ProtectedStaffRoute>
  );
}