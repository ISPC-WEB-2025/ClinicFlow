/**
 * Genera las tarjetas del equipo dinámicamente
 * @param {Array} team - Array de objetos con datos de miembros del equipo
 */
function generarTarjetas(team) {
	const teamGrid = document.getElementById("team-grid");
	
	if (!teamGrid) {
		console.error("No se encontró el elemento #team-grid");
		return;
	}

	teamGrid.innerHTML = "";

	if (!team || team.length === 0) {
		teamGrid.innerHTML = `
			<div class="error" role="alert">
				<i class="fas fa-exclamation-triangle fa-3x mb-3" aria-hidden="true"></i>
				<p>No se encontraron datos del equipo.</p>
			</div>
		`;
		return;
	}

	const fragment = document.createDocumentFragment();

	team.forEach((member) => {
		const article = crearTarjetaMiembro(member);
		fragment.appendChild(article);
	});

	teamGrid.appendChild(fragment);
}

/**
 * Crea una tarjeta individual de miembro del equipo
 * @param {Object} member - Datos del miembro (name, role, github)
 * @returns {HTMLElement} - Elemento article con la tarjeta
 */
function crearTarjetaMiembro(member) {
	const article = document.createElement("article");
	article.className = "team-card";

	const link = document.createElement("a");
	link.href = member.github || "#";
	link.className = "team-card-link";
	link.target = "_blank";
	link.rel = "noopener noreferrer";
	link.setAttribute("aria-label", `Ver GitHub de ${member.name}`);

	link.innerHTML = `
		<header class="team-info">
			<h3 class="team-name">${escapeHtml(member.name)}</h3>
			<p class="team-role">${escapeHtml(member.role)}</p>
		</header>
		<footer class="social-links">
			<i class="fab fa-github social-icon" aria-hidden="true"></i>
			<span class="sr-only">GitHub de ${escapeHtml(member.name)}</span>
		</footer>
	`;

	article.appendChild(link);
	return article;
}

/**
 * Escapa caracteres HTML para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} - Texto escapado
 */
function escapeHtml(text) {
	const div = document.createElement("div");
	div.textContent = text;
	return div.innerHTML;
}

/**
 * Muestra un mensaje de error en el grid del equipo
 * @param {string} message - Mensaje de error
 */
function mostrarError(message) {
	const teamGrid = document.getElementById("team-grid");
	if (!teamGrid) return;

	teamGrid.innerHTML = `
		<div class="error" role="alert">
			<i class="fas fa-exclamation-triangle fa-3x mb-3" aria-hidden="true"></i>
			<p>Error al cargar los datos: ${escapeHtml(message)}</p>
			<p>Por favor, verifique que el archivo team.json exista en la carpeta data.</p>
		</div>
	`;
}

/**
 * Carga los datos del equipo desde el JSON
 */
async function cargarDatosEquipo() {
	try {
		const response = await fetch("./data/team.json");
		
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		
		const data = await response.json();
		
		if (!data.team || !Array.isArray(data.team)) {
			throw new Error("Formato de datos inválido");
		}
		
		generarTarjetas(data.team);
	} catch (error) {
		console.error("Error loading team data:", error);
		mostrarError(error.message);
	}
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", cargarDatosEquipo);