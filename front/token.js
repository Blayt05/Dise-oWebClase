function isTokenExpired() {
    const token = localStorage.getItem('mi_token_seguro');
    
    if(!token){
        return true;
    }

    try {
        // Decodificar el token
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;

        return payload.exp < currentTime;
    } catch(error) {
        return true;
    }
}

// Funcion para proteger paginas
function checkAuth() {
    if(isTokenExpired()) {
        localStorage.removeItem('mi_token_seguro');
        window.location.href = "/index.html";
        alert("Tu sesion ha expirado")
    }
}

