import oracledb from 'oracledb';

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

// Configuración específica para Oracle 11g
const oracleConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING,
  poolMin: 1,
  poolMax: 3,  
  poolTimeout: 30
};

let pool: oracledb.Pool;

async function initializePool() {
  try {
    
    pool = await oracledb.createPool(oracleConfig);
    console.log('✅ Pool creado para Oracle 11g');
    
  } catch (error) {
    if (typeof error === 'object' && error && 'message' in error) {
      console.error('❌ Error con Oracle 11g:', (error as { message: string }).message);
      // Si falla, probamos con oracledb legacy
      if ((error as { message: string }).message.includes('NJS-138')) {
        console.log('💡 Probando con configuración legacy para Oracle 11g...');
        await initializePoolLegacy();
      } else {
        throw error;
      }
    } else {
      console.error('❌ Error con Oracle 11g:', error);
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

async function runQuery(sql: string, binds: oracledb.BindParameters = []) {
  if (!pool) await initializePool();

  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    return result.rows;
  } catch (err) {
    if (typeof err === 'object' && err && 'message' in err) {
      console.error("❌ Error en consulta:", (err as { message: string }).message);
    } else {
      console.error("❌ Error en consulta:", err);
    }
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

export default runQuery;
export { initializePool };