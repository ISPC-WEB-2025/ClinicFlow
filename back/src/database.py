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
