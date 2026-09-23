const pool = require('../config/db');

const BASE = `
  SELECT d.id, d.titulo, d.descripcion, d.propietario, d.departamento_id,
         dep.nombre AS departamento, d.nivel_confidencialidad, d.estado,
         d.pais, d.fecha_creacion
  FROM documentos d
  JOIN departamentos dep ON dep.id = d.departamento_id`;

async function listar() {
  const [rows] = await pool.query(`${BASE} ORDER BY d.id`);
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await pool.query(`${BASE} WHERE d.id = ?`, [id]);
  return rows[0] || null;
}

async function crear(d) {
  const [r] = await pool.query(
    `INSERT INTO documentos (titulo, descripcion, propietario, departamento_id,
      nivel_confidencialidad, estado, pais) VALUES (?,?,?,?,?, 'PENDIENTE', ?)`,
    [d.titulo, d.descripcion || '', d.propietario, d.departamento_id, d.nivel_confidencialidad, d.pais]
  );
  return r.insertId;
}

async function actualizar(id, { titulo, descripcion }) {
  await pool.query(
    'UPDATE documentos SET titulo = COALESCE(?, titulo), descripcion = COALESCE(?, descripcion) WHERE id = ?',
    [titulo ?? null, descripcion ?? null, id]
  );
}

async function eliminar(id) {
  await pool.query('DELETE FROM documentos WHERE id = ?', [id]);
}

async function cambiarEstado(id, estado) {
  await pool.query('UPDATE documentos SET estado = ? WHERE id = ?', [estado, id]);
}

module.exports = { listar, buscarPorId, crear, actualizar, eliminar, cambiarEstado };