import { NextRequest, NextResponse } from 'next/server';
import runQuery from '@/lib/db/oracle';

interface Libro {
  LIBRO_ID: number;
  TITULO: string;
  AUTOR_ID: number;
  NOMBRE_AUTOR: string;
  AUTOR_NACIONALIDAD: string;
  EDITORIAL_ID: number;
  NOMBRE_EDITORIAL: string;
  ANIO_PUBLICACION: number;
  NUM_COPIAS: number;
  FECHA_REGISTRO: string;
  URL_IMAGEN?: string;
  ISBN?: string;
  GENERO_ID: number;
  NOMBRE_GENERO: string;
  COPIAS_DISPONIBLES: number;
  TOTAL_COPIAS_REGISTRADAS?: number;
  COPIAS_FISICAS_DISPONIBLES?: number;
}

interface TotalResult {
  TOTAL: number;
}

interface NextIdResult {
  NEXT_ID: number;
}

interface NextCopiaIdResult {
  NEXT_COPIA_ID: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const genero = searchParams.get('genero') || '';
    const autor = searchParams.get('autor') || '';
    const editorial = searchParams.get('editorial') || '';
    const disponibilidad = searchParams.get('disponibilidad') || '';

    const offset = (page - 1) * limit;

    // Construir consulta dinámica
    let whereClause = '';
    const binds: string[] = [];

    if (search) {
      whereClause += ` AND (l.titulo LIKE '%' || :${binds.length + 1} || '%' OR a.nombre_autor LIKE '%' || :${binds.length + 1} || '%')`;
      binds.push(search);
    }

    if (genero) {
      whereClause += ` AND g.nombre_genero = :${binds.length + 1}`;
      binds.push(genero);
    }

    if (autor) {
      whereClause += ` AND a.nombre_autor = :${binds.length + 1}`;
      binds.push(autor);
    }

    if (editorial) {
      whereClause += ` AND e.nombre_editorial = :${binds.length + 1}`;
      binds.push(editorial);
    }

    // Consulta principal actualizada con JOIN a autores y editoriales
    const libros = await runQuery(
      `SELECT 
        l.libro_id, 
        l.titulo, 
        l.autor_id,
        a.nombre_autor,
        a.nacionalidad as autor_nacionalidad,
        l.editorial_id,
        e.nombre_editorial,
        l.anio_publicacion, 
        l.num_copias,
        l.fecha_registro, 
        l.url_imagen,
        l.isbn,
        g.genero_id, 
        g.nombre_genero,
        -- Cálculo CORRECTO: copias totales - copias prestadas
        (l.num_copias - 
          NVL((SELECT COUNT(*) FROM prestamos p 
               WHERE p.libro_id = l.libro_id 
               AND p.estado = 'PRESTADO'), 0)
        ) as copias_disponibles,
        (SELECT COUNT(*) FROM copias_libros cl WHERE cl.libro_id = l.libro_id) as total_copias_registradas,
        (SELECT COUNT(*) FROM copias_libros cl WHERE cl.libro_id = l.libro_id AND cl.estado_copia = 'DISPONIBLE') as copias_fisicas_disponibles
       FROM LIBROS l
       JOIN autores a ON l.autor_id = a.autor_id
       LEFT JOIN editoriales e ON l.editorial_id = e.editorial_id
       JOIN generos g ON l.genero_id = g.genero_id
       WHERE 1=1 ${whereClause}
       ORDER BY l.fecha_registro DESC
       OFFSET :${binds.length + 1} ROWS FETCH NEXT :${binds.length + 2} ROWS ONLY`,
      [...binds, offset, limit]
    );

    // Aplicar filtro de disponibilidad en el código 
    let librosFiltrados = libros || [];
    
    if (disponibilidad === 'available') {
      librosFiltrados = librosFiltrados.filter((libro) => 
        ((libro as Libro).COPIAS_DISPONIBLES || 0) > 0
      );
    } else if (disponibilidad === 'unavailable') {
      librosFiltrados = librosFiltrados.filter((libro) => 
        ((libro as Libro).COPIAS_DISPONIBLES || 0) === 0
      );
    }

    // Contar total para paginación
    const totalResult = await runQuery(
      `SELECT COUNT(*) as total
       FROM LIBROS l
       JOIN autores a ON l.autor_id = a.autor_id
       LEFT JOIN editoriales e ON l.editorial_id = e.editorial_id
       JOIN generos g ON l.genero_id = g.genero_id
       WHERE 1=1 ${whereClause}`,
      binds
    );

    const total = totalResult ? (totalResult[0] as TotalResult).TOTAL : 0;

