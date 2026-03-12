// ===================================
// VARIABLES GLOBALES
// ===================================

// Datos de los Pokémon
let pokemon1 = {
    nombre: '',
    imagen: '',
    vidaActual: 100,
    turnosJugados: 0
};

let pokemon2 = {
    nombre: '',
    imagen: '',
    vidaActual: 100,
    turnosJugados: 0
};

let turnoActual = 1; // 1 = Pokémon 1, 2 = Pokémon 2

// ===================================
// CARGAR LISTA DE POKÉMON AL INICIAR
// ===================================

window.onload = async function() {
    try {
        const respuesta = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        const datos = await respuesta.json();
        const listaOpciones = document.getElementById('pokemon-list');
        
        datos.results.forEach(pokemon => {
            const opcion = document.createElement('option');
            opcion.value = pokemon.name;
            listaOpciones.appendChild(opcion);
        });
    } catch (error) {
        console.log("Error al cargar la lista de Pokémon:", error);
    }
};

// ===================================
// INICIAR LA BATALLA
// ===================================

async function iniciarBatalla() {
    const nombrePoke1 = document.getElementById('poke1-input').value.toLowerCase().trim();
    const nombrePoke2 = document.getElementById('poke2-input').value.toLowerCase().trim();
    const mensajeError = document.getElementById('error-msg');
    
    // Validar que se ingresaron ambos Pokémon
    if (!nombrePoke1 || !nombrePoke2) {
        mensajeError.textContent = "⚠️ Por favor, ingresa ambos Pokémon";
        return;
    }
    
    if (nombrePoke1 === nombrePoke2) {
        mensajeError.textContent = "⚠️ Los Pokémon deben ser diferentes";
        return;
    }
    
    try {
        // Obtener datos de la API
        const datosPoke1 = await obtenerDatosPokemon(nombrePoke1);
        const datosPoke2 = await obtenerDatosPokemon(nombrePoke2);
        
        // Configurar los Pokémon
        configurarPokemon(pokemon1, datosPoke1, 'p1');
        configurarPokemon(pokemon2, datosPoke2, 'p2');
        
        // Cambiar a la pantalla de batalla
        document.getElementById('selection-screen').classList.remove('active');
        document.getElementById('battle-screen').classList.add('active');
        
        // Mostrar mensaje inicial
        mostrarNarrador(`¡La batalla entre ${pokemon1.nombre} y ${pokemon2.nombre} ha comenzado!`);
        
        // Iniciar el primer turno después de 2 segundos
        setTimeout(ejecutarTurno, 2000);
        
    } catch (error) {
        mensajeError.textContent = "❌ Error: Pokémon no encontrado. Verifica los nombres.";
    }
}

// ===================================
// OBTENER DATOS DE UN POKÉMON
// ===================================

async function obtenerDatosPokemon(nombre) {
    const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
    if (!respuesta.ok) throw new Error('Pokémon no encontrado');
    return await respuesta.json();
}

// ===================================
// CONFIGURAR POKÉMON CON SUS DATOS
// ===================================

function configurarPokemon(pokemon, datos, prefijo) {
    pokemon.nombre = datos.name.toUpperCase();
    pokemon.imagen = datos.sprites.other['official-artwork'].front_default || datos.sprites.front_default;
    pokemon.vidaActual = 100;
    pokemon.turnosJugados = 0;
    
    // Actualizar interfaz
    document.getElementById(`${prefijo}-name`).textContent = pokemon.nombre;
    document.getElementById(`${prefijo}-img`).src = pokemon.imagen;
    actualizarBarrasVida();
}

// ===================================
// EJECUTAR UN TURNO DE BATALLA
// ===================================

function ejecutarTurno() {
    // Verificar si la batalla terminó
    if (pokemon1.vidaActual <= 0 || pokemon2.vidaActual <= 0) {
        return;
    }
    
    // Determinar atacante y defensor
    const atacante = turnoActual === 1 ? pokemon1 : pokemon2;
    const defensor = turnoActual === 1 ? pokemon2 : pokemon1;
    
    // Incrementar turnos del atacante
    atacante.turnosJugados++;
    
    // Elegir acción aleatoria
    const accion = elegirAccion(atacante);
    
    // Verificar si la acción falla (20% de probabilidad)
    const falla = Math.random() < 0.20;
    
    if (falla) {
        mostrarNarrador(`❌ Turno de ${atacante.nombre}: ¡El ${accion.nombre} FALLÓ!`);
        agregarAlHistorial(`❌ ${atacante.nombre} intentó usar ${accion.nombre} pero falló.`);
    } else {
        // Ejecutar la acción
        ejecutarAccion(atacante, defensor, accion);
    }
    
    // Verificar si hay un ganador
    if (defensor.vidaActual <= 0) {
        setTimeout(() => mostrarGanador(atacante), 1500);
    } else {
        // Cambiar de turno y continuar
        turnoActual = turnoActual === 1 ? 2 : 1;
        setTimeout(ejecutarTurno, 2500);
    }
}

