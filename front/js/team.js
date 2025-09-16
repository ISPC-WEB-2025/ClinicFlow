function generarTarjetas(team) {
	const teamGrid = document.getElementById("team-grid");
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

	team.forEach((member) => {
		const article = document.createElement("article");
		article.className = "team-card";

		article.innerHTML = `
			<header class="team-info">
				<h3 class="team-name">${member.name}</h3>
				<p class="team-role">${member.role}</p>
			</header>
			<footer class="social-links">
				<a href="${member.github}" target="_blank" rel="noopener" title="GitHub de ${member.name}">
					<i class="fab fa-github" aria-hidden="true"></i>
					<span class="sr-only">GitHub</span>
				</a>
			</footer>
		`;

		teamGrid.appendChild(article);
	});
}


document.addEventListener("DOMContentLoaded", function () {
	fetch("./data/team.json")
		.then((response) => {
			if (!response.ok) {
				throw new Error("No se pudo cargar el archivo JSON");
			}
			return response.json();
		})
		.then((data) => {
			generarTarjetas(data.team);
		})
		.catch((error) => {
			console.error("Error loading JSON:", error);
			const teamGrid = document.getElementById("team-grid");
			teamGrid.innerHTML = `
                        <div class="error">
                            <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                            <p>Error al cargar los datos: ${error.message}</p>
                            <p>Por favor, verifique que el archivo team.json exista en la carpeta data.</p>
                        </div>
                    `;
		});
});
