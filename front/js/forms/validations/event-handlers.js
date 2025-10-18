/* MANEJA DIFERENTES EVENTOS */


import { mostrarAlerta } from './validation-utils.js'; // importar funciones de validation utils

const guardarSesion = (usuario, origen) => {
    sessionStorage.setItem('userEmail', usuario.email);
    sessionStorage.setItem('userName', usuario.nombre || 'Usuario');
    sessionStorage.setItem('userOrigen', origen);
};

/* 
QUÉ
Guarda información del usuario en sessionStorage (email, nombre y origen).

CÓMO

Recibe un objeto usuario y una cadena origen.

Guarda usuario.email en la clave 'userEmail'.

Guarda usuario.nombre (o 'Usuario' si no existe) en 'userName'.

Guarda origen en 'userOrigen'.
Usa sessionStorage.setItem(key, value).

PARA QUÉ
Mantener en la sesión del navegador información básica del usuario para usarla durante la sesión (mostrar nombre en la UI, condicionar rutas, etc.). sessionStorage dura hasta que se cierra la pestaña/ventana.
*/

const redirigir = (url, delay = 500) => {
    setTimeout(() => window.location.href = url, delay);
};
/* 
QUÉ
Redirige la página actual a una URL después de un retardo (por defecto 500 ms). 0.5 s

CÓMO

Usa setTimeout para ejecutar window.location.href = url tras delay milisegundos.

delay es opcional y por defecto vale 500.

PARA QUÉ
Dar tiempo para que el usuario vea una notificación o para completar alguna animación/operación antes de cambiar de página. Por ejemplo después de mostrar una alerta de éxito redirigir al login.
*/

const limpiarPasswordInput = () => {
    const passwordInput = document.getElementById('form-password');
    if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
    }
};
/* 
QUÉ
Limpia y enfoca el campo de contraseña del formulario (id="form-password").

CÓMO

Busca el elemento con document.getElementById('form-password').

Si existe, asigna '' a passwordInput.value para vaciarlo y llama passwordInput.focus() para llevar el foco al campo.

PARA QUÉ
Eliminar la contraseña introducida en intentos de login fallidos (por seguridad/UX) y posicionar el cursor para que el usuario reingrese su contraseña rápidamente.
*/

const ocultarFormulario = (formId) => {
    const form = document.getElementById(formId);
    if (form) form.style.display = 'none';
};
/* 
UÉ
Oculta un formulario (o cualquier elemento) estableciendo display: none en el estilo.

CÓMO

Obtiene el elemento por document.getElementById(formId).

Si existe, hace form.style.display = 'none';.

PARA QUÉ
Quitar de la vista un formulario después de una acción exitosa (por ejemplo, ocultar el formulario de "forgotPassword-form" luego de solicitar cambio de contraseña).
*/

const manejarResultadoRegistro = (event) => {
    const { exito, mensaje } = event.detail;
    
    if (exito) {
        mostrarAlerta('success', `${mensaje} Redirigiendo al login...`, () => {
            redirigir('login.html');
        });
    } else {
        mostrarAlerta('warning', mensaje);
    }
};

/* 
QUÉ
Manejador de evento para el resultado del registro de usuario. Espera un CustomEvent cuyo detail contiene { exito, mensaje }.

CÓMO

Extrae exito y mensaje de event.detail.

Si exito es true:

Llama mostrarAlerta('success', ${mensaje} Redirigiendo al login..., callback) y en el callback llama redirigir('login.html').

Si exito es false:

Llama mostrarAlerta('warning', mensaje) para mostrar advertencia.

PARA QUÉ
Centralizar la respuesta en la UI a la acción de registro: mostrar feedback y redirigir al login si fue exitoso. Espera que otro módulo dispare el evento resultadoRegistro con los detalles.
*/

const manejarResultadoLogin = (event) => {
    const { exito, mensaje, usuario, origen } = event.detail;
    
    if (exito) {
        guardarSesion(usuario, origen);
        mostrarAlerta('success', `${mensaje} Redirigiendo...`, () => {
            redirigir('../index.html');
        });
    } else {
        mostrarAlerta('danger', mensaje);
        limpiarPasswordInput();
    }
};
/* 
QUÉ
Manejador de evento para el resultado de un intento de login. Espera event.detail con { exito, mensaje, usuario, origen }.

CÓMO

Extrae exito, mensaje, usuario, origen de event.detail.

Si exito es true:

Llama guardarSesion(usuario, origen) para almacenar datos en sessionStorage.

Muestra una alerta de éxito con mostrarAlerta('success', ${mensaje} Redirigiendo..., callback) y en el callback redirige a ../index.html.

Si exito es false:

Muestra una alerta de error mostrarAlerta('danger', mensaje).

Llama limpiarPasswordInput() para vaciar y enfocar el campo de contraseña.

PARA QUÉ
Procesar el resultado del login: en caso de éxito persistir datos de sesión y llevar al usuario a la página principal; en caso de fallo, notificar y facilitar reintento.
*/

