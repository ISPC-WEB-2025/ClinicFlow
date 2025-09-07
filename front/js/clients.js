// clients-carousel.js
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos del JSON
    fetch('./data/clients.json')
        .then(response => response.json())
        .then(data => {
            generateCarousel(data.clients);
            initCarousel();
        })
        .catch(error => console.error('Error loading JSON:', error));

    function generateCarousel(clients) {
        const carouselContainer = document.getElementById('clients');
        
        // Estructura HTML del carrusel
        const carouselHTML = `
            
                <span class="section-header mt-4 mb-4">
                    <h4 class="divider-title">Nuestros Clientes</h4>
                    <span class="control-wrapper">
                        <a class="carousel-control-prev" href="#clientsCarousel" role="button" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="sr-only">Previous</span>
                        </a>
                        <a class="carousel-control-next" href="#clientsCarousel" role="button" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="sr-only">Next</span>
                        </a>
                    </span>
                </span>

                <div id="clientsCarousel" class="carousel slide" data-bs-ride="false">
                    <div class="carousel-inner" id="carousel-inner">
                        ${generateCarouselItems(clients)}
                    </div>
                </div>
            
        `;

        carouselContainer.innerHTML = carouselHTML;
    }

    function generateCarouselItems(clients) {
        let itemsHTML = '';
        const itemsPerSlide = getItemsPerSlide();
        
        // Dividir clients en grupos según itemsPerSlide
        for (let i = 0; i < clients.length; i += itemsPerSlide) {
            const slideClients = clients.slice(i, i + itemsPerSlide);
            const isActive = i === 0 ? 'active' : '';
            
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
        return clients.map(client => `
            <article class="card">
                <img class="card-img-top" src="${client.image}" alt="${client.alt}">
                <div class="card-body">
                    <h5 class="card-title">${client.title}</h5>
                    <p class="card-text">${client.text}</p>
                </div>
            </article>
        `).join('');
    }

    function getItemsPerSlide() {
        const width = window.innerWidth;
        if (width <= 450) return 1;
        if (width <= 768) return 2;
        return 4; // Desktop
    }

    function initCarousel() {
        // Reiniciar carrusel cuando cambie el tamaño de la ventana
        window.addEventListener('resize', function() {
            const carouselInner = document.getElementById('carousel-inner');
            if (carouselInner) {
                fetch('./data/clients.json')
                    .then(response => response.json())
                    .then(data => {
                        carouselInner.innerHTML = generateCarouselItems(data.clients);
                    });
            }
        });
    }
});