// ===================================
// ELEGIR ACCIÓN PARA EL TURNO
// ===================================

function elegirAccion(pokemon) {
    const accionesPosibles = [];
    
    // Ataque normal (siempre disponible)
    accionesPosibles.push({
        tipo: 'ataque',
        nombre: 'Ataque Normal',
        danioMin: 10,
        danioMax: 20
    });
    
    // Defensa normal (siempre disponible)
    accionesPosibles.push({
        tipo: 'defensa',
        nombre: 'Defensa',
        reduccion: 0.5
    });
    
    // Ataque especial (disponible después de 3 turnos)
    if (pokemon.turnosJugados >= 3) {
        accionesPosibles.push({
            tipo: 'ataque-especial',
            nombre: 'Ataque Especial',
            danioMin: 25,
            danioMax: 35
        });
    }
    
    // Defensa especial (disponible después de 2 turnos)
    if (pokemon.turnosJugados >= 2) {
        accionesPosibles.push({
            tipo: 'defensa-especial',
            nombre: 'Defensa Especial',
            reduccion: 0
        });
    }
    
    // Elegir una acción aleatoria de las disponibles
    const indiceAleatorio = Math.floor(Math.random() * accionesPosibles.length);
    return accionesPosibles[indiceAleatorio];
}

// ===================================
// EJECUTAR UNA ACCIÓN
// ===================================

function ejecutarAccion(atacante, defensor, accion) {
    let mensaje = `🎯 Turno de ${atacante.nombre}: usó ${accion.nombre}`;
    let danioTotal = 0;
    
    if (accion.tipo === 'ataque' || accion.tipo === 'ataque-especial') {
        // Calcular daño
        const danioBase = Math.floor(Math.random() * (accion.danioMax - accion.danioMin + 1)) + accion.danioMin;
        danioTotal = danioBase;
        
        // Aplicar daño al defensor
        defensor.vidaActual -= danioTotal;
        if (defensor.vidaActual < 0) defensor.vidaActual = 0;
        
        mensaje += `. Causó ${danioTotal}% de daño. ${defensor.nombre} tiene ${defensor.vidaActual}% de vida.`;
        
        // Animación de golpe
        const imgDefensor = turnoActual === 1 ? 'p2-img' : 'p1-img';
        document.getElementById(imgDefensor).classList.add('shake');
        setTimeout(() => document.getElementById(imgDefensor).classList.remove('shake'), 500);
        
    } else if (accion.tipo === 'defensa' || accion.tipo === 'defensa-especial') {
        mensaje += `. ${atacante.nombre} se preparó para defenderse.`;
    }
    
    mostrarNarrador(mensaje);
    agregarAlHistorial(mensaje);
    actualizarBarrasVida();
}

// ===================================
// MOSTRAR MENSAJE EN EL NARRADOR
// ===================================

function mostrarNarrador(mensaje) {
    document.getElementById('narrator-text').textContent = mensaje;
}

// ===================================
// AGREGAR MENSAJE AL HISTORIAL
// ===================================

function agregarAlHistorial(mensaje) {
    const lista = document.getElementById('log-list');
    const item = document.createElement('li');
    item.textContent = mensaje;
    // Agregar al principio de la lista
    lista.insertBefore(item, lista.firstChild);
}

// ===================================
// ACTUALIZAR BARRAS DE VIDA
// ===================================

function actualizarBarrasVida() {
    // Pokémon 1
    document.getElementById('p1-hp-bar').style.width = pokemon1.vidaActual + '%';
    document.getElementById('p1-hp-text').textContent = pokemon1.vidaActual;
    
    // Pokémon 2
    document.getElementById('p2-hp-bar').style.width = pokemon2.vidaActual + '%';
    document.getElementById('p2-hp-text').textContent = pokemon2.vidaActual;
    
    // Cambiar color según la vida restante
    cambiarColorBarra('p1-hp-bar', pokemon1.vidaActual);
    cambiarColorBarra('p2-hp-bar', pokemon2.vidaActual);
}

// ===================================
// CAMBIAR COLOR DE LA BARRA DE VIDA
// ===================================

function cambiarColorBarra(idBarra, vidaActual) {
    const barra = document.getElementById(idBarra);
    
    if (vidaActual > 50) {
        barra.style.backgroundColor = '#4caf50'; // Verde
    } else if (vidaActual > 25) {
        barra.style.backgroundColor = '#ff9800'; // Naranja
    } else {
        barra.style.backgroundColor = '#f44336'; // Rojo
    }
}

// ===================================
// MOSTRAR PANTALLA DE GANADOR
// ===================================

function mostrarGanador(ganador) {
    document.getElementById('battle-screen').classList.remove('active');
    document.getElementById('winner-screen').classList.add('active');
    
    document.getElementById('winner-name').textContent = ganador.nombre;
    document.getElementById('winner-img').src = ganador.imagen;
}