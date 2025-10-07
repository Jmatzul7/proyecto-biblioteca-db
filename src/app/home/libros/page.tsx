// app/home/libros/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BookGrid from '@/components/books/BookGrid';
import BookSearch from '@/components/books/BookSearch';
import BookFilters from '@/components/books/BookFilters';
import AddBookModal from '@/components/books/AddBookModal';
import LoanModal from '@/components/books/LoanModal';
import BookPagination from '@/components/books/BookPagination';
import UpdateCopiesModal from '@/components/books/UpdateCopiesModal';

interface Book {
  usuario_id: string;
  libro_id: string;
  titulo: string;
  autor: string;
  anio_publicacion: string;
  num_copias: string;
  fecha_registro: string;
  genero: {
    genero_id: string;
    nombre_genero: string;
  };
  copias_disponibles: string;
  url_imagen: string | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function BooksPage() {
  const { user } = useAuth(); // Obtener información del usuario
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isUpdateCopiesModalOpen, setIsUpdateCopiesModalOpen] = useState(false);
  
  // Estado para paginación
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Verificar si el usuario es administrador
  const isAdmin = user?.nombre_rol === 'Administrador';
  
  // Verificar si el usuario es bibliotecario o administrador
  //const isStaff = user && (user.nombre_rol === 'Administrador' || user.nombre_rol === 'Bibliotecario');
  const isStaff = user ? (user.nombre_rol === 'Administrador' || user.nombre_rol === 'Bibliotecario') : false;

  // Cargar TODOS los libros al montar el componente
  useEffect(() => {
    fetchAllBooks();
  }, []);

  // Aplicar filtros cuando cambien los criterios de búsqueda
  useEffect(() => {
    applyFilters();
  }, [allBooks, searchTerm, selectedGenre, availabilityFilter]);

  // Actualizar libros mostrados cuando cambie la paginación o los libros filtrados
  useEffect(() => {
    updateDisplayedBooks();
  }, [filteredBooks, pagination.page, pagination.limit]);

