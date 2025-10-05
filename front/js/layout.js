// layout.js - Gestión centralizada de Header y Footer
// Inserta y maneja dinámicamente el layout completo de la aplicación
(function() {
    'use strict';
    
    // ===== CONFIGURACIÓN =====
    const CONFIG = {
        sessionKeys: {
            email: 'userEmail',
            nombre: 'userName',
            origen: 'userOrigen'
        },
        selectors: {
            headerPlaceholder: '#header-placeholder',
            footerPlaceholder: '#footer-placeholder'
        },
        pages: [
            { name: 'Inicio', href: 'index.html', icon: 'fa-solid fa-plus' },
            { name: 'Nosotros', href: 'nosotros.html', icon: 'fa-solid fa-plus' },
            { name: 'Servicios', href: 'servicios.html', icon: 'fa-solid fa-plus' },
            { name: 'Planes', href: 'planes.html', icon: 'fa-solid fa-plus' },
            { name: 'Contacto', href: 'contacto.html', icon: 'fa-solid fa-plus' }
        ]
    };

    // ===== UTILIDADES DE RUTAS =====
    
    /**
     * Detecta si estamos en la raíz o en una subcarpeta
     * @returns {boolean} true si estamos en pages/, false si estamos en raíz
     */
    function estaEnSubcarpeta() {
        const path = window.location.pathname;
        return path.includes('/pages/');
    }

    /**
     * Obtiene el prefijo de ruta según la ubicación actual
     * @returns {string} '../' si estamos en subcarpeta, './' si estamos en raíz
     */
    function obtenerPrefijo() {
        return estaEnSubcarpeta() ? '../' : './';
    }

    /**
     * Construye una ruta absoluta según la página
     * @param {string} pageName - Nombre de la página (ej: 'index.html', 'nosotros.html')
     * @returns {string} Ruta completa y correcta
     */
    function construirRuta(pageName) {
        const prefijo = obtenerPrefijo();
        
        // Si es index.html, siempre va a la raíz
        if (pageName === 'index.html') {
            return estaEnSubcarpeta() ? '../index.html' : './index.html';
        }
        
        // Si estamos en raíz, agregar 'pages/'
        if (!estaEnSubcarpeta()) {
            return `./pages/${pageName}`;
        }
        
        // Si estamos en pages/, usar ruta relativa simple
        return `./${pageName}`;
    }

    // ===== TEMPLATES HTML =====
    const TEMPLATES = {
        header: (menuItems, ctaButtons) => {
            const prefijo = obtenerPrefijo();
            const homeUrl = estaEnSubcarpeta() ? '../index.html' : './index.html';
            
            return `
            
                <div class="container">
                    <a href="${homeUrl}" class="logo">
                        <span class="navbar-brand mb-0">ClinicFlow</span>
                        <i class="fa-solid fa-chevron-right icono-header left"></i>
                        <i class="fa-solid fa-chevron-right icono-header right"></i>
                    </a>
                    <!-- Botón hamburguesa para mobile -->
                    <button
                        class="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarContent"
                        aria-controls="navbarContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <i class="fas fa-bars"></i>
                    </button>
                    <!-- Contenido colapsable del navbar -->
                    <nav class="collapse navbar-collapse" id="navbarContent">
                        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
                            ${menuItems}
                            ${ctaButtons}
                        </ul>
                    </nav>
                </div>
            
            `;
        },
        
        menuItem: (page, isActive, rutaCompleta) => `
            <li class="nav-item">
                <a class="nav-link ${isActive ? 'active' : ''}" href="${rutaCompleta}">
                    <i class="${page.icon}"></i>${page.name}
                </a>
            </li>
        `,
        
        userMenu: (nombreUsuario) => {
            const perfilUrl = construirRuta('user-profile.html');
            
            return `
            <li class="nav-item dropdown ms-lg-3" id="user-menu">
                <a class="nav-link dropdown-toggle user-menu-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                 
                    <span class="user-name">${nombreUsuario}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end user-dropdown">
                    <li>
                        <a class="dropdown-item" href="${perfilUrl}">
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
        },
        
        botonesPublicos: () => {
            const loginUrl = construirRuta('login.html');
            const registerUrl = construirRuta('register.html');
            
            return `
            <li class="nav-item ms-lg-3">
                <a class="btn btn-outline-primary btn-header" href="${loginUrl}">
                    <i class="fa-solid fa-right-to-bracket"></i>
                    <span class="btn-text">Iniciar Sesión</span>
                </a>
            </li>
            <li class="nav-item ms-lg-2">
                <a class="btn btn-primary btn-header" href="${registerUrl}">
                    <i class="fa-solid fa-user-plus"></i>
                    <span class="btn-text">Registrarse</span>
                </a>
            </li>
            `;
        },
        
        footer: () => `
            
                <p>Copyright © 2025: ClinicFlow - Servicios Web Profesionales.</p>
            
        `
    };

    // ===== CLASE PRINCIPAL =====
    class LayoutManager {
        constructor() {
            this.currentPage = this.obtenerPaginaActual();
            this.sesion = this.verificarSesion();
        }

        /**
         * Obtiene la página actual basándose en la URL
         */
        obtenerPaginaActual() {
            const path = window.location.pathname;
            const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
            return filename;
        }

        /**
         * Verifica si existe una sesión activa
         */
        verificarSesion() {
            const email = sessionStorage.getItem(CONFIG.sessionKeys.email);
            const nombre = sessionStorage.getItem(CONFIG.sessionKeys.nombre);
            
            if (email && nombre) {
                return { email, nombre };
            }
            return null;
        }

        /**
         * Genera los items del menú de navegación
         */
        generarMenuItems() {
            return CONFIG.pages.map(page => {
                const rutaCompleta = construirRuta(page.href);
                const isActive = this.currentPage === page.href;
                return TEMPLATES.menuItem(page, isActive, rutaCompleta);
            }).join('');
        }

        /**
         * Genera los botones CTA según el estado de sesión
         */
        generarBotonesCTA() {
            if (this.sesion) {
                return TEMPLATES.userMenu(this.sesion.nombre);
            } else {
                return TEMPLATES.botonesPublicos();
            }
        }

        /**
         * Inserta el header en el DOM
         */
        insertarHeader() {
            const placeholder = document.querySelector(CONFIG.selectors.headerPlaceholder);
            
            if (!placeholder) {
                console.error('Header placeholder no encontrado');
                return;
            }

            const menuItems = this.generarMenuItems();
            const ctaButtons = this.generarBotonesCTA();
            const headerHTML = TEMPLATES.header(menuItems, ctaButtons);
            
            placeholder.innerHTML = headerHTML;

            // Configurar eventos si el usuario está logueado
            if (this.sesion) {
                this.configurarEventosUsuario();
            }

            console.log('✅ Header insertado correctamente');
        }

        /**
         * Inserta el footer en el DOM
         */
        insertarFooter() {
            const placeholder = document.querySelector(CONFIG.selectors.footerPlaceholder);
            
            if (!placeholder) {
                console.error('❌ Footer placeholder no encontrado');
                return;
            }

            placeholder.innerHTML = TEMPLATES.footer();
            console.log('✅ Footer insertado correctamente');
        }

        /**
         * Configura eventos para el menú de usuario logueado
         */
        configurarEventosUsuario() {
            // Esperar un momento para que el DOM se actualice
            setTimeout(() => {
                const btnLogout = document.getElementById('btn-logout');
                
                if (btnLogout) {
                    btnLogout.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.manejarLogout();
                    });
                }
            }, 100);
        }

        /**
         * Maneja el cierre de sesión
         */
        manejarLogout() {
            if (confirm('¿Estás seguro de que querés cerrar sesión?')) {
                this.cerrarSesion();
            }
        }

        /**
         * Cierra la sesión del usuario
         */
        cerrarSesion() {
            // Limpiar sessionStorage
            Object.values(CONFIG.sessionKeys).forEach(key => {
                sessionStorage.removeItem(key);
            });
            
            console.log('✅ Sesión cerrada correctamente');
            
            // Mostrar mensaje y redireccionar
            this.mostrarMensajeCierreSesion();
        }

        /**
         * Muestra mensaje de cierre de sesión y redirecciona
         */
        mostrarMensajeCierreSesion() {
            alert('Sesión cerrada exitosamente');
            const homeUrl = estaEnSubcarpeta() ? '../index.html' : './index.html';
            window.location.href = homeUrl;
        }

        /**
         * Actualiza el layout completo (útil para cambios de sesión)
         */
        actualizar() {
            this.sesion = this.verificarSesion();
            this.insertarHeader();
            console.log('🔄 Layout actualizado');
        }

        /**
         * Inicializa el layout completo
         */
        inicializar() {
            this.insertarHeader();
            this.insertarFooter();
            
            // Escuchar cambios de storage (sync entre pestañas)
            window.addEventListener('storage', (e) => {
                if (Object.values(CONFIG.sessionKeys).includes(e.key)) {
                    console.log('🔄 Cambio detectado en sesión desde otra pestaña');
                    this.actualizar();
                }
            });

            // Escuchar evento de login exitoso
            document.addEventListener('resultadoLogin', (e) => {
                if (e.detail.exito) {
                    this.actualizar();
                }
            });

            // Escuchar evento de registro exitoso
            document.addEventListener('resultadoRegistro', (e) => {
                if (e.detail.exito) {
                    this.actualizar();
                }
            });

            console.log('🎨 Layout Manager inicializado');
        }
    }

    // ===== INICIALIZACIÓN AUTOMÁTICA =====
    
    /**
     * Función de inicialización que se ejecuta cuando el DOM está listo
     */
    function init() {
        const layoutManager = new LayoutManager();
        layoutManager.inicializar();

        // Exponer API pública para uso externo
        window.LayoutManager = {
            actualizar: () => layoutManager.actualizar(),
            cerrarSesion: () => layoutManager.cerrarSesion(),
            verificarSesion: () => layoutManager.verificarSesion()
        };
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();