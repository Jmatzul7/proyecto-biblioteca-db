// app/api/prestamos/[id]/route.tsx 
import { NextRequest, NextResponse } from 'next/server';
import runQuery from '../../../../lib/db/oracle';

export async function GET(
  request: NextRequest,
   context: { params: { id: string } }
) {
  try {

    const prestamoId = Number(context.params.id);

    if (!prestamoId) {
      return NextResponse.json(
        { error: 'ID de préstamo requerido' },
        { status: 400 }
      );
    }

    const prestamos = await runQuery(
      `SELECT p.*, u.nombre as usuario_nombre, l.titulo as libro_titulo
       FROM PRESTAMOS p
       JOIN USUARIOS u ON p.usuario_id = u.usuario_id
       JOIN LIBROS l ON p.libro_id = l.libro_id
       WHERE p.prestamo_id = :1`,
      [prestamoId]
    );

    if (!prestamos || prestamos.length === 0) {
      return NextResponse.json(
        { error: 'Préstamo no encontrado' },
        { status: 404 }
      );
    }

    console.log('Préstamo encontrado:', prestamos[0]);
    return NextResponse.json(prestamos[0]);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { titulo, autor, anio_publicacion, genero_id, num_copias } = body;

    // Validaciones
    if (!titulo || !autor || !genero_id) {
      return NextResponse.json(
        { success: false, message: 'Título, autor y género son requeridos' },
        { status: 400 }
      );
    }

    // Obtener el próximo ID
    const nextIdResult = await runQuery(
      'SELECT COALESCE(MAX(libro_id), 0) + 1 as next_id FROM LIBROS'
    );
    const nextId = nextIdResult ? (nextIdResult[0] as any).NEXT_ID : 1;

    // Insertar nuevo libro
    await runQuery(
      `INSERT INTO LIBROS (libro_id, titulo, autor, anio_publicacion, genero_id, num_copias)
       VALUES (:1, :2, :3, :4, :5, :6)`,
      [nextId, titulo, autor, anio_publicacion || null, genero_id, num_copias || 1]
    );

    // Crear copias del libro
    if (num_copias > 0) {
      const copiaIds = [];
      for (let i = 1; i <= num_copias; i++) {
        const copiaId = nextId * 100 + i; // ID único para cada copia
        copiaIds.push(copiaId);
        
        await runQuery(
          `INSERT INTO COPIAS_LIBROS (copia_id, libro_id, estado_copia)
           VALUES (:1, :2, 'DISPONIBLE')`,
          [copiaId, nextId]
        );
      }
    }

    // Registrar en auditoría
    try {
      await runQuery(
        `INSERT INTO AUDITORIA (evento_id, usuario_id, accion, detalle)
         VALUES (AUDITORIA_SEQ.NEXTVAL, 1, 'NUEVO_LIBRO', 'Libro creado: ${titulo}')`
      );
    } catch (auditError) {
      console.log('⚠️ No se pudo registrar auditoría');
    }

    return NextResponse.json({
      success: true,
      message: 'Libro creado exitosamente',
      data: { libro_id: nextId }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creando libro:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}