const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener datos 
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Enviarlo al back
    const response  = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if(response.ok) {
        localStorage.setItem('mi_token_seguro',result.token);
        alert("Login exitoso");
        window.location.href = '/dashboard.html';
    } else {
        alert("Error: " + result.message);
    }
});
