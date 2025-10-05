// field-validators.js - Validadores específicos para campos

export function configurarContadorCaracteres() {
    const mensajeTextarea = document.getElementById('form-mensaje');
    const contadorCaracteres = document.getElementById('contador-caracteres');
    
    if (!mensajeTextarea || !contadorCaracteres) return;

    const actualizarContador = () => {
        const length = mensajeTextarea.value.length;
        contadorCaracteres.textContent = length;
        
        if (length > 450) {
            contadorCaracteres.style.color = '#dc3545';
        } else if (length > 400) {
            contadorCaracteres.style.color = '#ffc107';
        } else {
            contadorCaracteres.style.color = '#6c757d';
        }
    };

    mensajeTextarea.addEventListener('input', actualizarContador);
    actualizarContador();
}

export function configurarValidacionTelefono() {
    const telefonoInput = document.getElementById('form-telefono');
    if (!telefonoInput) return;

    telefonoInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^\d\s\-\+\(\)]/g, '');
        if (this.value.length > 20) {
            this.value = this.value.substring(0, 20);
        }
    });
}

export function configurarValidacionTexto() {
    const nombreInput = document.getElementById('form-nombre');
    const apellidoInput = document.getElementById('form-apellido');
    
    function validarSoloTexto(input) {
        if (!input) return;
        
        input.addEventListener('input', function() {
            this.value = this.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, '');
            this.value = this.value.replace(/\s{2,}/g, ' ');
            
            if (this.value.length >= 2 && this.value.length <= 50) {
                this.setCustomValidity('');
            } else if (this.value.length > 0 && this.value.length < 2) {
                this.setCustomValidity('Debe tener al menos 2 caracteres');
            }
        });
    }
    
    validarSoloTexto(nombreInput);
    validarSoloTexto(apellidoInput);
}

export function configurarValidacionNombreCompleto() {
    const nombreCompletoInput = document.getElementById('form-nombre-completo');
    if (!nombreCompletoInput) return;

    nombreCompletoInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, '');
        this.value = this.value.replace(/\s{2,}/g, ' ');
        
        const palabras = this.value.trim().split(/\s+/);
        const feedbackDiv = this.nextElementSibling;
        
        if (this.value.trim().length >= 5) {
            if (palabras.length < 2) {
                this.setCustomValidity('Ingresá tu nombre y apellido separados por un espacio');
                if (feedbackDiv?.classList.contains('invalid-feedback')) {
                    feedbackDiv.textContent = 'Ingresá tu nombre y apellido (ej: Juan Pérez)';
                }
            } else {
                this.setCustomValidity('');
                if (feedbackDiv?.classList.contains('invalid-feedback')) {
                    feedbackDiv.textContent = '';
                }
            }
        } else if (this.value.length > 0) {
            this.setCustomValidity('Debe tener al menos 5 caracteres');
        }
        
        // Validar en tiempo real
        if (this.value.length > 0) {
            if (this.checkValidity()) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
                this.classList.add('is-invalid');
            }
        }
    });
}

export function configurarValidacionEmail() {
    const emailInput = document.getElementById('form-email');
    if (!emailInput) return;

    emailInput.addEventListener('input', function() {
        const emailPattern = /^[a-zA-Z]{2,}[a-zA-Z0-9._-]*@[a-zA-Z]{2,}[a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
        const feedbackDiv = this.nextElementSibling;
        const mensajeError = 'Ingresá un email válido (ej: juanperez@example.com)';
        
        if (this.value.length > 0) {
            if (!emailPattern.test(this.value)) {
                this.setCustomValidity(mensajeError);
                if (feedbackDiv?.classList.contains('invalid-feedback')) {
                    feedbackDiv.textContent = mensajeError;
                }
            } else {
                this.setCustomValidity('');
                if (feedbackDiv?.classList.contains('invalid-feedback')) {
                    feedbackDiv.textContent = '';
                }
            }
        }
    });

    emailInput.addEventListener('blur', function() {
        this.value = this.value.trim().toLowerCase();
    });
}