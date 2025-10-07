interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number, newLimit?: number) => void; // ← ACTUALIZAR LA FIRMA
}

export default function BookPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange
}: PaginationProps) {
  const pages = [];
  const maxVisiblePages = 5;

  // Calcular rango de páginas a mostrar
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Ajustar si estamos cerca del final
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Calcular rangos de items mostrados - CORREGIDO
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Manejar cambio de items por página
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value);
    onPageChange(1, newLimit); // ← VOLVER A LA PÁGINA 1 CON EL NUEVO LÍMITE
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
      {/* Información de items mostrados */}
      <div className="text-blue-200 text-sm">
        {totalItems > 0 ? (
          <>
            Mostrando <span className="text-white font-semibold">{startItem}-{endItem}</span> de{' '}
            <span className="text-white font-semibold">{totalItems}</span> libros
          </>
        ) : (
          <span className="text-white font-semibold">No hay libros para mostrar</span>
        )}
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center space-x-2">
        {/* Botón anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed border border-white/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Primera página */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 border border-white/20"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="text-blue-300 px-2">...</span>
            )}
          </>
        )}

        {/* Páginas numeradas */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 ${
              currentPage === page
                ? 'bg-cyan-500 text-white shadow-lg transform scale-105'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Última página */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="text-blue-300 px-2">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 border border-white/20"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Botón siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed border border-white/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Selector de items por página - CORREGIDO */}
      <div className="flex items-center space-x-2 text-blue-200 text-sm">
        <span>Mostrar:</span>
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange} 
          className="bg-white/5 border border-white/20 rounded-xl text-white px-3 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <option className="text-gray-600" value="10">10</option>
          <option className="text-gray-600" value="20">20</option>
          <option className="text-gray-600" value="50">50</option>
          <option className="text-gray-600" value="100">100</option>
        </select>
        <span>por página</span>
      </div>
    </div>
  );
}