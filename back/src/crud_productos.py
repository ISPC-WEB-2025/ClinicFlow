from mysql.connector import Error
from database import get_db_connection


def crear_producto(nombre, descripcion, precio, stock, id_usuario):
    """Crea un nuevo producto."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO producto (nombre, descripcion, precio, stock, idUsuario)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (nombre, descripcion, precio, stock, id_usuario),
        )
        conn.commit()
        return cursor.lastrowid
    except Error as e:
        print(f"Error al crear producto: {e}")
        if conn:
            conn.rollback()
        return None
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def obtener_todos_los_productos():
    """Devuelve todos los productos con el nombre del usuario creador (JOIN)."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT p.idProducto, p.nombre, p.descripcion, p.precio, p.stock,
                   u.nombre_usuario AS creador
            FROM producto p
            LEFT JOIN usuario u ON p.idUsuario = u.idUsuario
        """
        )
        return cursor.fetchall()
    except Error as e:
        print(f"Error al obtener productos: {e}")
        return []
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def actualizar_producto(
    id_producto, nombre=None, descripcion=None, precio=None, stock=None
):
    """Actualiza un producto."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        updates, params = [], []

        if nombre is not None:
            updates.append("nombre = %s")
            params.append(nombre)
        if descripcion is not None:
            updates.append("descripcion = %s")
            params.append(descripcion)
        if precio is not None:
            updates.append("precio = %s")
            params.append(precio)
        if stock is not None:
            updates.append("stock = %s")
            params.append(stock)

        if not updates:
            return False

        query = f"UPDATE producto SET {', '.join(updates)} WHERE idProducto = %s"
        params.append(id_producto)

        cursor.execute(query, tuple(params))
        conn.commit()
        return cursor.rowcount > 0
    except Error as e:
        print(f"Error al actualizar producto: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def eliminar_producto(id_producto):
    """Elimina un producto por ID."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM producto WHERE idProducto = %s", (id_producto,))
        conn.commit()
        return cursor.rowcount > 0
    except Error as e:
        print(f"Error al eliminar producto: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
