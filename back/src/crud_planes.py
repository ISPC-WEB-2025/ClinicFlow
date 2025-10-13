from mysql.connector import Error
from database import get_db_connection


def crear_plan(nombre_plan, precio, descripcion):
    """Crea un nuevo plan."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Obtener el próximo id_plan disponible
        cursor.execute("SELECT MAX(id_plan) FROM Planes")
        max_id = cursor.fetchone()[0]
        nuevo_id = (max_id + 1) if max_id else 1

        cursor.execute(
            """
            INSERT INTO Planes (id_plan, nombre_plan, precio, descripcion)
            VALUES (%s, %s, %s, %s)
            """,
            (nuevo_id, nombre_plan, precio, descripcion),
        )

        conn.commit()
        return nuevo_id
    except Error as e:
        print(f"Error al crear plan: {e}")
        if conn:
            conn.rollback()
        return None
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def obtener_todos_los_planes():
    """Devuelve todos los planes disponibles."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id_plan, nombre_plan, precio, descripcion
            FROM Planes
            ORDER BY id_plan
        """
        )
        return cursor.fetchall()
    except Error as e:
        print(f"Error al obtener planes: {e}")
        return []
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def actualizar_plan(id_plan, nombre_plan=None, precio=None, descripcion=None):
    """Actualiza un plan."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        updates, params = [], []

        if nombre_plan is not None:
            updates.append("nombre_plan = %s")
            params.append(nombre_plan)
        if precio is not None:
            updates.append("precio = %s")
            params.append(precio)
        if descripcion is not None:
            updates.append("descripcion = %s")
            params.append(descripcion)

        if not updates:
            return False

        query = f"UPDATE Planes SET {', '.join(updates)} WHERE id_plan = %s"
        params.append(id_plan)

        cursor.execute(query, tuple(params))
        conn.commit()
        return cursor.rowcount > 0

    except Error as e:
        print(f"Error al actualizar plan: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()





def obtener_plan_por_id(id_plan):
    """Obtiene un plan específico por su ID."""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id_plan, nombre_plan, precio, descripcion FROM Planes WHERE id_plan = %s",
            (id_plan,),
        )
        return cursor.fetchone()
    except Error as e:
        print(f"Error al obtener plan: {e}")
        return None
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def eliminar_plan(id_plan):
    """Elimina un plan por ID.
    Verifica si tiene suscripciones asociadas antes de eliminar."""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return False
        
        cursor = conn.cursor()
        
        # Verificar si el plan existe
        cursor.execute("SELECT id_plan FROM Planes WHERE id_plan = %s", (id_plan,))
        if not cursor.fetchone():
            print(f"No existe un plan con ID {id_plan}.")
            return False
        
        # Verificar si tiene suscripciones activas
        cursor.execute("""
            SELECT COUNT(*) FROM Suscripciones 
            WHERE id_plan = %s AND estado = 'Activo'
        """, (id_plan,))
        count_activas = cursor.fetchone()[0]
        
        if count_activas > 0:
            print(f"⚠️  ERROR: No se puede eliminar el plan.")
            print(f"Hay {count_activas} suscripción(es) ACTIVA(S) usando este plan.")
            print("Sugerencia: Cancela o cambia las suscripciones activas primero.")
            return False
        
        # Verificar suscripciones canceladas
        cursor.execute("""
            SELECT COUNT(*) FROM Suscripciones 
            WHERE id_plan = %s AND estado = 'Cancelado'
        """, (id_plan,))
        count_canceladas = cursor.fetchone()[0]
        
        if count_canceladas > 0:
            # Opción 1: Eliminar también las suscripciones canceladas (historial)
            print(f"⚠️  Este plan tiene {count_canceladas} suscripción(es) cancelada(s) (historial).")
            confirmacion = input("¿Eliminar también el historial de suscripciones? (s/n): ")
            
            if confirmacion.lower() == 's':
                cursor.execute("DELETE FROM Suscripciones WHERE id_plan = %s", (id_plan,))
                print(f"Se eliminaron {cursor.rowcount} registro(s) de suscripciones.")
            else:
                print("Operación cancelada. No se eliminó el plan.")
                return False
        
        # Ahora eliminar el plan
        cursor.execute("DELETE FROM Planes WHERE id_plan = %s", (id_plan,))
        conn.commit()
        
        if cursor.rowcount > 0:
            print(f"✓ Plan con ID {id_plan} eliminado exitosamente.")
            return True
        return False
        
    except Error as e:
        print(f"Error al eliminar plan: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


def validar_eliminacion_plan(id_plan):
    """Verifica si un plan puede ser eliminado de forma segura."""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return {"puede_eliminar": False, "razon": "Error de conexión"}
        
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'Activo' THEN 1 ELSE 0 END) as activas,
                SUM(CASE WHEN estado = 'Cancelado' THEN 1 ELSE 0 END) as canceladas
            FROM Suscripciones
            WHERE id_plan = %s
        """, (id_plan,))
        
        resultado = cursor.fetchone()
        
        if resultado['activas'] > 0:
            return {
                "puede_eliminar": False,
                "razon": f"Hay {resultado['activas']} suscripción(es) activa(s)",
                "detalle": resultado
            }
        
        return {
            "puede_eliminar": True,
            "razon": "OK",
            "suscripciones_canceladas": resultado['canceladas'],
            "detalle": resultado
        }
        
    except Error as e:
        print(f"Error al validar eliminación: {e}")
        return {"puede_eliminar": False, "razon": f"Error: {e}"}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()