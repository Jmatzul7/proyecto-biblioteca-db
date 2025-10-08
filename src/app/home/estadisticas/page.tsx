'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import  StatisticsPanel from '@/components/dashboard/StatisticsPanel';
import ExportButton from '@/components/dashboard/ExportButton';

interface StatisticsData {
  estadisticas_generales: {
    total_generos: number;
    total_libros: number;
    total_copias: number;
    prestamos_activos: number;
    libros_disponibles: number;
    libros_agotados: number;
    total_prestamos: number;
    prestamos_mes_actual: number;
    total_copias_sistema: number;
    copias_disponibles: number;
    copias_prestadas: number;
  };
  generos_populares: Array<{
    genero_id: number;
    nombre_genero: string;
    total_libros: number;
    total_copias: number;
    total_prestamos: number;
  }>;
  libros_populares: Array<{
    libro_id: number;
    titulo: string;
    autor: string;
    total_prestamos: number;
    copias_disponibles: number;
    num_copias: number;
    nombre_genero: string;
    porcentaje_disponibilidad: number;
  }>;
  libros_sin_copias: Array<{
    libro_id: number;
    titulo: string;
    autor: string;
    copias_disponibles: number;
    num_copias: number;
    nombre_genero: string;
    ultimo_prestamo: string;
    estado: string;
  }>;
  libros_tendencia: Array<{
    libro_id: number;
    titulo: string;
    autor: string;
    prestamos_recientes: number;
    copias_disponibles: number;
    num_copias: number;
    nombre_genero: string;
    tendencia: string;
  }>;
}

export default function EstadisticasPage() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/genero/estadisticas');
      const result = await response.json();

      if (result.success) {
        setStatistics(result.data);
        setLastUpdated(new Date());
      } else {
        console.error('Error fetching statistics:', result.message);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStatistics();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Dashboard de Estadísticas
            </h1>
            <p className="text-xl text-blue-200 max-w-2xl">
              Análisis completo y métricas detalladas de tu biblioteca
            </p>
            {lastUpdated && (
              <p className="text-blue-300 text-sm mt-2">
                Última actualización: {lastUpdated.toLocaleString('es-ES')}
              </p>
            )}
            {user && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-sm text-blue-300">Conectado como:</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  user.nombre_rol === 'Administrador' 
                    ? 'bg-red-500/20 text-red-300' 
                    : user.nombre_rol === 'Bibliotecario'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-green-500/20 text-green-300'
                }`}>
                  {user.nombre} ({user.nombre_rol})
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Botón de exportación */}
            {statistics && (
              <ExportButton 
                statistics={statistics}
                books={[]}
                loading={loading}
              />
            )}

            {/* Botón de actualizar */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Cargando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Actualizar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Panel de estadísticas */}
        <StatisticsPanel 
          statistics={statistics}
          loading={loading}
          onRefresh={handleRefresh}
        />

        {/* Información adicional */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-cyan-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-semibold text-white">¿Qué significan estas estadísticas?</h3>
            </div>
            <ul className="text-blue-200 space-y-2 text-sm">
              <li>• <strong>Libros Populares:</strong> Títulos con más préstamos históricos</li>
              <li>• <strong>Géneros Populares:</strong> Categorías con más libros y préstamos</li>
              <li>• <strong>Libros Agotados:</strong> Títulos sin copias disponibles</li>
              <li>• <strong>Tendencias:</strong> Libros más prestados en el último mes</li>
              <li>• <strong>Disponibilidad:</strong> Relación entre copias totales y disponibles</li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-white">Exportación de Datos</h3>
            </div>
            <div className="text-blue-200 text-sm space-y-2">
              <p>Puedes exportar todas las estadísticas en diferentes formatos:</p>
              <ul className="space-y-1 ml-4">
                <li>• <strong>Excel:</strong> Múltiples hojas organizadas</li>
                <li>• <strong>PDF:</strong> Reporte visual listo para imprimir</li>
              </ul>
              <p className="mt-3 text-cyan-300">
                Los datos se actualizan automáticamente cada vez que visitas esta página.
              </p>
            </div>
          </div>
        </div>

        {/* Navegación rápida */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <a
            href="/home/libros"
            className="inline-flex items-center justify-center px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Explorar Biblioteca
          </a>
          
          <a
            href="/home/libros/prestamos"
            className="inline-flex items-center justify-center px-6 py-3 bg-purple-500 hover:bg-purple-400 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Gestión de Préstamos
          </a>

          {user?.nombre_rol === 'Administrador' && (
            <a
              href="/home/usuarios"
              className="inline-flex items-center justify-center px-6 py-3 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Gestión de Usuarios
            </a>
          )}
        </div>
      </div>
    </div>
  );
}