// app/api/generos/estadisticas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import runQuery from '../../../../lib/db/oracle';

export async function GET(request: NextRequest) {
  try {
    // Consulta para géneros más populares (corregida)
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

    // Estadísticas generales (consultas separadas para evitar el error)
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

    // Formatear respuesta
    const datosFormateados = {
      estadisticas_generales: {
        total_generos: totalGeneros ? (totalGeneros[0] as any).TOTAL : 0,
        total_libros: totalLibros ? (totalLibros[0] as any).TOTAL : 0,
        total_copias: totalCopias ? (totalCopias[0] as any).TOTAL : 0,
        prestamos_activos: prestamosActivos ? (prestamosActivos[0] as any).TOTAL : 0
      },
      generos_populares: generosPopulares?.map((genero: any) => ({
        genero_id: genero.GENERO_ID,
        nombre_genero: genero.NOMBRE_GENERO,
        total_libros: genero.TOTAL_LIBROS,
        total_copias: genero.TOTAL_COPIAS,
        total_prestamos: genero.TOTAL_PRESTAMOS
      }))
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