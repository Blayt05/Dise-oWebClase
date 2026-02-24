const registroForm = document.getElementById('registroForm');

registroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener datos
    const user = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Enviarlo al back

    const response  = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify( { user, email, password })
    });

    const result = await response.json();

    if (response.ok) {
        alert("El registro ha sido exitoso")
        window.location.href = "/dashboard.html";
    } else {
        alert("Error", + result.message)
    }
})