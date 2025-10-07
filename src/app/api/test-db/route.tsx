import { NextResponse } from 'next/server';
import runQuery from '@/lib/db/oracle'; // Asegúrate que la ruta sea correcta

export async function GET() {
    try {
        // Consulta más simple de Oracle para probar la conexión
        //const sql = `SELECT SYSDATE FROM DUAL`; 
        const sql1 = `SELECT * FROM COPIAS_LIBROS`;
        
        console.log("Intentando conectar con Oracle...");
        
        // Ejecutar la consulta. Si no lanza un error, la conexión fue exitosa.
        const result = await runQuery(sql1);

        console.log("Conexión exitosa. Resultado:", result);

        return NextResponse.json({ 
            status: "success", 
            message: "Conexión con Oracle DB exitosa. La consulta de prueba ('SELECT SYSDATE FROM DUAL') se ejecutó correctamente.",
            data: result,
        }, { status: 200 });

    } catch (error:unknown) {
        console.error("FALLO DE CONEXIÓN A DB:", error instanceof Error ? error.message : String(error));
        return NextResponse.json({ 
            status: "error", 
            message: "Fallo al conectar o consultar la base de datos Oracle.",
            error_details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}