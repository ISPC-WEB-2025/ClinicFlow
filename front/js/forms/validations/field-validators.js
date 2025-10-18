const actualizarFeedback = (input, mensaje) => {
    const feedbackDiv = input.nextElementSibling;
    if (feedbackDiv?.classList.contains('invalid-feedback')) {
        feedbackDiv.textContent = mensaje;
    }
};

/* 
QUÉ

Actualiza el texto del mensaje de error (feedback visual) debajo de un campo del formulario.

CÓMO

Busca el elemento hermano inmediato siguiente del input (input.nextElementSibling), que debería ser un <div> con clase 'invalid-feedback'.

Si ese elemento existe y tiene la clase invalid-feedback, cambia su texto (textContent) con el mensaje recibido.

PARA QUÉ

Mostrar mensajes de error personalizados directamente debajo del campo cuando el usuario escribe datos incorrectos.
*/

const establecerValidez = (input, esValido, mensaje = '') => {
    input.setCustomValidity(esValido ? '' : mensaje);
    actualizarFeedback(input, esValido ? '' : mensaje);
};

/* 
QUÉ

Define si un input HTML es válido o no, y actualiza su mensaje de validación.

CÓMO

Usa input.setCustomValidity() para establecer el estado de validez del campo:

Si esValido es true, deja el campo sin error ('').

Si es false, asigna el mensaje como texto de error.

Llama a actualizarFeedback() para mostrar visualmente el mensaje.

PARA QUÉ

Permitir que los errores aparezcan integrados en el sistema de validación HTML5 y se sincronicen con el feedback visual personalizado.
*/

const obtenerColorContador = (length) => {
    if (length > 450) return '#dc3545';
    if (length > 400) return '#ffc107';
    return '#6c757d';
};

/* 

QUÉ

Devuelve un color según la cantidad de caracteres escritos en un campo.

CÓMO

Si length > 450: retorna rojo (#dc3545 → peligro).

Si length > 400: retorna amarillo (#ffc107 → advertencia).

Si es menor: gris (#6c757d → neutro).

PARA QUÉ

Indicar visualmente al usuario que se está acercando al límite de caracteres permitido (por ejemplo, en un textarea de mensaje).
*/

export function configurarContadorCaracteres() {
    const mensajeTextarea = document.getElementById('form-mensaje');
    const contadorCaracteres = document.getElementById('contador-caracteres');
    
    if (!mensajeTextarea || !contadorCaracteres) return;

    const actualizarContador = () => {
        const length = mensajeTextarea.value.length;
        contadorCaracteres.textContent = length;
        contadorCaracteres.style.color = obtenerColorContador(length);
    };

    mensajeTextarea.addEventListener('input', actualizarContador);
    actualizarContador();
}

/* 

QUÉ

Configura un contador en tiempo real para un campo de texto (por ejemplo, “mensaje”).

CÓMO

Obtiene el textarea (form-mensaje) y el contador (contador-caracteres).

Define una función interna actualizarContador():

Mide la longitud del texto.

Actualiza el número en pantalla.

Cambia el color usando obtenerColorContador().

Asocia actualizarContador al evento input.

Llama una vez a la función para inicializar.

PARA QUÉ

Dar retroalimentación inmediata sobre la cantidad de caracteres escritos, ayudando al usuario a no excederse.
*/

const validarRangoDNI = (input, valor) => {
    const longitud = input.value.length;
    
    if (longitud < 7) {
        return { valido: false, mensaje: 'El DNI debe tener entre 7 y 8 dígitos' };
    }
    
    if (valor < 1000000 || valor > 99999999) {
        return { 
            valido: false, 
            mensaje: 'Ingresá un DNI válido (entre 1.000.000 y 99.999.999)',
            customError: 'DNI fuera del rango válido'
        };
    }
    
    return { valido: true, mensaje: '' };
};

/* 
QUÉ

Verifica que el DNI tenga una longitud y un rango numérico válidos.

CÓMO

Si la longitud es menor a 7 → devuelve error.

Si el valor es menor que 1.000.000 o mayor que 99.999.999 → error de rango.

Si todo está correcto → devuelve { valido: true }.

PARA QUÉ

Evitar que el usuario ingrese DNIs demasiado cortos, largos o fuera del rango argentino real.

*/

