
// app/api/generos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import runQuery from '@/lib/db/oracle';

// Interfaces para los resultados de la base de datos
interface Genero {
  GENERO_ID: number;
  NOMBRE_GENERO: string;
  TOTAL_LIBROS: number;
  LIBROS_CON_COPIAS: number;
}

interface NextIdResult {
  NEXT_ID: number;
}

export async function GET(request: NextRequest) {
  try {
    // Consulta para obtener todos los géneros
    const generos = await runQuery(
      `SELECT g.genero_id, g.nombre_genero,
              COUNT(l.libro_id) as total_libros,
              COUNT(CASE WHEN l.num_copias > 0 THEN 1 END) as libros_con_copias
       FROM GENEROS g
       LEFT JOIN LIBROS l ON g.genero_id = l.genero_id
       GROUP BY g.genero_id, g.nombre_genero
       ORDER BY g.nombre_genero`
    );

    // Formatear respuesta
    const generosFormateados = generos?.map((genero) => {
      const g = genero as Genero;
      return {
        genero_id: g.GENERO_ID,
        nombre_genero: g.NOMBRE_GENERO,
        total_libros: g.TOTAL_LIBROS,
        libros_con_copias: g.LIBROS_CON_COPIAS
      };
    });

    return NextResponse.json({
      success: true,
      data: generosFormateados
    });

  } catch (error) {
    console.error('Error obteniendo géneros:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre_genero } = body;

    // Validaciones
    if (!nombre_genero || nombre_genero.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'El nombre del género es requerido' },
        { status: 400 }
      );
    }

    // Verificar si el género ya existe
    const generoExistente = await runQuery(
      'SELECT genero_id FROM GENEROS WHERE UPPER(nombre_genero) = UPPER(:1)',
      [nombre_genero.trim()]
    );

    if (generoExistente && generoExistente.length > 0) {
      return NextResponse.json(
        { success: false, message: 'El género ya existe' },
        { status: 409 }
      );
    }

    // Obtener el próximo ID
    const nextIdResult = await runQuery(
      'SELECT COALESCE(MAX(genero_id), 0) + 1 as next_id FROM GENEROS'
    );
  const nextId = nextIdResult ? (nextIdResult[0] as NextIdResult).NEXT_ID : 1;

    // Insertar nuevo género
    await runQuery(
      'INSERT INTO GENEROS (genero_id, nombre_genero) VALUES (:1, :2)',
      [nextId, nombre_genero.trim()]
    );

    // Registrar en auditoría
    try {
      await runQuery(
        `INSERT INTO AUDITORIA (evento_id, usuario_id, accion, detalle)
         VALUES (AUDITORIA_SEQ.NEXTVAL, 1, 'NUEVO_GENERO', 'Género creado: ${nombre_genero}')`
      );
    } catch (auditError) {
      console.log('⚠️ No se pudo registrar auditoría');
    }

    return NextResponse.json({
      success: true,
      message: 'Género creado exitosamente',
      data: { genero_id: nextId, nombre_genero: nombre_genero.trim() }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creando género:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}