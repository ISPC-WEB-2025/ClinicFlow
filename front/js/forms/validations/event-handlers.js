// event-handlers.js - Manejadores de eventos del sistema

import { mostrarAlerta, resetearFormulario } from './validation-utils.js';

export function registrarEventosGlobales() {
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
                window.location.href = '../index.html';
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
            // Ocultar el formulario para evitar expansión del input
            const form = document.getElementById('forgotPassword-form');
            if (form) form.style.display = 'none';
            
            mostrarAlerta('success', resultado.mensaje + ' Redirigiendo al login...', () => {
                window.location.href = 'login.html';
            });
        } else {
            mostrarAlerta('danger', resultado.mensaje);
        }
    });

    console.log('Eventos globales registrados');
}