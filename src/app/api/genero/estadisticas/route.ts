import { NextRequest, NextResponse } from 'next/server';
import runQuery from '@/lib/db/oracle';

// Interfaces para los resultados de la base de datos
interface GeneroPopular {
  GENERO_ID: number;
  NOMBRE_GENERO: string;
  TOTAL_LIBROS: number;
  TOTAL_COPIAS: number;
  TOTAL_PRESTAMOS: number;
}

interface TotalResult {
  TOTAL: number;
}

interface LibroPopularDB {
  LIBRO_ID: number;
  TITULO: string;
  NOMBRE_AUTOR: string; // Cambiado de AUTOR a NOMBRE_AUTOR
  NUM_COPIAS: number;
  NOMBRE_GENERO: string;
  TOTAL_PRESTAMOS: number;
  COPIAS_DISPONIBLES: number;
}

interface LibroSinCopiasDB {
  LIBRO_ID: number;
  TITULO: string;
  NOMBRE_AUTOR: string; // Cambiado de AUTOR a NOMBRE_AUTOR
  NUM_COPIAS: number;
  NOMBRE_GENERO: string;
  COPIAS_DISPONIBLES: number;
  ULTIMO_PRESTAMO: string;
}

interface LibroTendenciaDB {
  LIBRO_ID: number;
  TITULO: string;
  NOMBRE_AUTOR: string; // Cambiado de AUTOR a NOMBRE_AUTOR
  NUM_COPIAS: number;
  NOMBRE_GENERO: string;
  COPIAS_DISPONIBLES: number;
  PRESTAMOS_RECIENTES: number;
}

// Interfaces para la respuesta formateada (MANTENIENDO LA MISMA ESTRUCTURA)
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

interface GeneroPopularFormateado {
  genero_id: number;
  nombre_genero: string;
  total_libros: number;
  total_copias: number;
  total_prestamos: number;
}

interface LibroPopularFormateado {
  libro_id: number;
  titulo: string;
  autor: string; // Mantenemos 'autor' para el frontend
  total_prestamos: number;
  copias_disponibles: number;
  num_copias: number;
  nombre_genero: string;
  porcentaje_disponibilidad: number;
}

interface LibroSinCopiasFormateado {
  libro_id: number;
  titulo: string;
  autor: string; // Mantenemos 'autor' para el frontend
  copias_disponibles: number;
  num_copias: number;
  nombre_genero: string;
  ultimo_prestamo: string;
  estado: string;
}

interface LibroTendenciaFormateado {
  libro_id: number;
  titulo: string;
  autor: string; // Mantenemos 'autor' para el frontend
  prestamos_recientes: number;
  copias_disponibles: number;
  num_copias: number;
  nombre_genero: string;
  tendencia: string;
}

interface StatisticsResponse {
  estadisticas_generales: EstadisticasGenerales;
  generos_populares: GeneroPopularFormateado[];
  libros_populares: LibroPopularFormateado[];
  libros_sin_copias: LibroSinCopiasFormateado[];
  libros_tendencia: LibroTendenciaFormateado[];
  resumen: {
    total_libros_populares: number;
    total_libros_agotados: number;
    total_libros_tendencia: number;
  };
}

