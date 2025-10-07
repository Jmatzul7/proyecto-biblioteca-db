// app/api/usuarios/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import runQuery from '@/lib/db/oracle';


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const usuarioId = id;
    const body = await request.json();
    const { nombre, usuario_login, contrasena, rol_id } = body;

    console.log('📦 Editando usuario:', { usuarioId, nombre, usuario_login, rol_id });

    if (!usuarioId) {
      return NextResponse.json(
        { success: false, message: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    const usuarioIdNum = Number(usuarioId);

    if (isNaN(usuarioIdNum)) {
      return NextResponse.json(
        { success: false, message: 'ID de usuario debe ser numérico' },
        { status: 400 }
      );
    }

    // Validaciones básicas
    if (!nombre || !usuario_login) {
      return NextResponse.json(
        { success: false, message: 'Nombre y usuario son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    const usuarioExistente = await runQuery(
      'SELECT usuario_id FROM usuarios WHERE usuario_id = :1',
      [usuarioIdNum]
    );

    if (!usuarioExistente || usuarioExistente.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el nuevo nombre de usuario ya existe (excluyendo el usuario actual)
    const usuarioDuplicado = await runQuery(
      'SELECT usuario_id FROM usuarios WHERE usuario_login = :1 AND usuario_id != :2',
      [usuario_login, usuarioIdNum]
    );

    if (usuarioDuplicado && usuarioDuplicado.length > 0) {
      return NextResponse.json(
        { success: false, message: 'El nombre de usuario ya está en uso' },
        { status: 400 }
      );
    }

    // Preparar la consulta de actualización
    let updateSql = `
      UPDATE USUARIOS 
      SET nombre = :1, usuario_login = :2, rol_id = :3
    `;
    
    const paramsArray = [nombre, usuario_login, rol_id ? Number(rol_id) : 2];

    // Si se proporciona una nueva contraseña, actualizarla
    if (contrasena) {
      if (contrasena.length < 6) {
        return NextResponse.json(
          { success: false, message: 'La contraseña debe tener al menos 6 caracteres' },
          { status: 400 }
        );
      }
      
      //const hashedPassword = await bcrypt.hash(contrasena, 12);
      const hashedPassword = contrasena;

      updateSql += `, contrasena = :4`;
      paramsArray.push(hashedPassword);
    }

    updateSql += ` WHERE usuario_id = :${paramsArray.length + 1}`;
    paramsArray.push(usuarioIdNum);

    console.log('🔄 Actualizando usuario...');
    await runQuery(updateSql, paramsArray);

    // Registrar en auditoría
    try {
      await runQuery(
        `INSERT INTO AUDITORIA (evento_id, usuario_id, accion, detalle)
         VALUES (AUDITORIA_SEQ.NEXTVAL, 1, 'EDITAR_USUARIO', 'Usuario editado: ${usuario_login} - ID: ${usuarioId}')`
      );
    } catch (auditError) {
      console.log('⚠️ No se pudo registrar auditoría');
    }

    console.log('✅ Usuario actualizado exitosamente');

    return NextResponse.json({
      success: true,
      message: contrasena ? 'Usuario y contraseña actualizados exitosamente' : 'Usuario actualizado exitosamente',
      data: {
        usuario_id: usuarioIdNum,
        nombre: nombre,
        usuario_login: usuario_login,
        rol_id: rol_id ? Number(rol_id) : 2
      }
    });

  } catch (error: unknown) {
    console.error('❌ Error actualizando usuario:', error);

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