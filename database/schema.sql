DROP DATABASE IF EXISTS securedocs;
CREATE DATABASE securedocs;
USE securedocs;

CREATE TABLE departamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE,
  descripcion VARCHAR(150)
);

CREATE TABLE permisos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(40) NOT NULL UNIQUE,
  descripcion VARCHAR(150)
);

CREATE TABLE rol_permiso (
  rol_id INT NOT NULL,
  permiso_id INT NOT NULL,
  PRIMARY KEY (rol_id, permiso_id),
  FOREIGN KEY (rol_id) REFERENCES roles(id),
  FOREIGN KEY (permiso_id) REFERENCES permisos(id)
);

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol_id INT NOT NULL,
  departamento_id INT NOT NULL,
  nivel_seguridad TINYINT NOT NULL DEFAULT 1,
  pais VARCHAR(30) NOT NULL DEFAULT 'PERU',
  tipo_contrato ENUM('INTERNO','EXTERNO') NOT NULL DEFAULT 'INTERNO',
  estado ENUM('ACTIVO','INACTIVO','SUSPENDIDO') NOT NULL DEFAULT 'ACTIVO',
  FOREIGN KEY (rol_id) REFERENCES roles(id),
  FOREIGN KEY (departamento_id) REFERENCES departamentos(id)
);

CREATE TABLE documentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT,
  propietario INT NOT NULL,
  departamento_id INT NOT NULL,
  nivel_confidencialidad TINYINT NOT NULL DEFAULT 1,
  estado ENUM('BORRADOR','PENDIENTE','APROBADO','PUBLICADO') NOT NULL DEFAULT 'PENDIENTE',
  pais VARCHAR(30) NOT NULL DEFAULT 'PERU',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (propietario) REFERENCES usuarios(id),
  FOREIGN KEY (departamento_id) REFERENCES departamentos(id)
);

CREATE TABLE politicas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(60) NOT NULL,
  descripcion VARCHAR(255),
  activa BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE auditoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(100),
  recurso VARCHAR(100),
  accion VARCHAR(40),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  resultado ENUM('PERMITIDO','DENEGADO') NOT NULL,
  motivo VARCHAR(255),
  direccion_ip VARCHAR(45)
);

-- DATOS BASE
INSERT INTO departamentos (nombre) VALUES
('FINANZAS'), ('RRHH'), ('TI'), ('LEGAL'), ('GENERAL');

INSERT INTO roles (nombre, descripcion) VALUES
('ADMINISTRADOR', 'Administra usuarios, roles y configuraciones'),
('GERENTE', 'Supervisa documentos de su área'),
('SUPERVISOR', 'Revisa y aprueba documentos'),
('EMPLEADO', 'Crea y consulta documentos de su área'),
('AUDITOR', 'Consulta documentos y registros de auditoría'),
('INVITADO', 'Acceso temporal a determinados documentos');

INSERT INTO permisos (codigo, descripcion) VALUES
('CREAR_DOCUMENTO', 'Crear documento'),
('CONSULTAR_DOCUMENTO', 'Consultar documento'),
('MODIFICAR_DOCUMENTO', 'Modificar documento'),
('ELIMINAR_DOCUMENTO', 'Eliminar documento'),
('APROBAR_DOCUMENTO', 'Aprobar documento'),
('VER_AUDITORIA', 'Ver auditoría'),
('GESTIONAR_USUARIOS', 'Gestionar usuarios'),
('ASIGNAR_ROLES', 'Asignar roles');

-- MATRIZ RBAC (igual a la tabla del profesor)
INSERT INTO rol_permiso (rol_id, permiso_id) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),
(2,1),(2,2),(2,3),(2,4),(2,5),(2,6),
(3,1),(3,2),(3,3),(3,5),
(4,1),(4,2),(4,3),
(5,2),(5,6),
(6,2);

INSERT INTO politicas (codigo, nombre, descripcion) VALUES
('P1_DEPARTAMENTO', 'Departamento', 'Solo documentos de su propio departamento'),
('P2_NIVEL', 'Nivel de seguridad', 'nivel_seguridad >= nivel_confidencialidad'),
('P3_PROPIEDAD', 'Propiedad', 'Solo modifica sus documentos (excepto GERENTE y ADMINISTRADOR)'),
('P4_HORARIO', 'Horario', 'Nivel >= 4 solo entre 08:00 y 18:00'),
('P5_PAIS', 'País', 'Documentos de Perú solo desde Perú'),
('P6_DISPOSITIVO', 'Dispositivo', 'Nivel >= 4 solo desde dispositivo CORPORATIVO'),
('P7_ESTADO', 'Estado del usuario', 'Solo usuarios ACTIVO'),
('P8_INVITADO', 'Invitados', 'EXTERNO, nivel <= 1 y documento PUBLICADO');