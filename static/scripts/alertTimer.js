// JavaScript para mostrar la alerta temporalmente y ocultarla
document.addEventListener("DOMContentLoaded", function() {
    const alertContainer = document.getElementById('alert-container');
    
    if (alertContainer) {
        // Solo mostrar la alerta si tiene mensajes
        alertContainer.classList.remove('hidden-alert');

        // Ocultar automáticamente después de 5 segundos
        setTimeout(function() {
            const alerts = alertContainer.getElementsByClassName('alert');
            for (let alert of alerts) {
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 500); // Eliminar tras la animación
            }
        }, 5000);
    }
});
