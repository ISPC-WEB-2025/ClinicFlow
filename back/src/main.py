# main.py

import sys
from database import initialize_db, insert_sample_data
from classes.usuario import Usuario
from classes.plan import Plan


# -----------------------------
# Menús (Actualizados)
# -----------------------------
def mostrar_menu_administrador(usuario):
    while True:
        print(f"\n--- Menú de Administrador ({usuario.nombre_usuario}) ---")
        print("1. Ver mis datos personales")
        print("2. Visualizar listado de usuarios")
        print("3. Visualizar tabla de Suscripciones")
        print("4. Cambiar rol de usuario")
        print("5. Eliminar usuario")
        print("6. Editar mi perfil")
        print("7. Gestión de Planes")
        print("8. Gestión de Suscripciones")
        print("9. Cerrar sesión")

        print("-----------------------------")

        opcion = input("Seleccione una opción: ")

        if opcion == "1":
            datos = usuario.obtener_datos_personales()
            print("\n--- Mis Datos ---")
            for k, v in datos.items():
                print(f"{k}: {v}")
            input("Presiona ENTER para volver al menú...")

        elif opcion == "2":
            usuario.visualizar_todos_los_usuarios()

        elif opcion == "3":
            # Llama a la lógica de negocio para mostrar suscripciones
            usuario.mostrar_tabla_suscripciones()
            input("Presiona ENTER para volver al menú...")

        elif opcion == "4":
            try:
                id_usuario = int(input("Ingrese el ID del usuario a modificar: "))
                nuevo_rol = input(
                    "Ingrese el nuevo rol (administrador/estandar): "
                ).lower()

                usuario.cambiar_rol_usuario(id_usuario, nuevo_rol)

            except ValueError:
                print("Entrada inválida.")

        elif opcion == "5":
            try:
                id_usuario = int(input("Ingrese el ID del usuario a eliminar: "))
                usuario.eliminar_usuario_por_id(id_usuario)
            except ValueError:
                print("Entrada inválida.")

        elif opcion == "6":
            ejecutar_edicion_perfil(usuario)

        elif opcion == "7":
            menu_planes()

        elif opcion == "8":
            menu_suscripciones(usuario)

        elif opcion == "9":
            print("Cerrando sesión de administrador...")
            break
        else:
            print("Opción no válida. Intente de nuevo.")


def mostrar_menu_estandar(usuario):
    while True:
        print(f"\n--- Menú de Usuario Estándar ({usuario.nombre_usuario}) ---")
        print("1. Ver mis datos personales")
        print("2. Gestionar mi Plan de Servicio")
        print("3. Editar mi perfil")
        print("4. Cerrar sesión")
        print("--------------------------------")

        opcion = input("Seleccione una opción: ")

        if opcion == "1":
            datos = usuario.obtener_datos_personales()
            print("\n--- Mis Datos ---")
            for k, v in datos.items():
                print(f"{k}: {v}")
            input("Presiona ENTER para volver al menú...")
        elif opcion == "2":
            ejecutar_gestion_plan(usuario)

        elif opcion == "3":
            ejecutar_edicion_perfil(usuario)

        elif opcion == "4":
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


def ejecutar_gestion_plan(usuario):
    """Maneja la lógica de compra/cancelación de planes para el usuario estándar."""
    plan_activo = usuario.obtener_plan_activo()

    print("\n--- Gestión de Plan de Servicio ---")
    print(f"Tu plan actual es: {plan_activo}")

    if plan_activo == "Ninguno":
        print("\n¿Qué deseas hacer?")
        print("1. Contratar un nuevo plan")
        print("2. Volver al menú")
        opcion = input("Elige una opción (1 o 2): ")
    else:
        print("\n¿Qué deseas hacer?")
        print("1. Cambiar/Mejorar mi plan")
        print("2. Cancelar mi plan actual")
        print("3. Volver al menú")
        opcion = input("Elige una opción (1, 2 o 3): ")

    if opcion == "1":  # Contratar/Cambiar
        planes = Plan.obtener_todos_los_planes()
        Plan.mostrar_planes_en_consola(planes)
        while True:
            try:
                plan_id = int(input("Introduce el ID del plan que quieres contratar: "))
                if any(p.id_plan == plan_id for p in planes):
                    # Llama al método de negocio que coordina la cancelación/nueva compra
                    usuario.comprar_plan(plan_id)
                    break
                else:
                    print("ID de plan no válido. Intenta de nuevo.")
            except ValueError:
                print("Entrada no válida. Por favor, introduce un número.")

    elif opcion == "2" and plan_activo != "Ninguno":  # Cancelar
        # Llama al método de negocio para cancelar
        usuario.cancelar_plan()

    elif opcion == "2" or opcion == "3":  # Volver
        return

    else:
        print("Opción no válida.")


