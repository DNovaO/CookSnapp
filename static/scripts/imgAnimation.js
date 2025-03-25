const track = document.querySelector('.carousel-images');
const images = Array.from(track.children);
let trackWidth = 0;
let speed = 0.8; // Ajusta la velocidad del scroll
let animationFrameId; // Para controlar la animación

// Clonar las imágenes para crear el efecto de bucle continuo
function cloneImages() {
    images.forEach(image => {
        const clone = image.cloneNode(true);
        track.appendChild(clone);
    });
}

cloneImages();

// Calcular el ancho total del track
function calculateTrackWidth() {
    trackWidth = images.reduce((total, img) => total + img.offsetWidth, 0); // Suma el ancho de todas las imágenes
    trackWidth *= 2; // Debido a las imágenes clonadas, el ancho total es el doble
    track.style.width = `${trackWidth}px`; // Ajustar el ancho del track
}

calculateTrackWidth();

// Desplazamiento continuo
function scrollCarousel() {
    const currentTransform = parseFloat(getComputedStyle(track).transform.split(',')[4]) || 0;
    const newTransform = currentTransform - speed;

    // Para evitar que las imágenes se corten
    if (Math.abs(newTransform) >= trackWidth / 2) {
        track.style.transition = 'none'; // Desactivar la transición durante el reajuste
        track.style.transform = `translateX(0)`;
        setTimeout(() => {
            track.style.transition = 'transform 0.1s linear'; // Volver a activar la transición
        }, 1); // Pequeño retraso para permitir el ajuste
    } else {
        track.style.transition = 'transform 0.1s linear'; // Asegurarse de que la transición esté activa
        track.style.transform = `translateX(${newTransform}px)`;
    }

    animationFrameId = requestAnimationFrame(scrollCarousel);
}

scrollCarousel();

// Recalcular el ancho cuando cambie el tamaño de la ventana
window.addEventListener('resize', () => {
    calculateTrackWidth();
    // Necesario para ajustar el tamaño del track
    track.style.transform = `translateX(0)`;
    cancelAnimationFrame(animationFrameId);
    scrollCarousel();
});
