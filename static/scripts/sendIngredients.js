document.addEventListener("DOMContentLoaded", function () {
  const submitBtn = document.getElementById("submitIngredientsBtn");

  submitBtn.addEventListener("click", function () {
    const tableRows = document.querySelectorAll("#foodTable tbody tr");
    let ingredientsList = [];

    const username = document.getElementById("username").textContent.trim();

    tableRows.forEach((row) => {
      const foodItem = row.cells[1].textContent.trim();
      const quantity = row.cells[2].textContent.trim();

      if (foodItem && quantity) {
        ingredientsList.push({
          food: foodItem,
          quantity: parseInt(quantity)
        });
      }
    });

    if (ingredientsList.length === 0) {
      alert("No ingredients to send!");
      return;
    }

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
        if (response.ok) {
          return response.json(); // ¡necesario para renderizar!
        } else {
          throw new Error("Error en la respuesta del servidor.");
        }
      })
      .then((data) => {
        renderRecipes(data);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Hubo un problema al procesar los ingredientes.");
      });
  });

  function getCSRFToken() {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "csrftoken") {
        return value;
      }
    }
    return "";
  }
});

function renderRecipes(data) {
  const cardsContainer = document.getElementById("recipeCardContainer");
  cardsContainer.innerHTML = "";

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
      // Cierra modal de tarjetas
      const selectionModal = bootstrap.Modal.getInstance(document.getElementById("recipeSelectionModal"));
      if (selectionModal) selectionModal.hide();

      // Guarda la receta activa en localStorage
      localStorage.setItem('activeRecipe', JSON.stringify(recipe));

      // Muestra checklist
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

  // Mostrar modal de pasos
  const recipeStepsModal = new bootstrap.Modal(document.getElementById("recipeStepsModal"));
  recipeStepsModal.show();
}

document.addEventListener("DOMContentLoaded", () => {
  const returnBtn = document.getElementById("returnToRecipesBtn");

  if (returnBtn) {
    returnBtn.addEventListener("click", () => {
      // Cierra el modal de pasos
      const stepsModal = bootstrap.Modal.getInstance(document.getElementById("recipeStepsModal"));
      if (stepsModal) stepsModal.hide();

      // Reabre el modal de selección
      const selectionModal = new bootstrap.Modal(document.getElementById("recipeSelectionModal"));
      selectionModal.show();
    });
  }
});


document.querySelectorAll("#foodTable tbody td:nth-child(2), #foodTable tbody td:nth-child(3)").forEach((cell) => {
  cell.setAttribute("contenteditable", "true");
  cell.classList.add("editable-cell");
});
