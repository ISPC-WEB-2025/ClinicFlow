import { 
    validarCampo, 
    focusPrimerCampoInvalido, 
    resetearFormulario 
} from './validation-utils.js';

import { 
    configurarContadorCaracteres,
    configurarValidacionDNI,
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
    let validacionesInicializadas = false;
    let eventosRegistrados = false;

    const inicializarEventosGlobales = () => {
        if (eventosRegistrados) return;
        
        eventosRegistrados = true;
        registrarEventosGlobales();
    };

    const configurarValidadores = () => {
        configurarContadorCaracteres();
        configurarValidacionDNI();
        configurarValidacionTelefono();
        configurarValidacionTexto();
        configurarValidacionNombreCompleto();
        configurarValidacionEmail();
        configurarValidacionPassword();
    };

    const debeValidarInput = (input, esFormularioLogin) => {
        if (esFormularioLogin && input.id === 'form-password') {
            return false;
        }
        return true;
    };

    const aplicarValidacionInput = (input) => {
        if (input.id === 'form-confirm-password') {
            validarConfirmacionPassword(input);
            return;
        }
        
        if (input.value.length > 0) {
            validarCampo(input);
        } else {
            input.classList.remove('is-valid', 'is-invalid');
        }
    };

    const configurarValidacionTiempoReal = (forms) => {
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            const esFormularioLogin = form.id === 'login-form';
            
            inputs.forEach(input => {
                input.addEventListener('input', function() {
                    if (debeValidarInput(this, esFormularioLogin)) {
                        aplicarValidacionInput(this);
                    }
                });
            });
        });
    };

    const formHandlers = {
        'login-form': manejarLogin,
        'register-form': manejarRegistro,
        'contact-form': manejarContacto,
        'forgotPassword-form': manejarResetPassword
    };

    const procesarSubmit = (form) => {
        const confirmPassword = document.getElementById('form-confirm-password');
        if (confirmPassword) {
            validarConfirmacionPassword(confirmPassword);
        }

        if (form.checkValidity()) {
            const handler = formHandlers[form.id];
            if (handler) handler(form);
        } else {
            form.classList.add('was-validated');
            focusPrimerCampoInvalido(form);
        }
    };

    const configurarSubmitFormularios = (forms) => {
        forms.forEach(form => {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                event.stopPropagation();
                procesarSubmit(this);
            });
        });
    };

    const inicializarValidaciones = async () => {
        if (validacionesInicializadas) return;
        
        const forms = document.querySelectorAll('.needs-validation');
        if (forms.length === 0) return;

        validacionesInicializadas = true;

        configurarValidadores();
        configurarValidacionTiempoReal(forms);
        configurarSubmitFormularios(forms);
    };

    document.addEventListener('formRendered', inicializarValidaciones);

    document.addEventListener('DOMContentLoaded', () => {
        inicializarEventosGlobales();
        setTimeout(inicializarValidaciones, 300);
    });

})();