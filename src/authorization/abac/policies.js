const ACCIONES_DOCUMENTO = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE'];
const sobreDocumento = (ctx) => ctx.recurso && ACCIONES_DOCUMENTO.includes(ctx.accion);
const altaConfidencialidad = (ctx) => sobreDocumento(ctx) && ctx.recurso.nivel_confidencialidad >= 4;

module.exports = [
  {
    codigo: 'P7_ESTADO',
    aplica: () => true,
    evaluar: ({ usuario }) => usuario.estado === 'ACTIVO',
    motivo: ({ usuario }) => `Usuario ${usuario.estado}`
  },
  {
    codigo: 'P1_DEPARTAMENTO',
    rolesExentos: ['ADMINISTRADOR', 'AUDITOR', 'INVITADO'],
    aplica: sobreDocumento,
    evaluar: ({ usuario, recurso }) => usuario.departamento === recurso.departamento,
    motivo: ({ usuario, recurso }) => `Departamento distinto (${usuario.departamento} != ${recurso.departamento})`
  },
  {
    codigo: 'P2_NIVEL',
    aplica: sobreDocumento,
    evaluar: ({ usuario, recurso }) => usuario.nivel_seguridad >= recurso.nivel_confidencialidad,
    motivo: ({ usuario, recurso }) => `Nivel de seguridad insuficiente (${usuario.nivel_seguridad} < ${recurso.nivel_confidencialidad})`
  },
  {
    codigo: 'P3_PROPIEDAD',
    rolesExentos: ['GERENTE', 'ADMINISTRADOR'],
    aplica: (ctx) => ctx.accion === 'UPDATE' && !!ctx.recurso,
    evaluar: ({ usuario, recurso }) => usuario.id === recurso.propietario,
    motivo: () => 'Solo puede modificar documentos que creó'
  },
  {
    codigo: 'P4_HORARIO',
    aplica: altaConfidencialidad,
    evaluar: ({ entorno }) => entorno.hora >= '08:00' && entorno.hora <= '18:00',
    motivo: ({ entorno }) => `Fuera del horario autorizado 08:00-18:00 (hora: ${entorno.hora})`
  },
  {
    codigo: 'P5_PAIS',
    aplica: sobreDocumento,
    evaluar: ({ usuario, recurso, entorno }) =>
      usuario.pais === recurso.pais && entorno.ubicacion === recurso.pais,
    motivo: ({ recurso, entorno }) => `Documento de ${recurso.pais} accedido desde ${entorno.ubicacion}`
  },
  {
    codigo: 'P6_DISPOSITIVO',
    aplica: altaConfidencialidad,
    evaluar: ({ entorno }) => entorno.dispositivo === 'CORPORATIVO',
    motivo: ({ entorno }) => `Dispositivo no autorizado (${entorno.dispositivo})`
  },
  {
    codigo: 'P8_INVITADO',
    rolesAplicables: ['INVITADO'],
    aplica: sobreDocumento,
    evaluar: ({ usuario, recurso }) =>
      usuario.tipo_contrato === 'EXTERNO' &&
      recurso.nivel_confidencialidad <= 1 &&
      recurso.estado === 'PUBLICADO',
    motivo: () => 'Invitado solo accede a documentos PUBLICADOS de nivel 1 (contrato EXTERNO)'
  }
];