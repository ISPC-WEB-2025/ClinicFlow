from database import get_db_connection
from mysql.connector import Error
from crud_planes import (
    crear_plan,
    actualizar_plan,
    eliminar_plan,
    obtener_todos_los_planes as crud_obtener_todos
)

class Plan:

    def __init__(self, id_plan, nombre, precio, descripcion):
        self.id_plan = id_plan
        self.nombre = nombre
        self.precio = precio
        self.descripcion = descripcion

        @staticmethod
    def crear(nombre, descripcion, precio, stock, id_usuario):
        id_nuevo = crear_producto(nombre, descripcion, precio, stock, id_usuario)
        if id_nuevo:
            print("Producto creado correctamente.")
            return id_nuevo
        else:
            print("Error al crear el producto.")
            return None

    @staticmethod
    def listar_todos():
        productos = obtener_todos_los_productos()
        if not productos:
            print("No hay productos registrados.")
            return
        print("\n--- LISTADO DE PRODUCTOS ---")
        for p in productos:
            id_p, nombre, desc, precio, stock, creador = p
            print(f"ID: {id_p} | {nombre} | ${precio:.2f} | Stock: {stock} | Creador: {creador}")
        print("----------------------------")

    @staticmethod
    def editar(id_producto, nombre=None, descripcion=None, precio=None, stock=None):
        if actualizar_producto(id_producto, nombre, descripcion, precio, stock):
            print("Producto actualizado correctamente.")
        else:
            print("No se pudo actualizar el producto.")

    @staticmethod
    def eliminar(id_producto):
        if eliminar_producto(id_producto):
            print("Producto eliminado correctamente.")
        else:
            print("No se encontró el producto.")

    @staticmethod
    def obtener_todos_los_planes():

        conn = get_db_connection()
        if conn is None:
            return []

        planes_list = []
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT id_plan, nombre_plan, precio, descripcion FROM Planes ORDER BY id_plan"
            )
            resultados = cursor.fetchall()

            for row in resultados:
                planes_list.append(
                    Plan(
                        row["id_plan"],
                        row["nombre_plan"],
                        row["precio"],
                        row["descripcion"],
                    )
                )

        except Error as e:
            print(f"Error al obtener planes: {e}")
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()

        return planes_list

    @staticmethod
    def mostrar_planes_en_consola(planes):

        print("\n" + "=" * 70)
        print("             PLANES DE SERVICIO DISPONIBLES")
        print("=" * 70)
        print(f"{'ID':<4} {'Plan':<15} {'Precio/mes':<12} {'Descripción':<35}")
        print("-" * 70)

        if not planes:
            print("No hay planes disponibles.")
            return

        for plan in planes:
            # Formateamos el precio para asegurar 2 decimales
            precio_str = f"${plan.precio:.2f}"
            print(
                f"{plan.id_plan:<4} {plan.nombre:<15} {precio_str:<12} {plan.descripcion:<35}"
            )
        print("=" * 70)

    @staticmethod
    def obtener_plan_por_id(plan_id):
        """Retorna un objeto Plan basado en su ID."""
        conn = get_db_connection()
        if conn is None:
            return None

        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT id_plan, nombre_plan, precio, descripcion FROM Planes WHERE id_plan = %s",
                (plan_id,),
            )
            row = cursor.fetchone()

            if row:
                return Plan(
                    row["id_plan"],
                    row["nombre_plan"],
                    row["precio"],
                    row["descripcion"],
                )
            return None

        except Error as e:
            print(f"Error al obtener plan por ID: {e}")
            return None
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()
