// password-validator.js - Validador de contraseñas (SOLO para register)

export function configurarValidacionPassword() {
    const passwordInput = document.getElementById('form-password');
    const confirmInput = document.getElementById('form-confirm-password');
    
    if (!passwordInput) return;

    // Solo aplicar validación de seguridad si hay campo de confirmación (register)
    const esFormularioRegistro = confirmInput !== null;
    
    if (esFormularioRegistro) {
        crearIndicadorRequisitos(passwordInput);

        passwordInput.addEventListener('input', function() {
            validarSeguridadPassword(this);

            // Revalidar confirmación cuando cambia la password
            if (confirmInput && confirmInput.value.length > 0) {
                validarConfirmacionPassword(confirmInput);
            }
        });

        // Mostrar indicador solo al escribir
        passwordInput.addEventListener('input', function() {
            if (this.value.length > 0) {
                const indicador = this.closest('.form-outline').querySelector('.password-requirements');
                if (indicador) indicador.classList.add('show');
            } else {
                const indicador = this.closest('.form-outline').querySelector('.password-requirements');
                if (indicador) indicador.classList.remove('show');
            }
        });

        if (confirmInput) {
            confirmInput.addEventListener('input', () => {
                validarConfirmacionPassword(confirmInput);
            });
        }
    }
}

function validarSeguridadPassword(passwordInput) {
    const password = passwordInput.value;
    const feedbackDiv = passwordInput.nextElementSibling;
    
    const tieneMayuscula = /[A-Z]/.test(password);
    const tieneMinuscula = /[a-z]/.test(password);
    const tieneNumero = /[0-9]/.test(password);
    const tieneEspecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const longitudMinima = password.length >= 8;
    
    actualizarIndicadorRequisitos(passwordInput, {
        longitudMinima,
        tieneMayuscula,
        tieneMinuscula,
        tieneNumero,
        tieneEspecial
    });
    
    if (password.length > 0) {
        if (!longitudMinima) {
            passwordInput.setCustomValidity('La contraseña debe tener al menos 8 caracteres');
            if (feedbackDiv?.classList.contains('invalid-feedback')) {
                feedbackDiv.textContent = 'Mínimo 8 caracteres';
            }
        } else if (!tieneMayuscula) {
            passwordInput.setCustomValidity('Debe incluir al menos una letra mayúscula');
            if (feedbackDiv?.classList.contains('invalid-feedback')) {
                feedbackDiv.textContent = 'Incluí al menos una mayúscula (A-Z)';
            }
        } else if (!tieneMinuscula) {
            passwordInput.setCustomValidity('Debe incluir al menos una letra minúscula');
            if (feedbackDiv?.classList.contains('invalid-feedback')) {
                feedbackDiv.textContent = 'Incluí al menos una minúscula (a-z)';
            }
        } else if (!tieneNumero) {
            passwordInput.setCustomValidity('Debe incluir al menos un número');
            if (feedbackDiv?.classList.contains('invalid-feedback')) {
                feedbackDiv.textContent = 'Incluí al menos un número (0-9)';
            }
        } else if (!tieneEspecial) {
            passwordInput.setCustomValidity('Debe incluir al menos un carácter especial');
            if (feedbackDiv?.classList.contains('invalid-feedback')) {
                feedbackDiv.textContent = 'Incluí al menos un carácter especial (!@#$%...)';
            }
        } else {
            passwordInput.setCustomValidity('');
            if (feedbackDiv?.classList.contains('invalid-feedback')) {
                feedbackDiv.textContent = '';
            }
        }
    }
}

