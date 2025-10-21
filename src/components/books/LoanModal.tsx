'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorAlert from '@/components/ui/ErrorAlert';

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
  libro_id: string;
  titulo: string;
  autor: Autor; // Cambiado de string a objeto Autor
  editorial: Editorial | null; // Nuevo campo
  anio_publicacion: string;
  num_copias: string;
  copias_disponibles: string;
  genero: Genero;
  isbn?: string; // Nuevo campo opcional
}

interface Usuario {
  USUARIO_ID: string;
  NOMBRE: string;
  ROL_ID: string;
  USUARIO_LOGIN: string;
  FECHA_DEVOLUCION: string | null;
  TIPO_USUARIO: string;
}

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoanCreated: () => void;
  book: Book | null;
}

export default function LoanModal({ isOpen, onClose, onLoanCreated, book }: LoanModalProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUsuario, setSelectedUsuario] = useState('');
  const [fechaDevolucion, setFechaDevolucion] = useState('');

  // Cargar usuarios y configurar fecha por defecto al abrir el modal
  useEffect(() => {
    if (isOpen && book) {
      fetchUsuarios();
      setFechaDevolucion(calculateDefaultReturnDate());
    }
  }, [isOpen, book]);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios');
      const result = await response.json();
      
      if (result.success) {
        setUsuarios(result.data);
      } else {
        setError('Error al cargar la lista de usuarios');
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      setError('Error al cargar la lista de usuarios');
    }
  };

  const calculateDefaultReturnDate = () => {
    const today = new Date();
    const returnDate = new Date(today);
    returnDate.setDate(today.getDate() + 14); // 2 semanas por defecto
    
    return returnDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!selectedUsuario) {
        setError('Debes seleccionar un usuario');
        setLoading(false);
        return;
      }

      if (!book) {
        setError('Información del libro no disponible');
        setLoading(false);
        return;
      }

      const loanData = {
        libro_id: book.libro_id,
        usuario_id: selectedUsuario,
        fecha_devolucion: fechaDevolucion
      };

      const response = await fetch('/api/prestamos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData),
      });

      const result = await response.json();

      if (response.ok) {
        // Préstamo creado exitosamente
        onLoanCreated();
        onClose();
        resetForm();
      } else {
        setError(result.message || 'Error al crear el préstamo');
      }
    } catch (err) {
      console.error('Error creating loan:', err);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedUsuario('');
    setFechaDevolucion(calculateDefaultReturnDate());
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !book) return null;

  const userIcon = (
    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const calendarIcon = (
    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  const loanIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className="text-2xl font-bold text-white">Realizar Préstamo</h2>
            <p className="text-blue-200 text-sm mt-1">Asignar libro a usuario</p>
          </div>
          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Información del libro - Actualizada */}
        <div className="p-6 bg-white/5 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white mb-3">Libro seleccionado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-300">Título:</span>
              <p className="text-white font-semibold">{book.titulo}</p>
            </div>
            <div>
              <span className="text-blue-300">Autor:</span>
              <p className="text-white">{book.autor.nombre_autor}</p>
              {book.autor.nacionalidad && (
                <p className="text-blue-200 text-xs">({book.autor.nacionalidad})</p>
              )}
            </div>
            <div>
              <span className="text-blue-300">Género:</span>
              <p className="text-white">{book.genero.nombre_genero}</p>
            </div>
            {book.editorial && (
              <div>
                <span className="text-blue-300">Editorial:</span>
                <p className="text-white">{book.editorial.nombre_editorial}</p>
              </div>
            )}
            <div>
              <span className="text-blue-300">Año:</span>
              <p className="text-white">{book.anio_publicacion || 'N/A'}</p>
            </div>
            {book.isbn && (
              <div>
                <span className="text-blue-300">ISBN:</span>
                <p className="text-white text-xs font-mono">{book.isbn}</p>
              </div>
            )}
            <div className="md:col-span-2">
              <span className="text-blue-300">Copias disponibles:</span>
              <p className={`font-semibold ${parseInt(book.copias_disponibles) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {book.copias_disponibles} de {book.num_copias}
              </p>
            </div>
          </div>
        </div>

        {/* Formulario de préstamo */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <ErrorAlert message={error} />

          <div className="space-y-6">
            {/* Selección de usuario */}
            <Select
              id="usuario_id"
              name="usuario_id"
              value={selectedUsuario}
              onChange={(e) => setSelectedUsuario(e.target.value)}
              options={usuarios.map(usuario => ({
                value: usuario.USUARIO_ID,
                label: `${usuario.NOMBRE} (${usuario.USUARIO_LOGIN}) - ${usuario.TIPO_USUARIO}`
              }))}
              placeholder="Seleccionar usuario..."
              required
              label="Usuario *"
              className="text-gray-800"
            />

            {/* Fecha de devolución */}
            <Input
              id="fecha_devolucion"
              name="fecha_devolucion"
              type="date"
              value={fechaDevolucion}
              onChange={(e) => setFechaDevolucion(e.target.value)}
              required
              label="Fecha de Devolución *"
              icon={calendarIcon}
              min={new Date().toISOString().split('T')[0]}
            />

            {/* Información adicional */}
            <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-cyan-200 text-sm">
                  <p className="font-semibold">Información del préstamo</p>
                  <p className="mt-1">
                    El préstamo se registrará inmediatamente. El usuario tendrá hasta el{' '}
                    <span className="text-white font-semibold">
                      {new Date(fechaDevolucion).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>{' '}
                    para devolver el libro.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/20">
            <Button
              type="button"
              onClick={handleClose}
              disabled={loading}
              variant="secondary"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={loading}
              icon={loanIcon}
              className="flex-1"
              disabled={parseInt(book.copias_disponibles) === 0}
            >
              {loading ? 'Procesando...' : 'Realizar Préstamo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}