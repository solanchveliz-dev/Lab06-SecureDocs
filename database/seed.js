const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

// Departamentos: 1 FINANZAS, 2 RRHH, 3 TI, 4 LEGAL, 5 GENERAL
// Roles: 1 ADMIN, 2 GERENTE, 3 SUPERVISOR, 4 EMPLEADO, 5 AUDITOR, 6 INVITADO
const usuarios = [
  [1, 'Admin General',    'admin@techcorp.com',    1, 3, 5, 'PERU', 'INTERNO', 'ACTIVO'],
  [2, 'Gabriela Ramos',   'gabriela@techcorp.com', 2, 1, 5, 'PERU', 'INTERNO', 'ACTIVO'],
  [3, 'Carlos Ruiz',      'carlos@techcorp.com',   3, 1, 3, 'PERU', 'INTERNO', 'ACTIVO'],
  [4, 'Ana Torres',       'ana@techcorp.com',      4, 1, 2, 'PERU', 'INTERNO', 'ACTIVO'],
  [5, 'Lucia Mendoza',    'lucia@techcorp.com',    4, 2, 2, 'PERU', 'INTERNO', 'ACTIVO'],
  [6, 'Pedro Salas',      'pedro@techcorp.com',    5, 5, 5, 'PERU', 'INTERNO', 'ACTIVO'],
  [7, 'Invitado Externo', 'invitado@techcorp.com', 6, 5, 1, 'PERU', 'EXTERNO', 'ACTIVO'],
  [8, 'Jorge Inactivo',   'jorge@techcorp.com',    4, 1, 2, 'PERU', 'INTERNO', 'INACTIVO']
];

// id, titulo, descripcion, propietario, departamento_id, nivel, estado, pais
const documentos = [
  [1, 'Presupuesto anual',        'Presupuesto del área',      3, 1, 3, 'PENDIENTE', 'PERU'],
  [2, 'Reporte de gastos Q3',     'Gastos del trimestre',      4, 1, 2, 'PENDIENTE', 'PERU'],
  [3, 'Planilla de sueldos',      'Sueldos del personal',      5, 2, 2, 'PENDIENTE', 'PERU'],
  [4, 'Plan de inversiones 2027', 'Inversiones estratégicas',  2, 1, 4, 'APROBADO',  'PERU'],
  [5, 'Estrategia de fusión',     'Documento muy reservado',   2, 1, 5, 'APROBADO',  'PERU'],
  [6, 'Manual de bienvenida',     'Guía para nuevos',          1, 5, 1, 'PUBLICADO', 'PERU'],
  [7, 'Contratos confidenciales', 'Contratos con proveedores', 1, 4, 3, 'PUBLICADO', 'PERU'],
  [8, 'Borrador a eliminar',      'Documento de prueba',       4, 1, 1, 'BORRADOR',  'PERU']
];

async function seed() {
  await pool.query('DELETE FROM auditoria');
  await pool.query('DELETE FROM documentos');
  await pool.query('DELETE FROM usuarios');

  const hash = await bcrypt.hash('123456', 10);

  for (const u of usuarios) {
    await pool.query(
      `INSERT INTO usuarios (id, nombre, correo, password_hash, rol_id, departamento_id,
        nivel_seguridad, pais, tipo_contrato, estado) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [u[0], u[1], u[2], hash, u[3], u[4], u[5], u[6], u[7], u[8]]
    );
  }

  for (const d of documentos) {
    await pool.query(
      `INSERT INTO documentos (id, titulo, descripcion, propietario, departamento_id,
        nivel_confidencialidad, estado, pais) VALUES (?,?,?,?,?,?,?,?)`,
      d
    );
  }

  console.log('Datos de prueba cargados. Contraseña de todos: 123456');
  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });