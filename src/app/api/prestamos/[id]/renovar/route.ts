// app/api/prestamos/[id]/renovar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import runQuery from '@/lib/db/oracle';

export async function PUT(request: NextRequest) {
  try {
    // Extraer el id de la URL
    const urlParts = request.url.split('/');
    const prestamoId = urlParts[urlParts.length - 2];

    console.log('🔄 Solicitando renovación para préstamo:', prestamoId);

    if (!prestamoId) {
      return NextResponse.json(
        { success: false, message: 'ID de préstamo requerido' },
        { status: 400 }
      );
    }

    const prestamoIdNum = Number(prestamoId);

    if (isNaN(prestamoIdNum)) {
      return NextResponse.json(
        { success: false, message: 'ID de préstamo debe ser numérico' },
        { status: 400 }
      );
    }

    // 1. Verificar que el préstamo existe y está activo
    const prestamoInfoSql = `
      SELECT 
        p.prestamo_id,
        p.libro_id,
        p.estado,
        p.fecha_devolucion,
        l.titulo,
        l.num_copias,
        (SELECT COUNT(*) FROM PRESTAMOS p2 WHERE p2.libro_id = p.libro_id AND p2.estado = 'PRESTADO') as prestamos_activos
      FROM PRESTAMOS p
      JOIN LIBROS l ON p.libro_id = l.libro_id
      WHERE p.prestamo_id = :1
    `;

    console.log('🔍 Verificando préstamo...');
    const prestamoInfo = await runQuery(prestamoInfoSql, [prestamoIdNum]);

    if (!prestamoInfo || prestamoInfo.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Préstamo no encontrado' },
        { status: 404 }
      );
    }

    interface Prestamo {
      PRESTAMO_ID: number;
      LIBRO_ID: number;
      ESTADO: string;
      FECHA_DEVOLUCION: string;
      TITULO: string;
      NUM_COPIAS: number;
      PRESTAMOS_ACTIVOS: number;
    }
    const prestamo = prestamoInfo[0] as Prestamo;
    const estadoActual = prestamo.ESTADO;
    const libroId = prestamo.LIBRO_ID;
    const numCopias = prestamo.NUM_COPIAS;
    const prestamosActivos = prestamo.PRESTAMOS_ACTIVOS;

    console.log('📖 Información del préstamo:', prestamo);

    // Verificar que el préstamo esté en estado PRESTADO
    if (estadoActual !== 'PRESTADO') {
      return NextResponse.json(
        { success: false, message: `Solo se pueden renovar préstamos activos. Estado actual: ${estadoActual}` },
        { status: 400 }
      );
    }

    // Verificar disponibilidad del libro
    const copiasDisponibles = numCopias - prestamosActivos;
    if (copiasDisponibles <= 0) {
      return NextResponse.json(
        { success: false, message: 'No se puede renovar el préstamo. No hay copias disponibles del libro.' },
        { status: 400 }
      );
    }

    // Calcular nueva fecha de devolución (15 días desde hoy)
    const nuevaFechaDevolucion = new Date();
    nuevaFechaDevolucion.setDate(nuevaFechaDevolucion.getDate() + 15);

    // 2. Actualizar el préstamo con nueva fecha de devolución
    const updatePrestamoSql = `
      UPDATE PRESTAMOS 
      SET fecha_devolucion = TO_DATE(:1, 'YYYY-MM-DD')
      WHERE prestamo_id = :2
    `;

    const fechaFormateada = nuevaFechaDevolucion.toISOString().split('T')[0];

    console.log('🔄 Actualizando fecha de devolución...', { nuevaFecha: fechaFormateada });
    await runQuery(updatePrestamoSql, [fechaFormateada, prestamoIdNum]);

    // 3. Registrar en auditoría
    try {
      const auditoriaSql = `
        INSERT INTO AUDITORIA (evento_id, usuario_id, accion, detalle)
        VALUES (AUDITORIA_SEQ.NEXTVAL, 1, 'RENOVACION_PRESTAMO', 
               'Préstamo renovado ID: ${prestamoId} - Nueva fecha: ${fechaFormateada} - Libro: ${prestamo.TITULO}')
      `;
      await runQuery(auditoriaSql);
      console.log('📝 Auditoría registrada');
    } catch (auditError) {
      console.log('⚠️ No se pudo registrar auditoría');
    }

    console.log('✅ Préstamo renovado exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Préstamo renovado exitosamente',
      data: {
        prestamo_id: prestamoIdNum,
        libro_id: libroId,
        nueva_fecha_devolucion: fechaFormateada,
        fecha_renovacion: new Date().toISOString().split('T')[0]
      }
    });

  } catch (error: unknown) {
    console.error('❌ Error renovando préstamo:', (error as { message: string }).message);

    let errorMessage = 'Error interno del servidor';
    if (typeof error === 'object' && error && 'message' in error) {
      const errMsg = (error as { message: string }).message;
      if (errMsg.includes('ORA-00001')) errorMessage = 'Error de duplicación';
      if (errMsg.includes('NJS-098')) errorMessage = 'Error en los parámetros de la consulta';
    }

    return NextResponse.json(
      { success: false, message: errorMessage, error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}