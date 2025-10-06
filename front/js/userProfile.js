let usuarioActual = null;

function verificarSesion() {
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (!userEmail) {
        mostrarMensaje('No hay sesión activa. Redirigiendo al login...', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return null;
    }
    
    return userEmail;
}

function cargarDatosUsuario() {
    const userEmail = verificarSesion();
    if (!userEmail) return;

    console.log('📧 Cargando perfil para:', userEmail);

    document.dispatchEvent(new CustomEvent('cargarPerfilUsuario', {
        detail: { email: userEmail }
    }));
}

document.addEventListener('perfilUsuarioCargado', (event) => {
    const resultado = event.detail;
    
    console.log('📦 Resultado de carga:', resultado);
    
    if (resultado.exito) {
        usuarioActual = resultado.usuario;
        mostrarDatosEnInterfaz(usuarioActual);
        console.log('✅ Perfil cargado:', usuarioActual.email, `(Origen: ${resultado.origen})`);
    } else {
        console.error('❌ Error al cargar perfil:', resultado.mensaje);
        mostrarMensaje('Error al cargar el perfil. Por favor, recargá la página.', 'error');
    }
});

function mostrarDatosEnInterfaz(usuario) {
    console.log('🎨 Mostrando datos en interfaz:', usuario);
    
    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
    document.getElementById('userName').textContent = nombreCompleto || 'Usuario';
    document.getElementById('userRole').textContent = usuario.rol || 'Usuario';
    document.getElementById('userEmail').textContent = usuario.email || 'Sin email';
    document.getElementById('userPhone').textContent = usuario.telefono || 'No especificado';
    document.getElementById('userDNI').textContent = usuario.dni || 'No especificado';
    
    const fechaRegistro = usuario.fechaRegistro 
        ? formatearFecha(usuario.fechaRegistro) 
        : 'No disponible';
    document.getElementById('userRegDate').textContent = fechaRegistro;

    console.log('✅ Interfaz actualizada correctamente');
}

function formatearFecha(fechaISO) {
    try {
        const fecha = new Date(fechaISO);
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        return `${dia}/${mes}/${anio}`;
    } catch (error) {
        return 'No disponible';
    }
}

function configurarEventos() {
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            mostrarMensaje('Funcionalidad de cambio de contraseña en desarrollo', 'info');
        });
    }

    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', () => {
            mostrarMensaje('Configuración de notificaciones en desarrollo', 'info');
        });
    }

    const activityBtn = document.getElementById('activityBtn');
    if (activityBtn) {
        activityBtn.addEventListener('click', () => {
            mostrarMensaje('Historial de actividad en desarrollo', 'info');
        });
    }

    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportarDatos();
        });
    }
}

function exportarDatos() {
    if (!usuarioActual) {
        mostrarMensaje('No hay datos para exportar', 'warning');
        return;
    }

    const dataStr = JSON.stringify(usuarioActual, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    const nombreArchivo = `perfil_${usuarioActual.email.split('@')[0]}_${Date.now()}.json`;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    mostrarMensaje('Datos exportados exitosamente', 'success');
}

function mostrarMensaje(mensaje, tipo = 'info') {
    const colores = {
        info: '#4285f4',
        success: '#34a853',
        warning: '#fbbc04',
        error: '#ea4335'
    };

    const mensajeDiv = document.createElement('div');
    mensajeDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: ${colores[tipo]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        font-size: 0.9rem;
    `;
    mensajeDiv.textContent = mensaje;

    document.body.appendChild(mensajeDiv);

    setTimeout(() => {
        mensajeDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(mensajeDiv)) {
                document.body.removeChild(mensajeDiv);
            }
        }, 300);
    }, 3000);
}

function agregarAnimaciones() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

function inicializarPerfil() {
    console.log('🚀 Inicializando perfil de usuario...');
    
    configurarEventos();
    agregarAnimaciones();
}

document.addEventListener('usuariosJSONCargados', () => {
    console.log('✅ Evento usuariosJSONCargados recibido');
    
    if (window.UserManager) {
        console.log('✅ UserManager listo, cargando perfil...');
        cargarDatosUsuario();
    }
});

document.addEventListener('DOMContentLoaded', inicializarPerfil);