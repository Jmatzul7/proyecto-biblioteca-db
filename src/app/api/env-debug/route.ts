import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mostrar solo si las variables existen,
  const envStatus = {
    DB_USER: process.env.DB_USER ? '✅ Definido' : '❌ Faltante',
    DB_PASSWORD: process.env.DB_PASSWORD ? '✅ Definido' : '❌ Faltante',
    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING ? '✅ Definido' : '❌ Faltante',
    DB_HOST: process.env.DB_HOST ? '✅ Definido' : '❌ Faltante', 
    DB_PORT: process.env.DB_PORT ? '✅ Definido' : '❌ Faltante',
    DB_SERVICE_NAME: process.env.DB_SERVICE_NAME ? '✅ Definido' : '❌ Faltante',
    NODE_ENV: process.env.NODE_ENV
  };

  return NextResponse.json({
    environment: envStatus,
    suggestion: 'Usa DB_CONNECTION_STRING o las variables separadas (DB_HOST, DB_PORT, DB_SERVICE_NAME)'
  });
}