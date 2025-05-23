let currentRecipes = [];

document.addEventListener("DOMContentLoaded", function () {
  const submitBtn = document.getElementById("submitIngredientsBtn");
  const loaderOverlay = document.getElementById("loaderOverlay");
  const loaderMessage = document.getElementById("loaderMessage");

  const loadingMessages = [
    "Gathering ingredients...",
    "Preheating the oven...",
    "Mixing things up...",
    "Plating your dish...",
    "Adding a pinch of magic...",
    "Finalizing the recipe..."
  ];

  function startLoader() {
    let index = 0;
    loaderOverlay.style.display = "flex";
    loaderMessage.textContent = loadingMessages[index];

    const interval = setInterval(() => {
      index = (index + 1) % loadingMessages.length;
      loaderMessage.textContent = loadingMessages[index];
    }, 2000);

    return interval;
  }

  function stopLoader(intervalId) {
    clearInterval(intervalId);
    loaderOverlay.style.display = "none";
  }

  submitBtn.addEventListener("click", function () {
    const cards = document.querySelectorAll("#ingredientsCardContainer .card");
    let ingredientsList = [];

    const username = document.getElementById("username").textContent.trim();

    cards.forEach((card) => {
      const name = card.getAttribute("data-name");
      const quantity = card.getAttribute("data-quantity");
      const unit = card.getAttribute("data-unit");
      const state = card.getAttribute("data-state");

      if (name && quantity) {
        ingredientsList.push({
          food: name,
          quantity: `${quantity} ${unit} (${state})`
        });
      }
    });

    if (ingredientsList.length === 0) {
      showToast("No ingredients to send!", "toast-error", "#e74c3c");
      return;
    }

    submitBtn.disabled = true;
    const loaderInterval = startLoader();

    fetch("process-ingredients/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
      },
      body: JSON.stringify({
        "ingredients": ingredientsList,
        "username": username
      }),
    })
      .then((response) => {
        if (response.ok) return response.json();
        else throw new Error("Server response error.");
      })
      .then((data) => {
        stopLoader(loaderInterval);
        submitBtn.disabled = false;

        // Guardamos las recetas en una variable temporal
        window._pendingRecipes = data;

        // Mostramos el modal de disclaimer
        const disclaimerModalEl = document.getElementById("disclaimerModal");
        const disclaimerModal = new bootstrap.Modal(disclaimerModalEl);
        disclaimerModal.show();

        // Botones aceptar y cancelar
        const acceptBtn = document.getElementById("disclaimerAcceptBtn");
        const cancelBtn = document.getElementById("disclaimerCancelBtn");

        // Removemos listeners anteriores para evitar duplicados
        acceptBtn.onclick = null;
        cancelBtn.onclick = null;

        acceptBtn.onclick = () => {
          disclaimerModal.hide();
          renderRecipes(window._pendingRecipes);
          window._pendingRecipes = null;
        };

        cancelBtn.onclick = () => {
          disclaimerModal.hide();
          showToast("You need to agree to the disclaimer to see the recipes.", "toast-error", "#e74c3c");
          window._pendingRecipes = null;
        };
      })
      .catch((error) => {
        stopLoader(loaderInterval);
        submitBtn.disabled = false;
        console.error("Error:", error);
        showToast("There was a problem processing the ingredients.", "toast-error", "#e74c3c");
      });
  });

});

function showLoaderWithMessage(message) {
  const overlay = document.getElementById("loaderOverlay");
  const loaderMessage = document.getElementById("loaderMessage");
  loaderMessage.textContent = message;
  overlay.style.display = "flex";
}

function hideLoader() {
  const overlay = document.getElementById("loaderOverlay");
  overlay.style.display = "none";
}

function showToast(message, toastId = 'toast-success', color = '#27ae60', duration = 3000) {
  const toast = document.getElementById(toastId);
  if (toast) {
    toast.textContent = message;
    toast.style.backgroundColor = color;  // Aplica el color de fondo
    toast.style.display = 'block';
    toast.classList.add('show'); // si tienes animación CSS

    setTimeout(() => {
      toast.style.display = 'none';
      toast.classList.remove('show');
      toast.style.backgroundColor = ''; // Limpia el color para no afectar futuros mensajes
    }, duration);
  } else {
    console.warn('Toast ID not found:', toastId);
  }
}

