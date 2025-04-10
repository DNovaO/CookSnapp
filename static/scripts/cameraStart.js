let stream;
let detectedIngredients = [];


async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } }, // Usa la cámara trasera
    });

    document.getElementById("video").srcObject = stream;
    document.getElementById("video").style.display = "block";
    document.getElementById("photoCanvas").style.display = "none";
    document.getElementById("takePhoto").style.display = "inline-block";
    document.getElementById("retakePhoto").style.display = "none";
  } catch (error) {
    console.error("Error al acceder a la cámara:", error);
    alert(
      "No se pudo acceder a la cámara. Es posible que tu dispositivo no tenga una cámara trasera."
    );
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
}

document
  .getElementById("activateCameraBtn")
  .addEventListener("click", function () {
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

// Botón para tomar la foto y procesarla con YOLO
document.getElementById("takePhoto").addEventListener("click", () => {
  const canvas = document.getElementById("photoCanvas");
  const video = document.getElementById("video");
  const context = canvas.getContext("2d");

  // Captura de imagen del video al canvas
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Mostrar canvas y ocultar video
  canvas.style.display = "block";
  video.style.display = "none";
  document.getElementById("takePhoto").style.display = "none";
  document.getElementById("retakePhoto").style.display = "inline-block";

  // Detener la cámara
  if (video.srcObject) {
    video.srcObject.getTracks().forEach((track) => track.stop());
  }

  // Convertir imagen a base64
  const imageData = canvas.toDataURL("image/jpeg");

  // Enviar al backend
  fetch("detect_objects/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: imageData }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ingredients) {
        detectedIngredients = data.ingredients; // Guardamos la detección
        document.getElementById("usePhoto").style.display = "inline-block"; // Mostramos el nuevo botón
      } else {
        alert("No se detectaron ingredientes.");
      }
    })
    
    .catch((err) => {
      console.error("Error al detectar objetos:", err);
    });
});

document.getElementById("usePhoto").addEventListener("click", function () {
  if (detectedIngredients.length > 0) {
    detectedIngredients.forEach((ingredient) => {
      simulateManualAdd(ingredient);
    });
    detectedIngredients = [];
    document.getElementById("usePhoto").style.display = "none";

   
    document.getElementById("modal").style.display = "none";
    document.body.style.overflow = "auto";

    stopCamera();
  } else {
    alert("No hay ingredientes por agregar.");
  }
});




function simulateManualAdd(ingredientName) {
    const foodInput = document.getElementById('foodInput');
    const quantityInput = document.getElementById('quantityInput');
  
    foodInput.value = ingredientName;
    quantityInput.value = 1;
  
    document.getElementById('addFoodBtn').click();
  }
  