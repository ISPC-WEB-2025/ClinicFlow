# ClinicFlow - Base de Datos

ClinicFlow es un sistema web diseñado para optimizar la gestión de ingresos y egresos de pacientes en instituciones de salud de mediana y pequeña escala. Esta documentación describe el modelo de datos y las relaciones entre las tablas de la base de datos.

---

## **Tablas y Descripción**

### 1. `Usuario`
Contiene todos los usuarios del sistema, independientemente de su rol.

**Columnas:**
- `id_usuario` (PK): Identificador único del usuario.
- `nombre`: Nombre del usuario.
- `apellido`: Apellido del usuario.
- `email`: Correo electrónico para login.
- `contrasena`: Contraseña del usuario.
- `fecha_creacion`: Fecha de creación del registro.

**Relaciones:**
- Se relaciona con `Rol` mediante `Usuario_Rol`.
- Se relaciona con `Paciente`, `Medico` e `Internacion` para registrar quién realizó acciones.

---

### 2. `Rol`
Define los roles posibles en el sistema.

**Columnas:**
- `id_rol` (PK): Identificador único del rol.
- `nombre`: Nombre del rol (Ej: "Administrador", "Médico", "Enfermero", "Administrativo").
- `descripcion`: Breve descripción del rol.

**Relaciones:**
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

### 6. `Medico`
Información específica de los médicos del sistema.

**Columnas:**
- `id_medico` (PK)
- `id_usuario` (FK → `Usuario.id_usuario`)
- `matricula`
- `especialidad`

**Relaciones:**
- Muchos a muchos con `Internacion` mediante `Internacion_Medico`.

---

### 7. `Internacion`
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

### 8. `Internacion_Medico`
Relaciona médicos con internaciones (muchos a muchos).

**Columnas:**
- `id_internacion` (FK → `Internacion.id_internacion`)
- `id_medico` (FK → `Medico.id_medico`)

**Clave primaria compuesta:** `(id_internacion, id_medico)`

**Relaciones:**
- Muchos a muchos entre `Internacion` y `Medico`.

---

## **Resumen de relaciones**

- **Usuario – Rol:** Muchos a muchos mediante `Usuario_Rol`.
- **Usuario – Paciente / Internacion / Medico:** Uno a muchos.
- **Paciente – Internacion:** Uno a muchos.
- **Habitacion – Internacion:** Uno a muchos.
- **Medico – Internacion:** Muchos a muchos mediante `Internacion_Medico`.

---

## **Notas**

- Este diseño permite escalar fácilmente: se pueden agregar nuevos roles sin modificar las tablas principales.
- Se centraliza la información de usuarios, evitando duplicar datos de nombres y apellidos en varias tablas.
- Facilita la trazabilidad: se sabe quién registró cada paciente, internación o información médica.
