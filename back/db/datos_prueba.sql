-- =================================================================
-- Script de Inserción de Datos de Prueba
-- Este script solo inserta los datos que faltan.
-- La contraseña de todos los usuarios de prueba es 'pass123',
-- hasheada con SHA2(..., 256).
-- =================================================================

-- -----------------------------------
-- 1. INSERCIÓN DE USUARIOS ESTÁNDAR (1 a 10)
-- -----------------------------------
INSERT IGNORE INTO usuario (nombre_usuario, nombre, apellido, email, password, direccion, rol) VALUES
('usuario1', 'Carlos', 'Pérez', 'carlos@mail.com', SHA2('pass123', 256), 'Calle Falsa 123', 'estandar'),
('usuario2', 'Laura', 'Gómez', 'laura@mail.com', SHA2('pass123', 256), 'Av. Siempre Viva 45', 'estandar'),
('usuario3', 'Miguel', 'Ruiz', 'miguel@mail.com', SHA2('pass123', 256), 'Bv. Libertad 99', 'estandar'),
('usuario4', 'Ana', 'Díaz', 'ana@mail.com', SHA2('pass123', 256), 'Ruta Sur km5', 'estandar'),
('usuario5', 'Javier', 'López', 'javier@mail.com', SHA2('pass123', 256), 'Plaza Central 1', 'estandar'),
('usuario6', 'Sofía', 'Castro', 'sofia@mail.com', SHA2('pass123', 256), 'Pasaje Secreto', 'estandar'),
('usuario7', 'Mariana', 'Torres', 'mariana@mail.com', SHA2('pass123', 256), 'Calle de la Luna', 'estandar'),
('usuario8', 'Pablo', 'Torres', 'pablo@mail.com', SHA2('pass123', 256), 'Calle Principal 22', 'estandar'),
('usuario9', 'Eliana', 'Vargas', 'eliana@mail.com', SHA2('pass123', 256), 'Av. Central 300', 'estandar'),
('usuario10', 'Marcos', 'Silva', 'marcos@mail.com', SHA2('pass123', 256), 'Alameda Norte', 'estandar');


-- -----------------------------------
-- 2. INSERCIÓN DE SUSCRIPCIONES
-- Solo se inserta la suscripción si no existe una para ese usuario Y plan.
-- -----------------------------------

-- u1: Básico (1), Activo
INSERT INTO Suscripciones (id_usuario, id_plan, fecha_inicio, estado)
SELECT u.idUsuario, 1, '2024-01-15', 'Activo'
FROM usuario u
LEFT JOIN Suscripciones s ON s.id_usuario = u.idUsuario AND s.id_plan = 1
WHERE u.nombre_usuario = 'usuario1' AND s.id_suscripcion IS NULL;

-- u2: Estándar (2), Activo
INSERT INTO Suscripciones (id_usuario, id_plan, fecha_inicio, estado)
SELECT u.idUsuario, 2, '2024-02-20', 'Activo'
FROM usuario u
LEFT JOIN Suscripciones s ON s.id_usuario = u.idUsuario AND s.id_plan = 2
WHERE u.nombre_usuario = 'usuario2' AND s.id_suscripcion IS NULL;

-- u3: Premium (3), Activo
INSERT INTO Suscripciones (id_usuario, id_plan, fecha_inicio, estado)
SELECT u.idUsuario, 3, '2024-03-01', 'Activo'
FROM usuario u
LEFT JOIN Suscripciones s ON s.id_usuario = u.idUsuario AND s.id_plan = 3
WHERE u.nombre_usuario = 'usuario3' AND s.id_suscripcion IS NULL;

-- u4: Básico (1), Activo
INSERT INTO Suscripciones (id_usuario, id_plan, fecha_inicio, estado)
SELECT u.idUsuario, 1, '2024-04-10', 'Activo'
FROM usuario u
LEFT JOIN Suscripciones s ON s.id_usuario = u.idUsuario AND s.id_plan = 1
WHERE u.nombre_usuario = 'usuario4' AND s.id_suscripcion IS NULL;

-- u5: Estándar (2), Cancelado
INSERT INTO Suscripciones (id_usuario, id_plan, fecha_inicio, estado)
SELECT u.idUsuario, 2, '2024-05-05', 'Cancelado'
FROM usuario u
LEFT JOIN Suscripciones s ON s.id_usuario = u.idUsuario AND s.id_plan = 2
WHERE u.nombre_usuario = 'usuario5' AND s.id_suscripcion IS NULL;

-- u6: Personalizado (4), Activo
INSERT INTO Suscripciones (id_usuario, id_plan, fecha_inicio, estado)
SELECT u.idUsuario, 4, '2024-06-12', 'Activo'
FROM usuario u
LEFT JOIN Suscripciones s ON s.id_usuario = u.idUsuario AND s.id_plan = 4
WHERE u.nombre_usuario = 'usuario6' AND s.id_suscripcion IS NULL;

-- u7: Premium (3), Activo
INSERT INTO Suscripciones (id_usuario, id_plan, fecha_inicio, estado)
SELECT u.idUsuario, 3, '2024-07-22', 'Activo'
FROM usuario u
LEFT JOIN Suscripciones s ON s.id_usuario = u.idUsuario AND s.id_plan = 3
WHERE u.nombre_usuario = 'usuario7' AND s.id_suscripcion IS NULL;

-- u8: Básico (1), Cancelado
INSERT INTO Suscripciones (id_usuario, id_plan, fecha_inicio, estado)
SELECT u.idUsuario, 1, '2024-08-30', 'Cancelado'
FROM usuario u
LEFT JOIN Suscripciones s ON s.id_usuario = u.idUsuario AND s.id_plan = 1
WHERE u.nombre_usuario = 'usuario8' AND s.id_suscripcion IS NULL;

-- u9: Estándar (2), Activo
INSERT INTO Suscripciones (id_usuario, id_plan, fecha_inicio, estado)
SELECT u.idUsuario, 2, '2024-09-14', 'Activo'
FROM usuario u
LEFT JOIN Suscripciones s ON s.id_usuario = u.idUsuario AND s.id_plan = 2
WHERE u.nombre_usuario = 'usuario9' AND s.id_suscripcion IS NULL;

-- u10: Personalizado (4), Activo
INSERT INTO Suscripciones (id_usuario, id_plan, fecha_inicio, estado)
SELECT u.idUsuario, 4, '2024-10-18', 'Activo'
FROM usuario u
LEFT JOIN Suscripciones s ON s.id_usuario = u.idUsuario AND s.id_plan = 4
WHERE u.nombre_usuario = 'usuario10' AND s.id_suscripcion IS NULL;