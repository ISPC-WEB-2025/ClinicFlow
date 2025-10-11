USE proyecto_usuarios_db;

DROP TABLE IF EXISTS producto;

CREATE TABLE producto (
    idProducto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    idUsuario INT,
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario)
);
