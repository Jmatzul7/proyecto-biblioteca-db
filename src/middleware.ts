// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Rutas que requieren autenticación
  const protectedPaths = ['/home/','/home/libros/prestamos', '/admin', '/usuarios', '/home/libros/prestamos/mis-prestamos', '/home/libros/*'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const sessionCookie = request.cookies.get('user_session');
    
    if (!sessionCookie) {
      // Redirigir al login si no hay sesión
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verificar sesión en el backend
      const verifyResponse = await fetch(new URL('/api/auth/verify', request.url), {
        headers: {
          Cookie: `user_session=${sessionCookie.value}`
        }
      });

      if (!verifyResponse.ok) {
        // Sesión inválida, redirigir al login
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Opcional: Verificar roles para rutas de admin
      if (request.nextUrl.pathname.startsWith('/admin')) {
        const userData = JSON.parse(sessionCookie.value);
        if (userData.nombre_rol !== 'Administrador') {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/libros/:path*',
    '/admin/:path*',
    '/perfil/:path*',
    '/home/libros/:path*',
    '/home/prestamos/:path*',
    '/home/usuarios/:path*',
    '/home/:path*'

  ]
};