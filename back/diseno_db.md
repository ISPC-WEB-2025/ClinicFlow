# Diseño de Base de Datos para el Sistema de Gestión de Usuarios

## 1. Entidades Principales del Sistema

El sistema actual se centra en la gestión de usuarios, por lo que la entidad principal identificada es:

* **Usuario**

## 2. Definición de Atributos por Entidad

### Entidad: `usuarios`

Representa a las personas que interactuarán con el sistema, ya sea como usuarios estándar o administradores.

| Atributo          | Tipo de Dato MySQL | Descripción                                         | Restricciones / Notas                                  |
| :---------------- | :----------------- | :-------------------------------------------------- | :----------------------------------------------------- |
| `id_usuario`      | `INT`              | Identificador único del usuario.                    | Clave Primaria (PK), AUTO_INCREMENT                 |
| `nombre_usuario`  | `VARCHAR(255)`     | Nombre de usuario para iniciar sesión.              | NOT NULL, UNIQUE (no puede haber nombres duplicados)   |
| `contrasena_hash` | `VARCHAR(255)`     | Hash SHA256 de la contraseña del usuario.           | NOT NULL (la contraseña siempre debe estar hasheada)   |
| `rol`             | `VARCHAR(50)`      | Rol del usuario en el sistema.                      | NOT NULL, `CHECK('administrador', 'estandar')`       |

## 3. Relaciones entre Entidades

Actualmente, solo existe una entidad principal (`usuarios`). Por lo tanto, no hay relaciones complejas entre múltiples tablas que necesiten ser definidas (como uno a muchos o muchos a muchos). La gestión de roles se maneja directamente como un atributo dentro de la misma tabla de `usuarios`.

## 4. Proceso de Normalización (Tercera Forma Normal - 3FN)

La tabla `usuarios` ha sido diseñada para cumplir con la Tercera Forma Normal (3FN):

* **Primera Forma Normal (1FN):**
  * Todos los atributos son atómicos (indivisibles). Por ejemplo, el nombre de usuario es un solo campo.
  * No hay grupos repetitivos.
  * Cada fila es única (gracias a `id_usuario` como PK).
* **Segunda Forma Normal (2FN):**
  * Está en 1FN.
  * Todos los atributos no clave (`nombre_usuario`, `contrasena_hash`, `rol`) dependen completamente de la clave primaria (`id_usuario`). No hay dependencias parciales.
* **Tercera Forma Normal (3FN):**
  * Está en 2FN.
  * No existen dependencias transitivas. Es decir, ningún atributo no clave depende de otro atributo no clave. El `rol` depende directamente del `id_usuario` y no de `nombre_usuario` o `contrasena_hash`.

## 5. Modelo Relacional Resultante

El modelo relacional consiste en una única tabla:

```sql
usuarios (
id_usuario INT PRIMARY KEY AUTO_INCREMENT,
nombre_usuario VARCHAR(255) UNIQUE NOT NULL,
contrasena_hash VARCHAR(255) NOT NULL,
rol VARCHAR(50) NOT NULL CHECK (rol IN ('administrador', 'estandar'))
)
```

* **Clave Primaria (PK):** `id_usuario`
* **Claves Foráneas (FK):** No aplica en este modelo de una sola tabla.

## 6. Documentación Adicional y Aclaraciones

* **Roles de Usuario:** Se ha optado por almacenar el rol (`'administrador'` o `'estandar'`) directamente como un atributo en la tabla `usuarios`. Esta decisión se basa en la simplicidad de los requisitos actuales (solo dos roles fijos).
  * **Suposición:** Se asume que un usuario solo puede tener un rol a la vez y que los roles posibles son fijos y conocidos de antemano. Para un sistema más complejo con múltiples roles por usuario o roles dinámicos, se consideraría una tabla `roles` y una tabla `usuario_roles` para una relación muchos a muchos. Para este proyecto, el enfoque actual es suficiente y cumple 3FN.
* **Contraseñas:** Las contraseñas no se almacenan en texto plano. Se guardan como un hash SHA256 (`contrasena_hash`) para garantizar la seguridad.
* **Unicidad del Nombre de Usuario:** El atributo `nombre_usuario` tiene una restricción `UNIQUE` para asegurar que no puedan existir dos usuarios con el mismo nombre.

## 7. Consultas SQL Necesarias (CRUD del Usuario)

Aquí se definen las consultas SQL básicas para las operaciones CRUD (Create, Read, Update, Delete) sobre la tabla `usuarios`.

### A. CREATE (Crear Nuevo Usuario)

```sql
INSERT INTO usuarios (nombre_usuario, contrasena_hash, rol)
VALUES ('nuevo_usuario', 'hash_contrasena_aqui', 'estandar');
```

En Python:

```py
database.crear_usuario()
```

### B. READ (Leer Usuarios)

  1. Leer Usuario por NOMBRE

      ```sql
      SELECT id_usuario, nombre_usuario, contrasena_hash, rol
      FROM usuarios
      WHERE nombre_usuario = 'nombre_a_buscar';
      ```

      En Python:

      ```py
      Llamado por database.obtener_usuario_por_nombre()
      ```

  2. Leer Usuario por ID

      ```sql
      SELECT id_usuario, nombre_usuario, contrasena_hash, rol
      FROM usuarios
      WHERE id_usuario = 1;
      ```

      En Python:

      ```python
      database.obtener_usuario_por_id()
      ```

  3. Leer Todos los Usuarios

      ```sql
      SELECT id_usuario, nombre_usuario, contrasena_hash, rol
      FROM usuarios;
      ```

      En Python:

      ```python
      database.obtener_todos_los_usuarios()
      ```

### C. UPDATE (Actualizar Rol de Usuario)

```sql
UPDATE usuarios
SET rol = 'administrador'
WHERE id_usuario = 1;
```

En Python:

```python
database.actualizar_rol_usuario()
```

### D. DELETE (Eliminar Usuario)

```sql
DELETE FROM usuarios
WHERE id_usuario = 1;
```

En Python:

```python
database.eliminar_usuario()
```
