# SecureDocs: control de acceso con RBAC y ABAC

Aplicación web para gestionar documentos y expedientes de **TechCorp S.A.** aplicando dos modelos de autorización:

- **RBAC** (Role-Based Access Control): ¿qué puede hacer el usuario según su rol?
- **ABAC** (Attribute-Based Access Control): ¿puede hacerlo en estas condiciones (departamento, nivel, hora, país, dispositivo)?

El acceso solo se permite cuando **RBAC = PERMITIDO** y **ABAC = PERMITIDO**. Cada intento queda registrado en auditoría.

Laboratorio 06, curso Seguridad en la nube (Cloud Security), Tecsup.

## Video de demostración

https://youtu.be/xzcJ8J-vhYg

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | HTML + Bootstrap 5 |
| Backend | Node.js + Express 5 |
| Base de datos | MySQL (MAMP o XAMPP) |
| Autenticación | JWT (jsonwebtoken) + bcrypt (bcryptjs) |


La autorización está separada en componentes independientes, sin condicionales dispersos por rol:

```
src/
├── app.js                     -> Servidor Express y rutas
├── config/db.js               -> Conexión a MySQL
├── auth/                      -> Authentication
│   ├── authController.js      -> login, logout, usuario actual
│   └── authMiddleware.js      -> Validación del token JWT
├── authorization/             -> Authorization
│   ├── authorize.js           -> Middleware en dos etapas: RBAC y luego ABAC
│   ├── entorno.js             -> Atributos del entorno (hora, IP, ubicación, dispositivo)
│   ├── rbac/rbacService.js    -> RBAC Service (lee la matriz rol_permiso)
│   └── abac/
│       ├── policies.js        -> Las 8 políticas centralizadas
│       └── abacEngine.js      -> ABAC Policy Engine
├── services/                  -> Document, User y Audit Service
├── controllers/               -> Lógica de cada endpoint
└── routes/                    -> Definición de endpoints
database/
├── schema.sql                 -> Tablas, roles, permisos y políticas
└── seed.js                    -> Usuarios y documentos de prueba
public/index.html              -> Interfaz web
```

## Instalación

### Requisitos

- Node.js 18 o superior
- MySQL con MAMP (Mac) o XAMPP (Windows)
- Git

### Pasos

1. Clonar el repositorio e instalar dependencias:

   ```
   git clone https://github.com/solanchveliz-dev/Lab06-SecureDocs.git
   cd Lab06-SecureDocs
   npm install
   ```

2. Iniciar MySQL en MAMP o XAMPP.

3. Crear la base de datos: abrir phpMyAdmin, pestaña **SQL**, pegar el contenido de `database/schema.sql` y ejecutar.

4. Crear el archivo `.env` a partir de `.env.example` y completar los datos:

   ```
   PORT=3000
   DB_HOST=127.0.0.1
   DB_PORT=8889
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=securedocs
   JWT_SECRET=una_clave_secreta
   JWT_EXPIRES=2h
   PERMITIR_SIMULACION=true
   ```

   | Servidor | DB_PORT | DB_PASSWORD |
   |---|---|---|
   | MAMP (Mac) | 8889 | root |
   | XAMPP (Windows) | 3306 | (vacío) |

5. Cargar los datos de prueba:

   ```
   npm run seed
   ```

6. Iniciar el servidor:

   ```
   npm run dev
   ```

7. Abrir http://localhost:3000

Para reiniciar los datos en cualquier momento, volver a ejecutar `npm run seed`.

## Usuarios de prueba

Contraseña de todos: `123456`

| Correo | Rol | Departamento | Nivel | Observación |
|---|---|---|---|---|
| admin@techcorp.com | ADMINISTRADOR | TI | 5 | |
| gabriela@techcorp.com | GERENTE | FINANZAS | 5 | |
| carlos@techcorp.com | SUPERVISOR | FINANZAS | 3 | |
| ana@techcorp.com | EMPLEADO | FINANZAS | 2 | |
| lucia@techcorp.com | EMPLEADO | RRHH | 2 | |
| pedro@techcorp.com | AUDITOR | GENERAL | 5 | |
| invitado@techcorp.com | INVITADO | GENERAL | 1 | Contrato EXTERNO |
| jorge@techcorp.com | EMPLEADO | FINANZAS | 2 | Usuario INACTIVO |

## Matriz RBAC

| Operación | Admin | Gerente | Supervisor | Empleado | Auditor | Invitado |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Crear documento | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Consultar documento | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Modificar documento | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Eliminar documento | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Aprobar documento | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Ver auditoría | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| Gestionar usuarios | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Asignar roles | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

Se almacena en las tablas `roles`, `permisos` y `rol_permiso`.

## Matriz de políticas ABAC

| Código | Política | Condición | Se aplica a | Roles exentos |
|---|---|---|---|---|
| P1 | Departamento | usuario.departamento == documento.departamento | Acciones sobre documentos | Administrador, Auditor, Invitado |
| P2 | Nivel de seguridad | usuario.nivel_seguridad >= documento.nivel_confidencialidad | Acciones sobre documentos | Ninguno |
| P3 | Propiedad | usuario.id == documento.propietario | Modificar | Gerente, Administrador |
| P4 | Horario | Hora entre 08:00 y 18:00 | Documentos nivel 4 o 5 | Ninguno |
| P5 | País | usuario.pais == documento.pais y ubicación == documento.pais | Acciones sobre documentos | Ninguno |
| P6 | Dispositivo | dispositivo == CORPORATIVO | Documentos nivel 4 o 5 | Ninguno |
| P7 | Estado del usuario | usuario.estado == ACTIVO | Todas, incluido el inicio de sesión | Ninguno |
| P8 | Invitados | Contrato EXTERNO, nivel <= 1 y documento PUBLICADO | Solo rol Invitado | No aplica |

