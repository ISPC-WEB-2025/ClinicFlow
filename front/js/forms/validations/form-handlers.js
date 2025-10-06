import { mostrarAlerta, resetearFormulario } from './validation-utils.js';

const dispatchEvent = (eventName, detail) => {
    document.dispatchEvent(new CustomEvent(eventName, { detail }));
};

const obtenerValorInput = (id) => {
    return document.getElementById(id)?.value || '';
};

const separarNombreCompleto = (nombreCompleto) => {
    const palabras = nombreCompleto.trim().split(/\s+/);
    return {
        nombre: palabras[0],
        apellido: palabras.slice(1).join(' ')
    };
};

export function manejarLogin(form) {
    const datosLogin = {
        email: obtenerValorInput('form-email').trim(),
        password: obtenerValorInput('form-password')
    };

    dispatchEvent('intentoLogin', datosLogin);
}

export function manejarRegistro(form) {
    const nombreCompleto = obtenerValorInput('form-nombre-completo').trim();
    const { nombre, apellido } = separarNombreCompleto(nombreCompleto);

    const datosUsuario = {
        nombre,
        apellido,
        nombreCompleto,
        email: obtenerValorInput('form-email').trim().toLowerCase(),
        dni: obtenerValorInput('form-dni').trim(),
        telefono: obtenerValorInput('form-telefono').trim(),
        password: obtenerValorInput('form-password')
    };

    dispatchEvent('intentoRegistro', datosUsuario);
}

export function manejarContacto(form) {
    const nombre = obtenerValorInput('form-nombre');
    
    mostrarAlerta(
        'success',
        `¡Gracias por tu consulta, ${nombre}! Te contactaremos pronto.`
    );
    
    resetearFormulario(form);
}

export function manejarResetPassword(form) {
    const email = obtenerValorInput('form-email').trim().toLowerCase();
    dispatchEvent('intentoResetPassword', { email });
}