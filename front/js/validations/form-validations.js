// form-validations.js - Sistema centralizado de validaciones (MODULARIZADO)

import { 
    validarCampo, 
    focusPrimerCampoInvalido, 
    resetearFormulario 
} from './validation-utils.js';

import { 
    configurarContadorCaracteres,
    configurarValidacionTelefono,
    configurarValidacionTexto,
    configurarValidacionNombreCompleto,
    configurarValidacionEmail
} from './field-validators.js';

import { 
    configurarValidacionPassword,
    validarConfirmacionPassword 
} from './password-validator.js';

import { 
    manejarLogin,
    manejarRegistro,
    manejarContacto,
    manejarResetPassword 
} from './form-handlers.js';

import { registrarEventosGlobales } from './event-handlers.js';

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
    function inicializarEventosGlobales() {
        if (eventosRegistrados) {
            console.log('Eventos ya registrados, omitiendo...');
            return;
        }
        
        eventosRegistrados = true;
        registrarEventosGlobales();
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

    // ===== VALIDACIÓN EN TIEMPO REAL =====
    function configurarValidacionTiempoReal(forms) {
        Array.from(forms).forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            const esFormularioLogin = form.id === 'login-form';
            
            Array.from(inputs).forEach(input => {
                // Solo validación en tiempo real con input
                input.addEventListener('input', function() {
                    // En login, no validar visualmente el campo password
                    if (esFormularioLogin && this.id === 'form-password') {
                        return;
                    }
                    
                    // Validar siempre el confirm-password en tiempo real
                    if (this.id === 'form-confirm-password') {
                        validarConfirmacionPassword(this);
                    }
                    
                    // Validar todos los campos en tiempo real
                    if (this.value.length > 0) {
                        validarCampo(this);
                    } else {
                        this.classList.remove('is-valid', 'is-invalid');
                    }
                });
            });
        });
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

    // ===== EVENTOS =====
    document.addEventListener('formRendered', async () => {
        await inicializarValidaciones();
    });

    document.addEventListener('DOMContentLoaded', async () => {
        await cargarUsuarios();
        inicializarEventosGlobales();
        
        setTimeout(async () => {
            await inicializarValidaciones();
        }, 300);
    });

})();