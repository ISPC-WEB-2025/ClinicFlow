from .usuario import Usuario

class UsuarioEstandar(Usuario):
    """Representa un usuario estándar del sistema."""
    # AÑADE datos_perfil=None aquí
    def __init__(self, id_usuario, nombre_usuario, contrasena_hash, rol, datos_perfil=None):
        # Y pásalo a super().__init__()
        super().__init__(id_usuario, nombre_usuario, contrasena_hash, rol, datos_perfil)
        if self.rol != 'estandar':
            raise ValueError("El rol debe ser 'estandar' para esta clase.")