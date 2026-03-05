async function loadComponent(elementid, filePath) {
    try {
        const response = await fetch(filePath);
        const html = await response.text();
        document.getElementById(elementid).innerHTML = html;
    } catch (error) {
        console.error(`Error cargando ${filePath}`, error);
    }
}
    document.addEventListener('DOMContentLoaded', function() {
        loadComponent('header-placeholder', '/front/header.html');
        loadComponent('footer-placeholder', '/front/footer.html');
    });
// 