document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("addAllergyModalBtn");
    const input = document.getElementById("customAllergyModal");
    const container = document.getElementById("customAllergiesListModal");

    if (addBtn && input && container) {
        addBtn.addEventListener("click", () => {
            const allergy = input.value.trim();
            if (allergy) {
                const wrapper = document.createElement("div");
                wrapper.className = "d-inline-block position-relative me-2 mb-2";
        
                const badge = document.createElement("span");
                badge.className = "badge custom-allergy-card px-3 py-2";
                badge.innerText = allergy;
                badge.style.cursor = "pointer";
                
                // Al hacer clic se elimina tanto el badge como el input oculto
                badge.addEventListener("click", () => {
                    container.removeChild(wrapper);
                });
        
                const hiddenInput = document.createElement("input");
                hiddenInput.type = "hidden";
                hiddenInput.name = "allergies";
                hiddenInput.value = allergy;
        
                wrapper.appendChild(badge);
                wrapper.appendChild(hiddenInput);
                container.appendChild(wrapper);
        
                input.value = "";
            }
        });        
    }

    const saveBtn = document.querySelector("#userSettingsModal .btn-modal[type='submit']");

    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            const selectedAllergies = Array.from(document.querySelectorAll("input[name='allergies']:checked"))
                .map(el => el.value);

            const customAllergies = Array.from(document.querySelectorAll("#customAllergiesListModal input[type='hidden']"))
                .map(el => el.value);

            const allAllergies = [...selectedAllergies, ...customAllergies];
            const cookingLevel = document.querySelector("select[name='cooking_level']")?.value || "Beginner";
            const nutrition = document.querySelector("input[name='nutrition']:checked")?.value || "No";
            const language = document.querySelector("select[name='language']")?.value || "english";

            const data = {
                allergies: allAllergies,
                cooking_level: cookingLevel,
                nutrition: nutrition,
                language: language
            };

            showLoader("Updating preferences...");

            setTimeout(() => {
                fetch(window.location.href, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCookie("csrftoken")
                    },
                    body: JSON.stringify(data)
                })
                    .then(response => {
                        if (response.redirected) {
                            window.location.href = response.url;
                        } else {
                            updateLoaderMessage("Ready!");

                            setTimeout(() => {
                                hideLoader();
                                const modal = bootstrap.Modal.getInstance(document.getElementById('userSettingsModal'));
                                modal.hide();
                            }, 2000); // Simulación de delay de 2 segundos
                        }
                    })
                    .catch(err => {
                        console.error("Error guardando preferencias:", err);
                        updateLoaderMessage("Error al guardar");
                        setTimeout(hideLoader, 2000);
                    });
            }, 3000); // Simulación de delay de 3 segundos
        });
    }
});

// CSRF helper
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Loader UI
function showLoader(message) {
    let loader = document.getElementById("loaderOverlay");
    if (!loader) {
        loader = document.createElement("div");
        loader.id = "loaderOverlay";
        loader.style.position = "fixed";
        loader.style.top = 0;
        loader.style.left = 0;
        loader.style.width = "100%";
        loader.style.height = "100%";
        loader.style.background = "rgba(0, 0, 0, 0.6)";
        loader.style.zIndex = 9999;
        loader.style.display = "flex";
        loader.style.alignItems = "center";
        loader.style.justifyContent = "center";
        loader.style.flexDirection = "column";
        loader.style.color = "#fff";
        loader.style.fontSize = "1.5rem";

        const spinner = document.createElement("div");
        spinner.className = "spinner-border text-light mb-3";
        spinner.role = "status";

        const text = document.createElement("div");
        text.id = "loaderMessage";
        text.innerText = message;

        loader.appendChild(spinner);
        loader.appendChild(text);
        document.body.appendChild(loader);
    } else {
        updateLoaderMessage(message);
        loader.style.display = "flex";
    }
}

function updateLoaderMessage(message) {
    const msg = document.getElementById("loaderMessage");
    if (msg) msg.innerText = message;
}

function hideLoader() {
    const loader = document.getElementById("loaderOverlay");
    if (loader) loader.style.display = "none";
}
