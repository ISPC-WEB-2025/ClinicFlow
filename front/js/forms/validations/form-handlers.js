import { mostrarAlerta, resetearFormulario } from './validation-utils.js';

/* 
El archivo define funciones manejadoras de formularios (login, registro, contacto y reset password) que:

Reúnen los datos ingresados por el usuario.

Estandarizan los valores (limpian espacios, formatean texto, separan nombre/apellido).

Disparan eventos personalizados (CustomEvent) que informan al resto del sistema lo que ocurrió, en lugar de ejecutar la lógica directamente (como enviar datos al backend).

👉 En otras palabras, este módulo no realiza las acciones finales (como autenticación o guardado), sino que comunica la intención del usuario a otros módulos que escuchan esos eventos.
*/


const dispatchEvent = (eventName, detail) => {
    document.dispatchEvent(new CustomEvent(eventName, { detail }));
};
/* Qué hace:
Crea y dispara un evento personalizado (CustomEvent) sobre el objeto global document.
El parámetro detail contiene los datos relevantes (por ejemplo, el usuario o el email).

Por qué es útil:
Permite desacoplar la interfaz de usuario del flujo de negocio.
Otros módulos pueden escuchar: */
const obtenerValorInput = (id) => {
    return document.getElementById(id)?.value || '';
};
/* Qué hace:
Obtiene el valor de un campo de formulario por su ID, con optional chaining (?.) para evitar errores si el elemento no existe.
Devuelve una cadena vacía si el campo no se encuentra.

Patrón común:

Encapsula el acceso al DOM.

Hace el código más limpio y resistente. */
const separarNombreCompleto = (nombreCompleto) => {
    const palabras = nombreCompleto.trim().split(/\s+/);
    return {
        nombre: palabras[0],
        apellido: palabras.slice(1).join(' ')
    };
};
/* Qué hace:
Divide una cadena de nombre completo en nombre (primer palabra) y apellido (resto).
Ejemplo:
→ "Juan Pérez González" → { nombre: "Juan", apellido: "Pérez González" }

Ventaja:
Permite usar un único campo visual (“nombre completo”) pero separar los datos para el backend. */
export function manejarLogin(form) {
    const datosLogin = {
        email: obtenerValorInput('form-email').trim(),
        password: obtenerValorInput('form-password')
    };

    dispatchEvent('intentoLogin', datosLogin);
}
/* Qué hace:

Extrae los valores del formulario de login.

Los normaliza (elimina espacios).

Dispara el evento intentoLogin con los datos.

➡️ Otro módulo puede escuchar ese evento para ejecutar la autenticación. */
export function manejarRegistro(form) {
    const nombreCompleto = obtenerValorInput('form-nombre-completo').trim();
    const { nombre, apellido } = separarNombreCompleto(nombreCompleto);

    const datosUsuario = {
        nombre,
        apellido,
        nombreCompleto,
        email: obtenerValorInput('form-email').trim().toLowerCase(),
        dni: obtenerValorInput('form-dni').trim(),
        telefono: obtenerValorInput('form-telefono').trim(),
        password: obtenerValorInput('form-password')
    };

    dispatchEvent('intentoRegistro', datosUsuario);
}
/* Qué hace:

Toma todos los valores del formulario de registro.

Separa nombre/apellido.

Dispara el evento intentoRegistro con los datos listos para enviar.

👉 Nuevamente, este módulo no envía los datos directamente, solo avisa que el usuario quiere registrarse. */
export async function manejarContacto(form) {
    const formData = new FormData(form);
    const nombreInput = form.querySelector('[name="nombre"]');

    try {
     
        const response = await fetch(form.action, {
            method: form.method, 
            body: formData      
        });

        
        const data = await response.json();

        if (data.success) {
            mostrarAlerta(
                'success',
                `¡Gracias por tu consulta, ${nombreInput.value}! Te contactaremos pronto.`
            );
            const scrollTarget = document.getElementById('page-title') || form
            scrollTarget.scrollIntoView({
                behavior: 'smooth', 
                block: 'start'      
            });

            
            setTimeout(() => {
                resetearFormulario(form);
            }, 2000); 

        } else {
            console.error('Error de Web3Forms:', data.message);
            mostrarAlerta('error', `Error al enviar: ${data.message}`);
        }

    } catch (error) {
        console.error('Error de red o CORS al contactar a Web3Forms:', error);
        mostrarAlerta('error', 'No se pudo conectar con el servidor. Revisa la consola para más detalles.');
    }
}
/* Qué hace:
Esta función sí realiza la acción directamente:

Envía los datos de contacto a un servicio externo (como Web3Forms).

Muestra alertas de éxito o error mediante mostrarAlerta().

Hace scroll hasta el título del formulario y lo resetea tras unos segundos.

Destacable:

Usa async/await y try/catch para manejar errores de red.

Es el único caso donde la acción no se delega a un evento, porque el servicio se consume directamente desde el frontend. */
export function manejarResetPassword(form) {
    const email = obtenerValorInput('form-email').trim().toLowerCase();
    dispatchEvent('intentoResetPassword', { email });
}
/* Qué hace:
Dispara el evento intentoResetPassword con el correo ingresado. */