function crearIndicadorRequisitos(passwordInput) {
    const formOutline = passwordInput.closest('.form-outline');
    if (!formOutline) return;

    if (formOutline.querySelector('.password-requirements')) return;

    const indicadorHTML = `
        <div class="password-requirements">
            <ul>
                <li data-req="length">
                    <i class="fa-solid fa-circle-xmark"></i>
                    8+ caracteres
                </li>
                <li data-req="uppercase">
                    <i class="fa-solid fa-circle-xmark"></i>
                    1 mayúscula
                </li>
                <li data-req="lowercase">
                    <i class="fa-solid fa-circle-xmark"></i>
                    1 minúscula
                </li>
                <li data-req="number">
                    <i class="fa-solid fa-circle-xmark"></i>
                    1 número
                </li>
                <li data-req="special">
                    <i class="fa-solid fa-circle-xmark"></i>
                    1 especial
                </li>
            </ul>
        </div>
    `;

    const invalidFeedback = passwordInput.nextElementSibling;
    const toggleButton = formOutline.querySelector('.password-toggle-btn');
    
    if (toggleButton) {
        toggleButton.insertAdjacentHTML('afterend', indicadorHTML);
    } else if (invalidFeedback && invalidFeedback.classList.contains('invalid-feedback')) {
        invalidFeedback.insertAdjacentHTML('afterend', indicadorHTML);
    } else {
        formOutline.insertAdjacentHTML('beforeend', indicadorHTML);
    }
}

function actualizarIndicadorRequisitos(passwordInput, requisitos) {
    const formOutline = passwordInput.closest('.form-outline');
    if (!formOutline) return;

    const indicador = formOutline.querySelector('.password-requirements');
    if (!indicador) return;

    const items = {
        length: indicador.querySelector('[data-req="length"]'),
        uppercase: indicador.querySelector('[data-req="uppercase"]'),
        lowercase: indicador.querySelector('[data-req="lowercase"]'),
        number: indicador.querySelector('[data-req="number"]'),
        special: indicador.querySelector('[data-req="special"]')
    };

    actualizarItemRequisito(items.length, requisitos.longitudMinima);
    actualizarItemRequisito(items.uppercase, requisitos.tieneMayuscula);
    actualizarItemRequisito(items.lowercase, requisitos.tieneMinuscula);
    actualizarItemRequisito(items.number, requisitos.tieneNumero);
    actualizarItemRequisito(items.special, requisitos.tieneEspecial);
}

function actualizarItemRequisito(item, cumple) {
    if (!item) return;

    const icon = item.querySelector('i');
    
    if (cumple) {
        item.classList.remove('invalid');
        item.classList.add('valid');
        icon.classList.remove('fa-circle-xmark');
        icon.classList.add('fa-circle-check');
    } else {
        item.classList.remove('valid');
        item.classList.add('invalid');
        icon.classList.remove('fa-circle-check');
        icon.classList.add('fa-circle-xmark');
    }
}

export function validarConfirmacionPassword(confirmInput) {
    const passwordInput = document.getElementById('form-password');
    if (!passwordInput) return;

    // Buscar el feedback div correctamente (puede estar después del toggle button)
    let feedbackDiv = confirmInput.nextElementSibling;
    
    // Si el siguiente elemento es el botón toggle, buscar el siguiente
    if (feedbackDiv && feedbackDiv.classList.contains('password-toggle-btn')) {
        feedbackDiv = feedbackDiv.nextElementSibling;
    }
    
    // Si el campo está vacío, limpiar validación
    if (confirmInput.value.length === 0) {
        confirmInput.setCustomValidity('');
        confirmInput.classList.remove('is-valid', 'is-invalid');
        if (feedbackDiv?.classList.contains('invalid-feedback')) {
            feedbackDiv.textContent = '';
            feedbackDiv.style.display = 'none';
        }
        return;
    }

    // Validar si coinciden
    if (confirmInput.value !== passwordInput.value) {
        confirmInput.setCustomValidity('Las contraseñas no coinciden');
        confirmInput.classList.remove('is-valid');
        confirmInput.classList.add('is-invalid');
        
        if (feedbackDiv?.classList.contains('invalid-feedback')) {
            feedbackDiv.textContent = 'Las contraseñas no coinciden';
            feedbackDiv.style.display = 'block';
        }
    } else {
        confirmInput.setCustomValidity('');
        
        // Solo marcar como válido si la password también es válida
        if (passwordInput.checkValidity()) {
            confirmInput.classList.remove('is-invalid');
            confirmInput.classList.add('is-valid');
        }
        
        if (feedbackDiv?.classList.contains('invalid-feedback')) {
            feedbackDiv.textContent = '';
            feedbackDiv.style.display = 'none';
        }
    }
}