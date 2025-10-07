// app/api/loans/[id]/return/route.ts
import { NextRequest, NextResponse } from 'next/server';
import runQuery from '@/lib/db/oracle';

export async function PUT(request: NextRequest) {
  try {
    // Extraer el id de la URL
    const urlParts = request.url.split('/');
    const prestamoId = urlParts[urlParts.length - 2];
    const body = await request.json();
    const { estado } = body;

    console.log('📦 Marcando préstamo como devuelto:', { prestamoId, estado });

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

    // 1. Obtener información del préstamo
    const prestamoInfoSql = `
      SELECT 
        p.prestamo_id,
        p.libro_id,
        p.usuario_id,
        p.estado,
        l.titulo,
        l.num_copias
      FROM PRESTAMOS p
      JOIN LIBROS l ON p.libro_id = l.libro_id
      WHERE p.prestamo_id = :1
    `;

    console.log('🔍 Buscando información del préstamo...');
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
      USUARIO_ID: number;
      ESTADO: string;
      TITULO: string;
      NUM_COPIAS: number;
    }
    const prestamo = prestamoInfo[0] as Prestamo;
    const libroId = prestamo.LIBRO_ID;
    const estadoActual = prestamo.ESTADO;
    const numCopiasTotales = prestamo.NUM_COPIAS;

    console.log('📖 Información del préstamo:', prestamo);

    // Verificar que el préstamo esté en estado PRESTADO
    if (estadoActual !== 'PRESTADO') {
      return NextResponse.json(
        { success: false, message: `El préstamo ya está en estado: ${estadoActual}` },
        { status: 400 }
      );
    }

    // 2. Actualizar el préstamo con fecha de devolución real
    const updatePrestamoSql = `
      UPDATE PRESTAMOS 
      SET estado = :1, 
          fecha_devolucion = SYSDATE
      WHERE prestamo_id = :2
    `;

    console.log('🔄 Actualizando préstamo...');
    await runQuery(updatePrestamoSql, [estado, prestamoIdNum]);

    // 3. Calcular préstamos activos para este libro (para información, no para actualizar)
    const prestamosActivosSql = `
      SELECT COUNT(*) as prestamos_activos
      FROM PRESTAMOS 
      WHERE libro_id = :1 AND estado = 'PRESTADO'
    `;

    console.log('🔢 Calculando préstamos activos...');
    const prestamosActivosResult = await runQuery(prestamosActivosSql, [libroId]);
    
    // Manejo seguro del resultado
    let prestamosActivos = 0;
    if (prestamosActivosResult && prestamosActivosResult.length > 0) {
      interface PrestamosActivosResult {
        PRESTAMOS_ACTIVOS: number;
      }
      prestamosActivos = (prestamosActivosResult[0] as PrestamosActivosResult)?.PRESTAMOS_ACTIVOS || 0;
    }

    // Calcular copias disponibles (solo para la respuesta, no actualizamos la tabla)
    const copiasDisponibles = numCopiasTotales - prestamosActivos;

    console.log('📊 Estadísticas:', {
      copias_totales: numCopiasTotales,
      prestamos_activos: prestamosActivos,
      copias_disponibles: copiasDisponibles
    });

    // 4. Registrar en auditoría
    try {
      const auditoriaSql = `
        INSERT INTO AUDITORIA (evento_id, usuario_id, accion, detalle)
        VALUES (AUDITORIA_SEQ.NEXTVAL, 1, 'DEVOLUCION_LIBRO', 
               'Préstamo devuelto ID: ${prestamoId} - Libro: ${prestamo.TITULO} - Libro ID: ${libroId}')
      `;
      await runQuery(auditoriaSql);
      console.log('📝 Auditoría registrada');
    } catch (auditError) {
      console.log('⚠️ No se pudo registrar auditoría');
    }

    console.log('✅ Préstamo marcado como devuelto exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Libro marcado como devuelto exitosamente',
      data: {
        prestamo_id: prestamoIdNum,
        libro_id: libroId,
        estado: estado,
        fecha_devolucion: new Date().toISOString().split('T')[0],
        copias_totales: numCopiasTotales,
        prestamos_activos: prestamosActivos,
        copias_disponibles: copiasDisponibles
      }
    });

  } catch (error: unknown) {
    console.error('❌ Error actualizando préstamo:', (error as { message: string }).message);

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