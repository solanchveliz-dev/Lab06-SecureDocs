const documentoService = require('../services/documentoService');
const abac = require('../authorization/abac/abacEngine');

// Solo devuelve los documentos que el usuario puede ver según ABAC
async function listar(req, res) {
  const docs = await documentoService.listar();
  const activas = await abac.politicasActivas();
  const visibles = [];

  for (const d of docs) {
    const r = await abac.evaluar({ usuario: req.usuario, recurso: d, accion: 'READ', entorno: req.entorno }, activas);
    if (r.permitido) visibles.push(d);
  }
  res.json({ total: docs.length, visibles: visibles.length, documentos: visibles });
}

async function obtener(req, res) {
  res.json(req.recurso);
}

async function crear(req, res) {
  if (!req.body?.titulo) return res.status(400).json({ error: 'El título es obligatorio' });
  const id = await documentoService.crear({
    ...req.recurso,
    descripcion: req.body.descripcion,
    departamento_id: req.usuario.departamento_id
  });
  res.status(201).json({ mensaje: 'Documento creado', id });
}

async function actualizar(req, res) {
  const { titulo, descripcion } = req.body || {};
  await documentoService.actualizar(req.params.id, { titulo, descripcion });
  res.json({ mensaje: 'Documento actualizado' });
}

async function eliminar(req, res) {
  await documentoService.eliminar(req.params.id);
  res.json({ mensaje: 'Documento eliminado' });
}

async function aprobar(req, res) {
  if (req.recurso.estado !== 'PENDIENTE') {
    return res.status(400).json({ error: `Solo se aprueban documentos PENDIENTE (actual: ${req.recurso.estado})` });
  }
  await documentoService.cambiarEstado(req.params.id, 'APROBADO');
  res.json({ mensaje: 'Documento aprobado' });
}

module.exports = { listar, obtener, crear, actualizar, eliminar, aprobar };