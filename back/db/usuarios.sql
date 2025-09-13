-- Eliminar tablas si ya existen (orden importante: la que tiene FK primero)
DROP TABLE IF EXISTS perfiles;
DROP TABLE IF EXISTS usuarios;

-- Crear la tabla 'usuarios' (para autenticación y autorización)
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(255) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol ENUM('administrador', 'estandar') NOT NULL DEFAULT 'estandar'
);

-- Crear la tabla 'perfiles' (para datos personales/de perfil)
CREATE TABLE perfiles (
    id_perfil INT AUTO_INCREMENT PRIMARY KEY, -- Opcional, (podríamos usar id_usuario como PK)
    id_usuario INT NOT NULL UNIQUE,           -- Clave foránea a usuarios.id_usuario
    nombre_completo VARCHAR(255) NULL,
    apellido VARCHAR(255) NULL,
    email VARCHAR(255) UNIQUE NULL,           -- El email puede ser opcional o not null, y único
    fecha_nacimiento DATE NULL,
    direccion VARCHAR(255) NULL,
    telefono VARCHAR(50) NULL,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE -- Si se elimina un usuario, su perfil también se elimina
);
