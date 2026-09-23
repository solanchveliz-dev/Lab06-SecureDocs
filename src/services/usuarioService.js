const pool = require('../config/db');

const BASE = `
  SELECT u.id, u.nombre, u.correo, u.password_hash, u.rol_id, r.nombre AS rol,
         u.departamento_id, d.nombre AS departamento, u.nivel_seguridad,
         u.pais, u.tipo_contrato, u.estado
  FROM usuarios u
  JOIN roles r ON r.id = u.rol_id
  JOIN departamentos d ON d.id = u.departamento_id`;

const CAMPOS_EDITABLES = ['nombre', 'departamento_id', 'nivel_seguridad', 'pais', 'tipo_contrato', 'estado'];

async function buscarPorId(id) {
  const [rows] = await pool.query(`${BASE} WHERE u.id = ?`, [id]);
  return rows[0] || null;
}

async function buscarPorCorreo(correo) {
  const [rows] = await pool.query(`${BASE} WHERE u.correo = ?`, [correo]);
  return rows[0] || null;
}

async function listar() {
  const [rows] = await pool.query(`${BASE} ORDER BY u.id`);
  return rows.map(({ password_hash, ...u }) => u);
}

async function crear(d) {
  const [r] = await pool.query(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol_id, departamento_id,
      nivel_seguridad, pais, tipo_contrato, estado) VALUES (?,?,?,?,?,?,?,?, 'ACTIVO')`,
    [d.nombre, d.correo, d.password_hash, d.rol_id, d.departamento_id,
     d.nivel_seguridad || 1, d.pais || 'PERU', d.tipo_contrato || 'INTERNO']
  );
  return r.insertId;
}

async function actualizar(id, datos) {
  const campos = CAMPOS_EDITABLES.filter(c => datos[c] !== undefined);
  if (!campos.length) return 0;
  const sql = `UPDATE usuarios SET ${campos.map(c => `${c} = ?`).join(', ')} WHERE id = ?`;
  const [r] = await pool.query(sql, [...campos.map(c => datos[c]), id]);
  return r.affectedRows;
}

async function asignarRol(id, rolId) {
  const [r] = await pool.query('UPDATE usuarios SET rol_id = ? WHERE id = ?', [rolId, id]);
  return r.affectedRows;
}

module.exports = { buscarPorId, buscarPorCorreo, listar, crear, actualizar, asignarRol };