const manejarResultadoResetPassword = (event) => {
    const { exito, mensaje } = event.detail;
    
    if (exito) {
        ocultarFormulario('forgotPassword-form');
        mostrarAlerta('success', `${mensaje} Redirigiendo al login...`, () => {
            redirigir('login.html');
        });
    } else {
        mostrarAlerta('danger', mensaje);
    }
};

/* 
QUÉ
Manejador de evento para el resultado de una solicitud de restablecimiento de contraseña. event.detail con { exito, mensaje }.

CÓMO

Extrae exito y mensaje.

Si exito es true:

Oculta el formulario con ocultarFormulario('forgotPassword-form').

Muestra alerta de éxito e incluye callback que redirige a 'login.html'.

Si exito es false:

Muestra una alerta de tipo danger con el mensaje.

PARA QUÉ
Controlar la UX luego de pedir un reset de contraseña: ocultar formulario y guiar al usuario de vuelta al login si la petición fue aceptada; en caso contrario, mostrar error.
*/

export function registrarEventosGlobales() {
    const eventos = {
        'resultadoRegistro': manejarResultadoRegistro,
        'resultadoLogin': manejarResultadoLogin,
        'resultadoResetPassword': manejarResultadoResetPassword
    };

    Object.entries(eventos).forEach(([nombre, handler]) => {
        document.addEventListener(nombre, handler);
    });
}

/* 
QUÉ
Función exportada que registra los manejadores anteriores como listeners de eventos personalizados en document.

CÓMO

Define un objeto eventos que mapea nombres de eventos a sus handlers:

'resultadoRegistro' → manejarResultadoRegistro

'resultadoLogin' → manejarResultadoLogin

'resultadoResetPassword' → manejarResultadoResetPassword

Recorre Object.entries(eventos) y por cada par [nombre, handler] añade document.addEventListener(nombre, handler).

PARA QUÉ
Inicializar los listeners globales una sola vez desde el código que arranca la página (por ejemplo, un main.js o un init de la vista). Permite que otros módulos lancen new CustomEvent('resultadoLogin', { detail: {...} }) y estos handlers se encarguen de la UI y la sesión.
*/





/* NOTAS */
/* 
Qué es sessionStorage.setItem(key, value)

sessionStorage es un objeto del navegador (parte del Web Storage API) que permite guardar datos en el lado del cliente — es decir, dentro del navegador del usuario.
Los datos se almacenan solo durante la sesión actual, y se eliminan automáticamente cuando el usuario cierra la pestaña o ventana del navegador.
*/

/* 
// Guardar datos de sesión
sessionStorage.setItem('userEmail', 'maria@gmail.com');
sessionStorage.setItem('userName', 'María Ponce');

// Recuperar datos
const email = sessionStorage.getItem('userEmail'); // "maria@gmail.com"
const nombre = sessionStorage.getItem('userName'); // "María Ponce"

// Eliminar un dato
sessionStorage.removeItem('userEmail');

// Vaciar toda la sesión
sessionStorage.clear();
*/



/* QUÉ es un callback

Un callback es una función que se pasa como argumento a otra función para que se ejecute después de que ocurra algo — normalmente cuando la función principal termina su tarea o se cumple cierta condición.

👉 En este caso, el callback es la función que se pasa como tercer parámetro a mostrarAlerta.
mostrarAlerta('success', `${mensaje} Redirigiendo al login...`, () => {
    redirigir('login.html');
});

PARA QUÉ sirve el callback aquí

Permite encadenar acciones: primero mostrar una alerta (dar feedback al usuario) y después redirigirlo.

Evita que el código se ejecute demasiado rápido (por ejemplo, redirigir antes de que el usuario vea el mensaje).

Hace que mostrarAlerta sea más flexible: puede aceptar distintas acciones a ejecutar al finalizar (redirigir, limpiar formularios, cerrar modales, etc.).

 */



