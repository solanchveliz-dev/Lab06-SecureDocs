const bcrypt = require('bcryptjs');
const usuarioService = require('../services/usuarioService');

async function listar(req, res) {
  res.json(await usuarioService.listar());
}

async function crear(req, res) {
  const d = req.body || {};
  if (!d.nombre || !d.correo || !d.password || !d.rol_id || !d.departamento_id) {
    return res.status(400).json({ error: 'Faltan campos: nombre, correo, password, rol_id, departamento_id' });
  }
  try {
    const password_hash = await bcrypt.hash(d.password, 10);
    const id = await usuarioService.crear({ ...d, password_hash });
    res.status(201).json({ mensaje: 'Usuario creado', id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'El correo ya existe' });
    throw err;
  }
}

// Modificar datos, activar/desactivar (estado), departamento y nivel de seguridad
async function actualizar(req, res) {
  const filas = await usuarioService.actualizar(req.params.id, req.body || {});
  if (!filas) return res.status(404).json({ error: 'Usuario no encontrado o sin cambios' });
  res.json({ mensaje: 'Usuario actualizado' });
}

async function asignarRol(req, res) {
  const { rol_id } = req.body || {};
  if (!rol_id) return res.status(400).json({ error: 'rol_id requerido' });
  const filas = await usuarioService.asignarRol(req.params.id, rol_id);
  if (!filas) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json({ mensaje: 'Rol asignado' });
}

module.exports = { listar, crear, actualizar, asignarRol };