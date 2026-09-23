const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioService = require('../services/usuarioService');
const audit = require('../services/auditService');
const abac = require('../authorization/abac/abacEngine');
const rbac = require('../authorization/rbac/rbacService');
const { construirEntorno } = require('../authorization/entorno');
const { tokensRevocados } = require('./authMiddleware');

async function login(req, res) {
  const { correo, password } = req.body || {};
  const ip = req.ip;
  if (!correo || !password) return res.status(400).json({ error: 'Correo y contraseña requeridos' });

  const usuario = await usuarioService.buscarPorCorreo(correo);
  const valido = usuario && await bcrypt.compare(password, usuario.password_hash);

  if (!valido) {
    await audit.registrar({ usuario: correo, recurso: 'auth', accion: 'LOGIN', resultado: 'DENEGADO', motivo: 'Credenciales inválidas', ip });
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  // ¿Usuario válido? -> lo decide la política P7 del motor ABAC
  const a = await abac.evaluar({ usuario, recurso: null, accion: 'LOGIN', entorno: construirEntorno(req) });
  if (!a.permitido) {
    await audit.registrar({ usuario: correo, recurso: 'auth', accion: 'LOGIN', resultado: 'DENEGADO', motivo: 'ABAC: ' + a.motivos.join(' | '), ip });
    return res.status(403).json({ error: 'Acceso denegado', motivos: a.motivos });
  }

  const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });
  await audit.registrar({ usuario: correo, recurso: 'auth', accion: 'LOGIN', resultado: 'PERMITIDO', motivo: 'Inicio de sesión correcto', ip });

  res.json({
    token,
    usuario: {
      id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol,
      departamento: usuario.departamento, nivel_seguridad: usuario.nivel_seguridad
    }
  });
}

async function logout(req, res) {
  tokensRevocados.add(req.token);
  await audit.registrar({ usuario: req.usuario.correo, recurso: 'auth', accion: 'LOGOUT', resultado: 'PERMITIDO', motivo: 'Cierre de sesión', ip: req.ip });
  res.json({ mensaje: 'Sesión cerrada' });
}

async function me(req, res) {
  const permisos = await rbac.permisosDeRol(req.usuario.rol_id);
  res.json({ usuario: req.usuario, permisos });
}

module.exports = { login, logout, me };