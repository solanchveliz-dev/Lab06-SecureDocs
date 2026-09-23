const pool = require('../../config/db');
const politicas = require('./policies');

// Las políticas se pueden activar/desactivar desde la tabla "politicas"
async function politicasActivas() {
  const [rows] = await pool.query('SELECT codigo FROM politicas WHERE activa = TRUE');
  return new Set(rows.map(r => r.codigo));
}

// Usuario + Recurso + Acción + Entorno -> Políticas -> PERMITIR / DENEGAR
async function evaluar(ctx, activas = null) {
  const habilitadas = activas || await politicasActivas();
  const aplicadas = [];
  const motivos = [];

  for (const p of politicas) {
    if (!habilitadas.has(p.codigo)) continue;
    if (p.rolesExentos && p.rolesExentos.includes(ctx.usuario.rol)) continue;
    if (p.rolesAplicables && !p.rolesAplicables.includes(ctx.usuario.rol)) continue;
    if (!p.aplica(ctx)) continue;

    aplicadas.push(p.codigo);
    if (!p.evaluar(ctx)) motivos.push(`${p.codigo}: ${p.motivo(ctx)}`);
  }

  return { permitido: motivos.length === 0, aplicadas, motivos };
}

module.exports = { evaluar, politicasActivas };