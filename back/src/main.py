# main.py

import sys
from database import initialize_db
from classes.usuario import Usuario


# -----------------------------
# Menús
# -----------------------------
def mostrar_menu_administrador(usuario):
    while True:
        print(f"\n--- Menú de Administrador ({usuario.nombre_usuario}) ---")
        print("1. Ver mis datos personales")
        print("2. Visualizar listado de usuarios")
        print("3. Cambiar rol de usuario")
        print("4. Eliminar usuario")
        print("5. Editar mi perfil")
        print("6. Cerrar sesión")
        print("-----------------------------")

        opcion = input("Seleccione una opción: ")

        if opcion == "1":
            datos = usuario.obtener_datos_personales()
            print("\n--- Mis Datos ---")
            for k, v in datos.items():
                print(f"{k}: {v}")
        elif opcion == "2":
            usuario.visualizar_todos_los_usuarios()
        elif opcion == "3":
            try:
                id_usuario = int(input("Ingrese el ID del usuario a modificar: "))
                nuevo_rol = input(
                    "Ingrese el nuevo rol (administrador/estandar): "
                ).lower()
                from database import actualizar_rol_usuario

                if actualizar_rol_usuario(id_usuario, nuevo_rol):
                    print("Rol actualizado con éxito.")
                else:
                    print("No se pudo actualizar el rol.")
            except ValueError:
                print("Entrada inválida.")
        elif opcion == "4":
            try:
                id_usuario = int(input("Ingrese el ID del usuario a eliminar: "))
                usuario.eliminar_usuario_por_id(id_usuario)
            except ValueError:
                print("Entrada inválida.")
        elif opcion == "5":
            ejecutar_edicion_perfil(usuario)
        elif opcion == "6":
            print("Cerrando sesión de administrador...")
            break
        else:
            print("Opción no válida. Intente de nuevo.")


def mostrar_menu_estandar(usuario):
    while True:
        print(f"\n--- Menú de Usuario Estándar ({usuario.nombre_usuario}) ---")
        print("1. Ver mis datos personales")
        print("2. Editar mi perfil")
        print("3. Cerrar sesión")
        print("--------------------------------")

        opcion = input("Seleccione una opción: ")

        if opcion == "1":
            datos = usuario.obtener_datos_personales()
            print(datos)
            print("\n--- Mis Datos ---")
            for k, v in datos.items():
                print(f"{k}: {v}")
            input("Presiona ENTER para volver al menú...")
        elif opcion == "2":
            ejecutar_edicion_perfil(usuario)
        elif opcion == "3":
            print("Cerrando sesión de usuario estándar...")
            break
        else:
            print("Opción no válida. Intente de nuevo.")


# -----------------------------
# Funciones auxiliares
# -----------------------------
def ejecutar_registro_usuario():
    print("\n--- Registro de Nuevo Usuario ---")
    nombre_usuario = input("Ingrese nombre de usuario: ")
    contrasena = input("Ingrese contraseña (mín. 6 caracteres, letras y números): ")

    print("\n--- Datos de Perfil (Opcional) ---")
    nombre = input("Nombre (opcional): ")
    apellido = input("Apellido (opcional): ")
    email = input("Email (opcional): ")
    direccion = input("Dirección (opcional): ")

    nuevo_usuario_obj = Usuario.registrar_nuevo_usuario(
        nombre_usuario, nombre, apellido, email, contrasena, direccion
    )
    if nuevo_usuario_obj:
        print(f"Usuario '{nuevo_usuario_obj.nombre_usuario}' registrado exitosamente.")
    else:
        print("Fallo el registro del usuario.")


def ejecutar_edicion_perfil(usuario):
    print("\n--- Editar Mi Perfil ---")
    print("Deje en blanco los campos que no desee modificar.")
    nombre = input(f"Nombre ({usuario.nombre or 'actualmente vacío'}): ")
    apellido = input(f"Apellido ({usuario.apellido or 'actualmente vacío'}): ")
    email = input(f"Email ({usuario.email or 'actualmente vacío'}): ")
    direccion = input(f"Dirección ({usuario.direccion or 'actualmente vacío'}): ")

    if usuario.actualizar_datos(
        nombre if nombre else None,
        apellido if apellido else None,
        email if email else None,
        direccion if direccion else None,
    ):
        print("Perfil actualizado con éxito.")
    else:
        print("No se pudo actualizar el perfil.")


# -----------------------------
# Función principal
# -----------------------------
def main():
    print("Iniciando Sistema de Gestión de Usuarios...")
    initialize_db()

    while True:
        print("\n--- Menú Principal ---")
        print("1. Registrar nuevo usuario")
        print("2. Iniciar sesión")
        print("3. Salir")
        opcion = input("Seleccione una opción: ")

        if opcion == "1":
            ejecutar_registro_usuario()

        elif opcion == "2":
            print("\n--- Inicio de Sesión ---")
            nombre = input("Ingrese nombre de usuario: ")
            contrasena = input("Ingrese contraseña: ")
            usuario_logueado = Usuario.iniciar_sesion(nombre, contrasena)

            if usuario_logueado:
                if usuario_logueado.rol == "administrador":
                    mostrar_menu_administrador(usuario_logueado)
                else:
                    mostrar_menu_estandar(usuario_logueado)
            else:
                print("Credenciales incorrectas o usuario no encontrado.")

        elif opcion == "3":
            print("Gracias por usar el programa. ¡Adiós!")
            sys.exit()

        else:
            print("Opción no válida. Intente de nuevo.")


if __name__ == "__main__":
    main()
