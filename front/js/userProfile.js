/**
 * userProfile.js - Sistema de gestión de perfil de usuario
 * Carga datos reales del usuario logueado y permite edición
 */

let usuarioActual = null;
let modoEdicion = false;

/**
 * Verifica si el usuario tiene sesión activa
 */
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

/**
 * Carga los datos del usuario logueado
 */
function cargarDatosUsuario() {
    const userEmail = verificarSesion();
    if (!userEmail) return;

    console.log('📧 Cargando perfil para:', userEmail);

    // Solicitar datos del usuario
    document.dispatchEvent(new CustomEvent('cargarPerfilUsuario', {
        detail: { email: userEmail }
    }));
}

/**
 * Evento que recibe los datos del usuario
 */
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

/**
 * Muestra los datos del usuario en la interfaz
 */
function mostrarDatosEnInterfaz(usuario) {
    console.log('🎨 Mostrando datos en interfaz:', usuario);
    
    // Información personal básica
    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
    document.getElementById('userName').textContent = nombreCompleto || 'Usuario';
    document.getElementById('userRole').textContent = usuario.rol || 'Usuario';
    document.getElementById('userEmail').textContent = usuario.email || 'Sin email';
    document.getElementById('userPhone').textContent = usuario.telefono || 'No especificado';
    document.getElementById('userDNI').textContent = usuario.dni || 'No especificado';
    
    // Fecha de registro formateada
    const fechaRegistro = usuario.fechaRegistro 
        ? formatearFecha(usuario.fechaRegistro) 
        : 'No disponible';
    document.getElementById('userRegDate').textContent = fechaRegistro;

    // Información profesional
    document.getElementById('userInstitution').textContent = 
        usuario.institucion || 'No especificado';
    document.getElementById('userSpecialty').textContent = 
        usuario.especialidad || 'No especificado';
    document.getElementById('userLicense').textContent = 
        usuario.matricula || 'No especificado';
    document.getElementById('userDepartment').textContent = 
        usuario.departamento || 'No especificado';

    // Estadísticas
    if (usuario.estadisticas) {
        document.getElementById('statAppointments').textContent = 
            usuario.estadisticas.consultas || 0;
        document.getElementById('statHours').textContent = 
            usuario.estadisticas.horasServicio || 0;
        document.getElementById('statRating').textContent = 
            (usuario.estadisticas.calificacion || 5.0).toFixed(1);
        
        // Animar estadísticas
        setTimeout(() => animarEstadisticas(usuario.estadisticas), 300);
    } else {
        // Valores por defecto si no hay estadísticas
        document.getElementById('statAppointments').textContent = '0';
        document.getElementById('statHours').textContent = '0';
        document.getElementById('statRating').textContent = '5.0';
    }

    console.log('✅ Interfaz actualizada correctamente');
}

/**
 * Formatea una fecha ISO a formato legible
 */
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

/**
 * Anima los contadores de estadísticas
 */
function animarEstadisticas(stats) {
    const animaciones = [
        { id: 'statAppointments', target: stats.consultas || 0 },
        { id: 'statHours', target: stats.horasServicio || 0 }
    ];

    animaciones.forEach(anim => {
        const element = document.getElementById(anim.id);
        if (!element) return;

        if (anim.target === 0) {
            element.textContent = '0';
            return;
        }

        let current = 0;
        const duration = 1500;
        const steps = 50;
        const incrementPerStep = anim.target / steps;

        const interval = setInterval(() => {
            current += incrementPerStep;
            if (current >= anim.target) {
                element.textContent = anim.target;
                clearInterval(interval);
            } else {
                element.textContent = Math.floor(current);
            }
        }, duration / steps);
    });
}

/**
 * Activa el modo de edición del perfil
 */
function activarModoEdicion() {
    if (!usuarioActual) {
        mostrarMensaje('No se pudo cargar el perfil del usuario', 'error');
        return;
    }

    modoEdicion = true;
    const editBtn = document.getElementById('editProfileBtn');
    editBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i><span>Guardar cambios</span>';
    editBtn.classList.remove('btn-outline-primary');
    editBtn.classList.add('btn-success');

    // Hacer editables los campos
    hacerCamposEditables([
        { id: 'userPhone', campo: 'telefono' },
        { id: 'userDNI', campo: 'dni' },
        { id: 'userInstitution', campo: 'institucion' },
        { id: 'userSpecialty', campo: 'especialidad' },
        { id: 'userLicense', campo: 'matricula' },
        { id: 'userDepartment', campo: 'departamento' }
    ]);

    mostrarMensaje('Modo de edición activado. Modifica los campos y guarda los cambios.', 'info');
}

