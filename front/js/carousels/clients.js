//ESTE ARCHIVO BUSCA RENDERIZAR EL CARRUSEL DE CLIENTES DE FORMA RESPONSIVE.
// POR QUE? PORQUE EL CARRUSEL DE BT NO PERMITIA MODIFICAR LA COMPOSICION DE CADA UNA DE SUS SLIDES (CANTIDAD DE ELEMENTOS MOSTRADOS POR PAGINA) DE ESTE MODO SE LEE EL TAMAÑO DE LA PANTALLA Y SE INSERTA EL CODIGO HTML PARA CADA UNA. PODRIA HABERSE REALIZADO CON OCULTAR Y MOSTRAR CODIGO HTML CON CSS PERO ESE TIPO DE ESCRITURA GENERA UNA CARGA MAS LENTA DEL DOM, PORQUE TIENE QUE PRECARGAR TODO POR MAS QUE NO SE MUESTRE, ASI SE CARGA SOLO EL HTML QUE SE NECESITA.


const getItemsPerSlide = () => {
    const width = window.innerWidth; // ancho de pantalla
    if (width <= 550) return 1; // breakpoint 1 (cantudad de elementos mostrados 1)
    if (width <= 768) return 2; // breakpoint 2 ( cant de el mostrados 2)
    return 4; // default valor mostrar 4
};

const generateCard = (client) => `
    <article class="card">
        <img class="card-img-top" src="${client.image}" alt="${client.alt}">
        <div class="card-body">
            <h5 class="card-title">${client.title}</h5>
            <p class="card-text">${client.text}</p>
        </div>
    </article>
`; // creamos la tarjeta de cada cliente usando template literal o template string

const generateCards = (clients) => clients.map(generateCard).join(''); // Usa map() para aplicar generateCard a cada elemento del array. Une todas las cadenas HTML con .join('') para obtener un solo bloque de HTML.

const generateCarouselItem = (slideClients, isActive) => `
    <div class="carousel-item ${isActive ? 'active' : ''}">
        <div class="card-wrapper">
            ${generateCards(slideClients)}
        </div>
    </div>
`;
// Genera el HTML de una diapositiva del carrusel (un “slide” de Bootstrap).
/* 
Recibe un subconjunto de clientes (slideClients) y un booleano (isActive).

Crea un <div class="carousel-item"> y agrega la clase "active" solo al primero.

Dentro, incluye las tarjetas generadas con generateCards(slideClients). */

const generateCarouselItems = (clients) => {
    const itemsPerSlide = getItemsPerSlide();
    let itemsHTML = '';

    for (let i = 0; i < clients.length; i += itemsPerSlide) {
        const slideClients = clients.slice(i, i + itemsPerSlide);
        itemsHTML += generateCarouselItem(slideClients, i === 0);
    }

    return itemsHTML;
};
/* 
Crea todas las diapositivas del carrusel en función del total de clientes.Llama a getItemsPerSlide() para saber cuántos clientes entran por slide.

Usa un bucle for que recorre el array de clients en grupos (chunks).
Cada grupo se pasa a generateCarouselItem().

Une todo el HTML en una sola cadena y la retorna.
*/


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

/* 
QUÉ:
Genera el HTML completo del carrusel, incluyendo el título, los botones de control y los ítems.

CÓMO:

Crea la estructura del carrusel con controles “prev” y “next”.

Inserta las diapositivas generadas con generateCarouselItems(clients) dentro de .carousel-inner
*/



const renderCarousel = (clients) => {
    const carouselContainer = document.getElementById('clients');
    if (carouselContainer) {
        carouselContainer.innerHTML = createCarouselHTML(clients);
    }
};

/* 
QUÉ:
Inserta el HTML del carrusel en el DOM.

CÓMO:

Busca el contenedor con id="clients".

Si existe, reemplaza su contenido con createCarouselHTML(clients).
*/

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



/* 
QUÉ:
Actualiza el carrusel cuando cambia el tamaño de la ventana (por ejemplo, al rotar el celular o cambiar de tamaño el navegador).

CÓMO:

Busca el contenedor #carousel-inner.

Si existe, vuelve a cargar los datos del archivo clients.json.

Regenera las diapositivas con generateCarouselItems().
*/


const initCarousel = () => {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateCarouselOnResize, 250);
    });
};

/* 
QUÉ:
Configura el evento que controla la actualización del carrusel al redimensionar la ventana.

CÓMO:

Declara resizeTimeout (un temporizador).

Escucha el evento window.resize.

Cada vez que el usuario cambia el tamaño, espera 250 ms antes de ejecutar updateCarouselOnResize() para no saturar el navegador.

PARA QUÉ:
Evita recargar el carrusel continuamente mientras el usuario redimensiona la ventana; solo actualiza cuando termina de hacerlo.
*/

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

/* 
QUÉ:
Carga los datos de los clientes desde un archivo JSON y genera el carrusel inicial.

CÓMO:

Usa fetch('./data/clients.json') para obtener los datos.

Convierte la respuesta a objeto con response.json().

Llama a renderCarousel(data.clients) para mostrarlo.

Inicia el listener de redimensionamiento con initCarousel().

PARA QUÉ:
Es la función principal que carga y muestra el carrusel con los datos dinámicos del archivo.
*/

document.addEventListener('DOMContentLoaded', loadClients); // espera que el documento este cargado para Ejecutar loadClients()