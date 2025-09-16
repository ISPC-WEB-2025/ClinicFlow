# --- Funciones CRUD para la tabla 'usuario' ---
from mysql.connector import Error
from database import get_db_connection


def crear_usuario(
    nombre_usuario, nombre, apellido, email, contrasena_hash, direccion, rol
):
    """Inserta un nuevo usuario en la tabla 'usuario' con todos sus datos."""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return None
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO usuario (nombre_usuario, nombre, apellido, email, password, direccion, rol)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (nombre_usuario, nombre, apellido, email, contrasena_hash, direccion, rol),
        )

        conn.commit()
        return cursor.lastrowid

    except Error as e:
        if e.errno == 1062:
            print("Error: Ya existe un usuario con este email o nombre de usuario.")
        else:
            print(f"Error al crear el usuario: {e}")
        if conn:
            conn.rollback()
        return None
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def obtener_usuario_por_nombre(nombre_usuario):
    """Busca un usuario por su nombre de usuario y retorna todos sus datos."""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return None
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT idUsuario, nombre_usuario, nombre, apellido, email, password, direccion, rol
            FROM usuario
            WHERE nombre_usuario = %s
            """,
            (nombre_usuario,),
        )
        return cursor.fetchone()
    except Error as e:
        print(f"Error al obtener usuario: {e}")
        return None
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


# def obtener_usuario_por_id(id_usuario):
#     """Busca un usuario por su ID"""
#     conn = None
#     try:
#         conn = get_db_connection()
#         if conn is None:
#             return None
#         cursor = conn.cursor()
#         cursor.execute(
#             "SELECT idUsuario, nombre_usuario, password, rol FROM usuario WHERE idUsuario = %s",
#             (id_usuario,),
#         )
#         return cursor.fetchone()
#     except Error as e:
#         print(f"Error al obtener usuario por ID: {e}")
#         return None
#     finally:
#         if conn and conn.is_connected():
#             cursor.close()
#             conn.close()


def obtener_todos_los_usuarios():
    """Retorna una lista de tuplas con todos los usuarios registrados"""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return []
        cursor = conn.cursor()
        cursor.execute(
            "SELECT idUsuario, nombre_usuario, nombre, apellido, email, rol FROM usuario"
        )
        return cursor.fetchall()
    except Error as e:
        print(f"Error al obtener todos los usuarios: {e}")
        return []
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def actualizar_usuario(
    id_usuario, nombre=None, apellido=None, email=None, direccion=None
):
    """Actualiza los datos de un usuario en la tabla 'usuario'."""

    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return False
        cursor = conn.cursor()

        updates = []
        params = []

        if nombre is not None:
            updates.append("nombre = %s")
            params.append(nombre)
        if apellido is not None:
            updates.append("apellido = %s")
            params.append(apellido)
        if email is not None:
            updates.append("email = %s")
            params.append(email)
        if direccion is not None:
            updates.append("direccion = %s")
            params.append(direccion)

        if not updates:
            print("No se proporcionaron datos para actualizar el usuario.")
            return False

        query = f"UPDATE usuario SET {', '.join(updates)} WHERE idUsuario = %s"
        params.append(id_usuario)

        cursor.execute(query, tuple(params))
        conn.commit()
        return cursor.rowcount > 0
    except Error as e:
        if e.errno == 1062:
            print("Error: El nombre de usuario o email ya está en uso.")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def actualizar_rol_usuario(id_usuario, nuevo_rol):
    """Actualiza el rol de un usuario específico."""
    # Validar que el admin no se elimine a sí mismo

    if nuevo_rol not in ["administrador", "estandar"]:
        print("Rol no válido. Debe ser 'administrador' o 'estandar'.")
        return False

    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return False
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE usuario SET rol = %s WHERE idUsuario = %s",
            (nuevo_rol, id_usuario),
        )
        conn.commit()
        return cursor.rowcount > 0
    except Error as e:
        print(f"Error al actualizar rol del usuario: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def eliminar_usuario(id_usuario):
    """Elimina un usuario de la base de datos por su ID"""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return False
        cursor = conn.cursor()
        cursor.execute("DELETE FROM usuario WHERE idUsuario = %s", (id_usuario,))
        conn.commit()
        return cursor.rowcount > 0
    except Error as e:
        print(f"Error al eliminar usuario: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
