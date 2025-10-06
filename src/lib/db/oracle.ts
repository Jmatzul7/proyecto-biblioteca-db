import oracledb from 'oracledb';

// Configurar formato de salida y autoCommit
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true; 
// 💡 AGREGAR ESTO:
oracledb.fetchAsString = [oracledb.DATE, oracledb.NUMBER];
// Si tienes CLOBs o BLOBs:
// oracledb.fetchAsBuffer = [ oracledb.BLOB ];

// Crear un pool de conexiones
let pool: oracledb.Pool;

async function initializePool() {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
      poolMin: 2,       
      poolMax: 5,       
      poolTimeout: 60   
    });
    console.log('Pool de conexiones creado');
  } catch (error) {
    console.error('Error creando pool:', error);
    throw error;
  }
}

// Función principal para ejecutar consultas
async function runQuery(

    sql: string,
  binds: any = [], // ✅ ahora puede ser objeto o array
  options: any = {}
) {
  // Inicializar pool si no existe
  if (!pool) {
    await initializePool();
  }

  let connection;
  try {
    // Obtener conexión del pool
    connection = await pool.getConnection();
    
    // Ejecutar consulta
    const result = await connection.execute(sql, binds, {
      ...options,
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    return result.rows; 
    
  } catch (err) {
    console.error("Error en la consulta:", err);
    throw err;
  } finally {
    // Liberar conexión al pool (NO cerrar)
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error liberando conexión:", err);
      }
    }
  }
}

// Cerrar pool cuando la aplicación termine
async function closePool() {
  if (pool) {
    try {
      await pool.close();
      console.log('Pool cerrado correctamente');
    } catch (err) {
      console.error('Error cerrando pool:', err);
    }
  }
}

export default runQuery;
export { closePool };