    // Formatear respuesta
    const librosFormateados = librosFiltrados.map((libro) => {
      const l = libro as Libro;
      return {
        libro_id: l.LIBRO_ID?.toString(),
        titulo: l.TITULO,
        autor: {
          autor_id: l.AUTOR_ID?.toString(),
          nombre_autor: l.NOMBRE_AUTOR,
          nacionalidad: l.AUTOR_NACIONALIDAD
        },
        editorial: l.EDITORIAL_ID ? {
          editorial_id: l.EDITORIAL_ID?.toString(),
          nombre_editorial: l.NOMBRE_EDITORIAL
        } : null,
        anio_publicacion: l.ANIO_PUBLICACION?.toString(),
        num_copias: l.NUM_COPIAS?.toString(),
        fecha_registro: l.FECHA_REGISTRO,
        url_imagen: l.URL_IMAGEN,
        isbn: l.ISBN,
        genero: {
          genero_id: l.GENERO_ID?.toString(),
          nombre_genero: l.NOMBRE_GENERO
        },
        copias_disponibles: l.COPIAS_DISPONIBLES?.toString() || '0',
        // Información adicional para debugging
        _debug: {
          total_copias_registradas: l.TOTAL_COPIAS_REGISTRADAS?.toString(),
          copias_fisicas_disponibles: l.COPIAS_FISICAS_DISPONIBLES?.toString()
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: librosFormateados,
      pagination: {
        page,
        limit,
        total: librosFiltrados.length, 
        totalPages: Math.ceil(librosFiltrados.length / limit)
      }
    });

  } catch (error: unknown) {
    console.error('❌ Error obteniendo libros:', (error as { message: string }).message);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obtener los datos del cuerpo de la solicitud
    const { 
      titulo, 
      autor_id, 
      editorial_id, 
      anio_publicacion, 
      genero_id, 
      num_copias, 
      url_imagen,
      isbn 
    } = await request.json();

    // Validaciones básicas
    if (!titulo || !autor_id) {
      return NextResponse.json(
        { success: false, message: 'Título y autor son obligatorios' },
        { status: 400 }
      );
    }

    // Validar que el autor existe
    const autorExists = await runQuery(
      `SELECT 1 FROM autores WHERE autor_id = :1`,
      [parseInt(autor_id)]
    );

    if (!autorExists || autorExists.length === 0) {
      return NextResponse.json(
        { success: false, message: 'El autor seleccionado no existe' },
        { status: 400 }
      );
    }

    // Validar que la editorial existe si se proporciona
    if (editorial_id) {
      const editorialExists = await runQuery(
        `SELECT 1 FROM editoriales WHERE editorial_id = :1`,
        [parseInt(editorial_id)]
      );

      if (!editorialExists || editorialExists.length === 0) {
        return NextResponse.json(
          { success: false, message: 'La editorial seleccionada no existe' },
          { status: 400 }
        );
      }
    }

    // Validar año de publicación si se proporciona
    if (anio_publicacion && (parseInt(anio_publicacion) < 1900 || parseInt(anio_publicacion) > new Date().getFullYear())) {
      return NextResponse.json(
        { success: false, message: 'El año de publicación debe ser mayor a 1900' },
        { status: 400 }
      );
    }

    // Obtener el próximo ID del libro
    const idResult = await runQuery(
      `SELECT COALESCE(MAX(LIBRO_ID), 0) + 1 AS NEXT_ID FROM LIBROS`
    );

    if (!idResult || idResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Error al generar ID del libro' },
        { status: 500 }
      );
    }

    const nextId = (idResult[0] as NextIdResult).NEXT_ID;

    // Insertar el nuevo libro
    const insertSql = `
      INSERT INTO LIBROS (
        LIBRO_ID, 
        TITULO, 
        AUTOR_ID,
        EDITORIAL_ID,
        ANIO_PUBLICACION, 
        GENERO_ID, 
        NUM_COPIAS, 
        FECHA_REGISTRO, 
        URL_IMAGEN,
        ISBN
      ) VALUES (
        :1, :2, :3, :4, :5, :6, :7, SYSDATE, :8, :9
      )
    `;

    const insertBinds = [
      nextId,
      titulo.trim(),
      parseInt(autor_id),
      editorial_id ? parseInt(editorial_id) : null,
      anio_publicacion ? parseInt(anio_publicacion) : null,
      genero_id ? parseInt(genero_id) : null,
      num_copias ? parseInt(num_copias) : 1,
      url_imagen || null,
      isbn || null
    ];

    await runQuery(insertSql, insertBinds);

    // Crear registros en COPIAS_LIBROS por cada copia
    if (num_copias && parseInt(num_copias) > 0) {
      const numCopias = parseInt(num_copias);
      
      // Obtener próximo ID de copia
      const copiaIdResult = await runQuery(
        `SELECT COALESCE(MAX(COPIA_ID), 0) + 1 AS NEXT_COPIA_ID FROM COPIAS_LIBROS`
      );
      
      if (copiaIdResult && copiaIdResult.length > 0) {
        let nextCopiaId = (copiaIdResult[0] as NextCopiaIdResult).NEXT_COPIA_ID;

        // Crear cada copia individual
        for (let i = 0; i < numCopias; i++) {
          const insertCopias = `
            INSERT INTO COPIAS_LIBROS (COPIA_ID, LIBRO_ID, ESTADO_COPIA)
            VALUES (:1, :2, 'DISPONIBLE')
          `;
          
          await runQuery(insertCopias, [nextCopiaId, nextId]);
          nextCopiaId++;
        }
      }
    }

    // Obtener el libro recién creado para devolverlo
    const libroCreado = await runQuery(
      `SELECT 
        l.LIBRO_ID,
        l.TITULO,
        l.AUTOR_ID,
        a.nombre_autor,
        a.nacionalidad as autor_nacionalidad,
        l.EDITORIAL_ID,
        e.nombre_editorial,
        l.ANIO_PUBLICACION,
        l.NUM_COPIAS,
        l.FECHA_REGISTRO,
        l.URL_IMAGEN,
        l.ISBN,
        g.GENERO_ID,
        g.NOMBRE_GENERO,
        -- CÁLCULO CORREGIDO: Usar NUM_COPIAS directamente (ya que es un libro nuevo sin préstamos)
        l.NUM_COPIAS as COPIAS_DISPONIBLES
       FROM LIBROS l
       JOIN autores a ON l.autor_id = a.autor_id
       LEFT JOIN editoriales e ON l.editorial_id = e.editorial_id
       JOIN generos g ON l.genero_id = g.genero_id
       WHERE l.LIBRO_ID = :1`,
      [nextId]
    );

    if (!libroCreado || libroCreado.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Error al recuperar el libro creado' },
        { status: 500 }
      );
    }