window.saveRecipe = function(index) {
  const recipe = currentRecipes[index];

  if (!recipe) {
    showToast("No recipe found to save.", "toast-error", "#e74c3c");
    return;
  }

  const { titulo, descripcion, pasos } = recipe;

  const recipeData = {
    titulo: titulo || "Untitled Recipe",
    descripcion: descripcion || "",
    pasos: Array.isArray(pasos) ? pasos : []
  };

  showLoaderWithMessage("Saving your recipe...");

  // Esperar 2 segundos antes de hacer el fetch
  setTimeout(() => {
    fetch("/photo/save_recipe/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
      },
      body: JSON.stringify(recipeData),
    })
    .then(response => response.json())
    .then(data => {
      hideLoader();
      showToast("Recipe saved successfully.", "toast-success", "#27ae60");
    })
    .catch(error => {
      console.error("Error saving recipe:", error);
      hideLoader();
      showToast("There was an error saving your recipe.", "toast-error", "#e74c3c");
    });
  }, 2000);
};

function renderRecipes(data) {
  const cardsContainer = document.getElementById("recipeCardContainer");
  cardsContainer.innerHTML = "";
  currentRecipes = data.recipes;

  data.recipes.forEach((recipe, index) => {
    const card = document.createElement("div");
    card.className = "col";
    card.innerHTML = `
      <div class="card custom-container h-100 shadow-m border-1">
        <div class="card-body">
          <h5 class="card-title">${recipe.titulo}</h5>
          <p class="card-text">${recipe.descripcion || "Una receta deliciosa para ti."}</p>
        </div>
        <div class="card-footer bg-transparent d-flex justify-content-between">
          <button class="search-btn" id="select-recipe-${index}">View recipe</button>
          <button class="btn-enviar" onclick="saveRecipe(${index})">Save Recipe</button>
        </div>
      </div>
    `;
    cardsContainer.appendChild(card);

    document.getElementById(`select-recipe-${index}`).onclick = () => {
      const selectionModal = bootstrap.Modal.getInstance(document.getElementById("recipeSelectionModal"));
      if (selectionModal) selectionModal.hide();

      renderChecklist(recipe);
    };
  });

  const recipeSelectionModal = new bootstrap.Modal(document.getElementById("recipeSelectionModal"));
  recipeSelectionModal.show();
}

function renderChecklist(recipe) {
  const checklistContainer = document.getElementById("recipeStepsContainer");
  checklistContainer.innerHTML = `
    <h4>${recipe.titulo}</h4>
    <p class="text-muted">${recipe.descripcion || ""}</p>
    <ul class="list-group no-border-list" id="checklistSteps"></ul>
  `;

  const list = document.getElementById("checklistSteps");

  recipe.pasos.forEach((step, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex align-items-start step-item";
    li.innerHTML = `
      <input type="checkbox" id="step-${index}" class="form-check-input mt-1 me-2">
      <label for="step-${index}" class="form-check-label flex-grow-1" style="cursor: pointer; font-weight: 500;">
        ${step}
      </label>
    `;
    list.appendChild(li);

    const checkbox = li.querySelector("input");
    const label = li.querySelector("label");

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

document.addEventListener("DOMContentLoaded", () => {
  const returnBtn = document.getElementById("returnToRecipesBtn");

  if (returnBtn) {
    returnBtn.addEventListener("click", () => {
      const stepsModal = bootstrap.Modal.getInstance(document.getElementById("recipeStepsModal"));
      if (stepsModal) stepsModal.hide();

      const selectionModal = new bootstrap.Modal(document.getElementById("recipeSelectionModal"));
      selectionModal.show();
    });
  }
});

document.querySelectorAll("#foodTable tbody td:nth-child(2), #foodTable tbody td:nth-child(3)").forEach((cell) => {
  cell.setAttribute("contenteditable", "true");
  cell.classList.add("editable-cell");
});

function getCSRFToken() {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "csrftoken") return value;
  }
  return "";
}
