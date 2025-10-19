# classes/usuario.py

import hashlib
from crud_usuarios import (
    crear_usuario,
    obtener_usuario_por_nombre,
    obtener_todos_los_usuarios,
    actualizar_usuario,
    actualizar_rol_usuario,
    existe_nombre_usuario,
)
from crud_suscripciones import (
    actualizar_suscripcion,
    obtener_plan_activo_por_usuario,
    crear_suscripcion,
    obtener_tabla_suscripciones,
)

from classes.plan import Plan

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

    @staticmethod  # estatic method porque no depende de la instancia
    def existe_nombre_usuario(nombre_usuario: str) -> bool:
        """
        Método de la clase que llama a la lógica de CRUD para verificar existencia.
        """
        # Llama a la función que REALMENTE hace la consulta a la DB
        return existe_nombre_usuario(nombre_usuario)

    @staticmethod  # estatic method porque no depende de la instancia
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
        es_valida, mensaje = Usuario._validar_contrasena(
            contrasena
        )  # es _ porque es privado
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

    def _gestionar_compra_plan(self, id_usuario, id_plan_nuevo):
        """Lógica compartida para comprar/cambiar plan."""
        plan_obj = Plan.obtener_plan_por_id(id_plan_nuevo)
        if not plan_obj:
            print(f"Error: El plan con ID {id_plan_nuevo} no existe.")
            return False

        actualizar_suscripcion(id_usuario, "Cancelado")

        if crear_suscripcion(id_usuario, id_plan_nuevo):
            print(f"¡Éxito! Plan '{plan_obj.nombre}' contratado.")
            return True
        else:
            print("Fallo al registrar la nueva suscripción.")
            return False

    def _gestionar_cancelar_plan(self, id_usuario):
        """Lógica compartida para cancelar plan."""
        plan_data = obtener_plan_activo_por_usuario(id_usuario)

        if not plan_data:
            print("Advertencia: No hay un plan activo para cancelar.")
            return True

        if actualizar_suscripcion(id_usuario, "Cancelado"):
            print(f"Plan '{plan_data['nombre_plan']}' cancelado.")
            return True
        else:
            print("Fallo al cancelar la suscripción.")
            return False


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
        from crud_usuarios import eliminar_usuario

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

    # FUNCIONES RELACIONADAS A  SUSCRIPCIONES

    def crear_suscripcion_usuario(self, id_usuario, id_plan):
        """Crea una suscripción para un usuario."""

        # Verificar si ya tiene un plan activo
        plan_activo = obtener_plan_activo_por_usuario(id_usuario)
        if plan_activo:
            print(
                f"Error: El usuario ya tiene un plan activo: {plan_activo['nombre_plan']}"
            )
            print("Primero debe cancelar o cambiar el plan actual.")
            return False

        if crear_suscripcion(id_usuario, id_plan):
            print("Suscripción creada exitosamente.")
            return True
        else:
            print("Error al crear suscripción.")
            return False

    def mostrar_tabla_suscripciones(self):  # consulta cruzada JOIN
        """Muestra todas las suscripciones del sistema (JOIN de 3 tablas)."""

        print("\n" + "=" * 80)
        print("TABLA DE SUSCRIPCIONES - VISTA ADMINISTRADOR")
        print("=" * 80)

        suscripciones = (
            obtener_tabla_suscripciones()
        )  # ir a crud_suscripciones.py (ver consulta JOIN)

        if not suscripciones:
            print("No hay suscripciones registradas en el sistema.")
            return

        # Encabezado
        print(f"{'ID':<6} {'Usuario':<18} {'Plan':<18} {'Inicio':<12} {'Estado':<12}")
        print("-" * 80)

        # Datos
        for sub in suscripciones:
            print(
                f"{sub['idUsuario']:<6} "
                f"{sub['nombre_usuario']:<18} "
                f"{sub['nombre_plan']:<18} "
                f"{str(sub['fecha_inicio']):<12} "
                f"{sub['estado']:<12}"
            )

        print("=" * 80)

    def cambiar_plan_usuario(self, id_usuario, id_plan_nuevo):
        return self._gestionar_compra_plan(id_usuario, id_plan_nuevo)

    def cancelar_plan_usuario(self, id_usuario):
        return self._gestionar_cancelar_plan(id_usuario)


class UsuarioEstandar(Usuario):
    """Clase para representar a un usuario estándar."""

    # metodos pan-suscripcion
    def obtener_plan_activo(self):
        """Retorna el nombre del plan activo del usuario."""
        plan_data = obtener_plan_activo_por_usuario(self.id_usuario)
        return plan_data["nombre_plan"] if plan_data else "Ninguno"

    def comprar_plan(self, id_plan_nuevo):
        return self._gestionar_compra_plan(self.id_usuario, id_plan_nuevo)

    def cancelar_plan(self):
        return self._gestionar_cancelar_plan(self.id_usuario)
