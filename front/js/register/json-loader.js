(async function() {

    const dispatchUsuarios = (usuarios) => {
        document.dispatchEvent(new CustomEvent('usuariosJSONCargados', {
            detail: { usuarios }
        }));
    };

    try {
        const response = await fetch('../data/users.json');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        dispatchUsuarios(data.usuarios || []);
        
    } catch (error) {
        dispatchUsuarios([]);
    }
})();