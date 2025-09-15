function generarTarjetas(team) {
	const teamGrid = document.getElementById("team-grid");
	teamGrid.innerHTML = "";

    

	if (!team || team.length === 0) {
		teamGrid.innerHTML = `
                    <div class="error">
                        <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                        <p>No se encontraron datos del equipo.</p>
                    </div>
                `;
		return;
	}

	team.forEach((member) => {
		const card = document.createElement("div");
		card.className = "team-card";

		card.innerHTML = `
        	
                    
                    <div class="team-info">
                        <h3 class="team-name">${member.name}</h3>
                        <p class="team-role">${member.role}</p>
                            <div class="social-links">
                            <a href="${member.linkedin}" target="_blank" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                            <a href="${member.github}" target="_blank" title="GitHub"><i class="fab fa-github"></i></a>
                        </div>
                    </div>
                `;

		teamGrid.appendChild(card);
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
