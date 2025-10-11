from crud_productos import (
    crear_producto,
    obtener_todos_los_productos,
    actualizar_producto,
    eliminar_producto
)

class Producto:
    def __init__(self, id_producto, nombre, descripcion, precio, stock, creador=None):
        self.id_producto = id_producto
        self.nombre = nombre
        self.descripcion = descripcion
        self.precio = precio
        self.stock = stock
        self.creador = creador

    def __str__(self):
        return f"[{self.id_producto}] {self.nombre} - ${self.precio:.2f} (Stock: {self.stock})"

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
