// form-handlers.js - Manejadores de envío de formularios

import { mostrarAlerta, resetearFormulario } from './validation-utils.js';

export function manejarLogin(form) {
    const emailInput = document.getElementById('form-email');
    const passwordInput = document.getElementById('form-password');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    document.dispatchEvent(new CustomEvent('intentoLogin', {
        detail: { email, password }
    }));
}

export function manejarRegistro(form) {
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

export function manejarContacto(form) {
    const nombreInput = document.getElementById('form-nombre');
    
    mostrarAlerta(
        'success',
        `¡Gracias por tu consulta, ${nombreInput.value}! Te contactaremos pronto.`
    );
    
    resetearFormulario(form);
}

export function manejarResetPassword(form) {
    const emailInput = document.getElementById('form-email');
    const email = emailInput.value.trim().toLowerCase();

    document.dispatchEvent(new CustomEvent('intentoResetPassword', {
        detail: { email }
    }));
}