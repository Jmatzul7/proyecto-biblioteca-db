import { NextResponse } from 'next/server';
import runQuery from '@/lib/db/oracle';


export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }>  }
) {
  try {
    const { id } = await context.params;
    const usuarioId = id;

    const sql = `
      SELECT 
        u.usuario_id as USUARIO_ID,
        u.nombre AS NOMBRE_USUARIO,
        l.libro_id as LIBRO_ID,
        l.titulo as LIBRO_TITULO,
        a.autor_id as AUTOR_ID,
        a.nombre_autor as NOMBRE_AUTOR,
        a.nacionalidad as NACIONALIDAD,
        p.prestamo_id as PRESTAMO_ID,
        p.fecha_prestamo as FECHA_PRESTAMO,
        p.fecha_devolucion as FECHA_DEVOLUCION,
        p.estado as ESTADO
      FROM usuarios u
      JOIN prestamos p ON u.usuario_id = p.usuario_id
      JOIN libros l ON p.libro_id = l.libro_id
      JOIN autores a ON l.autor_id = a.autor_id
      WHERE u.usuario_id = :usuarioId
      ORDER BY p.fecha_prestamo DESC
    `;

    const result = await runQuery(sql, [usuarioId]);

    interface UsuarioPrestamo {
      USUARIO_ID: number;
      NOMBRE_USUARIO: string;
      LIBRO_ID: number;
      LIBRO_TITULO: string;
      AUTOR_ID: number;
      NOMBRE_AUTOR: string;
      NACIONALIDAD: string;
      PRESTAMO_ID: number;
      FECHA_PRESTAMO: string;
      FECHA_DEVOLUCION: string;
      ESTADO: string;
    }

    const prestamosUsuario: UsuarioPrestamo[] = Array.isArray(result)
      ? result.map((p: unknown) => p as UsuarioPrestamo)
      : [];

    // Formatear manteniendo mayúsculas para el frontend
    const prestamosFormateados = prestamosUsuario.map(prestamo => ({
      USUARIO_ID: prestamo.USUARIO_ID.toString(),
      NOMBRE_USUARIO: prestamo.NOMBRE_USUARIO,
      LIBRO_ID: prestamo.LIBRO_ID.toString(),
      LIBRO_TITULO: prestamo.LIBRO_TITULO,
      AUTOR: {
        AUTOR_ID: prestamo.AUTOR_ID.toString(),
        NOMBRE_AUTOR: prestamo.NOMBRE_AUTOR,
        NACIONALIDAD: prestamo.NACIONALIDAD
      },
      PRESTAMO_ID: prestamo.PRESTAMO_ID.toString(),
      FECHA_PRESTAMO: prestamo.FECHA_PRESTAMO,
      FECHA_DEVOLUCION: prestamo.FECHA_DEVOLUCION,
      ESTADO: prestamo.ESTADO
    }));

    return NextResponse.json(
      {
        status: "success",
        data: prestamosFormateados,
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