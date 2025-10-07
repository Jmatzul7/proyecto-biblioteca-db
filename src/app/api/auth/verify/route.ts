// app/api/auth/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import runQuery from '@/lib/db/oracle';

// Interfaz para el usuario obtenido de la base de datos
interface DBUser {
  USUARIO_ID: number;
  NOMBRE: string;
  USUARIO_LOGIN: string;
  ROL_ID: number;
  NOMBRE_ROL: string;
}

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('user_session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No autenticado',
          user: null 
        },
        { status: 401 }
      );
    }

    let userSession;
    try {
      userSession = JSON.parse(sessionCookie.value);
    } catch (parseError) {
      // Cookie corrupta, eliminar
      const response = NextResponse.json(
        { 
          success: false, 
          message: 'Sesión inválida',
          user: null 
        },
        { status: 401 }
      );
      response.cookies.delete('user_session');
      response.cookies.delete('user_info');
      return response;
    }

    // Verificar estructura básica de la sesión
    if (!userSession.usuario_id || !userSession.timestamp) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Sesión inválida',
          user: null 
        },
        { status: 401 }
      );
    }

    // Verificar expiración (24 horas)
    const sessionAge = Date.now() - userSession.timestamp;
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 horas
    
    if (sessionAge > maxSessionAge) {
      // Sesión expirada, eliminar cookies
      const response = NextResponse.json(
        { 
          success: false, 
          message: 'Sesión expirada',
          user: null 
        },
        { status: 401 }
      );
      response.cookies.delete('user_session');
      response.cookies.delete('user_info');
      return response;
    }

    // Verificar en base de datos que el usuario aún existe
    try {
      const sql = `SELECT u.usuario_id, u.nombre, u.usuario_login, u.rol_id, 
                          r.nombre_rol
                   FROM USUARIOS u 
                   INNER JOIN ROLES r ON u.rol_id = r.rol_id 
                   WHERE u.usuario_id = :1`; // Sin validación de estado
      
      const users = await runQuery(sql, [userSession.usuario_id]);
      
      if (!users || users.length === 0) {
        // Usuario no existe
        const response = NextResponse.json(
          { 
            success: false, 
            message: 'Usuario no encontrado',
            user: null 
          },
          { status: 401 }
        );
        response.cookies.delete('user_session');
        response.cookies.delete('user_info');
        return response;
      }

  const currentUser = users[0] as DBUser;

      // Actualizar sesión con datos actuales
      const updatedSession = {
        ...userSession,
        nombre: currentUser.NOMBRE,
        usuario_login: currentUser.USUARIO_LOGIN,
        rol_id: currentUser.ROL_ID,
        nombre_rol: currentUser.NOMBRE_ROL,
        timestamp: Date.now() // Renovar timestamp
      };

      // Devolver datos del usuario
      return NextResponse.json({
        success: true,
        user: {
          usuario_id: currentUser.USUARIO_ID,
          nombre: currentUser.NOMBRE,
          usuario_login: currentUser.USUARIO_LOGIN,
          rol_id: currentUser.ROL_ID,
          nombre_rol: currentUser.NOMBRE_ROL
        }
      });

    } catch (dbError) {
      console.error('Error verificando usuario en BD:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error interno del servidor',
          user: null 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error en verify endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor',
        user: null 
      },
      { status: 500 }
    );
  }
}