export function configurarValidacionDNI() {
    const dniInput = document.getElementById('form-dni');
    if (!dniInput) return;

    dniInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^\d]/g, '').substring(0, 8);
        
        if (this.value.length === 0) return;
        
        const valor = parseInt(this.value);
        const resultado = validarRangoDNI(this, valor);
        
        establecerValidez(this, resultado.valido, resultado.customError || resultado.mensaje);
        if (!resultado.valido) {
            actualizarFeedback(this, resultado.mensaje);
        }
    });

    dniInput.addEventListener('blur', function() {
        if (this.value.length === 0) return;
        
        const valor = parseInt(this.value);
        const resultado = validarRangoDNI(this, valor);
        
        if (!resultado.valido) {
            this.classList.remove('is-valid');
            this.classList.add('is-invalid');
        }
    });
}

/* 
QUÉ

Configura la validación dinámica del campo de DNI.

CÓMO

Obtiene el input form-dni.

En el evento input:

Elimina caracteres no numéricos y limita a 8 dígitos.

Llama validarRangoDNI().

Usa establecerValidez() y actualizarFeedback() para mostrar errores.

En el evento blur:

Marca visualmente el campo como válido o inválido (is-valid / is-invalid).

PARA QUÉ

Asegurar que el DNI ingresado sea correcto en tiempo real y dar retroalimentación visual inmediata.
*/

const validarLongitudTelefono = (longitudSinEspacios) => {
    if (longitudSinEspacios < 8) {
        return { valido: false, mensaje: 'El teléfono debe tener al menos 8 dígitos' };
    }
    
    if (longitudSinEspacios > 15) {
        return { valido: false, mensaje: 'El teléfono no puede tener más de 15 dígitos' };
    }
    
    return { valido: true, mensaje: '' };
};

/* 

QUÉ

Valida la longitud de un número de teléfono.

CÓMO

Si tiene menos de 8 o más de 15 dígitos → retorna error.

Si no → lo marca como válido.

PARA QUÉ

Evitar teléfonos demasiado cortos o largos, manteniendo coherencia con formatos internacionales.
*/

export function configurarValidacionTelefono() {
    const telefonoInput = document.getElementById('form-telefono');
    if (!telefonoInput) return;

    telefonoInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^\d\s\-\+\(\)]/g, '').substring(0, 20);
        
        if (this.value.length === 0) return;
        
        const longitudSinEspacios = this.value.replace(/[\s\-\+\(\)]/g, '').length;
        const resultado = validarLongitudTelefono(longitudSinEspacios);
        
        establecerValidez(this, resultado.valido, resultado.mensaje);
    });

    telefonoInput.addEventListener('blur', function() {
        this.value = this.value.trim().replace(/\s{2,}/g, ' ');
    });
}

/* 
QUÉ

Aplica validación dinámica al campo teléfono.

CÓMO

Permite solo números y símbolos comunes de teléfono (+, -, (, )).

Calcula la longitud real sin espacios ni símbolos.

Valida con validarLongitudTelefono.

En blur, limpia espacios múltiples.

PARA QUÉ

Garantizar que el teléfono tenga una longitud válida y formato aceptable sin caracteres extraños.
*/

const normalizarTexto = (input) => {
    input.value = input.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s{2,}/g, ' ');
};
/* 

QUÉ

Limpia el texto de caracteres no alfabéticos y espacios repetidos.

CÓMO

Usa expresiones regulares para eliminar símbolos y números.

Reemplaza espacios múltiples por uno solo.

PARA QUÉ

Evitar errores de formato en nombres y apellidos (por ejemplo: “Ju@n” → “Jun”).
 */


const validarLongitudTexto = (input) => {
    const longitud = input.value.length;
    
    if (longitud >= 2 && longitud <= 50) {
        establecerValidez(input, true);
    } else if (longitud > 0 && longitud < 2) {
        establecerValidez(input, false, 'Debe tener al menos 2 caracteres');
    }
};

/* QUÉ

Valida que un texto (nombre/apellido) tenga entre 2 y 50 caracteres.

CÓMO

Si cumple → llama establecerValidez(input, true).

Si tiene menos de 2 caracteres → muestra mensaje de error.

PARA QUÉ

Asegurar que el usuario no deje campos de texto incompletos. */

