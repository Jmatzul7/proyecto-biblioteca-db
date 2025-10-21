import { NextResponse } from 'next/server';
import runQuery from '@/lib/db/oracle';

export async function GET() {
  try {
    const autores = await runQuery(
      `SELECT autor_id, nombre_autor, nacionalidad FROM autores ORDER BY nombre_autor`
    );

    return NextResponse.json({
      success: true,
      data: autores || []
    });
  } catch (error) {
    console.error('Error obteniendo autores:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}