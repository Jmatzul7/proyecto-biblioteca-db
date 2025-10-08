import { NextResponse } from 'next/server';
import runQuery from '@/lib/db/oracle';

export async function GET() {
  try {
    const query = `
      SELECT rol_id, nombre_rol 
      FROM roles 
      ORDER BY nombre_rol
    `;

    const roles = await runQuery(query);

    return NextResponse.json({
      success: true,
      data: roles
    });

  } catch (error) {
    console.error('❌ Error obteniendo roles:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}