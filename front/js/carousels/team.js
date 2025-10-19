//ESTE ARCHIVO SE TRATA DE RENDERIZAR LAS TARJETAS DEL EQUIPO DE FORMA DINAMICA desde team.json
//POR QUE? PORQUE NOS DA MAS CINTURA AL MOMENTO DE DEFINIR LA INFORMACION, QUITAR PONER Y SACAR DATOS SIN TENER QUE PASAR POR CADA UNA DE LAS TARJETAS EN HTML, ASÍ SE RENDERIZAN TODAS IGUALES Y DE FORMA CONTROLADA CON MANEJO DE ERORRES Y MENSAJES DE UNA SOLA VEZ.



const escapeHtml = (text) => {
	const div = document.createElement('div'); // crea un elemento <div> en memoria (no insertado en el DOM).
	div.textContent = text; // textContent no interpreta HTML, sino que lo trata como texto literal.
	return div.innerHTML; // devuelve el HTML interno del div, que será la versión escapada del texto. Ejemplo: si text es <script>, devuelve &lt;script&gt;.
};

/* SEGURIDAD
QUE: transforma texto plano en HTML seguro, escapando caracteres que podrían interpretarse como HTML.
POR QUE: si luego insertas ese texto dentro de un string HTML (por ejemplo con ${escapeHtml(message)}), el navegador mostrará los caracteres especiales como texto literal y no los ejecutará.
PARA QUE: previene inyección de HTML/JS (XSS) cuando muestras contenido dinámico en plantillas. */


const createErrorHTML = (message, showDetails = false) => `
	<div class="alert alert-warning text-center py-5" role="status" aria-live="polite">
		<i class="fas fa-exclamation-triangle fa-3x mb-3 text-warning" aria-hidden="true"></i>
		<p class="mb-0 fs-5">${escapeHtml(message)}</p>
		${showDetails ? '<p class="small text-muted mt-2">Por favor, verifique que el archivo team.json exista en la carpeta data.</p>' : ''} 
	</div>
`; 

/* QUE: construye y devuelve un string HTML para mostrar un mensaje de error/estado (bootstrap-like alert) usando plantilla literal.
COMO: //Usa una plantilla literal para armar un bloque <div> con clases (alert alert-warning ...) y contenido visual (icono y texto).
//Inserta el message dentro del HTML con ${escapeHtml(message)} — importante: asegura que el mensaje se escape correctamente.
// Si showDetails es true, agrega un párrafo adicional (mensaje pequeño) mediante un operador ternario: ${showDetails ? '...' : ''}.
PARA QUE: Mostrar alertas en caso que los datos de referencia no se carguen (json)
 */

const createEmptyStateHTML = () => createErrorHTML('No se encontraron datos del equipo.');
/* 
Qué hace: wrapper sencillo que devuelve el HTML de estado vacío (cuando no hay miembros). Reusa createErrorHTML con un mensaje fijo.

 */


const createLoadErrorHTML = (message) => createErrorHTML(`Error al cargar los datos: ${message}`, true);
/* 
Qué hace: wrapper que construye un mensaje de error al cargar, pasando showDetails = true para que muestre la nota adicional sobre team.json.
*/

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

/* 
Qué hace (resumen): genera el HTML interno (string) que representa la tarjeta visual de un miembro del equipo (nombre, rol, icono de GitHub).
COMO:
.team-info que contiene <h3> con el nombre y <p> con el rol.

.social-links con un icono de GitHub (<i class="fab fa-github">) y un <span class="visually-hidden"> para accesibilidad (texto alternativo para lectores de pantalla).

Todos los campos dinámicos (member.name, member.role) se pasan por escapeHtml() para evitar inyección.

Accesibilidad: el <span class="visually-hidden">Ver perfil de GitHub de ...</span> proporciona contexto para los lectores de pantalla.
*/

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

/* QUE: crea nodos DOM reales (<article> y <a>) para una tarjeta de miembro y retorna ese article.

COMO:

const article = document.createElement('article'); — crea un contenedor article.

article.className = 'team-card'; — aplica clase.

article.setAttribute('role', 'listitem'); — indica semántica de ítem en una lista (útil si el team-grid fuera tratado como lista).

Crea const link = document.createElement('a'); y configura:

link.href = member.github || '#'; — si member.github existe lo usa; si no, enlace vacío #.

link.className = 'team-card-link';

link.target = member.github ? '_blank' : '_self'; — abre en pestaña nueva sólo si hay URL de GitHub.

SEGURIDAD: link.rel = member.github ? 'noopener noreferrer' : ''; — seguridad para enlaces externos. (En _blank, el nuevo sitio hereda acceso limitado al window que lo abrió, a través de window.opener. la página abierta puede ejecutar JavaScript. El sitio externo puede redirigir tu pestaña original a una página falsa (ataque conocido como tabnabbing))

link.setAttribute('aria-label', \Ver perfil de GitHub de ${member.name}`);` — etiqueta accesible.

Si !member.github (no hay perfil):

link.setAttribute('aria-disabled', 'true'); — indica que no es interactivo para lectores de pantalla.

link.style.cursor = 'default'; — cursor en lugar de mano.

link.addEventListener('click', (e) => e.preventDefault()); — evita navegación accidental (por ejemplo al pulsar Enter).

link.innerHTML = createMemberCardHTML(member); — inyecta el HTML seguro (la función previa ya escapó los valores).

article.appendChild(link); — anida el link dentro del article.

return article; — devuelve el elemento listo para insertarse en el DOM.

*/



