import { NextRequest, NextResponse } from 'next/server';
import runQuery from '@/lib/db/oracle';

interface usuario{
USUARIO_ID: string,
NOMBRE: string,
USUARIO_LOGIN: string,
CONTRASENA: string,
ROL_ID: string,
NOMBRE_ROL: string
}

export async function POST(request: NextRequest) {
  try {
    const { usuario_login, contrasena } = await request.json();

    if (!usuario_login?.trim() || !contrasena?.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Usuario y contraseña requeridos' 
        },
        { status: 400 }
      );
    }

    const usuarioLogin = usuario_login.trim();
    
    const sql = `SELECT u.usuario_id, u.nombre, u.usuario_login, u.contrasena, 
                        u.rol_id, r.nombre_rol
                 FROM USUARIOS u 
                 INNER JOIN ROLES r ON u.rol_id = r.rol_id 
                 WHERE u.usuario_login = :1`;
    
    const users = await runQuery(sql, [usuarioLogin]);
    
    if (!users || users.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Credenciales incorrectas' 
        },
        { status: 401 }
      );
    }

    const user = users[0] as usuario;
    const isPasswordValid = contrasena === user.CONTRASENA;
    
    if (!isPasswordValid) {
      // Registrar intento fallido
      try {
        console.log('Intento de login fallido, registrando auditoría'+ user.USUARIO_ID );
        await runQuery(
          `INSERT INTO AUDITORIA (evento_id, usuario_id, accion, detalle) 
           VALUES ((SELECT NVL(MAX(evento_id), 0) + 1 FROM AUDITORIA), :1, 'LOGIN_FALLIDO', 'Intento de inicio de sesión fallido')`,
          [user.USUARIO_ID]
        );
      } catch (auditError) {
        console.log('No se pudo registrar auditoría de intento fallido'+ auditError);
        console.log(user.USUARIO_ID);
      }

      return NextResponse.json(
        { 
          success: false, 
          message: 'Credenciales incorrectas' 
        },
        { status: 401 }
      );
    }

    // Preparar datos de sesión
    const userSession = {
      usuario_id: user.USUARIO_ID,
      nombre: user.NOMBRE,
      usuario_login: user.USUARIO_LOGIN,
      rol_id: user.ROL_ID,
      nombre_rol: user.NOMBRE_ROL,
      timestamp: Date.now()
    };

    // Crear respuesta exitosa
    const response = NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: {
        usuario_id: user.USUARIO_ID,
        nombre: user.NOMBRE,
        usuario_login: user.USUARIO_LOGIN,
        rol_id: user.ROL_ID,
        nombre_rol: user.NOMBRE_ROL
      }
    });

    // Configurar cookies
    response.cookies.set('user_session', JSON.stringify(userSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
      path: '/'
    });

    response.cookies.set('user_info', JSON.stringify({
      nombre: user.NOMBRE,
      nombre_rol: user.NOMBRE_ROL
    }), {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
      path: '/'
    });

    // Registrar auditoría de login exitoso sin usar secuencia
    try {
      await runQuery(
        `INSERT INTO AUDITORIA (evento_id, usuario_id, accion, detalle) 
         VALUES ((SELECT NVL(MAX(evento_id), 0) + 1 FROM AUDITORIA), :1, 'LOGIN', 'Inicio de sesión exitoso desde la web')`,
        [user.USUARIO_ID]
      );
    } catch (auditError) {
      console.log('No se pudo registrar auditoría de login exitoso');
      // No fallar el login si la auditoría falla
    }

    return response;

  } catch (error) {
    console.error('Error en endpoint de login:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor. Por favor, intente más tarde.' 
      },
      { status: 500 }
    );
  }
}