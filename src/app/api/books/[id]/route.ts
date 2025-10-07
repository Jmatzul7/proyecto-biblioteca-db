
import { NextRequest, NextResponse } from 'next/server';
import runQuery from '@/lib/db/oracle';

// Interfaces para los resultados de la base de datos
interface Libro {
  LIBRO_ID: number;
  TITULO: string;
  AUTOR: string;
  ANIO_PUBLICACION: number;
  NUM_COPIAS: number;
  FECHA_REGISTRO: string;
  URL_IMAGEN?: string;
  GENERO_ID: number;
  NOMBRE_GENERO: string;
  COPIAS_DISPONIBLES: number;
}

interface LibroActual {
  TITULO: string;
  AUTOR: string;
  ANIO_PUBLICACION: number;
  GENERO_ID: number;
  NUM_COPIAS: number;
}

interface LibroExistente {
  TITULO: string;
}

interface Copia {
  COPIA_ID: number;
  ESTADO_COPIA: string;
}

interface PrestamoActivo {
  PRESTAMO_ID: number;
  USUARIO_NOMBRE: string;
  FECHA_PRESTAMO: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const libroId = Number(params.id);

    if (!libroId || isNaN(libroId)) {
      return NextResponse.json(
        { success: false, message: 'ID de libro inválido' },
        { status: 400 }
      );
    }

    // Consulta del libro con información completa
    const libros = await runQuery(
      `SELECT l.libro_id, l.titulo, l.autor, l.anio_publicacion, 
              l.num_copias, l.fecha_registro, l.url_imagen,
              g.genero_id, g.nombre_genero,
              (SELECT COUNT(*) FROM COPIAS_LIBROS cl WHERE cl.libro_id = l.libro_id AND cl.estado_copia = 'DISPONIBLE') as copias_disponibles
       FROM LIBROS l
       INNER JOIN GENEROS g ON l.genero_id = g.genero_id
       WHERE l.libro_id = :1`,
      [libroId]
    );

