// form-validations.js - Sistema centralizado de validaciones
// CORREGIDO: Mensaje duplicado + validación nombre completo

(function() {
    let USUARIOS_VALIDOS = [];
    let validacionesInicializadas = false;
    let eventosRegistrados = false; // ⭐ NUEVO: Prevenir duplicados

    // ===== CARGAR USUARIOS DESDE JSON =====
    async function cargarUsuarios() {
        try {
            const response = await fetch('./data/users.json');
            if (!response.ok) {
                throw new Error('No se pudo cargar users.json');
            }
            const data = await response.json();
            USUARIOS_VALIDOS = data.usuarios || [];
            console.log('✅ Usuarios del JSON cargados:', USUARIOS_VALIDOS.length);
            
            // Notificar a registerSimulation
            document.dispatchEvent(new CustomEvent('usuariosJSONCargados', {
                detail: { usuarios: USUARIOS_VALIDOS }
            }));
            
            return true;
        } catch (error) {
            console.error('❌ Error al cargar usuarios:', error);
            USUARIOS_VALIDOS = [];
            return false;
        }
    }

    // ===== REGISTRAR EVENTOS UNA SOLA VEZ =====
    function registrarEventosGlobales() {
        if (eventosRegistrados) {
            console.log('⚠️ Eventos ya registrados, omitiendo...');
            return;
        }
        
        eventosRegistrados = true;

        // Escuchar resultado del registro
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

        // Escuchar resultado del login
        document.addEventListener('resultadoLogin', (event) => {
            const resultado = event.detail;
            
            if (resultado.exito) {
                // Guardar sesión
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

        console.log('✅ Eventos globales registrados');
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
        configurarValidacionNombreCompleto(); // ⭐ NUEVO
        configurarValidacionEmail();
        configurarValidacionPassword();
        configurarValidacionTiempoReal(forms);
        configurarSubmitFormularios(forms);

        console.log('✅ Validaciones cargadas correctamente');
    }

    // ===== EVENTOS =====
    document.addEventListener('formRendered', async () => {
        await inicializarValidaciones();
    });

    document.addEventListener('DOMContentLoaded', async () => {
        await cargarUsuarios();
        registrarEventosGlobales(); // ⭐ Registrar una sola vez
        
        setTimeout(async () => {
            await inicializarValidaciones();
        }, 300);
    });

    // ===== VALIDACIÓN DE NOMBRE COMPLETO =====
    function configurarValidacionNombreCompleto() {
        const nombreCompletoInput = document.getElementById('form-nombre-completo');
        if (!nombreCompletoInput) return;

        nombreCompletoInput.addEventListener('input', function() {
            // Solo letras, espacios, acentos y ñ
            this.value = this.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, '');
            
            // Evitar espacios múltiples
            this.value = this.value.replace(/\s{2,}/g, ' ');
            
            // Validar al menos dos palabras
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

        // Validación adicional en blur
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

    // ===== VALIDACIÓN DE EMAIL =====
    function configurarValidacionEmail() {
        const emailInput = document.getElementById('form-email');
        if (!emailInput) return;

        emailInput.addEventListener('blur', function() {
            this.value = this.value.trim().toLowerCase();
        });
    }

    // ===== VALIDACIÓN DE PASSWORD =====
    function configurarValidacionPassword() {
        const passwordInput = document.getElementById('form-password');
        const confirmInput = document.getElementById('form-confirm-password');
        
        if (!passwordInput) return;

        if (confirmInput) {
            confirmInput.addEventListener('input', () => {
                validarConfirmacionPassword(confirmInput);
            });
            
            passwordInput.addEventListener('input', () => {
                if (confirmInput.value.length > 0) {
                    validarConfirmacionPassword(confirmInput);
                }
            });
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

        // Disparar evento para registerSimulation
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
        
        // Separar nombre y apellido
        const nombre = palabras[0];
        const apellido = palabras.slice(1).join(' ');

        const datosUsuario = {
            nombre: nombre,
            apellido: apellido,
            nombreCompleto: nombreCompleto,
            email: emailInput.value.trim().toLowerCase(),
            password: passwordInput.value
        };

        // Disparar evento para registerSimulation
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

    // ===== MOSTRAR ALERTAS (con prevención de duplicados) =====
    function mostrarAlerta(tipo, mensaje, callback) {
        const container = document.getElementById('formsType');
        if (!container) return;

        // ⭐ IMPORTANTE: Eliminar alertas existentes del mismo tipo
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
        
        // Auto-dismiss
        setTimeout(() => {
            const alert = container.querySelector(`.alert-${tipo}`);
            if (alert) alert.remove();
        }, 4000);

        if (callback) {
            setTimeout(callback, 2000);
        }
    }

})();