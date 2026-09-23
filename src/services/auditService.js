const pool = require('../config/db');

async function registrar({ usuario, recurso, accion, resultado, motivo, ip }) {
  try {
    await pool.query(
      `INSERT INTO auditoria (usuario, recurso, accion, resultado, motivo, direccion_ip)
       VALUES (?,?,?,?,?,?)`,
      [usuario || 'anonimo', recurso || '-', accion, resultado, motivo, ip || null]
    );
  } catch (err) {
    console.error('Error registrando auditoría:', err.message);
  }
}

async function listar() {
  const [rows] = await pool.query('SELECT * FROM auditoria ORDER BY id DESC LIMIT 300');
  return rows;
}

module.exports = { registrar, listar };