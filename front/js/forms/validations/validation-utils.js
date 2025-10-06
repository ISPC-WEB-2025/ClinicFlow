const aplicarClasesValidacion = (input, esValido) => {
    input.classList.toggle('is-invalid', !esValido);
    input.classList.toggle('is-valid', esValido);
};

export function validarCampo(input) {
    if (input.checkValidity()) {
        aplicarClasesValidacion(input, true);
    } else if (input.value.length > 0) {
        aplicarClasesValidacion(input, false);
        mostrarMensajeError(input);
    } else {
        input.classList.remove('is-valid', 'is-invalid');
    }
}

const obtenerMensajeTypeMismatch = (input) => {
    return input.type === 'email' 
        ? 'Ingresá un email válido (ej: juanperez@example.com)' 
        : 'Formato inválido';
};

const obtenerMensajeRangeUnderflow = (input) => {
    return input.id === 'form-dni' 
        ? 'El DNI debe ser mayor o igual a 1.000.000' 
        : `El valor debe ser mayor o igual a ${input.min}`;
};

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
}

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
    const container = document.getElementById('formsType');
    if (!container) return;

    eliminarAlertasExistentes(container, tipo);
    
    const alertHtml = crearAlertaHTML(tipo, mensaje);
    container.insertAdjacentHTML('afterbegin', alertHtml);
    
    programarEliminacionAlerta(container, tipo);

    if (callback) {
        setTimeout(callback, 2000);
    }
}