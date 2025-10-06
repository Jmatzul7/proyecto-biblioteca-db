'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorAlert from '@/components/ui/ErrorAlert';

interface Genero {
  genero_id: string;
  nombre_genero: string;
}

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: () => void;
}

export default function AddBookModal({ isOpen, onClose, onBookAdded }: AddBookModalProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    anio_publicacion: '',
    genero_id: '',
    num_copias: '1',
    crear_copias: 'true',
    url_imagen: ''
  });
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar géneros al abrir el modal
  useEffect(() => {
    if (isOpen) {
      fetchGeneros();
    }
  }, [isOpen]);
  
  const fetchGeneros = async () => {
    try {
      const response = await fetch('/api/genero');
      const result = await response.json();
      
      if (result.success) {
        setGeneros(result.data);
      } else {
        setError('Error al cargar los géneros');
      }
    } catch (error) {
      console.error('Error fetching generos:', error);
      setError('Error al cargar los géneros');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.titulo.trim() || !formData.autor.trim()) {
        setError('Título y autor son obligatorios');
        setLoading(false);
        return;
      }

      if (formData.anio_publicacion && (parseInt(formData.anio_publicacion) < 1000 || parseInt(formData.anio_publicacion) > new Date().getFullYear())) {
        setError('El año de publicación debe ser válido');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Libro agregado con éxito'+ result.data);
        onBookAdded();
        onClose();
        resetForm();
      } else {
        setError(result.message || 'Error al agregar el libro');
      }
    } catch (err) {
      console.error('Error adding book:', err);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      autor: '',
      anio_publicacion: '',
      genero_id: '',
      num_copias: '1',
      crear_copias: 'true',
      url_imagen: ''
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const bookIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );

  const addIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className="text-2xl font-bold text-white">Agregar Nuevo Libro</h2>
            <p className="text-blue-200 text-sm mt-1">Completa la información del libro</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <ErrorAlert message={error} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <Input
              id="titulo"
              name="titulo"
              type="text"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ingresa el título del libro"
              required
              label="Título del Libro *"
              icon={bookIcon}
              className="md:col-span-2"
            />

            {/* Autor */}
            <Input
              id="autor"
              name="autor"
              type="text"
              value={formData.autor}
              onChange={handleChange}
              placeholder="Nombre completo del autor"
              required
              label="Autor *"
              icon={bookIcon}
              className="md:col-span-2"
            />

            {/* Año de Publicación */}
            <Input
              id="anio_publicacion"
              name="anio_publicacion"
              type="number"
              value={formData.anio_publicacion}
              onChange={handleChange}
              placeholder="Ej: 2023"
              label="Año de Publicación"
              min={1900}
              max={new Date().getFullYear()}
            />

            {/* Género */}
            <Select
              id="genero_id"
              name="genero_id"
              value={formData.genero_id}
              onChange={handleChange}
              options={generos.map(g => ({ value: g.genero_id, label: g.nombre_genero }))}
              placeholder="Seleccionar género"
              label="Género"
              className="text-gray-500"
            />

            {/* Número de Copias */}
            <Input
              id="num_copias"
              name="num_copias"
              type="number"
              value={formData.num_copias}
              onChange={handleChange}
              placeholder="Ej: 5"
              label="Número de Copias"
              min={1}
              max={100}
            />

            <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/20">
              <input
                id="crear_copias"
                name="crear_copias"
                type="checkbox"
                checked={formData.crear_copias === 'true'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  crear_copias: e.target.checked ? 'true' : 'false'
                }))}
                className="h-4 w-4 text-cyan-400 focus:ring-cyan-400 border-white/20 rounded bg-white/5"
              />
              <label htmlFor="crear_copias" className="text-blue-200 text-sm">
                Crear registros individuales en COPIAS_LIBROS
              </label>
            </div>

            {/* URL de Imagen */}
            <Input
              id="url_imagen"
              name="url_imagen"
              type="url"
              value={formData.url_imagen}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
              label="URL de la Imagen (Opcional)"
              className="md:col-span-2"
            />
          </div>

          {/* Vista previa de imagen */}
          {formData.url_imagen && (
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Vista Previa de la Imagen
              </label>
              <div className="bg-white/5 border border-white/20 rounded-xl p-4">
                <img 
                  src={formData.url_imagen} 
                  alt="Vista previa" 
                  className="max-h-32 mx-auto rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

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
              icon={addIcon}
              className="flex-1"
            >
              {loading ? 'Agregando...' : 'Agregar Libro'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}