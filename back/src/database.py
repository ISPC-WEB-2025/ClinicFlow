# database.py

import mysql.connector
from mysql.connector import Error
import hashlib

# --- Configuración de la Base de Datos ---
DB_CONFIG = {
    "host": "localhost",
    "database": "proyecto_usuarios_db",
    "user": "root",
    "password": "root",
}

# --- Funciones de Conexión e Inicialización ---


def get_db_connection():
    """Establece y retorna una conexión a la base de datos MySQL."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        if conn.is_connected():
            return conn
    except Error as e:
        print(f"Error al conectar a MySQL: {e}")
        return None


def initialize_db():
    """
    Inicializa la base de datos MySQL creando las tablas 'usuarios' y 'perfiles' si no existen.
    También inserta un usuario administrador por defecto si la tabla 'usuarios' está vacía.
    """
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            print(
                "No se pudo establecer conexión con la base de datos para inicializarla."
            )
            return

        cursor = conn.cursor()

        # Script SQL para crear la tabla de usuarios
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS usuarios (
                id_usuario INT AUTO_INCREMENT PRIMARY KEY,
                nombre_usuario VARCHAR(255) NOT NULL UNIQUE,
                contrasena_hash VARCHAR(255) NOT NULL,
                rol VARCHAR(50) NOT NULL,
                CHECK (rol IN ('administrador', 'estandar'))
            );
        """
        )

        # Script SQL para crear la tabla de perfiles
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS perfiles (
                id_perfil INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario INT NOT NULL UNIQUE,          -- Clave foránea a usuarios.id_usuario
                nombre_completo VARCHAR(255) NULL,
                apellido VARCHAR(255) NULL,
                email VARCHAR(255) UNIQUE NULL,
                fecha_nacimiento DATE NULL,
                direccion VARCHAR(255) NULL,
                telefono VARCHAR(50) NULL,
                
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
                    ON DELETE CASCADE -- Si se elimina un usuario, su perfil también se elimina
            );
        """
        )

        # Verificar si ya existe un administrador para no duplicarlo
        cursor.execute("SELECT COUNT(*) FROM usuarios WHERE rol = 'administrador'")
        if cursor.fetchone()[0] == 0:
            default_admin_pass_hash = hashlib.sha256("admin123".encode()).hexdigest()
            # Primero insertamos en usuarios
            cursor.execute(
                """
                INSERT INTO usuarios (nombre_usuario, contrasena_hash, rol)
                VALUES (%s, %s, %s)
            """,
                ("admin", default_admin_pass_hash, "administrador"),
            )

            # Obtener el ID del usuario recién insertado para el perfil
            admin_id = cursor.lastrowid

            # Luego insertamos en perfiles
            cursor.execute(
                """
                INSERT INTO perfiles (id_usuario, nombre_completo, apellido, email)
                VALUES (%s, %s, %s, %s)
            """,
                (admin_id, "Administrador Principal", "Sistema", "admin@ejemplo.com"),
            )

            print(
                "Administrador por defecto 'admin' creado con contraseña 'admin123' y perfil básico."
            )

        conn.commit()
        print(
            f"Base de datos MySQL '{DB_CONFIG['database']}' inicializada correctamente con tablas de usuarios y perfiles."
        )

    except Error as e:
        print(f"Error durante la inicialización de MySQL: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


# --- Funciones CRUD para la tabla 'usuarios' (estas casi no cambian, solo se agregan las de perfil) ---

# database.py


def crear_usuario(nombre, apellido, email, contrasena_hash, direccion, rol):
    """Inserta un nuevo usuario en la tabla 'usuario' con todos sus datos."""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return None
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO usuario (nombre, apellido, email, password, direccion, rol)
            VALUES (%s, %s, %s, %s, %s, %s)
        """,
            (nombre, apellido, email, contrasena_hash, direccion, rol),
        )

        conn.commit()
        return cursor.lastrowid  # Retorna el ID del nuevo usuario

    except Error as e:
        if e.errno == 1062:  # Duplicate entry (si el email ya existe)
            print("Error: Ya existe un usuario con este email.")
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
    """Busca un usuario por su nombre de usuario. Retorna una tupla (id, nombre, hash, rol) o None."""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return None
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id_usuario, nombre_usuario, contrasena_hash, rol FROM usuarios WHERE nombre_usuario = %s",
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


def obtener_usuario_por_id(id_usuario):
    """Busca un usuario por su ID. Retorna una tupla (id, nombre, hash, rol) o None."""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return None
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id_usuario, nombre_usuario, contrasena_hash, rol FROM usuarios WHERE id_usuario = %s",
            (id_usuario,),
        )
        return cursor.fetchone()
    except Error as e:
        print(f"Error al obtener usuario por ID: {e}")
        return None
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def obtener_todos_los_usuarios():
    """Retorna una lista de tuplas con todos los usuarios registrados (solo datos de autenticación)."""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return []
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id_usuario, nombre_usuario, contrasena_hash, rol FROM usuarios"
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

        # Construimos la consulta UPDATE dinámicamente para solo actualizar los campos que no son None
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

        if not updates:  # No hay nada que actualizar
            print("No se proporcionaron datos para actualizar el usuario.")
            return False

        # El nombre de la tabla ahora es 'usuario'
        query = f"UPDATE usuario SET {', '.join(updates)} WHERE idUsuario = %s"
        params.append(id_usuario)

        cursor.execute(query, tuple(params))
        conn.commit()
        return cursor.rowcount > 0
    except Error as e:
        print(f"Error al actualizar el usuario ID {id_usuario}: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def actualizar_rol_usuario(id_usuario, nuevo_rol):
    """Actualiza el rol de un usuario específico."""
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
            "UPDATE usuarios SET rol = %s WHERE id_usuario = %s",
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
    """
    Elimina un usuario de la base de datos por su ID.
    Debido a ON DELETE CASCADE, su perfil asociado también será eliminado.
    """
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return False
        cursor = conn.cursor()
        cursor.execute("DELETE FROM usuarios WHERE id_usuario = %s", (id_usuario,))
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
