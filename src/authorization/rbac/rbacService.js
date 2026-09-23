const pool = require('../../config/db');

// Traduce la acción del sistema al permiso de la tabla permisos
const ACCION_PERMISO = {
  CREATE: 'CREAR_DOCUMENTO',
  READ: 'CONSULTAR_DOCUMENTO',
  UPDATE: 'MODIFICAR_DOCUMENTO',
  DELETE: 'ELIMINAR_DOCUMENTO',
  APPROVE: 'APROBAR_DOCUMENTO',
  VIEW_AUDIT: 'VER_AUDITORIA',
  MANAGE_USERS: 'GESTIONAR_USUARIOS',
  ASSIGN_ROLES: 'ASIGNAR_ROLES'
};

// usuario -> rol -> permisos -> operación
async function tienePermiso(rolId, accion) {
  const permiso = ACCION_PERMISO[accion];
  if (!permiso) return { permitido: false, permiso: accion };

  const [rows] = await pool.query(
    `SELECT 1 FROM rol_permiso rp
     JOIN permisos p ON p.id = rp.permiso_id
     WHERE rp.rol_id = ? AND p.codigo = ?`,
    [rolId, permiso]
  );
  return { permitido: rows.length > 0, permiso };
}

async function permisosDeRol(rolId) {
  const [rows] = await pool.query(
    `SELECT p.codigo FROM rol_permiso rp
     JOIN permisos p ON p.id = rp.permiso_id WHERE rp.rol_id = ?`,
    [rolId]
  );
  return rows.map(r => r.codigo);
}

module.exports = { tienePermiso, permisosDeRol };