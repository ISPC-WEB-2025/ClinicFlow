/* Este archivo define funciones puramente dedicadas a la validación visual y lógica de contraseñas.
No maneja formularios completos, ni eventos globales, ni feedbacks externos: solo se ocupa de los inputs de tipo “password”. */

/* Hace lo siguiente:

Obtiene los inputs relevantes (form-password y form-confirm-password).

Detecta si se trata de un formulario de registro (porque el de login no requiere confirmación).

Si es registro:

Crea dinámicamente el panel de requisitos (crearIndicadorRequisitos()).

Agrega listeners de input para validar en tiempo real:

La seguridad (validarSeguridadPassword).

La coincidencia (validarConfirmacionPassword).

👉 Esto significa que la validación ocurre a medida que el usuario escribe. */
export function configurarValidacionPassword() {
    const passwordInput = document.getElementById('form-password');
    const confirmInput = document.getElementById('form-confirm-password');
    
    if (!passwordInput) return;

    const esFormularioRegistro = confirmInput !== null;
    
    if (esFormularioRegistro) {
        crearIndicadorRequisitos(passwordInput);

        passwordInput.addEventListener('input', function() {
            validarSeguridadPassword(this);
            toggleIndicadorRequisitos(this);

            if (confirmInput?.value.length > 0) {
                validarConfirmacionPassword(confirmInput);
            }
        });

        confirmInput?.addEventListener('input', () => {
            validarConfirmacionPassword(confirmInput);
        });
    }
}

function validarSeguridadPassword(passwordInput) {
    const password = passwordInput.value;
    const feedbackDiv = passwordInput.nextElementSibling;
    
    const requisitos = {
        longitudMinima: password.length >= 8,
        tieneMayuscula: /[A-Z]/.test(password),
        tieneMinuscula: /[a-z]/.test(password),
        tieneNumero: /[0-9]/.test(password),
        tieneEspecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    actualizarIndicadorRequisitos(passwordInput, requisitos);
    
    if (password.length === 0) return;

    const validaciones = [
        { condicion: !requisitos.longitudMinima, mensaje: 'Mínimo 8 caracteres', customError: 'La contraseña debe tener al menos 8 caracteres' },
        { condicion: !requisitos.tieneMayuscula, mensaje: 'Incluí al menos una mayúscula (A-Z)', customError: 'Debe incluir al menos una letra mayúscula' },
        { condicion: !requisitos.tieneMinuscula, mensaje: 'Incluí al menos una minúscula (a-z)', customError: 'Debe incluir al menos una letra minúscula' },
        { condicion: !requisitos.tieneNumero, mensaje: 'Incluí al menos un número (0-9)', customError: 'Debe incluir al menos un número' },
        { condicion: !requisitos.tieneEspecial, mensaje: 'Incluí al menos un carácter especial (!@#$%...)', customError: 'Debe incluir al menos un carácter especial' }
    ];

    const validacionFallida = validaciones.find(v => v.condicion);

    if (validacionFallida) {
        passwordInput.setCustomValidity(validacionFallida.customError);
        if (feedbackDiv?.classList.contains('invalid-feedback')) {
            feedbackDiv.textContent = validacionFallida.mensaje;
        }
    } else {
        passwordInput.setCustomValidity('');
        if (feedbackDiv?.classList.contains('invalid-feedback')) {
            feedbackDiv.textContent = '';
        }
    }
}

function toggleIndicadorRequisitos(passwordInput) {
    const indicador = passwordInput.closest('.form-outline')?.querySelector('.password-requirements');
    if (!indicador) return;

    indicador.classList.toggle('show', passwordInput.value.length > 0);
}

function crearIndicadorRequisitos(passwordInput) {
    const formOutline = passwordInput.closest('.form-outline');
    if (!formOutline || formOutline.querySelector('.password-requirements')) return;

    const requisitos = [
        { key: 'length', text: '8+ caracteres' },
        { key: 'uppercase', text: '1 mayúscula' },
        { key: 'lowercase', text: '1 minúscula' },
        { key: 'number', text: '1 número' },
        { key: 'special', text: '1 especial' }
    ];

    const items = requisitos.map(req => `
        <li data-req="${req.key}">
            <i class="fa-solid fa-circle-xmark"></i>
            ${req.text}
        </li>
    `).join('');

    const indicadorHTML = `
        <div class="password-requirements">
            <ul>${items}</ul>
        </div>
    `;

    const toggleButton = formOutline.querySelector('.password-toggle-btn');
    const invalidFeedback = passwordInput.nextElementSibling;
    
    if (toggleButton) {
        toggleButton.insertAdjacentHTML('afterend', indicadorHTML);
    } else if (invalidFeedback?.classList.contains('invalid-feedback')) {
        invalidFeedback.insertAdjacentHTML('afterend', indicadorHTML);
    } else {
        formOutline.insertAdjacentHTML('beforeend', indicadorHTML);
    }
}

function actualizarIndicadorRequisitos(passwordInput, requisitos) {
    const indicador = passwordInput.closest('.form-outline')?.querySelector('.password-requirements');
    if (!indicador) return;

    const mapeo = {
        length: requisitos.longitudMinima,
        uppercase: requisitos.tieneMayuscula,
        lowercase: requisitos.tieneMinuscula,
        number: requisitos.tieneNumero,
        special: requisitos.tieneEspecial
    };

    Object.entries(mapeo).forEach(([key, cumple]) => {
        const item = indicador.querySelector(`[data-req="${key}"]`);
        actualizarItemRequisito(item, cumple);
    });
}

function actualizarItemRequisito(item, cumple) {
    if (!item) return;

    const icon = item.querySelector('i');
    
    item.classList.toggle('valid', cumple);
    item.classList.toggle('invalid', !cumple);
    
    icon.classList.toggle('fa-circle-check', cumple);
    icon.classList.toggle('fa-circle-xmark', !cumple);
}

export function validarConfirmacionPassword(confirmInput) {
    const passwordInput = document.getElementById('form-password');
    if (!passwordInput) return;

    let feedbackDiv = confirmInput.nextElementSibling;
    
    if (feedbackDiv?.classList.contains('password-toggle-btn')) {
        feedbackDiv = feedbackDiv.nextElementSibling;
    }
    
    if (confirmInput.value.length === 0) {
        confirmInput.setCustomValidity('');
        confirmInput.classList.remove('is-valid', 'is-invalid');
        if (feedbackDiv?.classList.contains('invalid-feedback')) {
            feedbackDiv.textContent = '';
            feedbackDiv.style.display = 'none';
        }
        return;
    }

    const passwordsCoinciden = confirmInput.value === passwordInput.value;

    if (!passwordsCoinciden) {
        confirmInput.setCustomValidity('Las contraseñas no coinciden');
        confirmInput.classList.remove('is-valid');
        confirmInput.classList.add('is-invalid');
        
        if (feedbackDiv?.classList.contains('invalid-feedback')) {
            feedbackDiv.textContent = 'Las contraseñas no coinciden';
            feedbackDiv.style.display = 'block';
        }
    } else {
        confirmInput.setCustomValidity('');
        
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