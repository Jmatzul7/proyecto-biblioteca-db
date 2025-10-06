// app/api/generos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import runQuery from '../../../../lib/db/oracle';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const generoId = Number(params.id);

    if (!generoId || isNaN(generoId)) {
      return NextResponse.json(
        { success: false, message: 'ID de género inválido' },
        { status: 400 }
      );
    }

    // Consulta del género con información completa
    const generos = await runQuery(
      `SELECT g.genero_id, g.nombre_genero,
              COUNT(l.libro_id) as total_libros,
              SUM(l.num_copias) as total_copias
       FROM GENEROS g
       LEFT JOIN LIBROS l ON g.genero_id = l.genero_id
       WHERE g.genero_id = :1
       GROUP BY g.genero_id, g.nombre_genero`,
      [generoId]
    );

    if (!generos || generos.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Género no encontrado' },
        { status: 404 }
      );
    }

    const genero = generos[0] as any;

    // Obtener libros de este género
    const libros = await runQuery(
      `SELECT l.libro_id, l.titulo, l.autor, l.anio_publicacion, l.num_copias,
              (SELECT COUNT(*) FROM COPIAS_LIBROS cl WHERE cl.libro_id = l.libro_id AND cl.estado_copia = 'DISPONIBLE') as copias_disponibles
       FROM LIBROS l
       WHERE l.genero_id = :1
       ORDER BY l.titulo`,
      [generoId]
    );

    // Formatear respuesta
    const generoData = {
      genero_id: genero.GENERO_ID,
      nombre_genero: genero.NOMBRE_GENERO,
      estadisticas: {
        total_libros: genero.TOTAL_LIBROS,
        total_copias: genero.TOTAL_COPIAS || 0
      },
      libros: libros?.map((libro: any) => ({
        libro_id: libro.LIBRO_ID,
        titulo: libro.TITULO,
        autor: libro.AUTOR,
        anio_publicacion: libro.ANIO_PUBLICACION,
        num_copias: libro.NUM_COPIAS,
        copias_disponibles: libro.COPIAS_DISPONIBLES
      }))
    };

    return NextResponse.json({
      success: true,
      data: generoData
    });

  } catch (error) {
    console.error('❌ Error obteniendo género:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// app/api/generos/[id]/route
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const generoId = Number(params.id);
    const body = await request.json();
    const { nombre_genero } = body;

    if (!generoId) {
      return NextResponse.json(
        { success: false, message: 'ID de género requerido' },
        { status: 400 }
      );
    }

    if (!nombre_genero || nombre_genero.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'El nombre del género es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el género existe
    const generoExistente = await runQuery(
      'SELECT nombre_genero FROM GENEROS WHERE genero_id = :1',
      [generoId]
    );

    if (!generoExistente || generoExistente.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Género no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el nuevo nombre ya existe en otro género
    const nombreExistente = await runQuery(
      'SELECT genero_id FROM GENEROS WHERE UPPER(nombre_genero) = UPPER(:1) AND genero_id != :2',
      [nombre_genero.trim(), generoId]
    );

    if (nombreExistente && nombreExistente.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Ya existe otro género con ese nombre' },
        { status: 409 }
      );
    }

    // Actualizar género
    await runQuery(
      'UPDATE GENEROS SET nombre_genero = :1 WHERE genero_id = :2',
      [nombre_genero.trim(), generoId]
    );

    // Registrar en auditoría
    try {
      await runQuery(
        `INSERT INTO AUDITORIA (evento_id, usuario_id, accion, detalle)
         VALUES (AUDITORIA_SEQ.NEXTVAL, 1, 'ACTUALIZAR_GENERO', 'Género actualizado ID: ${generoId} - Nuevo nombre: ${nombre_genero}')`
      );
    } catch (auditError) {
      console.log('⚠️ No se pudo registrar auditoría');
    }

    return NextResponse.json({
      success: true,
      message: 'Género actualizado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error actualizando género:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// app/api/generos/[id]/route
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const generoId = Number(params.id);

    if (!generoId) {
      return NextResponse.json(
        { success: false, message: 'ID de género requerido' },
        { status: 400 }
      );
    }

    // Verificar que el género existe
    const generoExistente = await runQuery(
      'SELECT nombre_genero FROM GENEROS WHERE genero_id = :1',
      [generoId]
    );

    if (!generoExistente || generoExistente.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Género no encontrado' },
        { status: 404 }
      );
    }

    const nombreGenero = (generoExistente[0] as any).NOMBRE_GENERO;

    // Verificar si hay libros asociados a este género
    const librosAsociados = await runQuery(
      'SELECT COUNT(*) as total FROM LIBROS WHERE genero_id = :1',
      [generoId]
    );

    const totalLibros = librosAsociados ? (librosAsociados[0] as any).TOTAL : 0;

    if (totalLibros > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `No se puede eliminar el género. Hay ${totalLibros} libro(s) asociados a este género.` 
        },
        { status: 400 }
      );
    }

    // Eliminar el género
    await runQuery(
      'DELETE FROM GENEROS WHERE genero_id = :1',
      [generoId]
    );

    // Registrar en auditoría
    try {
      await runQuery(
        `INSERT INTO AUDITORIA (evento_id, usuario_id, accion, detalle)
         VALUES (AUDITORIA_SEQ.NEXTVAL, 1, 'ELIMINAR_GENERO', 'Género eliminado: ${nombreGenero}')`
      );
    } catch (auditError) {
      console.log('⚠️ No se pudo registrar auditoría');
    }

    return NextResponse.json({
      success: true,
      message: 'Género eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando género:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}