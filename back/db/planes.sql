USE proyecto_usuarios_db;

CREATE TABLE IF NOT EXISTS Planes (
                id_plan INT PRIMARY KEY,
                nombre_plan VARCHAR(100) NOT NULL UNIQUE,
                precio DECIMAL(10, 2) NOT NULL,
                descripcion VARCHAR(255)
            );