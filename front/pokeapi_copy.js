const contenedor = document.getElementById('contenedor-pokemon-api');

// Vatriables globales
let todosLosPokemones = [];
let paginaActual = 1;
const pokemonPorPagina = 20;
let totalPokemon = 0;

// Filtrar por ID
function filtroId(pokemones, id) {
    if (!id) return pokemones;
    return pokemones.filter(pokemon => pokemon.id == id);
}

// Filtrar por nombre
function filtroNombre(pokemones, nombre) {
    if (!nombre) return pokemones;
    return pokemones.filter(pokemon => pokemon.name.toLowerCase().includes(nombre.toLowerCase()));
}

// Filtrar por tipo
function filtroTipo(pokemones, tipo) {
    if (!tipo) return pokemones;
    return pokemones.filter(pokemon => 
        pokemon.types.some(t => t.type.name === tipo)
    );
}

function aplicarFiltros(pokemones) {
    const id = document.getElementById('filtro-id').value;
    const nombre = document.getElementById('filtro-nombre').value;
    const tipo = document.getElementById('filtro-tipo').value;

    let resultado = pokemones;
    resultado = filtroId(resultado, id);
    resultado = filtroNombre(resultado,nombre);
    resultado = filtroTipo(resultado, tipo);

    return resultado;
}

// Peticion para obtener el pokemon
async function obtenerPokemon(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        return data
    } catch (error) {
        console.error("Eror:", error);
        return null;
    }
}

function crearTarjetaPokemon(data){
    const tipos = data.types.map(t => t.type.name);
        // HTML de la tarjeta
        return `
                <div class="tarea-card">
                    <h3 class="tarea-titulo-card-poke">${data.name}</h3>
                    <img src="${data.sprites.front_default}" class="contenedor-img-poke" alt="${data.name}">
                    <h2>${data.id}</h2>
                    <p>${tipos}<p>
                    <div class="tarea-footer-poke">
                        <span class="tarea-prioridad-poke baja">${data.height}</span>
                        <span id="peso-pokemon" class="tarea-prioridad-poke baja">${data.weight / 10}</span>
                    </div>
                </div>
        `;
}

function mostrarPokemones(pokemones) {
    contenedor.innerHTML = '';

    if (pokemones.length === 0) {
        contenedor.innerHTML = '<p>No se encontraron pokemones</p>';
        return ;
    }

    const tarjetas = pokemones.map(pokemon => crearTarjetaPokemon(pokemon));
    contenedor.innerHTML = tarjetas.join('');
}

async function cargarPagina(pagina) {
    try {
        const offset = (pagina - 1) * pokemonPorPagina;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pokemonPorPagina}&offset=${offset}`);
        const data = await response.json();
        
        totalPokemon = data.count;

        // Obtener todos los pokemones de la pagina
        const promesas = data.results.map(pokemon => {
            const id = pokemon.url.split('/').filter(Boolean).pop();
            return obtenerPokemon(id);
        });
        
        todosLosPokemones = await Promise.all(promesas);

        mostrarPokemones(todosLosPokemones);
        actualizarInfoPagina();

    } catch (error) {
        console.error("Error", error);
    }
}

function actualizarInfoPagina() {
    const totalPaginas = Math.ceil(totalPokemon / pokemonPorPagina);
    document.getElementById('info-pagina').textContent = `Página ${paginaActual} de ${totalPaginas}`;

    document.getElementById('btn-anterior').disabled = paginaActual === 1;
    document.getElementById('btn-siguiente').disabled = paginaActual >= totalPaginas;
}

// Botones de navegacion
document.getElementById('btn-anterior').addEventListener('click', () => {
    const totalPaginas = Math.ceil(totalPokemon / pokemonPorPagina);
    if (paginaActual > 1) {
        paginaActual--;
        cargarPagina(paginaActual);
    }
});

document.getElementById('btn-siguiente').addEventListener('click', () => {
    const totalPaginas = Math.ceil(totalPokemon / pokemonPorPagina);
    if (paginaActual < totalPaginas) {
        paginaActual++;
        cargarPagina(paginaActual);
    }
});

// Botones de filtro
document.getElementById('btn-filtrar').addEventListener('click', () => {
    const pokemonesFiltrados =  aplicarFiltros(todosLosPokemones);
    mostrarPokemones(pokemonesFiltrados);
});

document.getElementById('btn-limpiar').addEventListener('click', () => {
    document.getElementById('filtro-id').value = '';
    document.getElementById('filtro-nombre').value = '';
    document.getElementById('filtro-tipo').value = '';
    mostrarPokemones(todosLosPokemones);
});


cargarPagina(1);


            
    