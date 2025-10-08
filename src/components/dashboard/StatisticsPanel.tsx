'use client';
// Interfaces para las estadísticas
interface EstadisticasGenerales {
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
}

interface GeneroPopular {
  genero_id: number;
  nombre_genero: string;
  total_libros: number;
  total_copias: number;
  total_prestamos: number;
}

interface LibroPopular {
  libro_id: number;
  titulo: string;
  autor: string;
  total_prestamos: number;
  copias_disponibles: number;
  num_copias: number;
  nombre_genero: string;
  porcentaje_disponibilidad: number;
}

interface LibroSinCopias {
  libro_id: number;
  titulo: string;
  autor: string;
  copias_disponibles: number;
  num_copias: number;
  nombre_genero: string;
  ultimo_prestamo: string;
  estado: string;
}

interface LibroTendencia {
  libro_id: number;
  titulo: string;
  autor: string;
  prestamos_recientes: number;
  copias_disponibles: number;
  num_copias: number;
  nombre_genero: string;
  tendencia: string;
}

interface StatisticsData {
  estadisticas_generales: EstadisticasGenerales;
  generos_populares: GeneroPopular[];
  libros_populares: LibroPopular[];
  libros_sin_copias: LibroSinCopias[];
  libros_tendencia: LibroTendencia[];
}

interface StatisticsPanelProps {
  statistics: StatisticsData | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function StatisticsPanel({ statistics, loading, onRefresh }: StatisticsPanelProps) {
  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-3 text-blue-200">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl text-white font-semibold mb-2">No hay estadísticas disponibles</h3>
        <p className="text-blue-200">Las estadísticas no pudieron ser cargadas</p>
      </div>
    );
  }

  const { estadisticas_generales, generos_populares, libros_populares, libros_sin_copias, libros_tendencia } = statistics;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Estadísticas de la Biblioteca</h2>
        <button
          onClick={onRefresh}
          className="bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Actualizar</span>
        </button>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">{estadisticas_generales.total_libros}</div>
          <div className="text-blue-200 text-sm">Libros</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{estadisticas_generales.libros_disponibles}</div>
          <div className="text-blue-200 text-sm">Disponibles</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{estadisticas_generales.libros_agotados}</div>
          <div className="text-blue-200 text-sm">Agotados</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{estadisticas_generales.total_prestamos}</div>
          <div className="text-blue-200 text-sm">Préstamos</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{estadisticas_generales.prestamos_activos}</div>
          <div className="text-blue-200 text-sm">Activos</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{estadisticas_generales.total_generos}</div>
          <div className="text-blue-200 text-sm">Géneros</div>
        </div>
      </div>

      {/* Géneros populares */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Géneros Más Populares</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {generos_populares.slice(0, 5).map((genero: GeneroPopular) => (
            <div key={genero.genero_id} className="bg-white/5 rounded-xl p-3">
              <div className="font-semibold text-white text-sm">{genero.nombre_genero}</div>
              <div className="text-blue-200 text-xs">
                {genero.total_libros} libros • {genero.total_prestamos} préstamos
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Libros populares y en tendencia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Libros Más Populares</h3>
          <div className="space-y-2">
            {libros_populares.slice(0, 5).map((libro: LibroPopular) => (
              <div key={libro.libro_id} className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium text-white text-sm">{libro.titulo}</div>
                  <div className="text-blue-200 text-xs">{libro.autor}</div>
                </div>
                <div className="text-right">
                  <div className="text-cyan-400 font-bold">{libro.total_prestamos}</div>
                  <div className="text-blue-200 text-xs">préstamos</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Libros Agotados</h3>
          <div className="space-y-2">
            {libros_sin_copias.slice(0, 5).map((libro: LibroSinCopias) => (
              <div key={libro.libro_id} className="bg-white/5 rounded-lg p-3">
                <div className="font-medium text-white text-sm">{libro.titulo}</div>
                <div className="text-blue-200 text-xs">{libro.autor}</div>
                <div className="text-red-400 text-xs mt-1">Sin copias disponibles</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Libros en tendencia */}
      {libros_tendencia && libros_tendencia.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Libros en Tendencia (Último Mes)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {libros_tendencia.slice(0, 4).map((libro: LibroTendencia) => (
              <div key={libro.libro_id} className="bg-white/5 rounded-xl p-3">
                <div className="font-semibold text-white text-sm mb-1">{libro.titulo}</div>
                <div className="text-blue-200 text-xs mb-2">{libro.autor}</div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-400 text-xs font-bold">{libro.prestamos_recientes} préstamos</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    libro.copias_disponibles > 0 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {libro.copias_disponibles} disp.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}