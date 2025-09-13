# main.py

import sys
from database import initialize_db  # Importa la función para inicializar la DB

# Importamos las clases directamente desde el paquete 'clases'
from classes.usuario import Usuario

# Variable global para almacenar el usuario actualmente logueado
usuario_logueado = None


def mostrar_menu_principal():
    """Muestra el menú principal de la aplicación."""
    print("\n--- Menú Principal ---")
    print("1. Registrar nuevo usuario")
    print("2. Iniciar sesión")
    print("3. Salir")
    print("----------------------")
    return input("Seleccione una opción: ")


def mostrar_menu_admin():
    """Muestra el menú para usuarios administradores."""
    print("\n--- Menú de Administrador ---")
    print("1. Ver mis datos personales")
    print("2. Visualizar listado de usuarios")
    print("3. Cambiar rol de usuario")
    print("4. Eliminar usuario")
    print("5. Editar mi perfil")  # NUEVA OPCIÓN
    print("6. Cerrar sesión")
    print("-----------------------------")
    return input("Seleccione una opción: ")


def mostrar_menu_estandar():
    """Muestra el menú para usuarios estándar."""
    print("\n--- Menú de Usuario Estándar ---")
    print("1. Ver mis datos personales")
    print("2. Editar mi perfil")  # NUEVA OPCIÓN
    print("3. Cerrar sesión")
    print("--------------------------------")
    return input("Seleccione una opción: ")


def ejecutar_registro_usuario():
    """Solicita datos para registrar un nuevo usuario y su perfil."""
    print("\n--- Registro de Nuevo Usuario ---")
    nombre_usuario = input("Ingrese nombre de usuario: ")
    contrasena = input("Ingrese contraseña (mín. 6 caracteres, letras y números): ")
    rol = input("Ingrese rol (administrador/estandar): ").lower()

    # Opcional: Preguntar por datos de perfil en el registro
    print("\n--- Datos de Perfil (Opcional) ---")
    nombre_completo = input("Nombre completo (opcional): ")
    apellido = input("Apellido (opcional): ")
    email = input("Email (opcional): ")
    # Podrías pedir más campos si lo deseas

    nuevo_usuario_obj = Usuario.registrar_nuevo_usuario(
        nombre_usuario, contrasena, rol, datos_perfil_iniciales
    )
    if nuevo_usuario_obj:
        print(f"Usuario '{nuevo_usuario_obj.nombre_usuario}' registrado exitosamente.")
    else:
        print("Fallo el registro del usuario.")


def ejecutar_inicio_sesion():
    """Solicita credenciales e intenta iniciar sesión."""
    global usuario_logueado
    print("\n--- Inicio de Sesión ---")
    nombre = input("Ingrese nombre de usuario: ")
    contrasena = input("Ingrese contraseña: ")
    usuario_logueado = Usuario.iniciar_sesion(nombre, contrasena)


def ejecutar_edicion_perfil():
    """Permite al usuario logueado editar su perfil."""
    global usuario_logueado
    if usuario_logueado is None:
        print("Debe iniciar sesión para editar su perfil.")
        return

    print("\n--- Editar Mi Perfil ---")
    print("Deje en blanco los campos que no desee modificar.")
    nombre_completo = input(
        f"Nombre completo ({usuario_logueado.datos_perfil[2] if usuario_logueado.datos_perfil and usuario_logueado.datos_perfil[2] else 'actualmente vacío'}): "
    )
    apellido = input(
        f"Apellido ({usuario_logueado.datos_perfil[3] if usuario_logueado.datos_perfil and usuario_logueado.datos_perfil[3] else 'actualmente vacío'}): "
    )
    email = input(
        f"Email ({usuario_logueado.datos_perfil[4] if usuario_logueado.datos_perfil and usuario_logueado.datos_perfil[4] else 'actualmente vacío'}): "
    )
    # ... otros campos que quieras permitir editar

    # Solo pasamos los valores que el usuario realmente ingresó (no vacíos)
    actualizaciones = {
        "nombre_completo": nombre_completo if nombre_completo else None,
        "apellido": apellido if apellido else None,
        "email": email if email else None,
        # ... otros campos
    }

    # Filtrar valores None y pasarlos a la función
    datos_a_actualizar = {k: v for k, v in actualizaciones.items() if v is not None}

    if usuario_logueado.actualizar_perfil(**datos_a_actualizar):
        print("Perfil actualizado con éxito.")
    else:
        print("No se pudo actualizar el perfil.")


