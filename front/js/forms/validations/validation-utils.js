/* utilidades de validación y feedback visual del sistema de formularios.
Cumple un rol clave porque centraliza todas las funciones comunes de validación, mensajes de error, reseteo de formularios y alertas.
 */

const aplicarClasesValidacion = (input, esValido) => {
    input.classList.toggle('is-invalid', !esValido);
    input.classList.toggle('is-valid', esValido);
};/* Propósito: alternar las clases CSS de validación de Bootstrap (is-valid / is-invalid) según el resultado de la validación.
🔹 Ventaja: mantiene coherencia visual y reutiliza una misma función para todos los campos. */

export function validarCampo(input) {
    if (input.checkValidity()) {
        aplicarClasesValidacion(input, true);
    } else if (input.value.length > 0) {
        aplicarClasesValidacion(input, false);
        mostrarMensajeError(input);
    } else {
        input.classList.remove('is-valid', 'is-invalid');
    }
}/* 🔹 Qué hace:

Usa la validación nativa del navegador (checkValidity()).

Si el campo es válido → marca con verde.

Si es inválido y tiene contenido → marca con rojo y muestra el mensaje de error.

Si está vacío → limpia las clases.

🔹 Ventaja:
Funciona con cualquier tipo de input (text, email, number, etc.) y se integra fácilmente con las validaciones personalizadas. */

const obtenerMensajeTypeMismatch = (input) => {
    return input.type === 'email' 
        ? 'Ingresá un email válido (ej: juanperez@example.com)' 
        : 'Formato inválido';
};/* 📘 Cómo funciona:

Usa objetos auxiliares (obtenerMensajeTypeMismatch, obtenerMensajeRangeUnderflow, etc.) para construir el texto adecuado según el tipo de campo o su id.

Permite que cada input tenga mensajes contextualizados (por ejemplo, el DNI o el teléfono tienen textos distintos). */

const obtenerMensajeRangeUnderflow = (input) => {
    return input.id === 'form-dni' 
        ? 'El DNI debe ser mayor o igual a 1.000.000' 
        : `El valor debe ser mayor o igual a ${input.min}`;
};/* 👉 Así, si el pattern de un input no se cumple, se muestra un mensaje claro, no el genérico del navegador. */

const obtenerMensajeRangeOverflow = (input) => {
    return input.id === 'form-dni' 
        ? 'El DNI debe ser menor o igual a 99.999.999' 
        : `El valor debe ser menor o igual a ${input.max}`;
};

const obtenerMensajePattern = (input) => {
    const patternMensajes = {
        'form-nombre': 'Solo se permiten letras',
        'form-apellido': 'Solo se permiten letras',
        'form-telefono': 'El teléfono debe tener entre 8 y 20 caracteres',
        'form-dni': 'Ingresá un DNI válido (entre 1.000.000 y 99.999.999)',
        'form-nombre-completo': 'Ingresá tu nombre y apellido (ej: Juan Pérez)'
    };
    return patternMensajes[input.id] || 'Formato inválido';
};

const obtenerMensajesError = (input) => ({
    valueMissing: 'Este campo es obligatorio',
    typeMismatch: obtenerMensajeTypeMismatch(input),
    tooShort: `Mínimo ${input.minLength} caracteres`,
    tooLong: `Máximo ${input.maxLength} caracteres`,
    rangeUnderflow: obtenerMensajeRangeUnderflow(input),
    rangeOverflow: obtenerMensajeRangeOverflow(input),
    patternMismatch: obtenerMensajePattern(input),
    customError: input.validationMessage
});

export function mostrarMensajeError(input) {
    const feedbackDiv = input.nextElementSibling;
    if (!feedbackDiv?.classList.contains('invalid-feedback')) return;

    const mensajes = obtenerMensajesError(input);

    for (const [tipo, mensaje] of Object.entries(mensajes)) {
        if (input.validity[tipo]) {
            feedbackDiv.textContent = mensaje;
            return;
        }
    }
}

export function focusPrimerCampoInvalido(form) {
    const primerCampoInvalido = form.querySelector('.form-control:invalid');
    if (!primerCampoInvalido) return;

    primerCampoInvalido.focus();
    primerCampoInvalido.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

const limpiarValidacionInputs = (inputs) => {
    inputs.forEach(input => {
        input.classList.remove('is-valid', 'is-invalid');
    });
};

const resetearContador = () => {
    const contador = document.getElementById('contador-caracteres');
    if (contador) contador.textContent = '0';
};

export function resetearFormulario(form) {
    form.reset();
    form.classList.remove('was-validated');
    
    const inputs = form.querySelectorAll('input, textarea, select');
    limpiarValidacionInputs(inputs);
    resetearContador();
}/* 🔹 Qué hace:

Limpia el formulario (reset()).

Borra las clases de validación (is-valid, is-invalid).

Reinicia el contador de caracteres (si existe).

🔹 Ventaja:
Permite reiniciar un formulario visual y lógicamente con una sola llamada — ideal tras un envío exitoso. */

const ICONOS_ALERTA = {
    success: 'fa-circle-check',
    danger: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
};

const eliminarAlertasExistentes = (container, tipo) => {
    container.querySelectorAll(`.alert-${tipo}`).forEach(alerta => alerta.remove());
};

const crearAlertaHTML = (tipo, mensaje) => `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
        <i class="fa-solid ${ICONOS_ALERTA[tipo]}"></i> ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
`;

const programarEliminacionAlerta = (container, tipo) => {
    setTimeout(() => {
        const alert = container.querySelector(`.alert-${tipo}`);
        if (alert) alert.remove();
    }, 4000);
};

export function mostrarAlerta(tipo, mensaje, callback) {
    const container = document.querySelector('.needs-validation') || document.querySelector('main');
    if (!container) return;

    eliminarAlertasExistentes(container, tipo);
    
    const alertHtml = crearAlertaHTML(tipo, mensaje);
    container.insertAdjacentHTML('afterbegin', alertHtml);
    
    programarEliminacionAlerta(container, tipo);

    if (callback) {
        setTimeout(callback, 500);
    }/* 🔹 Qué hace:

Inserta una alerta Bootstrap en la parte superior del formulario o <main>.

Elimina cualquier alerta anterior del mismo tipo.

La cierra automáticamente luego de 4 segundos.

Si se pasa un callback, lo ejecuta después (por ejemplo, redirigir al login).

🔹 Ventaja:

Feedback visual estandarizado.

Control de duplicación y limpieza automática.

Integración flexible con acciones posteriores. */
}