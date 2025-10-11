document.addEventListener("DOMContentLoaded", function () {
	fetch("./data/clients.json")
		.then((response) => response.json())
		.then((data) => {
			generateCarousel(data.clients);
			initCarousel();
		})
		.catch((error) => console.error("Error loading JSON:", error));

	function generateCarousel(clients) {
		const carouselContainer = document.getElementById("clients");
		const carouselHTML = `
    <header class="section-header mt-4 mb-4">
        <h2 class="divider-title">Nuestros Clientes</h2>
        <div class="control-wrapper">
            <a class="carousel-control-prev" href="#clientsCarousel" role="button" data-bs-slide="prev" aria-label="Anterior">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            </a>
            <a class="carousel-control-next" href="#clientsCarousel" role="button" data-bs-slide="next" aria-label="Siguiente">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
            </a>
        </div>
    </header>

    <div id="clientsCarousel" class="carousel slide" data-bs-ride="false">
        <div class="carousel-inner" id="carousel-inner">
            ${generateCarouselItems(clients)}
        </div>
    </div>
`;

		carouselContainer.innerHTML = carouselHTML;
	}

	function generateCarouselItems(clients) {
		let itemsHTML = "";
		const itemsPerSlide = getItemsPerSlide();

		for (let i = 0; i < clients.length; i += itemsPerSlide) {
			const slideClients = clients.slice(i, i + itemsPerSlide);
			const isActive = i === 0 ? "active" : "";

			itemsHTML += `
                <div class="carousel-item ${isActive}">
                    <div class="card-wrapper">
                        ${generateCards(slideClients)}
                    </div>
                </div>
            `;
		}

		return itemsHTML;
	}

	function generateCards(clients) {
		return clients
			.map(
				(client) => `
            <article class="card">
                <img class="card-img-top" src="${client.image}" alt="${client.alt}">
                <div class="card-body">
                    <h5 class="card-title">${client.title}</h5>
                    <p class="card-text">${client.text}</p>
                </div>
            </article>
        `
			)
			.join("");
	}

	function getItemsPerSlide() {
		const width = window.innerWidth;
		if (width <= 550) return 1;
		if (width <= 768) return 2;
		return 4;
	}

	function initCarousel() {
		window.addEventListener("resize", function () {
			const carouselInner = document.getElementById("carousel-inner");
			if (carouselInner) {
				fetch("./data/clients.json")
					.then((response) => response.json())
					.then((data) => {
						carouselInner.innerHTML = generateCarouselItems(
							data.clients
						);
					});
			}
		});
	}
});
