document.addEventListener("DOMContentLoaded", function () {
    let recipeCards = document.querySelectorAll(".recipe-card");

    recipeCards.forEach(card => {
        card.addEventListener("click", function() {
            const title = card.getAttribute("data-title");
            const description = card.getAttribute("data-description");
            const stepsString = card.getAttribute("data-steps");
            const date = card.getAttribute("data-date");

            // Decodificar los caracteres Unicode en los pasos
            const decodedSteps = decodeUnicode(stepsString);
            // Separar los pasos por saltos de línea (\n) y limpiarlos de espacios innecesarios
            const steps = decodedSteps.split("\n").map(step => step.trim()).filter(step => step.length > 0);

            renderRecipeStepsModal(title, description, steps, date);
        });
    });
});

// Función para decodificar caracteres Unicode en texto
function decodeUnicode(str) {
    return str.replace(/\\u[\dA-F]{4}/gi, function(match) {
        return String.fromCharCode(parseInt(match.replace("\\u", ""), 16));
    });
}

function renderRecipeStepsModal(title, description, steps, date) {
    const stepsContainer = document.getElementById("recipeStepsContainer");
    stepsContainer.innerHTML = `  
        <h4>${title}</h4>
        <p class="text-muted">${description || "No description available."}</p>
        <ul class="list-group no-border-list" id="checklistSteps"></ul>
    `;

    const list = document.getElementById("checklistSteps");

    steps.forEach((step, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex align-items-start";
        li.innerHTML = `
            <input type="checkbox" id="step-${index}" class="form-check-input mt-1 me-2">
            <label for="step-${index}" class="form-check-label flex-grow-1" style="cursor: pointer; font-weight: 500;">
                ${step}
            </label>
        `;
        list.appendChild(li);

        const checkbox = li.querySelector("input");
        const label = li.querySelector("label");

        // Cuando creas el li:
        li.classList.add("step-item");

        // Luego al marcar/desmarcar:
        checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
            label.style.textDecoration = "line-through";
            label.style.color = "#6c757d";
            li.classList.add("checked-step");
        } else {
            label.style.textDecoration = "none";
            label.style.color = "inherit";
            li.classList.remove("checked-step");
        }
        });


    });

    const recipeStepsModal = new bootstrap.Modal(document.getElementById("recipeStepsModal"));
    recipeStepsModal.show();
}
