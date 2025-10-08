'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ErrorAlert from '@/components/ui/ErrorAlert';

interface Book {
  libro_id: string;
  titulo: string;
  autor: string;
  num_copias: string;
  copias_disponibles: string;
  genero: {
    nombre_genero: string;
  };
}

interface UpdateCopiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopiesUpdated: () => void;
  book: Book | null;
}

export default function UpdateCopiesModal({ isOpen, onClose, onCopiesUpdated, book }: UpdateCopiesModalProps) {
  const [numCopias, setNumCopias] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Inicializar el formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && book) {
      setNumCopias(book.num_copias);
      setError('');
    }
  }, [isOpen, book]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  // Función separada para el botón
  const handleButtonSubmit = async () => {
    await submitForm();
  };

  const submitForm = async () => {
    setLoading(true);
    setError('');

    try {
      if (!book) {
        setError('Información del libro no disponible');
        setLoading(false);
        return;
      }

      const nuevasCopias = parseInt(numCopias);
      if (isNaN(nuevasCopias) || nuevasCopias < 0) {
        setError('El número de copias debe ser un número válido');
        setLoading(false);
        return;
      }

      // Verificar que no se reduzcan las copias por debajo de los préstamos activos
      const prestamosActivos = parseInt(book.num_copias) - parseInt(book.copias_disponibles);
      if (nuevasCopias < prestamosActivos) {
        setError(`No puedes reducir a menos de ${prestamosActivos} copias. Hay ${prestamosActivos} préstamos activos.`);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/books/${book.libro_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          num_copias: nuevasCopias
        }),
      });

      const result = await response.json();

      if (response.ok) {
        onCopiesUpdated();
        onClose();
        resetForm();
      } else {
        setError(result.message || 'Error al actualizar las copias');
      }
    } catch (err) {
      console.error('Error updating copies:', err);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNumCopias('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !book) return null;

  const copiasIcon = (
    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );

  const updateIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );

  const prestamosActivos = parseInt(book.num_copias) - parseInt(book.copias_disponibles);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Actualizar Copias</h2>
            <p className="text-blue-200 text-sm mt-1">Modificar número de copias del libro</p>
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

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto">
          {/* Información del libro */}
          <div className="p-6 border-b border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{book.titulo}</h3>
            <p className="text-blue-200 text-sm">por {book.autor}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-cyan-400 font-bold">{book.num_copias}</div>
                <div className="text-blue-300 text-xs">Copias actuales</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-green-400 font-bold">{book.copias_disponibles}</div>
                <div className="text-blue-300 text-xs">Disponibles</div>
              </div>
            </div>

            {prestamosActivos > 0 && (
              <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                <div className="flex items-center text-yellow-300 text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>{prestamosActivos} préstamo(s) activo(s)</span>
                </div>
              </div>
            )}
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <ErrorAlert message={error} />

            <Input
              id="num_copias"
              name="num_copias"
              type="number"
              value={numCopias}
              onChange={(e) => setNumCopias(e.target.value)}
              placeholder="Ej: 10"
              required
              label="Nuevo número de copias *"
              icon={copiasIcon}
              min={prestamosActivos.toString()}
              max={1000}
            />

            {/* Información de cambios */}
            {numCopias && !isNaN(parseInt(numCopias)) && (
              <div className="bg-white/5 border border-white/20 rounded-xl p-4">
                <h4 className="text-white font-semibold text-sm mb-2">Resumen de cambios:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-300">Copias actuales:</span>
                    <span className="text-white">{book.num_copias}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">Nuevas copias:</span>
                    <span className="text-white">{numCopias}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">Diferencia:</span>
                    <span className={parseInt(numCopias) > parseInt(book.num_copias) ? 'text-green-400' : 'text-red-400'}>
                      {parseInt(numCopias) > parseInt(book.num_copias) ? '+' : ''}
                      {parseInt(numCopias) - parseInt(book.num_copias)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Botones fijos en la parte inferior */}
        <div className="p-6 border-t border-white/20 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
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
              type="button" 
              onClick={handleButtonSubmit}
              loading={loading}
              icon={updateIcon}
              className="flex-1"
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}