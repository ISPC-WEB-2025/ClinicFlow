DROP TABLE IF EXISTS usuarios;

-- Crear la tabla 'usuarios' (para autenticación y autorización)
CREATE TABLE IF NOT EXISTS usuario (
                idUsuario INT AUTO_INCREMENT PRIMARY KEY,
                nombre_usuario VARCHAR(255) NOT NULL UNIQUE,
                nombre VARCHAR(255) NULL,
                apellido VARCHAR(255) NULL,
                email VARCHAR(255) UNIQUE NULL,
                password VARCHAR(255) NOT NULL,
                direccion VARCHAR(255) NULL,
                rol VARCHAR(50) NOT NULL,
                CHECK (rol IN ('administrador', 'estandar'))
            );