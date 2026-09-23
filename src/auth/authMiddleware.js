const jwt = require('jsonwebtoken');
const usuarioService = require('../services/usuarioService');

const tokensRevocados = new Set(); // tokens de sesiones cerradas

async function autenticar(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Token requerido' });
  if (tokensRevocados.has(token)) return res.status(401).json({ error: 'Sesión cerrada' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // Se recarga el usuario para usar atributos actualizados (ej. si lo desactivaron)
  const usuario = await usuarioService.buscarPorId(payload.id);
  if (!usuario) return res.status(401).json({ error: 'Usuario no existe' });

  delete usuario.password_hash;
  req.usuario = usuario;
  req.token = token;
  next();
}

module.exports = { autenticar, tokensRevocados };