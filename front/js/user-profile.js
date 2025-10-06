let usuarioActual = null;


function verificarSesion() {
	const userEmail = sessionStorage.getItem('userEmail');
	
	if (!userEmail) {
		mostrarNotificacion('No hay sesión activa. Redirigiendo al login...', 'warning');
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


function formatearFecha(fechaISO) {
	try {
		const fecha = new Date(fechaISO);
		if (isNaN(fecha.getTime())) {
			return 'No disponible';
		}
		
		const dia = String(fecha.getDate()).padStart(2, '0');
		const mes = String(fecha.getMonth() + 1).padStart(2, '0');
		const anio = fecha.getFullYear();
		return `${dia}/${mes}/${anio}`;
	} catch (error) {
		console.error('Error al formatear fecha:', error);
		return 'No disponible';
	}
}


function mostrarDatosEnInterfaz(usuario) {
	console.log('🎨 Mostrando datos en interfaz:', usuario);
	
	
	const elementos = {
		userName: document.getElementById('userName'),
		userRole: document.getElementById('userRole'),
		userEmail: document.getElementById('userEmail'),
		userPhone: document.getElementById('userPhone'),
		userDNI: document.getElementById('userDNI'),
		userRegDate: document.getElementById('userRegDate')
	};

	
	const elementosFaltantes = Object.entries(elementos)
		.filter(([key, el]) => !el)
		.map(([key]) => key);

	if (elementosFaltantes.length > 0) {
		console.error('❌ Elementos faltantes en el DOM:', elementosFaltantes);
		return;
	}

	
	const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();
	elementos.userName.textContent = nombreCompleto || 'Usuario';
	elementos.userRole.textContent = usuario.rol || 'Usuario';
	elementos.userEmail.textContent = usuario.email || 'Sin email';
	elementos.userPhone.textContent = usuario.telefono || 'No especificado';
	elementos.userDNI.textContent = usuario.dni || 'No especificado';
	elementos.userRegDate.textContent = usuario.fechaRegistro 
		? formatearFecha(usuario.fechaRegistro) 
		: 'No disponible';

	
	document.title = `${nombreCompleto} - Mi Perfil | ClinicFlow`;

	console.log('✅ Interfaz actualizada correctamente');
}


function mostrarNotificacion(mensaje, tipo = 'info') {
	
	const estilos = {
		info: { bg: '#4285f4', icon: 'fa-info-circle' },
		success: { bg: '#34a853', icon: 'fa-check-circle' },
		warning: { bg: '#fbbc04', icon: 'fa-exclamation-triangle' },
		error: { bg: '#ea4335', icon: 'fa-times-circle' }
	};

	const estilo = estilos[tipo] || estilos.info;


	const toast = document.createElement('div');
	toast.className = 'toast align-items-center text-white border-0 position-fixed top-0 end-0 m-3';
	toast.style.cssText = `
		background-color: ${estilo.bg};
		z-index: 9999;
		min-width: 300px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	`;
	toast.setAttribute('role', 'alert');
	toast.setAttribute('aria-live', 'assertive');
	toast.setAttribute('aria-atomic', 'true');

	toast.innerHTML = `
		<div class="d-flex">
			<div class="toast-body d-flex align-items-center gap-2">
				<i class="fas ${estilo.icon}" aria-hidden="true"></i>
				<span>${mensaje}</span>
			</div>
			<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
		</div>
	`;

	document.body.appendChild(toast);


	const bsToast = new bootstrap.Toast(toast, {
		animation: true,
		autohide: true,
		delay: 3000
	});

	bsToast.show();

	toast.addEventListener('hidden.bs.toast', () => {
		toast.remove();
	});
}


function exportarDatos() {
	if (!usuarioActual) {
		mostrarNotificacion('No hay datos para exportar', 'warning');
		return;
	}

	try {
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
		
		mostrarNotificacion('Datos exportados exitosamente', 'success');
	} catch (error) {
		console.error('Error al exportar datos:', error);
		mostrarNotificacion('Error al exportar los datos', 'error');
	}
}


function configurarEventos() {
	
	const changePasswordBtn = document.getElementById('changePasswordBtn');
	if (changePasswordBtn) {
		changePasswordBtn.addEventListener('click', () => {
			mostrarNotificacion('Funcionalidad de cambio de contraseña en desarrollo', 'info');
		});
	}

	const notificationsBtn = document.getElementById('notificationsBtn');
	if (notificationsBtn) {
		notificationsBtn.addEventListener('click', () => {
			mostrarNotificacion('Configuración de notificaciones en desarrollo', 'info');
		});
	}

	
	const activityBtn = document.getElementById('activityBtn');
	if (activityBtn) {
		activityBtn.addEventListener('click', () => {
			mostrarNotificacion('Historial de actividad en desarrollo', 'info');
		});
	}

	
	const exportBtn = document.getElementById('exportBtn');
	if (exportBtn) {
		exportBtn.addEventListener('click', exportarDatos);
	}
}


function inicializarPerfil() {
	console.log('🚀 Inicializando perfil de usuario...');
	configurarEventos();
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
		mostrarNotificacion('Error al cargar el perfil. Por favor, recargá la página.', 'error');
	}
});


document.addEventListener('usuariosJSONCargados', () => {
	console.log('✅ Evento usuariosJSONCargados recibido');
	
	if (window.UserManager) {
		console.log('✅ UserManager listo, cargando perfil...');
		cargarDatosUsuario();
	} else {
		console.error('❌ UserManager no está disponible');
		mostrarNotificacion('Error al cargar el sistema de usuarios', 'error');
	}
});


if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', inicializarPerfil);
} else {
	inicializarPerfil();
}