export async function GET() {
  try {
    // Consulta para géneros más populares
    const generosPopulares = await runQuery(
      `SELECT g.genero_id, g.nombre_genero,
              COUNT(l.libro_id) as total_libros,
              COALESCE(SUM(l.num_copias), 0) as total_copias,
              (SELECT COUNT(*) FROM PRESTAMOS p 
               JOIN LIBROS l2 ON p.libro_id = l2.libro_id 
               WHERE l2.genero_id = g.genero_id) as total_prestamos
       FROM GENEROS g
       LEFT JOIN LIBROS l ON g.genero_id = l.genero_id
       GROUP BY g.genero_id, g.nombre_genero
       ORDER BY COUNT(l.libro_id) DESC, total_prestamos DESC
       FETCH FIRST 10 ROWS ONLY`
    );

    // Calcular copias disponibles basado en LIBROS.num_copias - PRESTAMOS activos
    const copiasDisponiblesQuery = `
      SELECT l.libro_id,
             l.num_copias - 
             (SELECT COUNT(*) 
              FROM PRESTAMOS p 
              WHERE p.libro_id = l.libro_id 
              AND p.estado = 'PRESTADO') as copias_disponibles
      FROM LIBROS l
    `;

    // Libros más populares (con más préstamos) - ACTUALIZADO para usar AUTORES
    const librosPopulares = await runQuery(
      `SELECT l.libro_id, l.titulo, a.nombre_autor, l.num_copias,
              g.nombre_genero,
              COUNT(p.prestamo_id) as total_prestamos,
              cd.copias_disponibles
       FROM LIBROS l
       LEFT JOIN PRESTAMOS p ON l.libro_id = p.libro_id
       LEFT JOIN GENEROS g ON l.genero_id = g.genero_id
       LEFT JOIN AUTORES a ON l.autor_id = a.autor_id  -- JOIN con AUTORES
       LEFT JOIN (${copiasDisponiblesQuery}) cd ON l.libro_id = cd.libro_id
       GROUP BY l.libro_id, l.titulo, a.nombre_autor, l.num_copias, 
                g.nombre_genero, cd.copias_disponibles
       ORDER BY COUNT(p.prestamo_id) DESC, l.titulo ASC
       FETCH FIRST 10 ROWS ONLY`
    );

    // Libros sin copias disponibles - ACTUALIZADO para usar AUTORES
    const librosSinCopias = await runQuery(
      `SELECT l.libro_id, l.titulo, a.nombre_autor, l.num_copias,
              g.nombre_genero, cd.copias_disponibles,
              (SELECT MAX(fecha_prestamo) 
               FROM PRESTAMOS p 
               WHERE p.libro_id = l.libro_id) as ultimo_prestamo
       FROM LIBROS l
       LEFT JOIN GENEROS g ON l.genero_id = g.genero_id
       LEFT JOIN AUTORES a ON l.autor_id = a.autor_id  -- JOIN con AUTORES
       LEFT JOIN (${copiasDisponiblesQuery}) cd ON l.libro_id = cd.libro_id
       WHERE cd.copias_disponibles <= 0
       ORDER BY ultimo_prestamo DESC NULLS LAST, l.titulo ASC
       FETCH FIRST 10 ROWS ONLY`
    );

    // Libros con más préstamos en el último mes - ACTUALIZADO para usar AUTORES
    const librosTendencia = await runQuery(
      `SELECT l.libro_id, l.titulo, a.nombre_autor, l.num_copias,
              g.nombre_genero, cd.copias_disponibles,
              COUNT(p.prestamo_id) as prestamos_recientes
       FROM LIBROS l
       LEFT JOIN PRESTAMOS p ON l.libro_id = p.libro_id
       LEFT JOIN GENEROS g ON l.genero_id = g.genero_id
       LEFT JOIN AUTORES a ON l.autor_id = a.autor_id  -- JOIN con AUTORES
       LEFT JOIN (${copiasDisponiblesQuery}) cd ON l.libro_id = cd.libro_id
       WHERE p.fecha_prestamo >= ADD_MONTHS(SYSDATE, -1)
       GROUP BY l.libro_id, l.titulo, a.nombre_autor, l.num_copias, 
                g.nombre_genero, cd.copias_disponibles
       ORDER BY COUNT(p.prestamo_id) DESC, l.titulo ASC
       FETCH FIRST 8 ROWS ONLY`
    );

    // Estadísticas generales (sin cambios)
    const totalGeneros = await runQuery(
      'SELECT COUNT(*) as total FROM GENEROS'
    );

    const totalLibros = await runQuery(
      'SELECT COUNT(*) as total FROM LIBROS'
    );

    const totalCopias = await runQuery(
      'SELECT COALESCE(SUM(num_copias), 0) as total FROM LIBROS'
    );

    const prestamosActivos = await runQuery(
      `SELECT COUNT(*) as total FROM PRESTAMOS WHERE estado = 'PRESTADO'`
    );

    // Calcular libros disponibles basado en LIBROS.num_copias vs PRESTAMOS activos
    const librosDisponibles = await runQuery(
      `SELECT COUNT(*) as total 
       FROM LIBROS l
       WHERE l.num_copias > (
         SELECT COUNT(*) 
         FROM PRESTAMOS p 
         WHERE p.libro_id = l.libro_id 
         AND p.estado = 'PRESTADO'
       )`
    );

    // Calcular libros agotados basado en LIBROS.num_copias vs PRESTAMOS activos
    const librosAgotados = await runQuery(
      `SELECT COUNT(*) as total 
       FROM LIBROS l
       WHERE l.num_copias <= (
         SELECT COUNT(*) 
         FROM PRESTAMOS p 
         WHERE p.libro_id = l.libro_id 
         AND p.estado = 'PRESTADO'
       ) OR l.num_copias = 0`
    );

    // Estadísticas de préstamos
    const totalPrestamos = await runQuery(
      'SELECT COUNT(*) as total FROM PRESTAMOS'
    );

    const prestamosMesActual = await runQuery(
      `SELECT COUNT(*) as total FROM PRESTAMOS 
       WHERE EXTRACT(MONTH FROM fecha_prestamo) = EXTRACT(MONTH FROM SYSDATE)
       AND EXTRACT(YEAR FROM fecha_prestamo) = EXTRACT(YEAR FROM SYSDATE)`
    );

    // Estadísticas de copias (basado en LIBROS.num_copias)
    const totalCopiasSistema = await runQuery(
      'SELECT COALESCE(SUM(num_copias), 0) as total FROM LIBROS'
    );

    // Calcular copias disponibles (total copias - préstamos activos)
    const copiasDisponibles = await runQuery(
      `SELECT 
         (SELECT COALESCE(SUM(num_copias), 0) FROM LIBROS) - 
         (SELECT COUNT(*) FROM PRESTAMOS WHERE estado = 'PRESTADO') as total
       FROM DUAL`
    );

    const copiasPrestadas = await runQuery(
      'SELECT COUNT(*) as total FROM PRESTAMOS WHERE estado = \'PRESTADO\''
    );

    // Formatear respuesta (manteniendo la misma estructura para el frontend)
    const datosFormateados: StatisticsResponse = {
      estadisticas_generales: {
        total_generos: totalGeneros ? (totalGeneros[0] as TotalResult).TOTAL : 0,
        total_libros: totalLibros ? (totalLibros[0] as TotalResult).TOTAL : 0,
        total_copias: totalCopias ? (totalCopias[0] as TotalResult).TOTAL : 0,
        prestamos_activos: prestamosActivos ? (prestamosActivos[0] as TotalResult).TOTAL : 0,
        libros_disponibles: librosDisponibles ? (librosDisponibles[0] as TotalResult).TOTAL : 0,
        libros_agotados: librosAgotados ? (librosAgotados[0] as TotalResult).TOTAL : 0,
        total_prestamos: totalPrestamos ? (totalPrestamos[0] as TotalResult).TOTAL : 0,
        prestamos_mes_actual: prestamosMesActual ? (prestamosMesActual[0] as TotalResult).TOTAL : 0,
        total_copias_sistema: totalCopiasSistema ? (totalCopiasSistema[0] as TotalResult).TOTAL : 0,
        copias_disponibles: copiasDisponibles ? (copiasDisponibles[0] as TotalResult).TOTAL : 0,
        copias_prestadas: copiasPrestadas ? (copiasPrestadas[0] as TotalResult).TOTAL : 0
      },
      generos_populares: (generosPopulares || []).map((genero) => {
        const g = genero as GeneroPopular;
        return {
          genero_id: g.GENERO_ID,
          nombre_genero: g.NOMBRE_GENERO,
          total_libros: g.TOTAL_LIBROS,
          total_copias: g.TOTAL_COPIAS,
          total_prestamos: g.TOTAL_PRESTAMOS
        };
      }),
      libros_populares: (librosPopulares || []).map((libro) => {
        const l = libro as LibroPopularDB;
        const copiasDisponibles = l.COPIAS_DISPONIBLES || 0;
        return {
          libro_id: l.LIBRO_ID,
          titulo: l.TITULO,
          autor: l.NOMBRE_AUTOR, // Mapeamos NOMBRE_AUTOR a autor
          total_prestamos: l.TOTAL_PRESTAMOS,
          copias_disponibles: copiasDisponibles > 0 ? copiasDisponibles : 0,
          num_copias: l.NUM_COPIAS,
          nombre_genero: l.NOMBRE_GENERO,
          porcentaje_disponibilidad: l.NUM_COPIAS > 0 
            ? Math.round((copiasDisponibles / l.NUM_COPIAS) * 100) 
            : 0
        };
      }),
      libros_sin_copias: (librosSinCopias || []).map((libro) => {
        const l = libro as LibroSinCopiasDB;
        return {
          libro_id: l.LIBRO_ID,
          titulo: l.TITULO,
          autor: l.NOMBRE_AUTOR, // Mapeamos NOMBRE_AUTOR a autor
          copias_disponibles: l.COPIAS_DISPONIBLES || 0,
          num_copias: l.NUM_COPIAS,
          nombre_genero: l.NOMBRE_GENERO,
          ultimo_prestamo: l.ULTIMO_PRESTAMO,
          estado: 'Agotado'
        };
      }),
      libros_tendencia: (librosTendencia || []).map((libro) => {
        const l = libro as LibroTendenciaDB;
        const copiasDisponibles = l.COPIAS_DISPONIBLES || 0;
        return {
          libro_id: l.LIBRO_ID,
          titulo: l.TITULO,
          autor: l.NOMBRE_AUTOR, // Mapeamos NOMBRE_AUTOR a autor
          prestamos_recientes: l.PRESTAMOS_RECIENTES,
          copias_disponibles: copiasDisponibles > 0 ? copiasDisponibles : 0,
          num_copias: l.NUM_COPIAS,
          nombre_genero: l.NOMBRE_GENERO,
          tendencia: 'popular'
        };
      }),
      resumen: {
        total_libros_populares: librosPopulares?.length || 0,
        total_libros_agotados: librosSinCopias?.length || 0,
        total_libros_tendencia: librosTendencia?.length || 0
      }
    };

    return NextResponse.json({
      success: true,
      data: datosFormateados
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}