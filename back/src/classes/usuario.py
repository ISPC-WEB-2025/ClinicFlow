import hashlib
from database import (
    crear_usuario,
    obtener_usuario_por_nombre,
    # obtener_todos_los_usuarios,
    actualizar_usuario as db_actualizar_usuario,
    # actualizar_rol_usuario,
    # eliminar_usuario,
)


class Usuario:
    """Clase para representar un usuario con sus atributos y métodos."""

    def __init__(self, id_usuario, nombre, apellido, email, contrasena, direccion, rol):
        self.id_usuario = id_usuario
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
            "Nombre": self.nombre,
            "Apellido": self.apellido,
            "Email": self.email,
            "Dirección": self.direccion,
            "Rol": self.rol,
        }

    def actualizar_datos(self, nombre=None, apellido=None, email=None, direccion=None):
        """Permite al usuario actualizar sus propios datos."""
        if db_actualizar_usuario(self.idUsuario, nombre, apellido, email, direccion):
            # Actualiza el objeto en memoria si la actualización en la DB es exitosa
            self.nombre = nombre if nombre is not None else self.nombre
            self.apellido = apellido if apellido is not None else self.apellido
            self.email = email if email is not None else self.email
            self.direccion = direccion if direccion is not None else self.direccion
            print("Datos actualizados exitosamente.")
            return True
        else:
            print("Fallo al actualizar los datos.")
            return False

    # Se incluyen como métodos estáticos ya que no es necesario instanciar la clase
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
    def registrar_nuevo_usuario(nombre, apellido, email, contrasena, direccion):
        """
        Registra un nuevo usuario con rol 'estandar' en la base de datos.
        No se le pasa el rol por seguridad.
        """
        es_valida, mensaje = Usuario._validar_contrasena(contrasena)
        if not es_valida:
            print(f"Error de validación de contraseña: {mensaje}")
            return None

        contrasena_hasheada = hashlib.sha256(contrasena.encode()).hexdigest()

        # El rol por defecto es 'estandar'
        rol_por_defecto = "estandar"

        id_nuevo_usuario = crear_usuario(
            nombre, apellido, email, contrasena_hasheada, direccion, rol_por_defecto
        )
        if id_nuevo_usuario:
            print("Usuario registrado exitosamente.")
            return Usuario(
                id_nuevo_usuario,
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
    def iniciar_sesion(email, contrasena):
        """
        Intenta iniciar sesión. Retorna la instancia del usuario logueado
        (Administrador o UsuarioEstandar), o None si las credenciales son
        incorrectas.
        """
        usuario_data = obtener_usuario_por_nombre(email)
        if usuario_data:
            id_u, nombre_u, apellido_u, email_u, hash_u, direccion_u, rol_u = (
                usuario_data  # desempaquetado de tupla
            )
            if hashlib.sha256(contrasena.encode()).hexdigest() == hash_u:
                print("Inicio de sesión exitoso.")
                return Usuario(
                    id_u, nombre_u, apellido_u, email_u, hash_u, direccion_u, rol_u
                )
            else:
                print("Contraseña incorrecta.")
        else:
            print("Usuario no encontrado.")
        return None
