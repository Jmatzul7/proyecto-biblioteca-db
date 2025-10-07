import { NextRequest, NextResponse } from 'next/server';
import runQuery from '@/lib/db/oracle';

// Devuelve libros con menos de 5 copias disponibles
export async function GET(request: NextRequest) {
	try {
		const libros = await runQuery(
			`SELECT libro_id, titulo, autor, num_copias
			 FROM LIBROS
			 WHERE num_copias < 5
			 ORDER BY num_copias ASC`
		);

		return NextResponse.json({
			success: true,
			data: libros
		});
	} catch (error: unknown) {
		return NextResponse.json({
			success: false,
			message: 'Error obteniendo libros con bajo stock',
			error: error instanceof Error ? error.message : String(error)
		}, { status: 500 });
	}
}
