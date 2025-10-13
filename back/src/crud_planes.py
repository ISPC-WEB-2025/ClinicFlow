from mysql.connector import Error
from database import get_db_connection


def crear_plan(nombre_plan, precio, descripcion):
    """Crea un nuevo plan."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Obtener el próximo id_plan disponible
        cursor.execute("SELECT MAX(id_plan) FROM Planes")
        max_id = cursor.fetchone()[0]
        nuevo_id = (max_id + 1) if max_id else 1

        cursor.execute(
            """
            INSERT INTO Planes (id_plan, nombre_plan, precio, descripcion)
            VALUES (%s, %s, %s, %s)
            """,
            (nuevo_id, nombre_plan, precio, descripcion),
        )

        conn.commit()
        return cursor.lastrowid
    except Error as e:
        print(f"Error al crear plan: {e}")
        if conn:
            conn.rollback()
        return None
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def obtener_todos_los_planes():
    """Devuelve todos los planes disponibles."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id_plan, nombre_plan, precio, descripcion
            FROM Planes
            ORDER BY id_plan
        """
        )
        return cursor.fetchall()
    except Error as e:
        print(f"Error al obtener planes: {e}")
        return []
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def actualizar_plan(id_plan, nombre_plan=None, precio=None, descripcion=None):
    """Actualiza un plan."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        updates, params = [], []

        if nombre_plan is not None:
            updates.append("nombre_plan = %s")
            params.append(nombre_plan)
        if precio is not None:
            updates.append("precio = %s")
            params.append(precio)
        if descripcion is not None:
            updates.append("descripcion = %s")
            params.append(descripcion)

        if not updates:
            return False

        query = f"UPDATE Planes SET {', '.join(updates)} WHERE id_plan = %s"
        params.append(id_plan)

        cursor.execute(query, tuple(params))
        conn.commit()
        return cursor.rowcount > 0

    except Error as e:
        print(f"Error al actualizar plan: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def eliminar_plan(id_plan):
    """Elimina un plan por ID."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Planes WHERE id_plan = %s", (id_plan,))
        conn.commit()
        return cursor.rowcount > 0
    except Error as e:
        print(f"Error al eliminar plan: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def obtener_plan_por_id(id_plan):
    """Obtiene un plan específico por su ID."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id_plan, nombre_plan, precio, descripcion FROM Planes WHERE id_plan = %s",
            (id_plan,),
        )
        return cursor.fetchone()
    except Error as e:
        print(f"Error al obtener plan: {e}")
        return None
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
