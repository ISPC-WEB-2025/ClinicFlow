
const escapeHtml = (text) => {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
};


const createErrorHTML = (message, showDetails = false) => `
	<div class="alert alert-warning text-center py-5" role="status" aria-live="polite">
		<i class="fas fa-exclamation-triangle fa-3x mb-3 text-warning" aria-hidden="true"></i>
		<p class="mb-0 fs-5">${escapeHtml(message)}</p>
		${showDetails ? '<p class="small text-muted mt-2">Por favor, verifique que el archivo team.json exista en la carpeta data.</p>' : ''}
	</div>
`;


const createEmptyStateHTML = () => createErrorHTML('No se encontraron datos del equipo.');


const createLoadErrorHTML = (message) => createErrorHTML(`Error al cargar los datos: ${message}`, true);


const createMemberCardHTML = (member) => `
	<div class="team-info">
		<h3 class="team-name">${escapeHtml(member.name)}</h3>
		<p class="team-role">${escapeHtml(member.role)}</p>
	</div>
	<div class="social-links">
		<i class="fab fa-github social-icon" aria-hidden="true"></i>
		<span class="visually-hidden">Ver perfil de GitHub de ${escapeHtml(member.name)}</span>
	</div>
`;


const createMemberCard = (member) => {
	const article = document.createElement('article');
	article.className = 'team-card';
	article.setAttribute('role', 'listitem');


	const link = document.createElement('a');
	link.href = member.github || '#';
	link.className = 'team-card-link';
	link.target = member.github ? '_blank' : '_self';
	link.rel = member.github ? 'noopener noreferrer' : '';
	link.setAttribute('aria-label', `Ver perfil de GitHub de ${member.name}`);
	

	if (!member.github) {
		link.setAttribute('aria-disabled', 'true');
		link.style.cursor = 'default';
		link.addEventListener('click', (e) => e.preventDefault());
	}

	link.innerHTML = createMemberCardHTML(member);
	article.appendChild(link);

	return article;
};


const renderTeamCards = (team) => {
	const teamGrid = document.getElementById('team-grid');
	
	if (!teamGrid) {
		console.error('Elemento #team-grid no encontrado en el DOM');
		return;
	}

	if (!team?.length) {
		teamGrid.innerHTML = createEmptyStateHTML();
		return;
	}


	const fragment = document.createDocumentFragment();
	team.forEach(member => {
		if (member.name && member.role) {
			fragment.appendChild(createMemberCard(member));
		}
	});


	teamGrid.innerHTML = '';
	teamGrid.appendChild(fragment);
};


const showError = (message) => {
	const teamGrid = document.getElementById('team-grid');
	if (teamGrid) {
		teamGrid.innerHTML = createLoadErrorHTML(message);
	}
};


const validateTeamData = (data) => {
	if (!data?.team || !Array.isArray(data.team)) {
		throw new Error('Formato de datos inválido: se esperaba un objeto con propiedad "team" de tipo array');
	}


	const invalidMembers = data.team.filter(member => !member.name || !member.role);
	if (invalidMembers.length > 0) {
		console.warn('Algunos miembros del equipo no tienen todos los campos requeridos:', invalidMembers);
	}

	return data.team;
};


const loadTeamData = async () => {
	try {
		const response = await fetch('../data/team.json');
		
		if (!response.ok) {
			throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
		}
		
		const data = await response.json();
		const team = validateTeamData(data);
		
		renderTeamCards(team);
	} catch (error) {
		console.error('Error al cargar datos del equipo:', error);
		showError(error.message);
	}
};


if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', loadTeamData);
} else {
	
	loadTeamData();
}