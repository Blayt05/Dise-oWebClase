const contenedor = document.getElementById('contenedor-pokemon');

// Peticion
async function obtenerPokemon(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        // HTML de la tarjeta
        const card = `
            <div class="pokemon-card" style="border: 1px solid #ccc; padding: 10px; text-align: center;">
                <img src="${data.sprites.front_default}" alt="${data.name}">
                <h3>${data.name}</h3>
                <p>Peso: ${data.weight / 10} kg</p>
            </div>
        `;
        
        contenedor.innerHTML += card;

    } catch (error) {
        console.error("Eror:", error);
    }
}

for(let i = 1; i <= 15; i++) {
    obtenerPokemon(i);
}
    