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

export async function manejarContacto(form) {
    const formData = new FormData(form);
    const nombreInput = form.querySelector('[name="nombre"]');

    try {
     
        const response = await fetch(form.action, {
            method: form.method, 
            body: formData      
        });

        
        const data = await response.json();

        if (data.success) {
            mostrarAlerta(
                'success',
                `¡Gracias por tu consulta, ${nombreInput.value}! Te contactaremos pronto.`
            );
            const scrollTarget = document.getElementById('page-title') || form
            scrollTarget.scrollIntoView({
                behavior: 'smooth', 
                block: 'start'      
            });

            
            setTimeout(() => {
                resetearFormulario(form);
            }, 2000); 

        } else {
            console.error('Error de Web3Forms:', data.message);
            mostrarAlerta('error', `Error al enviar: ${data.message}`);
        }

    } catch (error) {
        console.error('Error de red o CORS al contactar a Web3Forms:', error);
        mostrarAlerta('error', 'No se pudo conectar con el servidor. Revisa la consola para más detalles.');
    }
}

export function manejarResetPassword(form) {
    const email = obtenerValorInput('form-email').trim().toLowerCase();
    dispatchEvent('intentoResetPassword', { email });
}