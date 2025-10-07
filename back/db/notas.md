# Sprint 3

## 🛠️ Modelo Relacional Simplificado

El modelo se basa en tres tablas principales para gestionar la venta de suscripciones:

1. **`usuario`**: Ya existente, almacena la información del cliente (comprador).
2. **`Planes`**: El catálogo de productos (suscripciones).
3. **`Compras`**: Registra las ventas y la suscripción activa de cada cliente.

### Tablas y Relaciones

| Tabla | Propósito | Claves | Relaciones |
| :--- | :--- | :--- | :--- |
| **`usuario`** | Clientes que compran. | `idUsuario` (PK) | 1 $\rightarrow$ N en `Compras` |
| **`Planes`** | Los productos/servicios a la venta. | `plan_id` (PK) | 1 $\rightarrow$ N en `Compras` |
| **`Compras`** | Registro de cada transacción de suscripción. | `compra_id` (PK) | N $\rightarrow$ 1 en `usuario` y `Planes` |

-----

## 💾 Script de Base de Datos y Tablas (SQL)

Este script incluye la creación de la tabla `Planes` y `Compras`, y la inserción de datos de ejemplo para que puedas probar el **CRUD** y la consulta **JOIN**.

```sql
-- Asegurarse de estar usando la base de datos correcta (la que ya creaste)
-- USE proyecto_usuarios_db;

-- 1. Creación de la tabla Planes (El Producto/Servicio)
-- Esto reemplaza a 'Producto' tradicional con una suscripción.
DROP TABLE IF EXISTS Planes;
CREATE TABLE IF NOT EXISTS Planes (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    periodo_facturacion VARCHAR(50) DEFAULT 'Mensual', -- Ej: Mensual, Anual
    esta_activo BOOLEAN DEFAULT TRUE
);

-- 2. Creación de la tabla Compras (El registro de la venta)
DROP TABLE IF EXISTS Compras;
CREATE TABLE IF NOT EXISTS Compras (
    compra_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,              -- FK a la tabla 'usuario'
    plan_id INT NOT NULL,                 -- FK a la tabla 'Planes'
    fecha_compra DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    monto_total DECIMAL(10, 2) NOT NULL,
    estado_pago VARCHAR(50) NOT NULL,     -- Ej: Pagado, Pendiente
    fecha_vencimiento DATE,               -- Fecha de expiración del servicio
    
    -- Definición de Claves Foráneas
    FOREIGN KEY (usuario_id) REFERENCES usuario(idUsuario),
    FOREIGN KEY (plan_id) REFERENCES Planes(plan_id)
);

-- 3. Inserción de Datos de Prueba

-- Insertar planes de suscripción
INSERT INTO Planes (nombre, descripcion, precio) VALUES
('Básico', 'Funcionalidades esenciales.', 50.00),
('Estándar', 'Gestión completa y reportes.', 120.00),
('Premium', 'Funcionalidades avanzadas y soporte prioritario.', 250.00);


-- ⚠️ Asume que ya existe al menos 1 usuario en tu tabla 'usuario' (idUsuario=1)
-- Si necesitas un usuario admin por defecto:
/*
INSERT INTO usuario (nombre_usuario, email, password, rol) VALUES
('admin', 'admin@clinicflow.com', 'admin123', 'administrador');
*/

-- Insertar una compra de prueba (asumiendo idUsuario=1 compra el plan_id=2)
INSERT INTO Compras (usuario_id, plan_id, monto_total, estado_pago, fecha_vencimiento)
VALUES (
    1, -- Reemplazar por un idUsuario existente
    2, -- Plan Estándar
    120.00,
    'Pagado',
    DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
);
```

-----

## 🔍 Consulta con JOIN (Requisito)

Este es el tipo de consulta que puedes usar en el *backend* (Python) para obtener un listado de ventas detallado, uniendo la información del cliente (`usuario`) y el producto (`Planes`) a través de la tabla `Compras`.

```sql
-- Consulta: Mostrar qué usuario compró qué plan
SELECT
    C.compra_id,
    U.nombre AS Nombre_Cliente,
    U.email AS Email_Cliente,
    P.nombre AS Nombre_Plan_Adquirido,
    C.monto_total,
    DATE(C.fecha_compra) AS Fecha_Compra
FROM Compras C
JOIN usuario U ON C.usuario_id = U.idUsuario
JOIN Planes P ON C.plan_id = P.plan_id
ORDER BY C.fecha_compra DESC;
```