def ejecutar_accion_admin(opcion):
    """Ejecuta la acción de administrador según la opción seleccionada."""
    global usuario_logueado
    if not isinstance(usuario_logueado, Administrador):
        print("Error: Permisos insuficientes para esta acción.")
        return

    if opcion == "1":
        datos = usuario_logueado.obtener_datos_personales()
        print("\n--- Mis Datos ---")
        for key, value in datos.items():
            if isinstance(value, dict):  # Para mostrar el diccionario de perfil anidado
                print(f"{key}:")
                for sub_key, sub_value in value.items():
                    print(f"  - {sub_key}: {sub_value}")
            else:
                print(f"{key}: {value}")
        print("-----------------")
    elif opcion == "2":
        usuario_logueado.visualizar_todos_los_usuarios()
    elif opcion == "3":
        try:
            id_usuario = int(input("Ingrese el ID del usuario a modificar: "))
            nuevo_rol = input("Ingrese el nuevo rol (administrador/estandar): ").lower()
            usuario_logueado.modificar_rol_de_usuario(id_usuario, nuevo_rol)
        except ValueError:
            print("Entrada inválida. Por favor, ingrese un número para el ID.")
    elif opcion == "4":
        try:
            id_usuario = int(input("Ingrese el ID del usuario a eliminar: "))
            usuario_logueado.eliminar_usuario_por_id(id_usuario)
        except ValueError:
            print("Entrada inválida. Por favor, ingrese un número para el ID.")
    elif opcion == "5":  # NUEVA OPCIÓN
        ejecutar_edicion_perfil()
    elif opcion == "6":
        print("Cerrando sesión de administrador...")
        usuario_logueado = None  # Cerrar sesión
    else:
        print("Opción no válida. Intente de nuevo.")


def ejecutar_accion_estandar(opcion):
    """Ejecuta la acción de usuario estándar según la opción seleccionada."""
    global usuario_logueado
    if not isinstance(usuario_logueado, UsuarioEstandar):
        print("Error: Permisos insuficientes para esta acción.")
        return

    if opcion == "1":
        datos = usuario_logueado.obtener_datos_personales()
        print("\n--- Mis Datos ---")
        for key, value in datos.items():
            if isinstance(value, dict):
                print(f"{key}:")
                for sub_key, sub_value in value.items():
                    print(f"  - {sub_key}: {sub_value}")
            else:
                print(f"{key}: {value}")
        print("-----------------")
    elif opcion == "2":  # NUEVA OPCIÓN
        ejecutar_edicion_perfil()
    elif opcion == "3":
        print("Cerrando sesión de usuario estándar...")
        usuario_logueado = None  # Cerrar sesión
    else:
        print("Opción no válida. Intente de nuevo.")


def main():
    """Función principal que ejecuta el programa."""
    global usuario_logueado
    print("Iniciando Sistema de Gestión de Usuarios...")
    initialize_db()  # Asegura que la DB y el admin por defecto existan

    while True:
        if usuario_logueado is None:
            opcion = mostrar_menu_principal()
            if opcion == "1":
                ejecutar_registro_usuario()
            elif opcion == "2":
                ejecutar_inicio_sesion()
            elif opcion == "3":
                print("Gracias por usar el programa. ¡Adiós!")
                sys.exit()
            else:
                print("Opción no válida. Por favor, ingrese 1, 2 o 3.")
        else:
            if isinstance(usuario_logueado, Administrador):
                opcion = mostrar_menu_admin()
                ejecutar_accion_admin(opcion)
            elif isinstance(usuario_logueado, UsuarioEstandar):
                opcion = mostrar_menu_estandar()
                ejecutar_accion_estandar(opcion)
            else:
                print("Error interno: Tipo de usuario desconocido.")
                usuario_logueado = None


if __name__ == "__main__":
    main()
