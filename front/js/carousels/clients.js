const getItemsPerSlide = () => {
    const width = window.innerWidth;
    if (width <= 550) return 1;
    if (width <= 768) return 2;
    return 4;
};

const generateCard = (client) => `
    <article class="card">
        <img class="card-img-top" src="${client.image}" alt="${client.alt}">
        <div class="card-body">
            <h5 class="card-title">${client.title}</h5>
            <p class="card-text">${client.text}</p>
        </div>
    </article>
`;

const generateCards = (clients) => clients.map(generateCard).join('');

const generateCarouselItem = (slideClients, isActive) => `
    <div class="carousel-item ${isActive ? 'active' : ''}">
        <div class="card-wrapper">
            ${generateCards(slideClients)}
        </div>
    </div>
`;

const generateCarouselItems = (clients) => {
    const itemsPerSlide = getItemsPerSlide();
    let itemsHTML = '';

    for (let i = 0; i < clients.length; i += itemsPerSlide) {
        const slideClients = clients.slice(i, i + itemsPerSlide);
        itemsHTML += generateCarouselItem(slideClients, i === 0);
    }

    return itemsHTML;
};

const createCarouselHTML = (clients) => `
    <header class="section-header mt-4 mb-4 hd-carousel">
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

    <div id="clientsCarousel" class="carousel slide mb-4" data-bs-ride="false">
        <div class="carousel-inner" id="carousel-inner">
            ${generateCarouselItems(clients)}
        </div>
    </div>
`;

const renderCarousel = (clients) => {
    const carouselContainer = document.getElementById('clients');
    if (carouselContainer) {
        carouselContainer.innerHTML = createCarouselHTML(clients);
    }
};

const updateCarouselOnResize = async () => {
    const carouselInner = document.getElementById('carousel-inner');
    if (!carouselInner) return;

    try {
        const response = await fetch('./data/clients.json');
        const data = await response.json();
        carouselInner.innerHTML = generateCarouselItems(data.clients);
    } catch (error) {
        return;
    }
};

const initCarousel = () => {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateCarouselOnResize, 250);
    });
};

const loadClients = async () => {
    try {
        const response = await fetch('./data/clients.json');
        const data = await response.json();
        renderCarousel(data.clients);
        initCarousel();
    } catch (error) {
        return;
    }
};

document.addEventListener('DOMContentLoaded', loadClients);