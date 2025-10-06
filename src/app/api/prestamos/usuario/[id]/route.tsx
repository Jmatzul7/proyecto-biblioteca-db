import { NextResponse } from 'next/server';
import runQuery from '@/lib/db/oracle'; // ajusta la ruta a tu proyecto

// GET /api/prestamos/:id
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }>  }
) {
  try {
    const { id } = await context.params;
    const usuarioId = id;

    // SQL para obtener prestamos de un usuario
    const sql = `
      SELECT u.usuario_id,
             u.nombre AS nombre_usuario,
             l.libro_id,
             l.titulo as libro_titulo,
             l.autor,
             p.prestamo_id,
             p.fecha_prestamo,
             p.fecha_devolucion,
             p.estado
      FROM usuarios u
      JOIN prestamos p ON u.usuario_id = p.usuario_id
      JOIN libros l    ON p.libro_id   = l.libro_id
      WHERE u.usuario_id = :usuarioId
    `;

    const result = await runQuery(sql, [usuarioId]);

    return NextResponse.json(
      {
        status: "success",
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error en GET /api/prestamos/:id", error);
    return NextResponse.json(
      {
        status: "error",
        message: "No se pudieron obtener los préstamos del usuario.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
