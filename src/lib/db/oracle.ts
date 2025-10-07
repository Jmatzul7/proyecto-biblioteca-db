// src/lib/db/oracle.ts
import oracledb from 'oracledb';

// Para Oracle 11g, necesitamos configuraciones específicas
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

// Configuración específica para Oracle 11g
const oracleConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING,
  poolMin: 1,
  poolMax: 3,  // Reducir para Oracle 11g
  poolTimeout: 30
};

let pool: oracledb.Pool;

async function initializePool() {
  try {
    console.log('🔗 Conectando a Oracle 11g en CloudClusters...');
    
    pool = await oracledb.createPool(oracleConfig);
    console.log('✅ Pool creado para Oracle 11g');
    
  } catch (error: any) {
    console.error('❌ Error con Oracle 11g:', error.message);
    
    // Si falla, probamos con oracledb legacy
    if (error.message.includes('NJS-138')) {
      console.log('💡 Probando con configuración legacy para Oracle 11g...');
      await initializePoolLegacy();
    } else {
      throw error;
    }
  }
}

async function initializePoolLegacy() {
  try {
    // Configuración legacy para Oracle 11g
    const legacyConfig = {
      ...oracleConfig,
      poolMax: 2,
      poolTimeout: 20,
      stmtCacheSize: 0  // Desactivar cache para compatibilidad
    };
    
    pool = await oracledb.createPool(legacyConfig);
    console.log('✅ Pool legacy creado para Oracle 11g');
  } catch (error) {
    console.error('❌ Error con configuración legacy:', error);
    throw error;
  }
}

// Resto del código igual...
async function runQuery(sql: string, binds: any = []) {
  if (!pool) await initializePool();

  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    return result.rows;
  } catch (err: any) {
    console.error("❌ Error en consulta:", err.message);
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

export default runQuery;
export { initializePool };