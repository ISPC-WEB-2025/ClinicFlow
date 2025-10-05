// validation-utils.js - Utilidades generales de validación

export function validarCampo(input) {
    if (input.checkValidity()) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    } else if (input.value.length > 0) {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        mostrarMensajeError(input);
    } else {
        input.classList.remove('is-valid', 'is-invalid');
    }
}

export function mostrarMensajeError(input) {
    const feedbackDiv = input.nextElementSibling;
    if (!feedbackDiv?.classList.contains('invalid-feedback')) return;

    const mensajes = {
        valueMissing: 'Este campo es obligatorio',
        typeMismatch: input.type === 'email' ? 'Ingresá un email válido (ej: juanperez@example.com)' : 'Formato inválido',
        tooShort: `Mínimo ${input.minLength} caracteres`,
        tooLong: `Máximo ${input.maxLength} caracteres`,
        patternMismatch: obtenerMensajePattern(input),
        customError: input.validationMessage
    };

    for (const [tipo, mensaje] of Object.entries(mensajes)) {
        if (input.validity[tipo]) {
            feedbackDiv.textContent = mensaje;
            return;
        }
    }
}

function obtenerMensajePattern(input) {
    const patternMensajes = {
        'form-nombre': 'Solo se permiten letras',
        'form-apellido': 'Solo se permiten letras',
        'form-telefono': 'Formato de teléfono inválido',
        'form-nombre-completo': 'Ingresá tu nombre y apellido (ej: Juan Pérez)'
    };
    return patternMensajes[input.id] || 'Formato inválido';
}

export function focusPrimerCampoInvalido(form) {
    const primerCampoInvalido = form.querySelector('.form-control:invalid');
    if (primerCampoInvalido) {
        primerCampoInvalido.focus();
        primerCampoInvalido.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
}

export function resetearFormulario(form) {
    form.reset();
    form.classList.remove('was-validated');
    
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.classList.remove('is-valid', 'is-invalid');
    });
    
    const contador = document.getElementById('contador-caracteres');
    if (contador) contador.textContent = '0';
}

export function mostrarAlerta(tipo, mensaje, callback) {
    const container = document.getElementById('formsType');
    if (!container) return;

    const alertasExistentes = container.querySelectorAll(`.alert-${tipo}`);
    alertasExistentes.forEach(alerta => alerta.remove());

    const iconos = {
        success: 'fa-circle-check',
        danger: 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };

    const alertHtml = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            <i class="fa-solid ${iconos[tipo]}"></i> ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    container.insertAdjacentHTML('afterbegin', alertHtml);
    
    setTimeout(() => {
        const alert = container.querySelector(`.alert-${tipo}`);
        if (alert) alert.remove();
    }, 4000);

    if (callback) {
        setTimeout(callback, 2000);
    }
}