    // Registrar en auditoría
    try {
      await runQuery(
        `INSERT INTO AUDITORIA (evento_id, usuario_id, accion, detalle)
         VALUES ((SELECT NVL(MAX(evento_id), 0) + 1 FROM AUDITORIA), 1, 'Creacion Nuevo Libro', 'Libro creado: ${titulo}')`
      );
    } catch (auditError) {
      console.log('⚠️ No se pudo registrar auditoría');
    }

    const libro = libroCreado[0] as Libro;

    // Formatear respuesta
    const libroFormateado = {
      libro_id: libro.LIBRO_ID?.toString(),
      titulo: libro.TITULO,
      autor: {
        autor_id: libro.AUTOR_ID?.toString(),
        nombre_autor: libro.NOMBRE_AUTOR,
        nacionalidad: libro.AUTOR_NACIONALIDAD
      },
      editorial: libro.EDITORIAL_ID ? {
        editorial_id: libro.EDITORIAL_ID?.toString(),
        nombre_editorial: libro.NOMBRE_EDITORIAL
      } : null,
      anio_publicacion: libro.ANIO_PUBLICACION?.toString(),
      num_copias: libro.NUM_COPIAS?.toString(),
      fecha_registro: libro.FECHA_REGISTRO,
      url_imagen: libro.URL_IMAGEN,
      isbn: libro.ISBN,
      genero: {
        genero_id: libro.GENERO_ID?.toString(),
        nombre_genero: libro.NOMBRE_GENERO
      },
      copias_disponibles: libro.COPIAS_DISPONIBLES?.toString() || '0'
    };

    return NextResponse.json({
      success: true,
      message: 'Libro creado exitosamente',
      data: libroFormateado
    });

  } catch (error: unknown) {
    console.error('❌ Error creando libro:', error);
    // Manejar errores específicos de Oracle
    let errorMessage = 'Error interno del servidor al crear el libro';
    if (typeof error === 'object' && error && 'message' in error) {
      const errMsg = (error as { message: string }).message;
      // Error de constraint única (título duplicado)
      if (errMsg.includes('ORA-00001')) {
        errorMessage = 'Ya existe un libro con ese título';
      }
      // Error de foreign key (género/autor/editorial no existe)
      else if (errMsg.includes('ORA-02291')) {
        errorMessage = 'El género, autor o editorial seleccionado no existe';
      }
      // Error de datos inválidos
      else if (errMsg.includes('ORA-01722')) {
        errorMessage = 'Datos numéricos inválidos';
      }
    }
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' && typeof error === 'object' && error && 'message' in error ? (error as { message: string }).message : undefined
      },
      { status: 500 }
    );
  }
}