USE proyecto_usuarios_db;

CREATE TABLE IF NOT EXISTS Suscripciones (
                id_suscripcion INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario INT NOT NULL,
                id_plan INT NOT NULL,
                fecha_inicio DATE NOT NULL,
                estado VARCHAR(50) NOT NULL, -- Activo, Cancelado
                FOREIGN KEY (id_usuario) REFERENCES usuario(idUsuario),
                FOREIGN KEY (id_plan) REFERENCES Planes(id_plan)
            );