# -----------------------------
# Gestión de Planes (Administrador)
# -----------------------------
def menu_planes():
    """Menú CRUD para gestión de planes."""
    while True:
        print("\n--- Gestión de Planes ---")
        print("1. Crear plan")
        print("2. Listar planes")
        print("3. Editar plan")
        print("4. Eliminar plan")
        print("5. Volver al menú anterior")

        opcion = input("Seleccione una opción: ")

        if opcion == "1":
            nombre = input("Nombre del plan: ").strip()

            # VALIDACIÓN BÁSICA: Nombre no vacío
            if not nombre:
                print("El nombre del plan es obligatorio.")
                input("ENTER para continuar...")
                return  # Sale de la función

            try:
                precio_input = input("Precio: ").strip()

                # VALIDACIÓN BÁSICA: Precio no vacío y tipo numérico
                if not precio_input:
                    print("El precio es obligatorio.")
                    input("ENTER para continuar...")
                    return

                precio = float(precio_input)

            except ValueError:
                print("ERROR: El precio debe ser un número válido.")
                input("ENTER para continuar...")
                return  # Sale de la función

            descripcion = input("Descripción: ").strip()

            # Pasa el 'precio' ya convertido y validado
            Plan.crear(nombre, precio, descripcion)
            input("ENTER para continuar...")

        elif opcion == "2":
            Plan.listar_todos()
            input("ENTER para continuar...")

        elif opcion == "3":
            try:
                Plan.listar_todos()
                id_plan = int(input("ID del plan a editar: "))
                nombre = input("Nuevo nombre (vacío = sin cambio): ") or None
                precio = input("Nuevo precio (vacío = sin cambio): ")
                precio = float(precio) if precio else None
                descripcion = input("Nueva descripción (vacío = sin cambio): ") or None
                Plan.editar(id_plan, nombre, precio, descripcion)
            except ValueError:
                print("Entrada inválida.")
            input("ENTER para continuar...")

        elif opcion == "4":
            try:
                Plan.listar_todos()
                id_plan = int(input("ID del plan a eliminar: "))
                confirmacion = input(
                    f"¿Seguro que desea eliminar el plan {id_plan}? (s/n): "
                )
                if confirmacion.lower() == "s":
                    Plan.eliminar(id_plan)
            except ValueError:
                print("Entrada inválida.")
            input("ENTER para continuar...")

        elif opcion == "5":
            break

        else:
            print("Opción no válida.")


# -----------------------------
# Gestión de Suscripciones (Administrador)
# -----------------------------
def menu_suscripciones(usuario):
    """Menú CRUD para gestión de suscripciones."""

    while True:
        print("\n--- Gestión de Suscripciones ---")
        print("1. Crear suscripción para un usuario")
        print("2. Listar todas las suscripciones")
        print("3. Cambiar plan de un usuario")
        print("4. Cancelar plan de un usuario")
        print("5. Volver al menú anterior")

        opcion = input("Seleccione una opción: ")

        if opcion == "1":
            try:
                id_usuario = int(input("ID del usuario: "))
                Plan.listar_todos()
                id_plan = int(input("ID del plan a asignar: "))
                usuario.crear_suscripcion_usuario(id_usuario, id_plan)
            except ValueError:
                print("Entrada inválida.")
            input("ENTER para continuar...")

        elif opcion == "2":
            usuario.mostrar_tabla_suscripciones()
            input("ENTER para continuar...")

        elif opcion == "3":
            try:
                id_usuario = int(input("ID del usuario: "))
                Plan.listar_todos()
                nuevo_id_plan = int(input("Nuevo ID de plan: "))
                usuario.cambiar_plan_usuario(id_usuario, nuevo_id_plan)
            except ValueError:
                print("Entrada inválida.")
            input("ENTER para continuar...")

        elif opcion == "4":
            try:
                id_usuario = int(input("ID del usuario a cancelar: "))
                confirmacion = input(
                    f"¿Seguro que desea cancelar el plan del usuario {id_usuario}? (s/n): "
                )
                if confirmacion.lower() == "s":
                    usuario.cancelar_plan_usuario(id_usuario)
            except ValueError:
                print("Entrada inválida.")
            input("ENTER para continuar...")

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
        print("3. Cargar datos de prueba (Usuarios y Suscripciones)")
        print("4. Salir")
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
            # 🔑 Lógica de inserción de datos de prueba y mensaje de confirmación
            insert_sample_data()

            print("\n==============================================")
            print("✅ DATOS DE PRUEBA Y ADMINISTRADOR CARGADOS:")
            print("==============================================")
            print("🔑 Credenciales de ADMINISTRADOR:")
            print("   Usuario: admin")
            print("   Contraseña: admin123")
            print("\n👥 Credenciales de USUARIOS ESTÁNDAR:")
            print(
                "   Todos los usuarios (usuario1 a usuario6) tienen la misma contraseña:"
            )
            print("   Contraseña: pass123")
            print("==============================================")

        elif opcion == "4":
            print("Gracias por usar el programa. ¡Adiós!")
            sys.exit()

        else:
            print("Opción no válida. Intente de nuevo.")


if __name__ == "__main__":
    main()
