let stream;

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } } // Usa la cámara trasera
        });
        
        document.getElementById("video").srcObject = stream;
        document.getElementById("video").style.display = "block";
        document.getElementById("photoCanvas").style.display = "none";
        document.getElementById("takePhoto").style.display = "inline-block";
        document.getElementById("retakePhoto").style.display = "none";
    } catch (error) {
        console.error("Error al acceder a la cámara:", error);
        alert("No se pudo acceder a la cámara. Es posible que tu dispositivo no tenga una cámara trasera.");
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach((track) => track.stop());
    }
}

document.getElementById("activateCameraBtn").addEventListener("click", function () {
    document.getElementById("modal").style.display = "flex";
    document.body.style.overflow = "hidden";
    startCamera();
});

document.getElementById("closeCamera").addEventListener("click", function () {
    document.getElementById("modal").style.display = "none";
    document.body.style.overflow = "auto";
    stopCamera();
});

document.getElementById("takePhoto").addEventListener("click", function () {
    const video = document.getElementById("video");
    const canvas = document.getElementById("photoCanvas");
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.style.display = "block";
    video.style.display = "none";
    document.getElementById("takePhoto").style.display = "none";
    document.getElementById("retakePhoto").style.display = "inline-block";

    stopCamera();
});

document.getElementById("retakePhoto").addEventListener("click", function () {
    startCamera();  
});
