// header-manager.js - Gestión dinámica del header según estado de sesión

(function() {
    'use strict';

    function verificarSesion() {
        const userEmail = sessionStorage.getItem('userEmail');
        const userName = sessionStorage.getItem('userName');
        return { email: userEmail, nombre: userName };
    }

    function actualizarHeader() {
        const sesion = verificarSesion();
        const navbarNav = document.querySelector('.navbar-nav');
        
        if (!navbarNav) return;

        // Buscar los botones CTA actuales
        const btnLogin = navbarNav.querySelector('a[href="./login.html"]')?.closest('.nav-item');
        const btnRegister = navbarNav.querySelector('a[href="./register.html"]')?.closest('.nav-item');

        if (sesion.email && sesion.nombre) {
            // Usuario logueado - Mostrar menú de usuario
            if (btnLogin) btnLogin.remove();
            if (btnRegister) btnRegister.remove();

            // Verificar si ya existe el menú de usuario
            if (navbarNav.querySelector('#user-menu')) return;

            const userMenuHtml = `
                <li class="nav-item dropdown ms-lg-3" id="user-menu">
                    <a class="nav-link dropdown-toggle user-menu-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fa-solid fa-user-circle"></i>
                        <span class="user-name">${sesion.nombre}</span>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end user-dropdown">
                        <li>
                            <a class="dropdown-item" href="./perfil.html">
                                <i class="fa-solid fa-user"></i> Perfil
                            </a>
                        </li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                            <a class="dropdown-item" href="#" id="btn-logout">
                                <i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
                            </a>
                        </li>
                    </ul>
                </li>
            `;

            navbarNav.insertAdjacentHTML('beforeend', userMenuHtml);

            // Agregar evento de logout
            const btnLogout = document.getElementById('btn-logout');
            if (btnLogout) {
                btnLogout.addEventListener('click', (e) => {
                    e.preventDefault();
                    cerrarSesion();
                });
            }

        } else {
            // Usuario no logueado - Verificar si ya existen los botones
            if (!btnLogin && !btnRegister) {
                // Eliminar menú de usuario si existe
                const userMenu = navbarNav.querySelector('#user-menu');
                if (userMenu) userMenu.remove();

                // Crear botones de login y registro
                const botonesHTML = `
                    <li class="nav-item ms-lg-3">
                        <a class="btn btn-outline-primary btn-header" href="./login.html">
                            <i class="fa-solid fa-right-to-bracket"></i>
                            <span class="btn-text">Iniciar Sesión</span>
                        </a>
                    </li>
                    <li class="nav-item ms-lg-2">
                        <a class="btn btn-primary btn-header" href="./register.html">
                            <i class="fa-solid fa-user-plus"></i>
                            <span class="btn-text">Registrarse</span>
                        </a>
                    </li>
                `;
                navbarNav.insertAdjacentHTML('beforeend', botonesHTML);
            }
        }
    }

    function cerrarSesion() {
        if (confirm('¿Estás seguro de que querés cerrar sesión?')) {
            sessionStorage.removeItem('userEmail');
            sessionStorage.removeItem('userName');
            sessionStorage.removeItem('userOrigen');
            
            console.log('✅ Sesión cerrada correctamente');
            
            // Mostrar alerta y redireccionar
            if (typeof mostrarAlerta === 'function') {
                mostrarAlerta('success', 'Sesión cerrada exitosamente. Redirigiendo...', () => {
                    window.location.href = 'index.html';
                });
            } else {
                alert('Sesión cerrada exitosamente');
                window.location.href = 'index.html';
            }
        }
    }

    // Inicializar cuando cargue el DOM
    document.addEventListener('DOMContentLoaded', () => {
        actualizarHeader();
        console.log('🔐 Header-manager cargado');
    });

    // Actualizar header cuando cambie la sesión
    window.addEventListener('storage', (e) => {
        if (e.key === 'userEmail' || e.key === 'userName') {
            actualizarHeader();
        }
    });

    // Exponer función globalmente para uso externo
    window.actualizarHeaderUsuario = actualizarHeader;

})();