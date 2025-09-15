# classes/usuario.py

import hashlib
from database import (
    crear_usuario,
    obtener_usuario_por_nombre,
    obtener_todos_los_usuarios,
    actualizar_usuario,
    actualizar_rol_usuario,
)

# Importamos las clases secundarias al final para evitar errores de referencia circular
# Se puede usar import dentro de funciones para retrasar la importación


class Usuario:
    """Clase para representar un usuario con sus atributos y métodos."""

    def __init__(
        self,
        id_usuario,
        nombre_usuario,
        nombre=None,
        apellido=None,
        email=None,
        contrasena=None,
        direccion=None,
        rol=None,
    ):
        self.id_usuario = id_usuario
        self.nombre_usuario = nombre_usuario
        self.nombre = nombre
        self.apellido = apellido
        self.email = email
        self.contrasena = contrasena
        self.direccion = direccion
        self.rol = rol

    def __str__(self):
        return f"Usuario(ID: {self.id_usuario}, Nombre: {self.nombre_usuario}, Rol: {self.rol})"

    def obtener_datos_personales(self):
        """Retorna un diccionario con los datos del usuario."""
        return {
            "ID": self.id_usuario,
            "Nombre de Usuario": self.nombre_usuario,
            "Nombre": self.nombre,
            "Apellido": self.apellido,
            "Email": self.email,
            "Dirección": self.direccion,
            "Rol": self.rol,
        }

    def actualizar_datos(self, nombre=None, apellido=None, email=None, direccion=None):
        """Permite al usuario actualizar sus propios datos."""
        print(f"=== DEBUG actualizar_datos ===")
        print(
            f"Parámetros: nombre={nombre}, apellido={apellido}, email={email}, direccion={direccion}"
        )
        print(f"Llamando a db_actualizar_usuario...")
        if actualizar_usuario(self.id_usuario, nombre, apellido, email, direccion):
            self.nombre = nombre if nombre is not None else self.nombre
            self.apellido = apellido if apellido is not None else self.apellido
            self.email = email if email is not None else self.email
            self.direccion = direccion if direccion is not None else self.direccion
            print("Datos actualizados exitosamente.")
            return True
        else:
            print("Fallo al actualizar los datos.")
            return False

    @staticmethod
    def _validar_contrasena(contrasena):
        if len(contrasena) < 6:
            return False, "La contraseña debe tener al menos 6 caracteres."
        if not any(char.isalpha() for char in contrasena):
            return False, "La contraseña debe contener al menos una letra."
        if not any(char.isdigit() for char in contrasena):
            return False, "La contraseña debe contener al menos un número."
        return True, ""

    @staticmethod
    def registrar_nuevo_usuario(
        nombre_usuario,
        nombre=None,
        apellido=None,
        email=None,
        contrasena=None,
        direccion=None,
    ):
        """Registra un nuevo usuario con rol 'estandar'."""
        es_valida, mensaje = Usuario._validar_contrasena(contrasena)
        if not es_valida:
            print(f"Error de validación de contraseña: {mensaje}")
            return None

        contrasena_hasheada = hashlib.sha256(contrasena.encode()).hexdigest()
        rol_por_defecto = "estandar"

        id_nuevo_usuario = crear_usuario(
            nombre_usuario,
            nombre,
            apellido,
            email,
            contrasena_hasheada,
            direccion,
            rol_por_defecto,
        )
        if id_nuevo_usuario:
            print("Usuario registrado exitosamente.")
            return Usuario(
                id_nuevo_usuario,
                nombre_usuario,
                nombre,
                apellido,
                email,
                contrasena_hasheada,
                direccion,
                rol_por_defecto,
            )
        else:
            print("Fallo la creación del usuario.")
            return None

    @staticmethod
    def iniciar_sesion(nombre_usuario, contrasena):
        """Intenta iniciar sesión y retorna la instancia correcta de usuario."""
        usuario_data = obtener_usuario_por_nombre(nombre_usuario)
        if not usuario_data:
            print("Usuario no encontrado.")
            return None

        (
            id_u,
            nombre_usuario_u,
            nombre_u,
            apellido_u,
            email_u,
            hash_u,
            direccion_u,
            rol_u,
        ) = usuario_data

        if hashlib.sha256(contrasena.encode()).hexdigest() != hash_u:
            print("Contraseña incorrecta.")
            return None

        print("Inicio de sesión exitoso.")

        if rol_u == "administrador":
            from classes.usuario import Administrador

            return Administrador(
                id_u,
                nombre_usuario_u,
                nombre_u,
                apellido_u,
                email_u,
                hash_u,
                direccion_u,
                rol_u,
            )
        else:
            from classes.usuario import UsuarioEstandar

            return UsuarioEstandar(
                id_u,
                nombre_usuario_u,
                nombre_u,
                apellido_u,
                email_u,
                hash_u,
                direccion_u,
                rol_u,
            )


# --- Subclases ---


class Administrador(Usuario):
    """Clase para representar a un administrador."""

    def visualizar_todos_los_usuarios(self):
        usuarios = obtener_todos_los_usuarios()
        if not usuarios:
            print("No hay usuarios registrados.")
            return
        # "SELECT idUsuario, nombre_usuario, nombre, apellido, email, rol FROM usuario"
        print("\n--- Listado de Usuarios ---")
        for u in usuarios:
            id_u, nombre_usuario, nombre, apellido, email, rol = u
            print(
                f"ID: {id_u} | Usuario: {nombre_usuario} | "
                f"Nombre: {nombre or ''} {apellido or ''} | "
                f"Email: {email or ''} | Rol: {rol}"
            )
        print("---------------------------")

    def eliminar_usuario_por_id(self, id_usuario):
        """Elimina un usuario de la base de datos dado su ID."""
        from database import eliminar_usuario

        # Validar que el admin no se elimine a sí mismo
        if id_usuario == self.id_usuario:
            print("Error: No puedes eliminarte a ti mismo.")
            input("Ingrese enter para continuar: ")
            return

        if eliminar_usuario(id_usuario):
            print(f"Usuario con ID {id_usuario} eliminado correctamente.")
        else:
            print(f"No se encontró un usuario con ID {id_usuario}.")

    def cambiar_rol_usuario(self, id_usuario, nuevo_rol):
        """Cambia el rol de un usuario."""

        if id_usuario == self.id_usuario:
            print("Error: No puedes cambiar tu propio rol.")
            input("Ingrese enter para continuar: ")
            return

        if actualizar_rol_usuario(id_usuario, nuevo_rol):
            print(f"Rol actualizado correctamente.")
        else:
            print("No se pudo actualizar el rol.")


class UsuarioEstandar(Usuario):
    """Clase para representar a un usuario estándar."""

    pass
