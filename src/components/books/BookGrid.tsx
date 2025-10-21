import BookCard from './BookCard';

interface Autor {
  autor_id: string;
  nombre_autor: string;
  nacionalidad: string;
}

interface Editorial {
  editorial_id: string;
  nombre_editorial: string;
}

interface Genero {
  genero_id: string;
  nombre_genero: string;
}

interface Book {
  usuario_id: string;
  libro_id: string;
  titulo: string;
  autor: Autor; // Cambiado de string a objeto Autor
  editorial: Editorial | null; // Nuevo campo
  anio_publicacion: string;
  num_copias: string;
  fecha_registro: string;
  genero: Genero;
  copias_disponibles: string;
  url_imagen: string | null;
  isbn?: string; // Nuevo campo opcional
}

interface BookGridProps {
  books: Book[];
  loading?: boolean;
  onBookLoan?: (book: Book) => void; 
  onUpdateCopies?: (book: Book) => void;
  isStaff?: boolean;
}

export default function BookGrid({ 
  books, 
  loading = false, 
  onBookLoan, 
  onUpdateCopies,
  isStaff = false
}: BookGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white/10 rounded-2xl h-96 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl text-white font-semibold mb-2">No se encontraron libros</h3>
        <p className="text-blue-200">Intenta con otros filtros o términos de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard 
          key={book.libro_id} 
          book={book} 
          onBookLoan={onBookLoan}
          onUpdateCopies={onUpdateCopies}
          isStaff={isStaff}
        />
      ))}
    </div>
  );
}