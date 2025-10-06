import { mostrarAlerta, resetearFormulario } from './validation-utils.js';

const guardarSesion = (usuario, origen) => {
    sessionStorage.setItem('userEmail', usuario.email);
    sessionStorage.setItem('userName', usuario.nombre || 'Usuario');
    sessionStorage.setItem('userOrigen', origen);
};

const redirigir = (url, delay = 2000) => {
    setTimeout(() => window.location.href = url, delay);
};

const limpiarPasswordInput = () => {
    const passwordInput = document.getElementById('form-password');
    if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
    }
};

const ocultarFormulario = (formId) => {
    const form = document.getElementById(formId);
    if (form) form.style.display = 'none';
};

const manejarResultadoRegistro = (event) => {
    const { exito, mensaje } = event.detail;
    
    if (exito) {
        mostrarAlerta('success', `${mensaje} Redirigiendo al login...`, () => {
            redirigir('login.html');
        });
    } else {
        mostrarAlerta('warning', mensaje);
    }
};

const manejarResultadoLogin = (event) => {
    const { exito, mensaje, usuario, origen } = event.detail;
    
    if (exito) {
        guardarSesion(usuario, origen);
        mostrarAlerta('success', `${mensaje} Redirigiendo...`, () => {
            redirigir('../index.html');
        });
    } else {
        mostrarAlerta('danger', mensaje);
        limpiarPasswordInput();
    }
};

const manejarResultadoResetPassword = (event) => {
    const { exito, mensaje } = event.detail;
    
    if (exito) {
        ocultarFormulario('forgotPassword-form');
        mostrarAlerta('success', `${mensaje} Redirigiendo al login...`, () => {
            redirigir('login.html');
        });
    } else {
        mostrarAlerta('danger', mensaje);
    }
};

export function registrarEventosGlobales() {
    const eventos = {
        'resultadoRegistro': manejarResultadoRegistro,
        'resultadoLogin': manejarResultadoLogin,
        'resultadoResetPassword': manejarResultadoResetPassword
    };

    Object.entries(eventos).forEach(([nombre, handler]) => {
        document.addEventListener(nombre, handler);
    });
}