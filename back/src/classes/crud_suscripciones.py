from mysql.connector import Error
from database import get_db_connection
from datetime import datetime

def obtener_plan_activo_por_usuario(id_usuario):
    
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return None

        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT P.nombre_plan, P.id_plan
            FROM Suscripciones S
            JOIN Planes P ON S.id_plan = P.id_plan
            WHERE S.id_usuario = %s AND S.estado = 'Activo'
        """
        cursor.execute(query, (id_usuario,))
        return cursor.fetchone() # Retorna {nombre_plan: '...', id_plan: X} o None

    except Error as e:
        print(f"Error CRUD al obtener plan activo: {e}")
        return None
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

def actualizar_suscripcion(id_usuario, estado_nuevo):
    
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return 0

        cursor = conn.cursor()
        query = """
            UPDATE Suscripciones 
            SET estado = %s 
            WHERE id_usuario = %s AND estado = 'Activo'
        """
        cursor.execute(query, (estado_nuevo, id_usuario))
        conn.commit()
        return cursor.rowcount

    except Error as e:
        print(f"Error CRUD al actualizar suscripción: {e}")
        if conn:
            conn.rollback()
        return 0
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

def crear_suscripcion(id_usuario, id_plan):
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return False

        cursor = conn.cursor()
        fecha_actual = datetime.now().strftime('%Y-%m-%d')
        
        query_insert = """
            INSERT INTO Suscripciones (id_usuario, id_plan, fecha_inicio, estado)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query_insert, (id_usuario, id_plan, fecha_actual, 'Activo'))
        conn.commit()
        return True

    except Error as e:
        print(f"Error CRUD al crear suscripción: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

def obtener_tabla_suscripciones():
       conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            return []

        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT 
                U.idUsuario,
                U.nombre_usuario,
                P.nombre_plan,
                S.fecha_inicio,
                S.estado
            FROM Suscripciones S
            JOIN usuario U ON S.id_usuario = U.idUsuario
            JOIN Planes P ON S.id_plan = P.id_plan
            ORDER BY U.idUsuario, S.fecha_inicio DESC
        """
        cursor.execute(query)
        return cursor.fetchall()

    except Error as e:
        print(f"Error CRUD al obtener tabla de suscripciones: {e}")
        return []
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()