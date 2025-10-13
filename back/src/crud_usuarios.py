# --- Funciones CRUD para la tabla 'usuario' ---
from mysql.connector import Error
from database import get_db_connection


def existe_nombre_usuario(nombre_usuario: str) -> bool:
    """
    Verifica en la base de datos si el nombre de usuario ya está en uso.
    Retorna True si existe, False si no existe.
    """
    conn = None
    existe = False

    try:
        conn = get_db_connection()
        if conn is None:
            # No se pudo conectar a la base de datos, ver si especificamos tipo de error
            return False

        cursor = conn.cursor()

        # Consulta SQL para buscar un usuario con ese nombre
        query = "SELECT COUNT(*) FROM usuario WHERE nombre_usuario = %s"
        cursor.execute(query, (nombre_usuario,))

        # Obtenemos el resultado (un número, 0 o 1+)
        count = cursor.fetchone()[0]

        if count > 0:
            existe = True

    except Error as e:
        print(f"Error al verificar la existencia del nombre de usuario: {e}")
        # En caso de error de DB, retornaremos False para no detener el flujo
        # si no es estrictamente necesario (la lógica de registro lo maneje).
        return False

    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

    return existe


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

        nombre = nombre if nombre else None
        apellido = apellido if apellido else None
        email = email if email else None  # resolver error insertar cadena ''
        direccion = direccion if direccion else None

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
    """Elimina un usuario de la base de datos por su ID.
    También elimina todas sus suscripciones asociadas."""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return False
        
        cursor = conn.cursor()
        
        # Primero verificar si el usuario existe
        cursor.execute("SELECT idUsuario FROM usuario WHERE idUsuario = %s", (id_usuario,))
        if not cursor.fetchone():
            print(f"No existe un usuario con ID {id_usuario}.")
            return False
        
        # Verificar si tiene suscripciones
        cursor.execute("SELECT COUNT(*) FROM Suscripciones WHERE id_usuario = %s", (id_usuario,))
        count = cursor.fetchone()[0]
        
        if count > 0:
            # Eliminar primero las suscripciones
            cursor.execute("DELETE FROM Suscripciones WHERE id_usuario = %s", (id_usuario,))
            print(f"Se eliminaron {count} suscripción(es) asociada(s) al usuario.")
        
        # Ahora eliminar el usuario
        cursor.execute("DELETE FROM usuario WHERE idUsuario = %s", (id_usuario,))
        conn.commit()
        
        if cursor.rowcount > 0:
            print(f"Usuario con ID {id_usuario} eliminado exitosamente.")
            return True
        return False
        
    except Error as e:
        print(f"Error al eliminar usuario: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def obtener_usuario_con_detalles(id_usuario):
    """Obtiene información completa del usuario incluyendo suscripciones."""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return None
        
        cursor = conn.cursor(dictionary=True)
        
        # Obtener datos del usuario
        cursor.execute("""
            SELECT idUsuario, nombre_usuario, nombre, apellido, email, rol
            FROM usuario
            WHERE idUsuario = %s
        """, (id_usuario,))
        usuario = cursor.fetchone()
        
        if not usuario:
            return None
        
        # Obtener suscripciones del usuario
        cursor.execute("""
            SELECT COUNT(*) as total_suscripciones,
                   SUM(CASE WHEN estado = 'Activo' THEN 1 ELSE 0 END) as activas
            FROM Suscripciones
            WHERE id_usuario = %s
        """, (id_usuario,))
        
        suscripciones = cursor.fetchone()
        usuario['suscripciones'] = suscripciones
        
        return usuario
        
    except Error as e:
        print(f"Error al obtener detalles del usuario: {e}")
        return None
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()