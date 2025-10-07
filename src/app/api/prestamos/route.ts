import { NextRequest, NextResponse } from 'next/server';
import runQuery from '../../../lib/db/oracle';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    
    let query = `
      SELECT 
        p.prestamo_id as "PRESTAMO_ID",
        u.nombre as "USUARIO_NOMBRE",
        u.usuario_id as "USUARIO_ID",
        l.titulo as "LIBRO_TITULO",
        p.fecha_prestamo as "FECHA_PRESTAMO",
        p.fecha_devolucion as "FECHA_DEVOLUCION",
        p.estado as "ESTADO",
        p.libro_id as "LIBRO_ID"
      FROM PRESTAMOS p
      JOIN USUARIOS u ON p.usuario_id = u.usuario_id
      JOIN LIBROS l ON p.libro_id = l.libro_id
    `;

    const params = [];
    
    if (estado) {
      query += ` WHERE p.estado = :1`;
      params.push(estado);
    }

    query += ` ORDER BY p.fecha_prestamo DESC`;

    interface Prestamo {
      PRESTAMO_ID: number;
      USUARIO_NOMBRE: string;
      USUARIO_ID: number;
      LIBRO_TITULO: string;
      FECHA_PRESTAMO: string;
      FECHA_DEVOLUCION: string;
      ESTADO: string;
      LIBRO_ID: number;
    }
    const prestamosResult = await runQuery(query, params);
    const prestamosTipados: Prestamo[] = Array.isArray(prestamosResult)
      ? prestamosResult.map((p: unknown) => p as Prestamo)
      : [];

    return NextResponse.json({
      success: true,
      data: prestamosTipados
    });

  } catch (error) {
    console.error('❌ Error obteniendo préstamos:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { libro_id, usuario_id } = body;

    console.log('📦 Datos recibidos:', body);

    // 🔍 Validaciones básicas
    if (!libro_id || !usuario_id) {
      return NextResponse.json(
        { success: false, message: 'Los campos libro_id y usuario_id son obligatorios' },
        { status: 400 }
      );
    }

    const libroIdNum = Number(libro_id);
    const usuarioIdNum = Number(usuario_id);

    if (isNaN(libroIdNum) || isNaN(usuarioIdNum)) {
      return NextResponse.json(
        { success: false, message: 'Los IDs deben ser numéricos válidos' },
        { status: 400 }
      );
    }

    // 🟢 Verificar disponibilidad del libro
    const disponibilidadSql = `
        SELECT 
        l.NUM_COPIAS as copias_totales,
        (SELECT COUNT(*) FROM PRESTAMOS p WHERE p.libro_id = :libro_id AND p.estado = 'PRESTADO') as prestamos_activos,
        l.NUM_COPIAS - (SELECT COUNT(*) FROM PRESTAMOS p WHERE p.libro_id = :libro_id AND p.estado = 'PRESTADO') as copias_disponibles
        FROM LIBROS l
        WHERE l.LIBRO_ID = :libro_id
    `;

    console.log('🔍 Verificando disponibilidad...59');
    const disponibilidadResult = await runQuery(disponibilidadSql, { libro_id: libroIdNum });
    console.log('🔍 Verificando disponibilidad...63');

    if (!disponibilidadResult || disponibilidadResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Libro no encontrado' },
        { status: 404 }
      );
    }
console.log('🔍 Verificando disponibilidad.69..');
    interface Disponibilidad {
      COPIAS_TOTALES: number;
      PRESTAMOS_ACTIVOS: number;
      COPIAS_DISPONIBLES: number;
    }
    const disponibilidad = disponibilidadResult[0] as Disponibilidad;
    const copiasDisponibles = disponibilidad.COPIAS_DISPONIBLES ?? 0;

    console.log('📚 Disponibilidad:', disponibilidad);

    if (copiasDisponibles <= 0) {
      return NextResponse.json(
        { success: false, message: 'No hay copias disponibles de este libro' },
        { status: 400 }
      );
    }

    // 🆔 Obtener próximo ID de préstamo
    const idResult = await runQuery(`SELECT NVL(MAX(PRESTAMO_ID), 0) + 1 AS NEXT_ID FROM PRESTAMOS`);


    if (!idResult || idResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No se pudo generar el ID del préstamo' },
        { status: 500 }
      );
    }
    interface NextIdResult {
      NEXT_ID: number;
    }
    const nextId = (idResult[0] as NextIdResult)?.NEXT_ID;

    console.log('🆔 Próximo ID:', nextId);

    // 💾 Insertar préstamo
    const insertSql = `
      INSERT INTO PRESTAMOS (
        PRESTAMO_ID, USUARIO_ID, LIBRO_ID, 
        FECHA_PRESTAMO, FECHA_DEVOLUCION, ESTADO
      ) VALUES (
        :1, :2, :3, SYSDATE, SYSDATE + 15, 'PRESTADO'
      )
    `;

    console.log('💾 Insertando préstamo...');
    await runQuery(insertSql, [nextId, usuarioIdNum, libroIdNum]);

    console.log('✅ Préstamo creado exitosamente');

    // Calcular fecha estimada de devolución (solo para mostrar en respuesta)
    const fechaPrestamo = new Date();
    const fechaDevolucionEstimada = new Date();
    fechaDevolucionEstimada.setDate(fechaPrestamo.getDate() + 15);

    return NextResponse.json({
      success: true,
      message: `Préstamo realizado exitosamente. Fecha de devolución estimada: ${fechaDevolucionEstimada.toLocaleDateString('es-ES')}`,
      data: {
        prestamo_id: nextId,
        usuario_id: usuarioIdNum,
        libro_id: libroIdNum,
        fecha_prestamo: fechaPrestamo.toISOString().split('T')[0],
        fecha_devolucion_estimada: fechaDevolucionEstimada.toISOString().split('T')[0],
      },
    });
  } catch (error: any) {
    console.error('❌ Error creando préstamo:', error);

    let errorMessage = 'Error interno del servidor';
    if (error.message?.includes('ORA-02291')) errorMessage = 'Usuario o libro no válido';
    if (error.message?.includes('ORA-00001')) errorMessage = 'Error de duplicación en préstamos';
    if (error.message?.includes('NJS-098')) errorMessage = 'Error en los parámetros de la consulta';

    return NextResponse.json(
      { success: false, message: errorMessage, error: error.message },
      { status: 500 }
    );
  }
}
