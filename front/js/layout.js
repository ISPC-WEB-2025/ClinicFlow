(function() {
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

    function estaEnSubcarpeta() {
        const path = window.location.pathname;
        return path.includes('/pages/');
    }

    function obtenerPrefijo() {
        return estaEnSubcarpeta() ? '../' : './';
    }

    function construirRuta(pageName) {
        if (pageName === 'index.html') {
            return estaEnSubcarpeta() ? '../index.html' : './index.html';
        }
        
        if (!estaEnSubcarpeta()) {
            return `./pages/${pageName}`;
        }
        
        return `./${pageName}`;
    }

    const TEMPLATES = {
        header: (menuItems, ctaButtons) => {
            const homeUrl = estaEnSubcarpeta() ? '../index.html' : './index.html';
            
            return `
                <div class="container">
                    <a href="${homeUrl}" class="logo">
                        <span class="navbar-brand mb-0">ClinicFlow</span>
                        <i class="fa-solid fa-chevron-right icono-header left"></i>
                        <i class="fa-solid fa-chevron-right icono-header right"></i>
                    </a>
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

    class LayoutManager {
        constructor() {
            this.currentPage = this.obtenerPaginaActual();
            this.sesion = this.verificarSesion();
        }

        obtenerPaginaActual() {
            const path = window.location.pathname;
            const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
            return filename;
        }

        verificarSesion() {
            const email = sessionStorage.getItem(CONFIG.sessionKeys.email);
            const nombre = sessionStorage.getItem(CONFIG.sessionKeys.nombre);
            
            if (email && nombre) {
                return { email, nombre };
            }
            return null;
        }

        generarMenuItems() {
            return CONFIG.pages.map(page => {
                const rutaCompleta = construirRuta(page.href);
                const isActive = this.currentPage === page.href;
                return TEMPLATES.menuItem(page, isActive, rutaCompleta);
            }).join('');
        }

        generarBotonesCTA() {
            if (this.sesion) {
                return TEMPLATES.userMenu(this.sesion.nombre);
            } else {
                return TEMPLATES.botonesPublicos();
            }
        }

        insertarHeader() {
            const placeholder = document.querySelector(CONFIG.selectors.headerPlaceholder);
            if (!placeholder) return;

            const menuItems = this.generarMenuItems();
            const ctaButtons = this.generarBotonesCTA();
            const headerHTML = TEMPLATES.header(menuItems, ctaButtons);
            
            placeholder.innerHTML = headerHTML;

            if (this.sesion) {
                this.configurarEventosUsuario();
            }
        }

        insertarFooter() {
            const placeholder = document.querySelector(CONFIG.selectors.footerPlaceholder);
            if (!placeholder) return;

            placeholder.innerHTML = TEMPLATES.footer();
        }

        configurarEventosUsuario() {
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

        manejarLogout() {
            if (confirm('¿Estás seguro de que querés cerrar sesión?')) {
                this.cerrarSesion();
            }
        }

        cerrarSesion() {
            Object.values(CONFIG.sessionKeys).forEach(key => {
                sessionStorage.removeItem(key);
            });
            
            this.mostrarMensajeCierreSesion();
        }

        mostrarMensajeCierreSesion() {
            alert('Sesión cerrada exitosamente');
            const homeUrl = estaEnSubcarpeta() ? '../index.html' : './index.html';
            window.location.href = homeUrl;
        }

        actualizar() {
            this.sesion = this.verificarSesion();
            this.insertarHeader();
        }

        inicializar() {
            this.insertarHeader();
            this.insertarFooter();
            
            window.addEventListener('storage', (e) => {
                if (Object.values(CONFIG.sessionKeys).includes(e.key)) {
                    this.actualizar();
                }
            });

            document.addEventListener('resultadoLogin', (e) => {
                if (e.detail.exito) {
                    this.actualizar();
                }
            });

            document.addEventListener('resultadoRegistro', (e) => {
                if (e.detail.exito) {
                    this.actualizar();
                }
            });
        }
    }

    function init() {
        const layoutManager = new LayoutManager();
        layoutManager.inicializar();

        window.LayoutManager = {
            actualizar: () => layoutManager.actualizar(),
            cerrarSesion: () => layoutManager.cerrarSesion(),
            verificarSesion: () => layoutManager.verificarSesion()
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();