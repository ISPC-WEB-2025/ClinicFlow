# ClinicFlow - Base de Datos

ClinicFlow es un sistema web diseñado para optimizar la gestión de ingresos y egresos de pacientes en instituciones de salud de mediana y pequeña escala. Esta documentación describe el modelo de datos y las relaciones entre las tablas de la base de datos.

---

## **Tablas y Descripción**

### 1. `Usuario`

Contiene todos los usuarios del sistema, independientemente de su rol. Los campos `matricula` y `especialidad` son opcionales y se usan solo si el usuario tiene rol médico.

**Columnas:**

- `id_usuario` (PK): Identificador único del usuario.
- `nombre`: Nombre del usuario.
- `apellido`: Apellido del usuario.
- `email`: Correo electrónico para login.
- `contrasena`: Contraseña del usuario.
- `fecha_creacion`: Fecha de creación del registro.
- `matricula` (opcional): Solo para usuarios con rol médico.
- `especialidad` (opcional): Solo para usuarios con rol médico.

**Relaciones:**

- Se relaciona con `Rol` mediante `Usuario_Rol`.
- Se relaciona con `Paciente` e `Internacion` para registrar quién realizó acciones.
- Se relaciona con `Internacion_Medico` si el usuario tiene rol médico.

---

### 2. `Rol`

Define los roles posibles en el sistema.

**Columnas:**

- `id_rol` (PK): Identificador único del rol.
- `nombre`: Nombre del rol (Ej: "Administrador", "Médico", "Enfermero", "Administrativo").
- `descripcion`: Breve descripción del rol.

**Relaciones:**.

- Se conecta con `Usuario` mediante `Usuario_Rol`.

---

### 3. `Usuario_Rol`

Tabla intermedia para asignar uno o varios roles a un usuario.

**Columnas:**

- `id_usuario` (FK → `Usuario.id_usuario`)
- `id_rol` (FK → `Rol.id_rol`)

**Clave primaria compuesta:** `(id_usuario, id_rol)`

**Relaciones:**

- Muchos a muchos entre `Usuario` y `Rol`.

---

### 4. `Paciente`

Almacena información de los pacientes.

**Columnas:**

- `id_paciente` (PK)
- `dni`, `nombre`, `apellido`, `sexo`, `fecha_nac`, `telefono`, `mail`, `direccion`, `obra_social`
- `id_usuario` (FK → `Usuario.id_usuario`): Usuario que registró al paciente.

**Relaciones:**

- Uno a muchos con `Internacion` (un paciente puede tener varias internaciones).

---

### 5. `Habitacion`

Almacena las habitaciones disponibles en la institución de salud.

**Columnas:**

- `id_habitacion` (PK)
- `numero`, `piso`, `capacidad`

**Relaciones:**

- Uno a muchos con `Internacion` (una habitación puede recibir varias internaciones a lo largo del tiempo).

---

### 6. `Internacion`

Registra los ingresos y egresos de pacientes.

**Columnas:**

- `id_internacion` (PK)
- `fecha_ingreso`, `fecha_egreso`, `numero_ingreso`
- `diagnostico`, `informe`
- `id_paciente` (FK → `Paciente.id_paciente`)
- `id_habitacion` (FK → `Habitacion.id_habitacion`)
- `id_usuario` (FK → `Usuario.id_usuario`): Usuario que registró la internación.

**Relaciones:**

- Uno a muchos con `Internacion_Medico`.
- Muchos a uno con `Paciente` y `Habitacion`.

---

### 7. `Internacion_Medico`

Relaciona usuarios con rol médico con internaciones (muchos a muchos).

**Columnas:**

- `id_internacion` (FK → `Internacion.id_internacion`)
- `id_usuario` (FK → `Usuario.id_usuario`): Usuario con rol médico.

**Clave primaria compuesta:** `(id_internacion, id_usuario)`

**Relaciones:**

- Muchos a muchos entre `Internacion` y usuarios con rol médico.

---

## **Resumen de relaciones**

- **Usuario – Rol:** Muchos a muchos mediante `Usuario_Rol`.
- **Usuario – Paciente / Internacion:** Uno a muchos.
- **Paciente – Internacion:** Uno a muchos.
- **Habitacion – Internacion:** Uno a muchos.
- **Usuario (médico) – Internacion:** Muchos a muchos mediante `Internacion_Medico`.
