# clases/usuario.py

import hashlib
from database import crear_usuario, obtener_usuario_por_nombre, \
                     crear_perfil, obtener_perfil_por_usuario_id, eliminar_usuario # eliminar_usuario para rollback

# NO IMPORTAR UsuarioEstandar ni Administrador aquí (líneas eliminadas)
    
class Usuario:
    """Clase base para representar un usuario en el sistema."""
    def __init__(self, id_usuario, nombre_usuario, contrasena_hash, rol, datos_perfil=None):
        self.id_usuario = id_usuario
        self.nombre_usuario = nombre_usuario
        self.contrasena_hash = contrasena_hash
        self.rol = rol
        self.datos_perfil = datos_perfil

    def obtener_datos_personales(self):
        # ... (este método no cambia, solo la lógica de obtener el dict de perfil)
        datos = {
            "ID": self.id_usuario,
            "Nombre de Usuario": self.nombre_usuario,
            "Rol": self.rol
        }
        if self.datos_perfil:
            # Los datos de perfil vienen como una tupla (id_perfil, id_usuario, nombre_completo, apellido, email, ...)
            # Convertimos a un diccionario para mejor legibilidad
            datos_perfil_dict = {
                "ID Perfil": self.datos_perfil[0],
                "ID Usuario Asociado": self.datos_perfil[1], # Añadido para claridad
                "Nombre Completo": self.datos_perfil[2],
                "Apellido": self.datos_perfil[3],
                "Email": self.datos_perfil[4],
                "Fecha Nacimiento": self.datos_perfil[5],
                "Dirección": self.datos_perfil[6],
                "Teléfono": self.datos_perfil[7]
            }
            # Filtramos los None para no mostrar campos vacíos
            datos_perfil_dict = {k: v for k, v in datos_perfil_dict.items() if v is not None}
            datos["Perfil"] = datos_perfil_dict
        return datos
    
    def __str__(self):
        return f"Usuario(ID: {self.id_usuario}, Nombre: {self.nombre_usuario}, Rol: {self.rol})"

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
    def registrar_nuevo_usuario(nombre_usuario, contrasena, rol, datos_perfil_iniciales=None):
        """
        Registra un nuevo usuario y su perfil asociado.
        datos_perfil_iniciales es un diccionario opcional con:
        {'nombre_completo': '...', 'apellido': '...', 'email': '...', etc.}
        """
        # IMPORTACIONES LOCALES DENTRO DE LA FUNCIÓN
        from .usuario_estandar import UsuarioEstandar
        from .administrador import Administrador
        
        if rol not in ['administrador', 'estandar']:
            print("Error: Rol inválido. Debe ser 'administrador' o 'estandar'.")
            return None

        es_valida, mensaje = Usuario._validar_contrasena(contrasena)
        if not es_valida:
            print(f"Error de validación de contraseña: {mensaje}")
            return None
        
        contrasena_hasheada = hashlib.sha256(contrasena.encode()).hexdigest()
        
        id_nuevo_usuario = crear_usuario(nombre_usuario, contrasena_hasheada, rol)
        if id_nuevo_usuario:
            nc = datos_perfil_iniciales.get('nombre_completo') if datos_perfil_iniciales else None
            ap = datos_perfil_iniciales.get('apellido') if datos_perfil_iniciales else None
            em = datos_perfil_iniciales.get('email') if datos_perfil_iniciales else None
            fn = datos_perfil_iniciales.get('fecha_nacimiento') if datos_perfil_iniciales else None
            dir = datos_perfil_iniciales.get('direccion') if datos_perfil_iniciales else None
            tel = datos_perfil_iniciales.get('telefono') if datos_perfil_iniciales else None

            if crear_perfil(id_nuevo_usuario, nc, ap, em, fn, dir, tel):
                usuario_data = obtener_usuario_por_nombre(nombre_usuario)
                perfil_data = obtener_perfil_por_usuario_id(id_nuevo_usuario)
                if usuario_data:
                    id_u, nombre_u, hash_u, rol_u = usuario_data
                    if rol_u == 'administrador':
                        return Administrador(id_u, nombre_u, hash_u, rol_u, perfil_data)
                    else:
                        return UsuarioEstandar(id_u, nombre_u, hash_u, rol_u, perfil_data)
            else:
                # Si falla la creación del perfil, eliminamos el usuario que acabamos de crear
                eliminar_usuario(id_nuevo_usuario) 
                print("Fallo la creación del perfil. Usuario no registrado.")
        return None

    @staticmethod
    def iniciar_sesion(nombre_usuario, contrasena):
        """
        Intenta iniciar sesión. Retorna la instancia del usuario logueado
        (Administrador o UsuarioEstandar) con sus datos de perfil, o None si las credenciales son incorrectas.
        """
        # IMPORTACIONES LOCALES DENTRO DE LA FUNCIÓN
        from .usuario_estandar import UsuarioEstandar
        from .administrador import Administrador

        usuario_data = obtener_usuario_por_nombre(nombre_usuario)
        if usuario_data:
            id_u, nombre_u, hash_u, rol_u = usuario_data
            if hashlib.sha256(contrasena.encode()).hexdigest() == hash_u:
                print("Inicio de sesión exitoso.")
                perfil_data = obtener_perfil_por_usuario_id(id_u)
                
                if rol_u == 'administrador':
                    return Administrador(id_u, nombre_u, hash_u, rol_u, perfil_data)
                else:
                    return UsuarioEstandar(id_u, nombre_u, hash_u, rol_u, perfil_data)
            else:
                print("Contraseña incorrecta.")
        else:
            print("Usuario no encontrado.")
        return None

    def actualizar_perfil(self, nombre_completo=None, apellido=None, email=None, fecha_nacimiento=None, direccion=None, telefono=None):
        """
        Permite al usuario actualizar sus propios datos de perfil.
        Retorna True si la actualización fue exitosa, False en caso contrario.
        """
        from database import actualizar_perfil as db_actualizar_perfil # Alias para evitar conflicto de nombres

        if db_actualizar_perfil(self.id_usuario, nombre_completo, apellido, email, fecha_nacimiento, direccion, telefono):
            # Si la actualización en la DB fue exitosa, actualizamos también el objeto en memoria
            self.datos_perfil = obtener_perfil_por_usuario_id(self.id_usuario)
            print("Perfil actualizado exitosamente.")
            return True
        else:
            print("Fallo al actualizar el perfil.")
            return False

# Las clases UsuarioEstandar y Administrador no necesitan cambios en sus importaciones
# ya que ahora Usuario.py no las importa globalmente, y ellas solo importan a Usuario.