const renderTeamCards = (team) => {
	const teamGrid = document.getElementById('team-grid'); //busca #team-grid
	
	if (!teamGrid) {
		console.error('Elemento #team-grid no encontrado en el DOM');
		return;
	} // Maneja error de no encontrarlo

	if (!team?.length) { // ? optional chaining (encadenamiento opcional), es una forma segura de acceder a propiedades de un objeto sin causar errores si algo no existe. Si team es null o undefined, no intenta acceder a .length y devuelve undefined en su lugar.
		teamGrid.innerHTML = createEmptyStateHTML();
		return;
	} //devuelve error si esta vacio el contenido recibido


	const fragment = document.createDocumentFragment();
	team.forEach(member => {
		if (member.name && member.role) {
			fragment.appendChild(createMemberCard(member));
		}
	}); // crea las tarjetas si existen name y role en el miembro del team (itera el obejto team) filtra miembros incompletos visualmente
// Un DocumentFragment es como un contenedor temporal o una miniatura de DOM que no está en pantalla todavía.
//crear y preparar muchos elementos antes de agregarlos todos juntos al DOM real.
/* 
Eficiencia: Si agregas muchos nodos uno por uno al DOM, el navegador recalcula el diseño cada vez (reflows).

Con el fragmento, se hace un solo reflow cuando se inserta todo el bloque final.

Es como montar una maqueta fuera de escena y luego colocarla completa en el escenario. */

	teamGrid.innerHTML = ''; // limpia contenido previo del contenedor.
	teamGrid.appendChild(fragment); // inserta todas las cards juntas.
};




const showError = (message) => {
	const teamGrid = document.getElementById('team-grid');
	if (teamGrid) {
		teamGrid.innerHTML = createLoadErrorHTML(message);
	}
}; // busca #team-grid y, si existe, lo rellena con createLoadErrorHTML(message) (mensaje de error con detalles).



const validateTeamData = (data) => {
	if (!data?.team || !Array.isArray(data.team)) {
		throw new Error('Formato de datos inválido: se esperaba un objeto con propiedad "team" de tipo array');
	} // Si data no existe o data.team no existe o data.team no es array, lanza un Error.

	const invalidMembers = data.team.filter(member => !member.name || !member.role);
	if (invalidMembers.length > 0) {
		console.warn('Algunos miembros del equipo no tienen todos los campos requeridos:', invalidMembers);
	} // Encuentra miembros con campos faltantes.

	return data.team;
};

/* QUE: valida la estructura del JSON recibido (que tenga team como array) y avisa si hay miembros incompletos. Devuelve el array team.
*/


const loadTeamData = async () => { // función asíncrona principal que trae ../data/team.json, valida y renderiza; maneja errores.
	try { //se prueba este bloque
		const response = await fetch('../data/team.json'); // se piden los datos del json, y se guardan en response como promesa
		
		if (!response.ok) {
			throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
		} // si falla esa conexion con el documento se genera este error
		
		const data = await response.json(); // una vez que se trajo la info, la promesa realizada se guarda en data y se formatea
		const team = validateTeamData(data); // valida la info
		
		renderTeamCards(team); // se crean las cards
	} catch (error) { // si no funciona se captura el error y se maneja aca
		console.error('Error al cargar datos del equipo:', error);
		showError(error.message);
	}
};

/* Una función asíncrona es una que no se ejecuta toda de golpe, sino que puede esperar operaciones que tardan (como leer un archivo o pedir datos a un servidor) sin detener el resto del programa.
async indica que la función trabajará con operaciones asíncronas (no inmediatas).

Dentro de ella, usamos await para decir:
👉 “esperá que esto termine antes de seguir”.

Mientras tanto, el navegador no se bloquea, puede seguir haciendo otras cosas (como responder al usuario).
pausa la ejecución dentro de esa función hasta que una promesa (como fetch) se resuelva.

Te permite escribir código asíncrono como si fuera secuencial, pero sin bloquear la página. */



if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', loadTeamData); // espera a que el DOM esté listo y luego llama loadTeamData.
} else {
	
	loadTeamData();
}

/* 
decide cuándo ejecutar loadTeamData() según el estado de carga del documento.
garantiza que document.getElementById('team-grid') exista cuando se intente acceder a él.
*/