  const fetchAllBooks = async () => {
    try {
      setLoading(true);
      
      // Cargar TODOS los libros sin paginación
      const response = await fetch('/api/books?limit=1000');
      const result = await response.json();

      if (result.success) {
        setAllBooks(result.data);
      } else {
        console.error('Error fetching books:', result.message);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allBooks];

    // Filtrar por búsqueda (título, autor o género)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(book =>
        book.titulo.toLowerCase().includes(searchLower) ||
        book.autor.toLowerCase().includes(searchLower) ||
        book.genero.nombre_genero.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por género
    if (selectedGenre) {
      filtered = filtered.filter(book => book.genero.nombre_genero === selectedGenre);
    }

    // Filtrar por disponibilidad
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(book => parseInt(book.copias_disponibles) > 0);
    } else if (availabilityFilter === 'unavailable') {
      filtered = filtered.filter(book => parseInt(book.copias_disponibles) === 0);
    }

    setFilteredBooks(filtered);
    
    // Actualizar paginación
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit),
      page: 1
    }));
  };

  const updateDisplayedBooks = () => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const booksToDisplay = filteredBooks.slice(startIndex, endIndex);
    setDisplayedBooks(booksToDisplay);
  };

  const handlePageChange = (page: number, newLimit?: number) => {
    setPagination(prev => ({
      ...prev,
      page,
      ...(newLimit && { 
        limit: newLimit, 
        page: 1,
        totalPages: Math.ceil(prev.total / newLimit)
      })
    }));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
  };

  const handleAvailabilityChange = (availability: string) => {
    setAvailabilityFilter(availability);
  };

  // Función para abrir el modal de actualizar copias
  const handleOpenUpdateCopiesModal = (book: Book) => {
    setSelectedBook(book);
    setIsUpdateCopiesModalOpen(true);
  };

  // Función para cerrar el modal de actualizar copias
  const handleCloseUpdateCopiesModal = () => {
    setIsUpdateCopiesModalOpen(false);
    setSelectedBook(null);
  };

  // Función cuando se actualizan las copias exitosamente
  const handleCopiesUpdated = () => {
    // Recargar todos los libros para actualizar disponibilidad
    fetchAllBooks();
    handleCloseUpdateCopiesModal();
  };

  // Función para abrir el modal de préstamo
  const handleOpenLoanModal = (book: Book) => {
    setSelectedBook(book);
    setIsLoanModalOpen(true);
  };

  // Función para cerrar el modal de préstamo
  const handleCloseLoanModal = () => {
    setIsLoanModalOpen(false);
    setSelectedBook(null);
  };

  // Función cuando se crea un préstamo exitosamente
  const handleLoanCreated = () => {
    // Recargar todos los libros para actualizar disponibilidad
    fetchAllBooks();
    handleCloseLoanModal();
  };

  // Obtener géneros únicos para el filtro
  const uniqueGenres = [...new Set(allBooks.map(book => book.genero.nombre_genero))];

  const handleBookAdded = () => {
    fetchAllBooks();
  };

  // Calcular estadísticas en tiempo real
  const stats = {
    total: allBooks.length,
    available: allBooks.filter(book => parseInt(book.copias_disponibles) > 0).length,
    genres: uniqueGenres.length,
    filtered: filteredBooks.length
  };

  return (
    <div className="text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con botón agregar - SOLO PARA ADMINISTRADORES */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Nuestra Biblioteca
            </h1>
            <p className="text-xl text-blue-200 max-w-2xl">
              Explora nuestra colección de libros y descubre nuevas aventuras literarias
            </p>
          </div>
          
          {/* Mostrar botón solo si es administrador */}
          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Agregar Libro</span>
            </button>
          )}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-cyan-400 mb-2">{stats.total}</div>
            <div className="text-blue-200">Total de libros</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-green-400 mb-2">{stats.available}</div>
            <div className="text-blue-200">Disponibles</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-purple-400 mb-2">{stats.genres}</div>
            <div className="text-blue-200">Géneros</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.filtered}</div>
            <div className="text-blue-200">Resultados</div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:max-w-md">
              <BookSearch 
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
              />
            </div>
            <BookFilters
              selectedGenre={selectedGenre}
              onGenreChange={handleGenreChange}
              availabilityFilter={availabilityFilter}
              onAvailabilityChange={handleAvailabilityChange}
              genres={uniqueGenres}
            />
          </div>

          {/* Resultados de búsqueda */}
          {(searchTerm || selectedGenre || availabilityFilter !== 'all') && (
            <div className="mt-4 text-blue-200">
              {stats.filtered} resultados 
              {searchTerm && ` para "${searchTerm}"`}
              {selectedGenre && ` en ${selectedGenre}`}
              {availabilityFilter !== 'all' && ` (${availabilityFilter === 'available' ? 'Disponibles' : 'No disponibles'})`}
            </div>
          )}
        </div>

        {/* Grid de libros - Pasar información de autenticación */}
        <BookGrid 
          books={displayedBooks} 
          loading={loading} 
          onBookLoan={handleOpenLoanModal} 
          onUpdateCopies={handleOpenUpdateCopiesModal}
          isStaff={isStaff}
        />

        {/* Paginación - Solo mostrar si hay más de una página */}
        {!loading && pagination.totalPages > 1 && (
          <BookPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
          />
        )}

        {/* Mensaje cuando no hay resultados */}
        {!loading && filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl text-white font-semibold mb-2">No se encontraron libros</h3>
            <p className="text-blue-200">Intenta con otros términos de búsqueda o filtros</p>
          </div>
        )}

        {/* Modal para agregar libro */}
        <AddBookModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onBookAdded={handleBookAdded}
        />

        {/* Modal para préstamo */}
        <LoanModal 
          isOpen={isLoanModalOpen}
          onClose={handleCloseLoanModal}
          onLoanCreated={handleLoanCreated}
          book={selectedBook}
        />

        {/* Modal para actualizar copias */}
        <UpdateCopiesModal 
          isOpen={isUpdateCopiesModalOpen}
          onClose={handleCloseUpdateCopiesModal}
          onCopiesUpdated={handleCopiesUpdated}
          book={selectedBook}
        />

      </div>
    </div>
  );
}