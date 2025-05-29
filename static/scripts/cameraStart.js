let stream;

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } }
        });

        document.getElementById("video").srcObject = stream;
        document.getElementById("video").style.display = "block";
        document.getElementById("photoCanvas").style.display = "none";
        document.getElementById("takePhoto").style.display = "inline-block";
        document.getElementById("retakePhoto").style.display = "none";
        document.getElementById("usePhoto").style.display = "none";
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
    document.getElementById("usePhoto").style.display = "inline-block";

    stopCamera();
});

document.getElementById("retakePhoto").addEventListener("click", function () {
    startCamera();  
});

document.getElementById("usePhoto").addEventListener("click", function () {
    const canvas = document.getElementById("photoCanvas");
    const imageData = canvas.toDataURL("image/jpeg");

    showLoaderWithMessage("Detecting ingredients...");

    fetch("/photo/detect_ingredients/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify({ image: imageData })
    })
    .then(response => response.json())
    .then(data => {
        hideLoader();

        if (!data.ingredients || data.ingredients.length === 0) {
            showToast("No ingredients detected.", "toast-error", "#e74c3c");
            return;
        }

        if (!window.ingredientesRegistrados) window.ingredientesRegistrados = [];

        data.ingredients.forEach(ingredient => {
            const name = ingredient.charAt(0).toUpperCase() + ingredient.slice(1).toLowerCase();
            const cardHtml = `
              <div class="col-md-4 mb-3">
                <div class="card custom-container2 shadow-sm"
                     data-name="${name}" 
                     data-quantity="1" 
                     data-unit="pieces" 
                     data-state="fresh">
                  <div class="card-body">
                    <h5 class="card-title">${name}</h5>
                    <p class="card-text mb-1"><strong>Quantity:</strong> 1 pieces</p>
                    <p class="card-text mb-1"><strong>Condition:</strong> fresh</p>
                    <button class="btn btn-sm btn-outline-secondary edit-ingredient">Edit</button>
                    <button class="btn btn-sm btn-outline-danger remove-ingredient">Remove</button>
                  </div>
                </div>
              </div>`;

            document.getElementById("ingredientsCardContainer").insertAdjacentHTML("beforeend", cardHtml);

            window.ingredientesRegistrados.push({
                food: name,
                quantity: "1 pieces (fresh)"
            });
        });

        document.getElementById("modal").style.display = "none";
        document.body.style.overflow = "auto";
    })
    .catch(error => {
        console.error("Detection error:", error);
        hideLoader();
        showToast("Error detecting ingredients.", "toast-error", "#e74c3c");
    });
});
