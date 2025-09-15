# database.py

import mysql.connector
from mysql.connector import Error
import hashlib
import configparser
import os


# --- Configuración de la Base de Datos ---
def load_db_config():
    """Carga la configuración desde config.ini o usa valores por defecto"""
    config_file = "config.ini"

    # Si no existe el archivo, lo crea con valores por defecto
    if not os.path.exists(config_file):
        print("Archivo config.ini no encontrado. Creando uno nuevo...")
        create_default_config(config_file)

    # Leer configuración
    config = configparser.ConfigParser()
    config.read(config_file)

    return {
        "host": config.get("DATABASE", "host"),
        "database": config.get("DATABASE", "database"),
        "user": config.get("DATABASE", "user"),
        "password": config.get("DATABASE", "password"),
    }


def create_default_config(config_file):
    """Pide al usuario los datos de configuración y crea el archivo config.ini"""
    print("\n=== CONFIGURACIÓN INICIAL DE BASE DE DATOS ===")
    print(
        "El archivo config.ini no existe. Vamos a configurar la conexión a la base de datos."
    )
    print("Presiona Enter para usar los valores por defecto entre paréntesis.")

    # Pedir datos al usuario
    host = input("Host del servidor MySQL (localhost): ").strip() or "localhost"
    database = (
        input("Nombre de la base de datos (proyecto_usuarios_db): ").strip()
        or "proyecto_usuarios_db"
    )
    user = input("Usuario de MySQL (root): ").strip() or "root"
    password = input("Contraseña de MySQL (root): ").strip() or "root"

    # Crear el archivo de configuración
    config = configparser.ConfigParser()
    config["DATABASE"] = {
        "host": host,
        "database": database,
        "user": user,
        "password": password,
    }

    try:
        with open(config_file, "w") as f:
            config.write(f)
        print(f"\nArchivo {config_file} creado exitosamente.")

        # Opcionalmente, probar la conexión
        print("Probando conexión a la base de datos...")
        test_connection = mysql.connector.connect(
            host=host, database=database, user=user, password=password
        )
        test_connection.close()
        print("Conexión exitosa!")

    except mysql.connector.Error as e:
        print(f"Advertencia: No se pudo conectar con estos datos: {e}")
        print("El archivo se guardó de todas formas. Puedes editarlo después.")
    except Exception as e:
        print(f"Error al crear el archivo: {e}")

    print(
        "Puedes modificar esta configuración editando el archivo config.ini en cualquier momento."
    )
    print("=" * 50)


DB_CONFIG = load_db_config()


def create_database_if_not_exists():
    """Crea la base de datos si no existe"""
    conn = None
    try:
        # Conectar SIN especificar database
        conn = mysql.connector.connect(
            host=DB_CONFIG["host"],
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"],
        )

        cursor = conn.cursor()

        # Crear la base de datos si no existe
        database_name = DB_CONFIG["database"]
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{database_name}`")
        print(f"Base de datos '{database_name}' verificada/creada correctamente.")

        conn.commit()
        return True

    except Error as e:
        print(f"Error al crear/verificar la base de datos: {e}")
        return False
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


# --- Funciones de Conexión e Inicialización ---


def get_db_connection():
    """Establece y retorna una conexión a la base de datos MySQL."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        if conn.is_connected():
            return conn
    except Error as e:
        if e.errno == 1049:  # Error: Unknown database
            print(
                f"La base de datos '{DB_CONFIG['database']}' no existe. Intentando crearla..."
            )
            if create_database_if_not_exists():
                # Intentar conectar nuevamente
                try:
                    conn = mysql.connector.connect(**DB_CONFIG)
                    if conn.is_connected():
                        return conn
                except Error as e2:
                    print(f"Error al conectar después de crear la base de datos: {e2}")
                    return None
            else:
                print("No se pudo crear la base de datos.")
                return None
        else:
            print(f"Error al conectar a MySQL: {e}")
            return None


def initialize_db():
    """
    Inicializa la base de datos MySQL creando la tabla 'usuario' si no existe.
    También inserta un usuario administrador por defecto si la tabla está vacía.
    """
    if not create_database_if_not_exists():
        print("No se pudo crear/verificar la base de datos.")
        return

    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            print(
                "No se pudo establecer conexión con la base de datos para inicializarla."
            )
            return

        cursor = conn.cursor()

        # Script SQL para crear la tabla 'usuario'
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS usuario (
                idUsuario INT AUTO_INCREMENT PRIMARY KEY,
                nombre_usuario VARCHAR(255) NOT NULL UNIQUE,
                nombre VARCHAR(255) NULL,
                apellido VARCHAR(255) NULL,
                email VARCHAR(255) UNIQUE NULL,
                password VARCHAR(255) NOT NULL,
                direccion VARCHAR(255) NULL,
                rol VARCHAR(50) NOT NULL,
                CHECK (rol IN ('administrador', 'estandar'))
            );
            """
        )

        # Verificar si ya existe un administrador
        cursor.execute("SELECT COUNT(*) FROM usuario WHERE rol = 'administrador'")
        if cursor.fetchone()[0] == 0:
            default_admin_pass_hash = hashlib.sha256("admin123".encode()).hexdigest()
            cursor.execute(
                """
                INSERT INTO usuario (nombre_usuario, nombre, apellido, email, password, direccion, rol)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    "admin",
                    "Administrador",
                    "Principal",
                    "admin@ejemplo.com",
                    default_admin_pass_hash,
                    "Sistema",
                    "administrador",
                ),
            )
            print("Administrador por defecto 'admin' creado con contraseña 'admin123'.")

        conn.commit()
        print(
            f"Base de datos MySQL '{DB_CONFIG['database']}' inicializada correctamente."
        )

    except Error as e:
        print(f"Error durante la inicialización de MySQL: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


# --- Funciones CRUD para la tabla 'usuario' ---


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
