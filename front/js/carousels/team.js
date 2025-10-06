const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

const createErrorHTML = (message) => `
    <div class="error" role="alert">
        <i class="fas fa-exclamation-triangle fa-3x mb-3" aria-hidden="true"></i>
        <p>${message}</p>
    </div>
`;

const createEmptyStateHTML = () => createErrorHTML('No se encontraron datos del equipo.');

const createLoadErrorHTML = (message) => `
    <div class="error" role="alert">
        <i class="fas fa-exclamation-triangle fa-3x mb-3" aria-hidden="true"></i>
        <p>Error al cargar los datos: ${escapeHtml(message)}</p>
        <p>Por favor, verifique que el archivo team.json exista en la carpeta data.</p>
    </div>
`;

const createMemberCardHTML = (member) => `
    <header class="team-info">
        <h3 class="team-name">${escapeHtml(member.name)}</h3>
        <p class="team-role">${escapeHtml(member.role)}</p>
    </header>
    <footer class="social-links">
        <i class="fab fa-github social-icon" aria-hidden="true"></i>
        <span class="sr-only">GitHub de ${escapeHtml(member.name)}</span>
    </footer>
`;

const createMemberCard = (member) => {
    const article = document.createElement('article');
    article.className = 'team-card';

    const link = document.createElement('a');
    link.href = member.github || '#';
    link.className = 'team-card-link';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `Ver GitHub de ${member.name}`);
    link.innerHTML = createMemberCardHTML(member);

    article.appendChild(link);
    return article;
};

const renderTeamCards = (team) => {
    const teamGrid = document.getElementById('team-grid');
    
    if (!teamGrid) return;

    if (!team?.length) {
        teamGrid.innerHTML = createEmptyStateHTML();
        return;
    }

    const fragment = document.createDocumentFragment();
    team.forEach(member => fragment.appendChild(createMemberCard(member)));
    
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
        throw new Error('Formato de datos inválido');
    }
    return data.team;
};

const loadTeamData = async () => {
    try {
        const response = await fetch('../data/team.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const team = validateTeamData(data);
        
        renderTeamCards(team);
    } catch (error) {
        showError(error.message);
    }
};

document.addEventListener('DOMContentLoaded', loadTeamData);