export function configurarValidacionTexto() {
    const inputs = [
        document.getElementById('form-nombre'),
        document.getElementById('form-apellido')
    ].filter(Boolean);
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            normalizarTexto(this);
            validarLongitudTexto(this);
        });
    });
}
/* QUÉ

Activa la validación en tiempo real para los campos “nombre” y “apellido”.

CÓMO

Obtiene ambos inputs.

Escucha el evento input.

Llama a normalizarTexto y validarLongitudTexto cada vez que se escribe.

PARA QUÉ

Mantener nombres y apellidos con formato limpio y longitud mínima. */
const validarNombreCompleto = (input, feedbackDiv) => {
    const valor = input.value.trim();
    const palabras = valor.split(/\s+/);
    
    if (valor.length < 5) {
        if (input.value.length > 0) {
            establecerValidez(input, false, 'Debe tener al menos 5 caracteres');
        }
        return false;
    }
    
    if (palabras.length < 2) {
        const mensaje = 'Ingresá tu nombre y apellido (ej: Juan Pérez)';
        establecerValidez(input, false, 'Ingresá tu nombre y apellido separados por un espacio');
        if (feedbackDiv?.classList.contains('invalid-feedback')) {
            feedbackDiv.textContent = mensaje;
        }
        return false;
    }
    
    establecerValidez(input, true);
    return true;
};
/* QUÉ

Valida un campo de nombre completo (nombre + apellido).

CÓMO

Elimina espacios innecesarios y separa el texto en palabras.

Si tiene menos de 5 caracteres → error.

Si no tiene al menos dos palabras → muestra mensaje de ejemplo.

Si todo es correcto → marca el campo como válido.

PARA QUÉ

Evitar que se ingresen nombres incompletos (por ejemplo, “Juan” en vez de “Juan Pérez”). */


export function configurarValidacionNombreCompleto() {
    const nombreCompletoInput = document.getElementById('form-nombre-completo');
    if (!nombreCompletoInput) return;

    nombreCompletoInput.addEventListener('input', function() {
        normalizarTexto(this);
        
        const feedbackDiv = this.nextElementSibling;
        const esValido = validarNombreCompleto(this, feedbackDiv);
        
        if (this.value.length > 0) {
            this.classList.toggle('is-invalid', !esValido);
            this.classList.toggle('is-valid', esValido);
        }
    });
}
/* QUÉ

Aplica la validación anterior al campo “nombre completo”.

CÓMO

Escucha el evento input.

Llama a normalizarTexto y validarNombreCompleto.

Cambia dinámicamente las clases is-valid / is-invalid.

PARA QUÉ

Dar retroalimentación inmediata al usuario y guiarlo a ingresar nombre y apellido correctamente. */
export function configurarValidacionEmail() {
    const emailInput = document.getElementById('form-email');
    if (!emailInput) return;

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const mensajeError = 'Ingresá un email válido (ej: juanperez@example.com)';

    emailInput.addEventListener('input', function() {
        if (this.value.length === 0) return;
        
        const esValido = emailPattern.test(this.value);
        establecerValidez(this, esValido, mensajeError);
    });

    emailInput.addEventListener('blur', function() {
        this.value = this.value.trim().toLowerCase();
    });
}

/* QUÉ

Valida la estructura de un correo electrónico.

CÓMO

Define una expresión regular (emailPattern) que permite letras, números, guiones, puntos y arroba.

En input, verifica si el texto cumple el patrón.

En blur, limpia espacios y pasa todo a minúsculas.

PARA QUÉ

Asegurar que los correos ingresados tengan un formato estándar (por ejemplo: usuario@example.com). */



/* NOTAS */
/* Validar campos comunes (DNI, teléfono, nombre, email)	Usa eventos input y blur para reaccionar en tiempo real
Dar feedback visual	Usa clases is-valid / is-invalid y invalid-feedback
Centralizar la lógica de validación	Cada tipo de campo tiene su propia función “configurarValidacion…”
Reutilizar código	Funciones auxiliares como establecerValidez y actualizarFeedback evitan repetición */


/* Cada funcionalidad (por ejemplo, validar DNI, teléfono, nombre, email…) se define en una función exportada llamada configurarValidacionX(), donde X describe el campo o tipo de dato.

Por ejemplo:

configurarValidacionDNI()

configurarValidacionTelefono()

configurarValidacionTexto()

configurarValidacionEmail()

👉 Propósito:
Cada función configura los listeners (eventos como input o blur) y contiene la lógica específica para ese campo.

*/


/* 
Uso de funciones auxiliares reutilizables

En lugar de repetir la misma lógica en cada validación, se usan funciones auxiliares con nombres claros y consistentes:

Función	Propósito	Patrón de nombre
actualizarFeedback(input, mensaje)	Muestra o actualiza el texto del mensaje de error asociado al campo	verbo + sustantivo
establecerValidez(input, esValido, mensaje)	Define si un campo es válido y actualiza su mensaje de error	verbo + sustantivo
validarRangoDNI(), validarLongitudTelefono(), validarLongitudTexto(), validarNombreCompleto()	Contienen la lógica de validación pura (sin tocar el DOM)	verbo validar + qué se valida
normalizarTexto(input)	Limpia o ajusta el texto de entrada (sin validarlo)	verbo normalizar + tipo de dato */