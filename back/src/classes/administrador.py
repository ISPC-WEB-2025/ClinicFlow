from database import obtener_perfil_por_usuario_id, obtener_todos_los_usuarios
# Importaciones adelantadas para evitar dependencias circulares
from .usuario import Usuario

class Administrador(Usuario):
    """Representa un usuario con rol de administrador."""
    # AÑADE datos_perfil=None aquí
    def __init__(self, id_usuario, nombre_usuario, contrasena_hash, rol, datos_perfil=None):
        # Y pásalo a super().__init__()
        super().__init__(id_usuario, nombre_usuario, contrasena_hash, rol, datos_perfil)
        if self.rol != 'administrador':
            raise ValueError("El rol debe ser 'administrador' para esta clase.")

    # Resto de métodos de Administrador ...
    # Asegúrate de que visualizar_todos_los_usuarios() también use obtener_perfil_por_usuario_id para mostrar la información completa
    def visualizar_todos_los_usuarios(self):
        """Visualiza el listado completo de usuarios registrados, con algunos datos de perfil."""
        usuarios_data = obtener_todos_los_usuarios() # Obtiene datos de la tabla usuarios
        
        if usuarios_data:
            print("\n--- Listado de Usuarios ---")
            for user_tuple in usuarios_data:
                id_u, nombre_u, _, rol_u = user_tuple # Desempaquetar la tupla (el hash no lo necesitamos mostrar)
                # Intentamos obtener el perfil para cada usuario
                perfil_data = obtener_perfil_por_usuario_id(id_u)
                
                nombre_completo = perfil_data[2] if perfil_data and len(perfil_data) > 2 and perfil_data[2] else "N/A"
                email = perfil_data[4] if perfil_data and len(perfil_data) > 4 and perfil_data[4] else "N/A"
                
                print(f"ID: {id_u}, Nombre: {nombre_u}, Rol: {rol_u}, Nombre Completo: {nombre_completo}, Email: {email}")
            print("--------------------------")
        else:
            print("No hay usuarios registrados en el sistema.")