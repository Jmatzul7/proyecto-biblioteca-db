'use client';

import { useState } from 'react';

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

interface BookCardProps {
  book: Book;
  onBookLoan?: (book: Book) => void;
  onUpdateCopies?: (book: Book) => void; 
  isStaff?: boolean;
}

export default function BookCard({ book, onBookLoan, onUpdateCopies, isStaff = false }: BookCardProps) {
  const [isUpdateCopiesModalOpen, setIsUpdateCopiesModalOpen] = useState(false);
  
  const copiasDisponibles = parseInt(book.copias_disponibles);
  const copiasTotales = parseInt(book.num_copias);
  
  // Colores y textos mejorados para disponibilidad
  const getDisponibilidadConfig = () => {
    if (copiasDisponibles === 0) {
      return {
        color: 'bg-red-500',
        text: 'No disponible',
        icon: '❌',
        status: 'agotado'
      };
    } else if (copiasDisponibles === copiasTotales) {
      return {
        color: 'bg-green-500',
        text: `${copiasDisponibles} disponible${copiasDisponibles > 1 ? 's' : ''}`,
        icon: '✅',
        status: 'completo'
      };
    } else {
      return {
        color: 'bg-orange-500',
        text: `${copiasDisponibles}/${copiasTotales} disponible${copiasDisponibles > 1 ? 's' : ''}`,
        icon: '⚠️',
        status: 'parcial'
      };
    }
  };

  const disponibilidad = getDisponibilidadConfig();

  // Función para manejar el clic en Reservar
  const handleReserveClick = () => {
    if (onBookLoan && copiasDisponibles > 0 && isStaff) {
      onBookLoan(book);
    }
  };

  // Función para manejar la actualización de copias
  const handleUpdateCopiesClick = () => {
    if (onUpdateCopies && isStaff) {
      onUpdateCopies(book);
    }
  };

  // Imagen por defecto basada en el género
  const getDefaultImage = (genero: string) => {
    const images: { [key: string]: string } = {
      'Ciencia Ficcion': '🚀',
      'Fantasia': '🧙‍♂️',
      'Romance': '💖',
      'Misterio': '🕵️‍♂️',
      'Thriller': '🔪',
      'Historica': '🏛️',
      'Biografia': '👤',
      'Ciencia': '🔬',
      'Tecnologia': '💻',
      'Arte': '🎨',
      'Filosofia': '🤔',
      'Psicologia': '🧠',
      'Negocios': '💼',
      'Cocina': '👨‍🍳',
      'Viajes': '✈️',
      'Poesia': '📝',
      'Teatro': '🎭',
      'Mitologia': '⚡',
      'Autoayuda': '💪',
      'Infantil': '🧸',
      'Juvenil': '🎒'
    };
    return images[genero] || '📚';
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
      {/* Header con imagen */}
      <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center relative overflow-hidden">
        {book.url_imagen ? (
          <img 
            src={book.url_imagen} 
            alt={book.titulo}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              // Si falla la imagen, mostrar el ícono por defecto
              (e.target as HTMLImageElement).style.display = 'none';
              const fallbackElement = (e.target as HTMLImageElement).parentElement?.querySelector('.image-fallback') as HTMLElement;
              if (fallbackElement) {
                fallbackElement.style.display = 'flex';
              }
            }}
          />
        ) : null}
        
        {/* Fallback de imagen */}
        <div className={`text-6xl opacity-40 group-hover:scale-110 transition-transform duration-500 ${book.url_imagen ? 'image-fallback hidden' : 'flex'}`}>
          {getDefaultImage(book.genero.nombre_genero)}
        </div>
        
        {/* Badge de disponibilidad */}
        <div className={`absolute top-4 right-4 ${disponibilidad.color} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center space-x-1`}>
          <span>{disponibilidad.icon}</span>
          <span>{disponibilidad.text}</span>
        </div>

        {/* Badge de género */}
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
          {book.genero.nombre_genero}
        </div>

        {/* Indicador de estado de copias */}
        {disponibilidad.status === 'parcial' && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-full overflow-hidden">
            <div 
              className="h-1 bg-green-500 transition-all duration-500"
              style={{ width: `${(copiasDisponibles / copiasTotales) * 100}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
          {book.titulo}
        </h3>
        
        {/* Información del autor */}
        <div className="text-blue-200 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div>
            <span className="font-medium">{book.autor.nombre_autor}</span>
            {book.autor.nacionalidad && (
              <span className="text-xs text-blue-300 ml-2">({book.autor.nacionalidad})</span>
            )}
          </div>
        </div>

        {/* Información de editorial */}
        {book.editorial && (
          <div className="text-blue-200 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="truncate">{book.editorial.nombre_editorial}</span>
          </div>
        )}

        {/* Información de copias */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-cyan-400 font-bold text-lg">{copiasTotales}</div>
            <div className="text-blue-300 text-xs">Copias totales</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className={`font-bold text-lg ${
              copiasDisponibles > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {copiasDisponibles}
            </div>
            <div className="text-blue-300 text-xs">Disponibles</div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="flex items-center justify-between text-xs text-blue-300 mb-4">
          <div className="flex flex-col space-y-1">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {book.anio_publicacion || 'N/A'}
            </span>
            
            {book.isbn && (
              <span className="flex items-center" title={`ISBN: ${book.isbn}`}>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {book.isbn}
              </span>
            )}
          </div>
          
          {book.fecha_registro && (
            <span className="flex items-center" title={`Registrado: ${new Date(book.fecha_registro).toLocaleDateString()}`}>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(book.fecha_registro).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-3">
          {/* Botón de Reservar */}
          <button 
            onClick={handleReserveClick}
            className={`flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
              copiasDisponibles > 0 && isStaff
                ? 'bg-cyan-500 hover:bg-cyan-400 text-white transform hover:scale-105' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            disabled={copiasDisponibles === 0 || !isStaff}
            title={
              !isStaff 
                ? 'Solo personal autorizado puede realizar reservas' 
                : copiasDisponibles > 0 
                  ? `Reservar libro (${copiasDisponibles} disponible${copiasDisponibles > 1 ? 's' : ''})` 
                  : 'No hay copias disponibles'
            }
          >
            {copiasDisponibles > 0 ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Reservar</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>No Disponible</span>
              </>
            )}
          </button>
          
          {/* Botón para actualizar copias  */}
          <button 
            onClick={handleUpdateCopiesClick}
            className={`p-2 rounded-xl transition-all duration-300 transform flex items-center justify-center ${
              isStaff
                ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 hover:scale-110'
                : 'bg-gray-600/20 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!isStaff}
            title={isStaff ? "Actualizar número de copias" : "Solo personal autorizado puede actualizar copias"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          {/* Botón de favoritos - Siempre disponible */}
          <button 
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
            title="Agregar a favoritos"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}