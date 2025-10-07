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

    interface UsuarioPrestamo {
      USUARIO_ID: number;
      NOMBRE_USUARIO: string;
      LIBRO_ID: number;
      LIBRO_TITULO: string;
      AUTOR: string;
      PRESTAMO_ID: number;
      FECHA_PRESTAMO: string;
      FECHA_DEVOLUCION: string;
      ESTADO: string;
    }
    const prestamosUsuario: UsuarioPrestamo[] = Array.isArray(result)
      ? result.map((p: unknown) => p as UsuarioPrestamo)
      : [];

    return NextResponse.json(
      {
        status: "success",
        data: prestamosUsuario,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error en GET /api/prestamos/:id", error);
    return NextResponse.json(
      {
        status: "error",
        message: "No se pudieron obtener los préstamos del usuario.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
