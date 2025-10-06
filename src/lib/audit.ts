import runQuery from '../lib/db/oracle';

export async function audit(accion: string, detalle: string | null, usuarioId?: number | null) {
  try {
    const sql = `INSERT INTO AUDITORIA (usuario_id, accion, detalle, fecha_evento)
                 VALUES (:u, :a, :d, SYSDATE)`;
    const binds = { u: usuarioId ?? null, a: accion, d: detalle };

    const result = await runQuery(sql);
    return result;
  } catch {
    // Evitar romper la operación por fallo de auditoría
  }
}
