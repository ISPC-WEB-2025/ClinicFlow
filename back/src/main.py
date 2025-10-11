# main.py

import sys
from database import initialize_db
from classes.usuario import Usuario
from classes.producto import Producto


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
        print("6. Gestión de productos")
        print("7. Cerrar sesión")
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
            id_usuario = int(input("ID del usuario: "))
            nuevo_rol = input("Nuevo rol (administrador/estandar): ").lower()
            usuario.cambiar_rol_usuario(id_usuario, nuevo_rol)

        elif opcion == "4":
            id_usuario = int(input("ID del usuario a eliminar: "))
            usuario.eliminar_usuario_por_id(id_usuario)

        elif opcion == "5":
            ejecutar_edicion_perfil(usuario)

        elif opcion == "6":
            menu_productos(usuario)

        elif opcion == "7":
            print("Cerrando sesión de administrador...")
            break

        else:
            print("Opción no válida.")


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
    while True:
        nombre_usuario = input(
            "Ingrese nombre de usuario (o escriba 'salir' para cancelar): "
        )

        # 1. Opción para salir del registro
        if nombre_usuario.lower() == "salir":
            print("Registro de usuario cancelado.")
            return
        if Usuario.existe_nombre_usuario(nombre_usuario):
            print("¡Error! El nombre de usuario ya existe. Por favor, elija otro.")
            # Si quieres permitir salir del loop sin registrar, podrías añadir una opción aquí.
        else:
            print("Nombre de usuario disponible.")
            break
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
# Gestión de productos
# -----------------------------
def menu_productos(usuario):
    while True:
        print("\n--- Gestión de Productos ---")
        print("1. Crear producto")
        print("2. Listar productos (JOIN con usuario)")
        print("3. Editar producto")
        print("4. Eliminar producto")
        print("5. Volver al menú anterior")

        opcion = input("Seleccione una opción: ")

        if opcion == "1":
            nombre = input("Nombre: ")
            descripcion = input("Descripción: ")
            precio = float(input("Precio: "))
            stock = int(input("Stock: "))
            Producto.crear(nombre, descripcion, precio, stock, usuario.id_usuario)

        elif opcion == "2":
            Producto.listar_todos()
            input("ENTER para continuar...")

        elif opcion == "3":
            id_p = int(input("ID del producto a editar: "))
            nombre = input("Nuevo nombre (vacío = sin cambio): ") or None
            descripcion = input("Nueva descripción (vacío = sin cambio): ") or None
            precio = input("Nuevo precio (vacío = sin cambio): ")
            precio = float(precio) if precio else None
            stock = input("Nuevo stock (vacío = sin cambio): ")
            stock = int(stock) if stock else None
            Producto.editar(id_p, nombre, descripcion, precio, stock)

        elif opcion == "4":
            id_p = int(input("ID del producto a eliminar: "))
            Producto.eliminar(id_p)

        elif opcion == "5":
            break

        else:
            print("Opción no válida.")


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
