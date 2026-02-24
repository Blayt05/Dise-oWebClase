// URL de la api
const pokeapi = 'https://pokeapi.co/api/v2/pokemon/ditto';

// Peticion
fetch(pokeapi)
    .then(response => response.json()) // Se formatea a JSON
    .then(data => {
        const imgUrl = data.sprites.other['official-artwork'].front_default;
        const name = data.name;
        const peso = data.weight;
        const altura = data.height;

        document.getElementById('imagen-pokemon').src = imgUrl;
        document.getElementById('nombre-pokemon').textContent = name;
        document.getElementById('peso-pokemon').textContent = peso;
        document.getElementById('altura-pokemon').textContent = altura;

    })
    .catch(error => console.error("Error al consumir la API:", error));
    