Las políticas están centralizadas en `src/authorization/abac/policies.js` y se pueden activar o desactivar desde la tabla `politicas` sin modificar el código.

### Atributos del entorno

Se envían en cada petición mediante headers:

| Header | Ejemplo | Uso |
|---|---|---|
| `X-Ubicacion` | PERU | Política P5 |
| `X-Dispositivo` | CORPORATIVO | Política P6 |
| `X-Hora` | 20:00 | Política P4 (solo si `PERMITIR_SIMULACION=true`, para pruebas) |

Si no se envía `X-Hora`, se usa la hora real de Lima. La dirección IP se toma de la petición. En un entorno productivo la ubicación se obtendría por geolocalización de IP y el dispositivo desde un sistema de gestión de equipos, no desde el cliente.


1. **Autenticación:** se valida el token JWT.
2. **RBAC:** se verifica que el rol tenga el permiso de la operación. Si no lo tiene, se deniega y ABAC no se evalúa.
3. **ABAC:** se evalúan las políticas que aplican según usuario, recurso, acción y entorno.
4. **Auditoría:** se registra el resultado y el motivo.

## API

| Método | Endpoint | Permiso RBAC |
|---|---|---|
| POST | /auth/login | Público |
| POST | /auth/logout | Usuario autenticado |
| GET | /auth/me | Usuario autenticado |
| GET | /usuarios | GESTIONAR_USUARIOS |
| POST | /usuarios | GESTIONAR_USUARIOS |
| PUT | /usuarios/{id} | GESTIONAR_USUARIOS |
| PUT | /usuarios/{id}/rol | ASIGNAR_ROLES |
| GET | /documentos | CONSULTAR_DOCUMENTO |
| GET | /documentos/{id} | CONSULTAR_DOCUMENTO |
| POST | /documentos | CREAR_DOCUMENTO |
| PUT | /documentos/{id} | MODIFICAR_DOCUMENTO |
| DELETE | /documentos/{id} | ELIMINAR_DOCUMENTO |
| POST | /documentos/{id}/aprobar | APROBAR_DOCUMENTO |
| GET | /auditoria | VER_AUDITORIA |

Todos los endpoints protegidos pasan por autenticación y por el middleware de autorización RBAC + ABAC.

## Casos de prueba

Se pueden ejecutar desde la pestaña **Casos de prueba** de la interfaz. Los casos 13 al 17 son los adicionales del grupo.

| # | Escenario | Usuario | Resultado esperado | Motivo |
|---|---|---|---|---|
| 1 | Empleado consulta documento de su área | Ana | Permitido | Cumple RBAC y ABAC |
| 2 | Empleado consulta documento de otra área | Ana | Denegado por ABAC | P1 |
| 3 | Supervisor aprueba documento de su área | Carlos | Permitido | Cumple RBAC y ABAC |
| 4 | Empleado intenta aprobar documento | Ana | Denegado por RBAC | Sin APROBAR_DOCUMENTO |
| 5 | Usuario nivel 2 consulta documento nivel 4 | Ana | Denegado por ABAC | P2 |
| 6 | Gerente elimina documento | Gabriela | Permitido | Cumple RBAC y ABAC |
| 7 | Auditor intenta modificar documento | Pedro | Denegado por RBAC | Sin MODIFICAR_DOCUMENTO |
| 8 | Usuario inactivo intenta acceder | Jorge | Denegado | P7 |
| 9 | Documento confidencial fuera de horario (20:00) | Gabriela | Denegado por ABAC | P4 |
| 10 | Documento nivel 5 desde dispositivo personal | Gabriela | Denegado por ABAC | P6 |
| 11 | Invitado accede a documento público | Invitado | Permitido | Cumple P8 |
| 12 | Invitado accede a documento confidencial | Invitado | Denegado por ABAC | P2 y P8 |
| 13 | Supervisor modifica documento que no creó | Carlos | Denegado por ABAC | P3 |
| 14 | Gerente modifica documento ajeno | Gabriela | Permitido | Exento de P3 |
| 15 | Documento de Perú consultado desde Chile | Carlos | Denegado por ABAC | P5 |
| 16 | Supervisor intenta eliminar documento | Carlos | Denegado por RBAC | Sin ELIMINAR_DOCUMENTO |
| 17 | Empleado crea documento de nivel mayor al suyo | Ana | Denegado por ABAC | P2 |

## Registro de auditoría

Cada intento de acceso genera un registro en la tabla `auditoria`:

```json
{
  "usuario": "ana@techcorp.com",
  "recurso": "documentos-4",
  "accion": "READ",
  "fecha": "2026-09-24T10:00:00",
  "resultado": "DENEGADO",
  "motivo": "ABAC: P2_NIVEL: Nivel de seguridad insuficiente (2 < 4)"
}
```

Se puede consultar en la pestaña **Auditoría** (Administrador, Gerente o Auditor) o con `GET /auditoria`.

## Autora

Solanch Veliz, Tecsup.
