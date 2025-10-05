// form-validations.js - Sistema centralizado de validaciones
// ACTUALIZADO: Validación de email mejorada + password segura + reset password

(function() {
    let USUARIOS_VALIDOS = [];
    let validacionesInicializadas = false;
    let eventosRegistrados = false;

    // ===== CARGAR USUARIOS DESDE JSON =====
    async function cargarUsuarios() {
        try {
            const response = await fetch('./data/users.json');
            if (!response.ok) {
                throw new Error('No se pudo cargar users.json');
            }
            const data = await response.json();
            USUARIOS_VALIDOS = data.usuarios || [];
            console.log('Usuarios del JSON cargados:', USUARIOS_VALIDOS.length);
            
            document.dispatchEvent(new CustomEvent('usuariosJSONCargados', {
                detail: { usuarios: USUARIOS_VALIDOS }
            }));
            
            return true;
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            USUARIOS_VALIDOS = [];
            return false;
        }
    }

    // ===== REGISTRAR EVENTOS UNA SOLA VEZ =====
    function registrarEventosGlobales() {
        if (eventosRegistrados) {
            console.log('Eventos ya registrados, omitiendo...');
            return;
        }
        
        eventosRegistrados = true;

        // Resultado del registro
        document.addEventListener('resultadoRegistro', (event) => {
            const resultado = event.detail;
            
            if (resultado.exito) {
                mostrarAlerta('success', resultado.mensaje + ' Redirigiendo al login...', () => {
                    window.location.href = 'login.html';
                });
            } else {
                mostrarAlerta('warning', resultado.mensaje);
            }
        });

        // Resultado del login
        document.addEventListener('resultadoLogin', (event) => {
            const resultado = event.detail;
            
            if (resultado.exito) {
                sessionStorage.setItem('userEmail', resultado.usuario.email);
                sessionStorage.setItem('userName', resultado.usuario.nombre || 'Usuario');
                sessionStorage.setItem('userOrigen', resultado.origen);
                
                mostrarAlerta('success', `${resultado.mensaje} Redirigiendo...`, () => {
                    window.location.href = 'index.html';
                });
            } else {
                mostrarAlerta('danger', resultado.mensaje);
                const passwordInput = document.getElementById('form-password');
                if (passwordInput) {
                    passwordInput.value = '';
                    passwordInput.focus();
                }
            }
        });

        // Resultado del reset de password
        document.addEventListener('resultadoResetPassword', (event) => {
            const resultado = event.detail;
            
            if (resultado.exito) {
                mostrarAlerta('success', resultado.mensaje);
                const form = document.getElementById('forgotPassword-form');
                if (form) resetearFormulario(form);
            } else {
                mostrarAlerta('danger', resultado.mensaje);
            }
        });

        console.log('Eventos globales registrados');
    }

    // ===== INICIALIZAR VALIDACIONES =====
    async function inicializarValidaciones() {
        if (validacionesInicializadas) return;
        
        const forms = document.querySelectorAll('.needs-validation');
        if (forms.length === 0) return;

        validacionesInicializadas = true;

        configurarContadorCaracteres();
        configurarValidacionTelefono();
        configurarValidacionTexto();
        configurarValidacionNombreCompleto();
        configurarValidacionEmail();
        configurarValidacionPassword();
        configurarValidacionTiempoReal(forms);
        configurarSubmitFormularios(forms);

        console.log('Validaciones cargadas correctamente');
    }

    // ===== EVENTOS =====
    document.addEventListener('formRendered', async () => {
        await inicializarValidaciones();
    });

    document.addEventListener('DOMContentLoaded', async () => {
        await cargarUsuarios();
        registrarEventosGlobales();
        
        setTimeout(async () => {
            await inicializarValidaciones();
        }, 300);
    });

    // ===== VALIDACIÓN DE NOMBRE COMPLETO =====
    function configurarValidacionNombreCompleto() {
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
        });

        nombreCompletoInput.addEventListener('blur', function() {
            this.value = this.value.trim();
            
            const palabras = this.value.split(/\s+/).filter(p => p.length > 0);
            const feedbackDiv = this.nextElementSibling;
            
            if (this.value.length > 0 && palabras.length < 2) {
                this.setCustomValidity('Ingresá tu nombre y apellido separados por un espacio');
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
                
                if (feedbackDiv?.classList.contains('invalid-feedback')) {
                    feedbackDiv.textContent = 'Ingresá tu nombre y apellido (ej: Juan Pérez)';
                }
            }
        });
    }

    // ===== CONTADOR DE CARACTERES =====
    function configurarContadorCaracteres() {
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

    // ===== VALIDACIÓN DE TELÉFONO =====
    function configurarValidacionTelefono() {
        const telefonoInput = document.getElementById('form-telefono');
        if (!telefonoInput) return;

        telefonoInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^\d\s\-\+\(\)]/g, '');
            if (this.value.length > 20) {
                this.value = this.value.substring(0, 20);
            }
        });
    }

    // ===== VALIDACIÓN DE NOMBRE Y APELLIDO (CONTACTO) =====
    function configurarValidacionTexto() {
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

    // ===== VALIDACIÓN DE EMAIL MEJORADA =====
    function configurarValidacionEmail() {
        const emailInput = document.getElementById('form-email');
        if (!emailInput) return;

        emailInput.addEventListener('input', function() {
            // Patrón mejorado: mínimo 2 letras antes del @, @ obligatorio, 
            // mínimo 2 letras después, punto obligatorio, mínimo 2 letras después del punto
            const emailPattern = /^[a-zA-Z]{2,}[a-zA-Z0-9._-]*@[a-zA-Z]{2,}[a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
            const feedbackDiv = this.nextElementSibling;
            
            if (this.value.length > 0) {
                if (!emailPattern.test(this.value)) {
                    this.setCustomValidity('Formato inválido (ej: usuario@dominio.com)');
                    if (feedbackDiv?.classList.contains('invalid-feedback')) {
                        feedbackDiv.textContent = 'Formato inválido (ej: usuario@dominio.com)';
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

    // ===== VALIDACIÓN DE PASSWORD SEGURA =====
    function configurarValidacionPassword() {
        const passwordInput = document.getElementById('form-password');
        const confirmInput = document.getElementById('form-confirm-password');
        
        if (!passwordInput) return;

        // Crear indicador de requisitos
        crearIndicadorRequisitos(passwordInput);

        // Validación de seguridad de contraseña
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const feedbackDiv = this.nextElementSibling;
            
            // Requisitos
            const tieneMayuscula = /[A-Z]/.test(password);
            const tieneMinuscula = /[a-z]/.test(password);
            const tieneNumero = /[0-9]/.test(password);
            const tieneEspecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
            const longitudMinima = password.length >= 8;
            
            // Actualizar indicador visual
            actualizarIndicadorRequisitos(passwordInput, {
                longitudMinima,
                tieneMayuscula,
                tieneMinuscula,
                tieneNumero,
                tieneEspecial
            });
            
            if (password.length > 0) {
                if (!longitudMinima) {
                    this.setCustomValidity('La contraseña debe tener al menos 8 caracteres');
                    if (feedbackDiv?.classList.contains('invalid-feedback')) {
                        feedbackDiv.textContent = 'Mínimo 8 caracteres';
                    }
                } else if (!tieneMayuscula) {
                    this.setCustomValidity('Debe incluir al menos una letra mayúscula');
                    if (feedbackDiv?.classList.contains('invalid-feedback')) {
                        feedbackDiv.textContent = 'Incluí al menos una mayúscula (A-Z)';
                    }
                } else if (!tieneMinuscula) {
                    this.setCustomValidity('Debe incluir al menos una letra minúscula');
                    if (feedbackDiv?.classList.contains('invalid-feedback')) {
                        feedbackDiv.textContent = 'Incluí al menos una minúscula (a-z)';
                    }
                } else if (!tieneNumero) {
                    this.setCustomValidity('Debe incluir al menos un número');
                    if (feedbackDiv?.classList.contains('invalid-feedback')) {
                        feedbackDiv.textContent = 'Incluí al menos un número (0-9)';
                    }
                } else if (!tieneEspecial) {
                    this.setCustomValidity('Debe incluir al menos un carácter especial');
                    if (feedbackDiv?.classList.contains('invalid-feedback')) {
                        feedbackDiv.textContent = 'Incluí al menos un carácter especial (!@#$%...)';
                    }
                } else {
                    this.setCustomValidity('');
                    if (feedbackDiv?.classList.contains('invalid-feedback')) {
                        feedbackDiv.textContent = '';
                    }
                }
            }

            if (confirmInput && confirmInput.value.length > 0) {
                validarConfirmacionPassword(confirmInput);
            }
        });

        // Mostrar/ocultar indicador en focus/blur
        passwordInput.addEventListener('focus', function() {
            const indicador = this.closest('.form-outline').querySelector('.password-requirements');
            if (indicador) indicador.classList.add('show');
        });

        passwordInput.addEventListener('blur', function() {
            const indicador = this.closest('.form-outline').querySelector('.password-requirements');
            if (indicador) {
                setTimeout(() => {
                    indicador.classList.remove('show');
                }, 200);
            }
        });

        if (confirmInput) {
            confirmInput.addEventListener('input', () => {
                validarConfirmacionPassword(confirmInput);
            });
        }
    }

    // ===== CREAR INDICADOR DE REQUISITOS =====
    function crearIndicadorRequisitos(passwordInput) {
        const formOutline = passwordInput.closest('.form-outline');
        if (!formOutline) return;

        // Verificar si ya existe
        if (formOutline.querySelector('.password-requirements')) return;

        const indicadorHTML = `
            <div class="password-requirements">
                <h6><i class="fa-solid fa-shield-halved"></i> Requisitos de contraseña:</h6>
                <ul>
                    <li data-req="length">
                        <i class="fa-solid fa-circle-xmark"></i>
                        Mínimo 8 caracteres
                    </li>
                    <li data-req="uppercase">
                        <i class="fa-solid fa-circle-xmark"></i>
                        Al menos una mayúscula (A-Z)
                    </li>
                    <li data-req="lowercase">
                        <i class="fa-solid fa-circle-xmark"></i>
                        Al menos una minúscula (a-z)
                    </li>
                    <li data-req="number">
                        <i class="fa-solid fa-circle-xmark"></i>
                        Al menos un número (0-9)
                    </li>
                    <li data-req="special">
                        <i class="fa-solid fa-circle-xmark"></i>
                        Al menos un carácter especial (!@#$%...)
                    </li>
                </ul>
            </div>
        `;

        // Buscar el invalid-feedback o el botón toggle de password
        const invalidFeedback = passwordInput.nextElementSibling;
        const toggleButton = formOutline.querySelector('.password-toggle-btn');
        
        if (toggleButton) {
            // Si hay botón toggle, insertar después del toggle
            toggleButton.insertAdjacentHTML('afterend', indicadorHTML);
        } else if (invalidFeedback && invalidFeedback.classList.contains('invalid-feedback')) {
            // Si hay invalid-feedback, insertar después de él
            invalidFeedback.insertAdjacentHTML('afterend', indicadorHTML);
        } else {
            // Si no hay ninguno, insertar al final del form-outline
            formOutline.insertAdjacentHTML('beforeend', indicadorHTML);
        }
    }

    // ===== ACTUALIZAR INDICADOR DE REQUISITOS =====
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

        // Actualizar cada requisito
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

    // ===== VALIDAR CONFIRMACIÓN DE PASSWORD =====
    function validarConfirmacionPassword(confirmInput) {
        const passwordInput = document.getElementById('form-password');
        const feedbackDiv = confirmInput.nextElementSibling;
        
        if (!passwordInput) return;

        if (confirmInput.value !== passwordInput.value) {
            confirmInput.setCustomValidity('Las contraseñas no coinciden');
            if (feedbackDiv?.classList.contains('invalid-feedback')) {
                feedbackDiv.textContent = 'Las contraseñas no coinciden';
            }
        } else {
            confirmInput.setCustomValidity('');
            if (feedbackDiv?.classList.contains('invalid-feedback')) {
                feedbackDiv.textContent = '';
            }
        }
    }

    // ===== VALIDACIÓN EN TIEMPO REAL =====
    function configurarValidacionTiempoReal(forms) {
        Array.from(forms).forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            Array.from(inputs).forEach(input => {
                input.addEventListener('blur', function() {
                    if (this.type === 'text' || this.type === 'email' || this.tagName === 'TEXTAREA') {
                        this.value = this.value.trim();
                    }

                    if (this.id === 'form-confirm-password') {
                        validarConfirmacionPassword(this);
                    }

                    validarCampo(this);
                });
                
                input.addEventListener('input', function() {
                    if (form.classList.contains('was-validated')) {
                        if (this.id === 'form-confirm-password') {
                            validarConfirmacionPassword(this);
                        }
                        validarCampo(this);
                    }
                });
            });
        });
    }

    // ===== VALIDAR CAMPO INDIVIDUAL =====
    function validarCampo(input) {
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

    // ===== MOSTRAR MENSAJES DE ERROR =====
    function mostrarMensajeError(input) {
        const feedbackDiv = input.nextElementSibling;
        if (!feedbackDiv?.classList.contains('invalid-feedback')) return;

        const mensajes = {
            valueMissing: 'Este campo es obligatorio',
            typeMismatch: input.type === 'email' ? 'Ingresá un email válido' : 'Formato inválido',
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

    // ===== SUBMIT DE FORMULARIOS =====
    function configurarSubmitFormularios(forms) {
        Array.from(forms).forEach(form => {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                event.stopPropagation();

                const confirmPassword = document.getElementById('form-confirm-password');
                if (confirmPassword) {
                    validarConfirmacionPassword(confirmPassword);
                }

                if (form.checkValidity()) {
                    const formId = form.id;
                    
                    if (formId === 'login-form') {
                        manejarLogin(form);
                    } else if (formId === 'register-form') {
                        manejarRegistro(form);
                    } else if (formId === 'contact-form') {
                        manejarContacto(form);
                    } else if (formId === 'forgotPassword-form') {
                        manejarResetPassword(form);
                    }
                } else {
                    form.classList.add('was-validated');
                    focusPrimerCampoInvalido(form);
                }
            });
        });
    }

    // ===== FOCUS EN PRIMER CAMPO INVÁLIDO =====
    function focusPrimerCampoInvalido(form) {
        const primerCampoInvalido = form.querySelector('.form-control:invalid');
        if (primerCampoInvalido) {
            primerCampoInvalido.focus();
            primerCampoInvalido.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }

    // ===== MANEJO DE LOGIN =====
    function manejarLogin(form) {
        const emailInput = document.getElementById('form-email');
        const passwordInput = document.getElementById('form-password');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        document.dispatchEvent(new CustomEvent('intentoLogin', {
            detail: { email, password }
        }));
    }

    // ===== MANEJO DE REGISTRO =====
    function manejarRegistro(form) {
        const nombreCompletoInput = document.getElementById('form-nombre-completo');
        const emailInput = document.getElementById('form-email');
        const passwordInput = document.getElementById('form-password');

        const nombreCompleto = nombreCompletoInput.value.trim();
        const palabras = nombreCompleto.split(/\s+/);
        
        const nombre = palabras[0];
        const apellido = palabras.slice(1).join(' ');

        const datosUsuario = {
            nombre: nombre,
            apellido: apellido,
            nombreCompleto: nombreCompleto,
            email: emailInput.value.trim().toLowerCase(),
            password: passwordInput.value
        };

        document.dispatchEvent(new CustomEvent('intentoRegistro', {
            detail: datosUsuario
        }));
    }

    // ===== MANEJO DE CONTACTO =====
    function manejarContacto(form) {
        const nombreInput = document.getElementById('form-nombre');
        
        mostrarAlerta(
            'success',
            `¡Gracias por tu consulta, ${nombreInput.value}! Te contactaremos pronto.`
        );
        
        resetearFormulario(form);
    }

    // ===== MANEJO DE RESET PASSWORD =====
    function manejarResetPassword(form) {
        const emailInput = document.getElementById('form-email');
        const email = emailInput.value.trim().toLowerCase();

        document.dispatchEvent(new CustomEvent('intentoResetPassword', {
            detail: { email }
        }));
    }

    // ===== RESETEAR FORMULARIO =====
    function resetearFormulario(form) {
        form.reset();
        form.classList.remove('was-validated');
        
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });
        
        const contador = document.getElementById('contador-caracteres');
        if (contador) contador.textContent = '0';
    }

    // ===== MOSTRAR ALERTAS =====
    function mostrarAlerta(tipo, mensaje, callback) {
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

})();