    if (!libros || libros.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Libro no encontrado' },
        { status: 404 }
      );
    }

  const libro = libros[0] as Libro;

    // Obtener información de las copias
    const copias = await runQuery(
      `SELECT copia_id, estado_copia
       FROM COPIAS_LIBROS
       WHERE libro_id = :1
       ORDER BY copia_id`,
      [libroId]
    );

    // Obtener préstamos activos de este libro
    const prestamosActivos = await runQuery(
      `SELECT p.prestamo_id, u.nombre as usuario_nombre, p.fecha_prestamo
       FROM PRESTAMOS p
       INNER JOIN USUARIOS u ON p.usuario_id = u.usuario_id
       WHERE p.libro_id = :1 AND p.estado = 'PRESTADO'
       ORDER BY p.fecha_prestamo DESC`,
      [libroId]
    );

    // Formatear respuesta
    const libroData = {
      libro_id: libro.LIBRO_ID,
      titulo: libro.TITULO,
      autor: libro.AUTOR,
      anio_publicacion: libro.ANIO_PUBLICACION,
      num_copias: libro.NUM_COPIAS,
      fecha_registro: libro.FECHA_REGISTRO,
      genero: {
        genero_id: libro.GENERO_ID,
        nombre_genero: libro.NOMBRE_GENERO
      },
      copias_disponibles: libro.COPIAS_DISPONIBLES,
      copias: copias?.map((copia) => {
        const c = copia as Copia;
        return {
          copia_id: c.COPIA_ID,
          estado_copia: c.ESTADO_COPIA
        };
      }),
      prestamos_activos: prestamosActivos?.map((prestamo) => {
        const p = prestamo as PrestamoActivo;
        return {
          prestamo_id: p.PRESTAMO_ID,
          usuario_nombre: p.USUARIO_NOMBRE,
          fecha_prestamo: p.FECHA_PRESTAMO
        };
      })
    };

    return NextResponse.json({
      success: true,
      data: libroData
    });

  } catch (error) {
    console.error('❌ Error obteniendo libro:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const libroId = Number(params.id);
    const body = await request.json();
    const { num_copias } = body; // ✅ Solo queremos actualizar este campo

    if (!libroId || num_copias === undefined) {
      return NextResponse.json(
        { success: false, message: 'Se requiere ID de libro y num_copias' },
        { status: 400 }
      );
    }

    // 1️⃣ Verificar que el libro existe y obtener sus datos actuales
    const libroActualResult = await runQuery(
      `SELECT titulo, autor, anio_publicacion, genero_id, num_copias 
       FROM LIBROS 
       WHERE libro_id = :libro_id`,
      { libro_id: libroId }
    );

    if (!libroActualResult || libroActualResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Libro no encontrado' },
        { status: 404 }
      );
    }

  const libroActual = libroActualResult[0] as LibroActual;

    // 2️⃣ Actualizar solo num_copias, mantener el resto igual
    const updateSql = `
      UPDATE LIBROS
      SET titulo = :titulo,
          autor = :autor,
          anio_publicacion = :anio_publicacion,
          genero_id = :genero_id,
          num_copias = :num_copias
      WHERE libro_id = :libro_id
    `;

    const updateBinds = {
      titulo: libroActual.TITULO,
      autor: libroActual.AUTOR,
      anio_publicacion: libroActual.ANIO_PUBLICACION,
      genero_id: libroActual.GENERO_ID,
      num_copias: num_copias,
      libro_id: libroId,
    };

    await runQuery(updateSql, updateBinds);

    // 3️⃣ Registrar auditoría (opcional)
    try {
      await runQuery(
        `INSERT INTO AUDITORIA (evento_id, usuario_id, accion, detalle)
         VALUES (AUDITORIA_SEQ.NEXTVAL, 1, 'ACTUALIZAR_COPIAS', 'Actualizó num_copias del libro ID: ${libroId}')`
      );
    } catch (auditError) {
      console.warn('⚠️ No se pudo registrar en auditoría');
    }

    return NextResponse.json({
      success: true,
      message: 'Número de copias actualizado correctamente',
    });

  } catch (error: any) {
    console.error('❌ Error actualizando libro:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          error.message?.includes('ORA-01407')
            ? 'No se puede dejar campos requeridos vacíos'
            : 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const libroId = Number(params.id);

    if (!libroId) {
      return NextResponse.json(
        { success: false, message: 'ID de libro requerido' },
        { status: 400 }
      );
    }

    // Verificar que el libro existe
    const libroExistente = await runQuery(
      'SELECT titulo FROM LIBROS WHERE libro_id = :1',
      [libroId]
    );

    if (!libroExistente || libroExistente.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Libro no encontrado' },
        { status: 404 }
      );
    }

    const tituloLibro = (libroExistente[0] as LibroExistente).TITULO;

    // Verificar si tiene préstamos activos
    const prestamosActivos = await runQuery(
      'SELECT COUNT(*) as total FROM PRESTAMOS WHERE libro_id = :1 AND estado = "PRESTADO"',
      [libroId]
    );

    // Si quieres tipar también el resultado de prestamosActivos en DELETE:
    interface PrestamosCount {
      TOTAL: number;
    }
    const totalPrestamos = prestamosActivos ? (prestamosActivos[0] as PrestamosCount).TOTAL : 0;

    if (totalPrestamos > 0) {
      return NextResponse.json(
        { success: false, message: 'No se puede eliminar el libro, tiene préstamos activos' },
        { status: 400 }
      );
    }

    // Eliminar copias del libro primero
    await runQuery(
      'DELETE FROM COPIAS_LIBROS WHERE libro_id = :1',
      [libroId]
    );

    // Eliminar préstamos históricos
    await runQuery(
      'DELETE FROM PRESTAMOS WHERE libro_id = :1',
      [libroId]
    );

    // Eliminar el libro
    await runQuery(
      'DELETE FROM LIBROS WHERE libro_id = :1',
      [libroId]
    );

    // Registrar en auditoría
    try {
      await runQuery(
        `INSERT INTO AUDITORIA (evento_id, usuario_id, accion, detalle)
         VALUES (AUDITORIA_SEQ.NEXTVAL, 1, 'ELIMINAR_LIBRO', 'Libro eliminado: ${tituloLibro}')`
      );
    } catch (auditError) {
      console.log('⚠️ No se pudo registrar auditoría');
    }

    return NextResponse.json({
      success: true,
      message: 'Libro eliminado exitosamente'
    });

  } catch (error: unknown) {
    console.error('❌ Error eliminando libro:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}