/**
 * Hace los campos editables
 */
function hacerCamposEditables(campos) {
    campos.forEach(({ id, campo }) => {
        const element = document.getElementById(id);
        if (!element) return;

        const valorActual = usuarioActual[campo] || '';
        const placeholderTexts = {
            telefono: '+54 9 XXX XXX XXXX',
            dni: 'XX.XXX.XXX',
            institucion: 'Nombre de la institución',
            especialidad: 'Tu especialidad',
            matricula: 'MP XXXXX',
            departamento: 'Departamento/Área'
        };

        element.innerHTML = `
            <input 
                type="text" 
                class="form-control form-control-sm editable-field" 
                value="${valorActual}"
                placeholder="${placeholderTexts[campo] || 'Ingresá un valor'}"
                data-campo="${campo}"
            />
        `;
    });
}

/**
 * Guarda los cambios del perfil
 */
function guardarCambiosPerfil() {
    if (!usuarioActual) {
        mostrarMensaje('Error: No hay usuario cargado', 'error');
        return;
    }

    const camposEditables = document.querySelectorAll('.editable-field');
    const datosActualizados = {};

    camposEditables.forEach(input => {
        const campo = input.getAttribute('data-campo');
        const valor = input.value.trim();
        datosActualizados[campo] = valor;
    });

    console.log('💾 Guardando cambios:', datosActualizados);

    // Actualizar perfil
    document.dispatchEvent(new CustomEvent('actualizarPerfilUsuario', {
        detail: {
            email: usuarioActual.email,
            datos: datosActualizados
        }
    }));
}

/**
 * Evento de respuesta a actualización de perfil
 */
document.addEventListener('perfilUsuarioActualizado', (event) => {
    const resultado = event.detail;
    
    console.log('📝 Resultado de actualización:', resultado);
    
    if (resultado.exito) {
        usuarioActual = resultado.usuario;
        modoEdicion = false;
        
        // Restaurar vista normal
        mostrarDatosEnInterfaz(usuarioActual);
        
        const editBtn = document.getElementById('editProfileBtn');
        editBtn.innerHTML = '<i class="fa-solid fa-pen"></i><span>Editar perfil</span>';
        editBtn.classList.remove('btn-success');
        editBtn.classList.add('btn-outline-primary');
        
        mostrarMensaje(resultado.mensaje || 'Perfil actualizado correctamente', 'success');
    } else {
        mostrarMensaje(resultado.mensaje || 'Error al actualizar el perfil', 'error');
    }
});

/**
 * Configura los event listeners de los botones
 */
function configurarEventos() {
    // Botón editar/guardar perfil
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (modoEdicion) {
                guardarCambiosPerfil();
            } else {
                activarModoEdicion();
            }
        });
    }

    // Botón cambiar contraseña
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            mostrarMensaje('Funcionalidad de cambio de contraseña en desarrollo', 'info');
        });
    }

    // Botón notificaciones
    const notificationsBtn = document.getElementById('notificationsBtn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', () => {
            mostrarMensaje('Configuración de notificaciones en desarrollo', 'info');
        });
    }

    // Botón actividad
    const activityBtn = document.getElementById('activityBtn');
    if (activityBtn) {
        activityBtn.addEventListener('click', () => {
            mostrarMensaje('Historial de actividad en desarrollo', 'info');
        });
    }

    // Botón exportar
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportarDatos();
        });
    }
}

/**
 * Exporta los datos del usuario
 */
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

/**
 * Muestra un mensaje temporal al usuario
 */
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

/**
 * Agrega las animaciones CSS necesarias
 */
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
        .editable-field {
            border: 2px solid #4285f4 !important;
            background-color: #f8f9fa;
        }
        .editable-field:focus {
            outline: none;
            border-color: #1a73e8 !important;
            box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Inicializa la página de perfil
 */
function inicializarPerfil() {
    console.log('🚀 Inicializando perfil de usuario...');
    
    configurarEventos();
    agregarAnimaciones();
}

// Variable para controlar si ya se cargaron los usuarios del JSON
let usuariosJSONCargados = false;

// Escuchar cuando se cargan los usuarios del JSON
document.addEventListener('usuariosJSONCargados', () => {
    console.log('✅ Evento usuariosJSONCargados recibido');
    usuariosJSONCargados = true;
    
    // Ahora sí intentar cargar el perfil
    if (window.UserManager) {
        console.log('✅ UserManager listo, cargando perfil...');
        cargarDatosUsuario();
    }
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarPerfil);