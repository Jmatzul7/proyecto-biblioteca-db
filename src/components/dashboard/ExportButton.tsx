'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

// Interfaces para las estadísticas
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

interface ExportButtonProps {
  statistics: StatisticsData;
  books: Book[];
  loading: boolean;
}

export default function ExportButton({ statistics, books, loading }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const exportToExcel = () => {
    setExporting(true);
    
    try {
      // Crear workbook
      const wb = XLSX.utils.book_new();

      // Hoja de estadísticas generales - Convertir números a strings para Excel
      const statsData = [
        ['Estadística', 'Valor'],
        ['Total de Libros', statistics.estadisticas_generales.total_libros.toString()],
        ['Libros Disponibles', statistics.estadisticas_generales.libros_disponibles.toString()],
        ['Libros Agotados', statistics.estadisticas_generales.libros_agotados.toString()],
        ['Total de Préstamos', statistics.estadisticas_generales.total_prestamos.toString()],
        ['Préstamos Activos', statistics.estadisticas_generales.prestamos_activos.toString()],
        ['Préstamos del Mes', statistics.estadisticas_generales.prestamos_mes_actual.toString()],
        ['Total de Géneros', statistics.estadisticas_generales.total_generos.toString()],
        ['Total de Copias', statistics.estadisticas_generales.total_copias_sistema.toString()],
        ['Copias Disponibles', statistics.estadisticas_generales.copias_disponibles.toString()],
        ['Copias Prestadas', statistics.estadisticas_generales.copias_prestadas.toString()],
      ];
      
      const statsWs = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, statsWs, 'Estadísticas Generales');

      // Hoja de géneros populares
      const genresData = [
        ['Género', 'Total Libros', 'Total Copias', 'Total Préstamos']
      ];
      
      statistics.generos_populares.forEach(genre => {
        genresData.push([
          genre.nombre_genero,
          genre.total_libros.toString(),
          genre.total_copias.toString(),
          genre.total_prestamos.toString()
        ]);
      });
      
      const genresWs = XLSX.utils.aoa_to_sheet(genresData);
      XLSX.utils.book_append_sheet(wb, genresWs, 'Géneros Populares');

      // Hoja de libros populares
      const popularBooksData = [
        ['Título', 'Autor', 'Género', 'Préstamos Totales', 'Copias Disponibles', 'Porcentaje Disponibilidad']
      ];
      
      statistics.libros_populares.forEach(book => {
        popularBooksData.push([
          book.titulo,
          book.autor,
          book.nombre_genero,
          book.total_prestamos.toString(),
          book.copias_disponibles.toString(),
          `${book.porcentaje_disponibilidad}%`
        ]);
      });
      
      const popularBooksWs = XLSX.utils.aoa_to_sheet(popularBooksData);
      XLSX.utils.book_append_sheet(wb, popularBooksWs, 'Libros Populares');

      // Hoja de libros agotados
      const outOfStockData = [
        ['Título', 'Autor', 'Género', 'Último Préstamo']
      ];
      
      statistics.libros_sin_copias.forEach(book => {
        outOfStockData.push([
          book.titulo,
          book.autor,
          book.nombre_genero,
          book.ultimo_prestamo || 'N/A'
        ]);
      });
      
      const outOfStockWs = XLSX.utils.aoa_to_sheet(outOfStockData);
      XLSX.utils.book_append_sheet(wb, outOfStockWs, 'Libros Agotados');

      // Hoja de libros en tendencia
      const trendingBooksData = [
        ['Título', 'Autor', 'Género', 'Préstamos Recientes', 'Copias Disponibles']
      ];
      
      statistics.libros_tendencia.forEach(book => {
        trendingBooksData.push([
          book.titulo,
          book.autor,
          book.nombre_genero,
          book.prestamos_recientes.toString(),
          book.copias_disponibles.toString()
        ]);
      });
      
      const trendingBooksWs = XLSX.utils.aoa_to_sheet(trendingBooksData);
      XLSX.utils.book_append_sheet(wb, trendingBooksWs, 'Libros en Tendencia');

      // Generar archivo
      const fileName = `estadisticas-biblioteca-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      alert('Error al exportar a Excel');
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    setExporting(true);
    
    try {
      // Crear elemento temporal para el PDF
      const pdfElement = document.createElement('div');
      pdfElement.style.position = 'absolute';
      pdfElement.style.left = '-9999px';
      pdfElement.style.top = '0';
      pdfElement.style.width = '800px';
      pdfElement.style.padding = '20px';
      pdfElement.style.backgroundColor = 'white';
      pdfElement.style.color = 'black';
      pdfElement.style.fontFamily = 'Arial, sans-serif';
      
      // Construir contenido del PDF
      pdfElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #06b6d4; font-size: 28px; margin-bottom: 10px;">Estadísticas de la Biblioteca</h1>
          <p style="color: #666; font-size: 14px;">Generado el ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #06b6d4; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #06b6d4; padding-bottom: 5px;">Estadísticas Generales</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #06b6d4;">${statistics.estadisticas_generales.total_libros}</div>
              <div style="font-size: 12px; color: #666;">Total de Libros</div>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #10b981;">${statistics.estadisticas_generales.libros_disponibles}</div>
              <div style="font-size: 12px; color: #666;">Libros Disponibles</div>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${statistics.estadisticas_generales.libros_agotados}</div>
              <div style="font-size: 12px; color: #666;">Libros Agotados</div>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #8b5cf6;">${statistics.estadisticas_generales.total_prestamos}</div>
              <div style="font-size: 12px; color: #666;">Total Préstamos</div>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${statistics.estadisticas_generales.prestamos_activos}</div>
              <div style="font-size: 12px; color: #666;">Préstamos Activos</div>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${statistics.estadisticas_generales.total_generos}</div>
              <div style="font-size: 12px; color: #666;">Total Géneros</div>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #06b6d4; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #06b6d4; padding-bottom: 5px;">Géneros Más Populares</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #06b6d4; color: white;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Género</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Total Libros</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Total Copias</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Total Préstamos</th>
              </tr>
            </thead>
            <tbody>
              ${statistics.generos_populares.slice(0, 5).map(genre => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 10px; border: 1px solid #ddd;">${genre.nombre_genero}</td>
                  <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${genre.total_libros}</td>
                  <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${genre.total_copias}</td>
                  <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${genre.total_prestamos}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <h2 style="color: #06b6d4; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #06b6d4; padding-bottom: 5px;">Libros Más Populares</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #10b981; color: white;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Título</th>
                  <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Préstamos</th>
                </tr>
              </thead>
              <tbody>
                ${statistics.libros_populares.slice(0, 5).map(book => `
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px; border: 1px solid #ddd; font-size: 12px;">${book.titulo}</td>
                    <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${book.total_prestamos}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div>
            <h2 style="color: #06b6d4; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #06b6d4; padding-bottom: 5px;">Libros Agotados</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #ef4444; color: white;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Título</th>
                  <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Autor</th>
                </tr>
              </thead>
              <tbody>
                ${statistics.libros_sin_copias.slice(0, 5).map(book => `
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px; border: 1px solid #ddd; font-size: 12px;">${book.titulo}</td>
                    <td style="padding: 8px; text-align: center; border: 1px solid #ddd; font-size: 12px;">${book.autor}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;

      document.body.appendChild(pdfElement);

      const canvas = await html2canvas(pdfElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: pdfElement.offsetWidth,
        height: pdfElement.offsetHeight
      });

      document.body.removeChild(pdfElement);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`estadisticas-biblioteca-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error exportando a PDF:', error);
      alert('Error al exportar a PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Botón Excel */}
      <button
        onClick={exportToExcel}
        disabled={exporting || loading}
        className="bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center space-x-2"
      >
        {exporting ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Exportando...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Exportar Excel</span>
          </>
        )}
      </button>

      {/* Botón PDF */}
      <button
        onClick={exportToPDF}
        disabled={exporting || loading}
        className="bg-red-500 hover:bg-red-400 disabled:bg-gray-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center space-x-2"
        title="Exportar a PDF"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>PDF</span>
      </button>
    </div>
  );
}