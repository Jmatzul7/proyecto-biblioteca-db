import { NextRequest, NextResponse } from 'next/server';
import runQuery from '@/lib/db/oracle';

    interface Usuario {
      USUARIO_ID: number;
      NOMBRE: string;
      USUARIO_LOGIN: string;
      ROL_ID: number;
      FECHA_REGISTRO: string;
      TIPO_USUARIO: string;
    }

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rol = searchParams.get('rol');
    const search = searchParams.get('search');
    
    let query = `
      SELECT 
        u.usuario_id,
        u.nombre,
        u.usuario_login,
        u.rol_id,
        u.fecha_registro,
        r.nombre_rol as tipo_usuario
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.rol_id
    `;

    const params = [];
    let paramCount = 0;
    
    if (rol) {
      query += ` ${paramCount === 0 ? 'WHERE' : 'AND'} r.nombre_rol = :${++paramCount}`;
      params.push(rol);
    }
    
    if (search) {
      query += ` ${paramCount === 0 ? 'WHERE' : 'AND'} (UPPER(u.nombre) LIKE UPPER(:${++paramCount}) OR UPPER(u.usuario_login) LIKE UPPER(:${++paramCount}))`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY u.fecha_registro DESC, u.nombre`;


    const usuariosResult = await runQuery(query, params);
    const usuarios: Usuario[] = Array.isArray(usuariosResult)
      ? usuariosResult.map((u: unknown) => u as Usuario)
      : [];

    return NextResponse.json({
      success: true,
      data: usuarios
    });

  } catch (error: unknown) {
    console.error('❌ Error obteniendo usuarios:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, usuario_login, contrasena, rol_id } = body;

    console.log('📦 Datos recibidos para nuevo usuario:', { nombre, usuario_login, rol_id });

    // Validaciones básicas
    if (!nombre || !usuario_login || !contrasena) {
      return NextResponse.json(
        { success: false, message: 'Nombre, usuario y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    if (contrasena.length < 6) {
      return NextResponse.json(
        { success: false, message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await runQuery(
      'SELECT usuario_id FROM usuarios WHERE usuario_login = :1',
      [usuario_login]
    );

    if (usuarioExistente && usuarioExistente.length > 0) {
      return NextResponse.json(
        { success: false, message: 'El nombre de usuario ya está en uso' },
        { status: 400 }
      );
    }

    // Obtener próximo ID de usuario
    const idResult = await runQuery(`SELECT NVL(MAX(USUARIO_ID), 0) + 1 AS NEXT_ID FROM USUARIOS`);
        if (!idResult || idResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Error al identificador de usuario' },
        { status: 500 }
      );
    }
    
    interface NextIdResult {
      NEXT_ID: number;
    }
    const nextId = (idResult[0] as NextIdResult)?.NEXT_ID;

    if (!nextId) {
      return NextResponse.json(
        { success: false, message: 'No se pudo generar el ID del usuario' },
        { status: 500 }
      );
    }

    // Encriptar contraseña
    //const hashedPassword = await bcrypt.hash(contrasena, 12);

    const hashedPassword = contrasena; // Temporalmente sin hash para pruebas

    // Insertar usuario
    const insertSql = `
      INSERT INTO USUARIOS (
        USUARIO_ID, NOMBRE, ROL_ID, FECHA_REGISTRO, USUARIO_LOGIN, CONTRASENA
      ) VALUES (
        :1, :2, :3, SYSDATE, :4, :5
      )
    `;

    const rolIdNum = rol_id ? Number(rol_id) : 2; 

    await runQuery(insertSql, [nextId, nombre, rolIdNum, usuario_login, hashedPassword]);

    // Registrar en auditoría
    try {
      await runQuery(
        `INSERT INTO AUDITORIA (evento_id, usuario_id, accion, detalle)
         VALUES (AUDITORIA_SEQ.NEXTVAL, 1, 'NUEVO_USUARIO', 'Usuario creado: ${usuario_login} - ID: ${nextId}')`
      );
    } catch (auditError) {
      console.log('⚠️ No se pudo registrar auditoría');
    }

    console.log('✅ Usuario creado exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        usuario_id: nextId,
        nombre: nombre,
        usuario_login: usuario_login,
        rol_id: rolIdNum,
        fecha_registro: new Date().toISOString().split('T')[0]
      }
    });

  } catch (error: unknown) {
    console.error('❌ Error creando usuario:', error);

    let errorMessage = 'Error interno del servidor';
    if (error instanceof Error) {
      if (error.message.includes('ORA-00001')) errorMessage = 'Error de duplicación en usuarios';
      if (error.message.includes('NJS-098')) errorMessage = 'Error en los parámetros de la consulta';
    }


    return NextResponse.json(
      { success: false, message: errorMessage, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}