const rbac = require('./rbac/rbacService');
const abac = require('./abac/abacEngine');
const { construirEntorno } = require('./entorno');
const audit = require('../services/auditService');

function autorizar(accion, cargarRecurso = null) {
  return async (req, res, next) => {
    const usuario = req.usuario;
    const entorno = construirEntorno(req);
    const recursoNombre = req.baseUrl.slice(1) + (req.params.id ? `-${req.params.id}` : '');

    const registrar = (resultado, motivo) => audit.registrar({
      usuario: usuario.correo, recurso: recursoNombre, accion, resultado, motivo, ip: entorno.direccion_ip
    });

    // Etapa 1: RBAC
    const r = await rbac.tienePermiso(usuario.rol_id, accion);
    if (!r.permitido) {
      const motivo = `RBAC: el rol ${usuario.rol} no tiene el permiso ${r.permiso}`;
      await registrar('DENEGADO', motivo);
      return res.status(403).json({ resultado: 'DENEGADO', etapa: 'RBAC', motivo });
    }

    // Cargar el recurso (documento)
    let recurso = null;
    if (cargarRecurso) {
      recurso = await cargarRecurso(req);
      if (!recurso) {
        await registrar('DENEGADO', 'Recurso no encontrado');
        return res.status(404).json({ error: 'Recurso no encontrado' });
      }
    }

    // Etapa 2: ABAC
    const a = await abac.evaluar({ usuario, recurso, accion, entorno });
    if (!a.permitido) {
      await registrar('DENEGADO', 'ABAC: ' + a.motivos.join(' | '));
      return res.status(403).json({ resultado: 'DENEGADO', etapa: 'ABAC', motivos: a.motivos });
    }

    await registrar('PERMITIDO', `RBAC ok (${r.permiso}); ABAC ok (${a.aplicadas.join(', ')})`);
    req.recurso = recurso;
    req.entorno = entorno;
    next();
  };
}

module.exports = { autorizar };