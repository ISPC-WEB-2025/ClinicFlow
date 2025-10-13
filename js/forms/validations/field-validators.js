const actualizarFeedback = (input, mensaje) => {
    const feedbackDiv = input.nextElementSibling;
    if (feedbackDiv?.classList.contains('invalid-feedback')) {
        feedbackDiv.textContent = mensaje;
    }
};

const establecerValidez = (input, esValido, mensaje = '') => {
    input.setCustomValidity(esValido ? '' : mensaje);
    actualizarFeedback(input, esValido ? '' : mensaje);
};

const obtenerColorContador = (length) => {
    if (length > 450) return '#dc3545';
    if (length > 400) return '#ffc107';
    return '#6c757d';
};

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

const validarLongitudTelefono = (longitudSinEspacios) => {
    if (longitudSinEspacios < 8) {
        return { valido: false, mensaje: 'El teléfono debe tener al menos 8 dígitos' };
    }
    
    if (longitudSinEspacios > 15) {
        return { valido: false, mensaje: 'El teléfono no puede tener más de 15 dígitos' };
    }
    
    return { valido: true, mensaje: '' };
};

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

const normalizarTexto = (input) => {
    input.value = input.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s{2,}/g, ' ');
};

const validarLongitudTexto = (input) => {
    const longitud = input.value.length;
    
    if (longitud >= 2 && longitud <= 50) {
        establecerValidez(input, true);
    } else if (longitud > 0 && longitud < 2) {
        establecerValidez(input, false, 'Debe tener al menos 2 caracteres');
    }
};

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