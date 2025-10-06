// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logout exitoso'
  });

  // Eliminar cookies de sesión
  response.cookies.delete('user_session');
  response.cookies.delete('user_info');

  return response;
}