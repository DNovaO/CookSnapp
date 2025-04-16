document.addEventListener("DOMContentLoaded", function () {
  const submitBtn = document.getElementById("submitIngredientsBtn");

  submitBtn.addEventListener("click", function () {
    const tableRows = document.querySelectorAll("#foodTable tbody tr");
    let ingredientsList = [];

    tableRows.forEach((row) => {
      const foodItem = row.cells[1].textContent.trim();
      const quantity = row.cells[2].textContent.trim();

      if (foodItem && quantity) {
        ingredientsList.push({ food: foodItem, quantity: parseInt(quantity) });
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
      body: JSON.stringify({ ingredients: ingredientsList }),
    })
      .then((response) => {
        if (response.ok) {
          renderRecipes(response);
        } else {
          alert("Error sending ingredients.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
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

function renderRecipes(response) {
  response.json().then((data) => {
    if (!data.recipe) {
      alert("No recipe was generated.");
      return;
    }

    const stepsContainer = document.getElementById("recipeStepsContainer");
    const recipeHTML = data.recipe;

    // Separar instrucciones en pasos (detecta líneas numeradas)
    const steps = recipeHTML
      .split(/(?:\n|<br\s*\/?>)?\s*\d+\.\s+/)
      .filter(Boolean);

    stepsContainer.innerHTML = "";

    steps.forEach((step, index) => {
      const stepDiv = document.createElement("div");
      stepDiv.className = "step" + (index === 0 ? " active" : "");
      stepDiv.innerHTML = `<p><strong>Paso ${index + 1}:</strong> ${step.trim()}</p>`;
      stepsContainer.appendChild(stepDiv);
    });

    let currentStep = 0;
    const stepElements = stepsContainer.querySelectorAll(".step");
    const prevBtn = document.getElementById("prevStepBtn");
    const nextBtn = document.getElementById("nextStepBtn");

    function updateSteps() {
      stepElements.forEach((el, i) => {
        el.classList.toggle("active", i === currentStep);
      });

      prevBtn.disabled = currentStep === 0;
      nextBtn.disabled = currentStep === stepElements.length - 1;
    }

    prevBtn.onclick = () => {
      if (currentStep > 0) {
        currentStep--;
        updateSteps();
      }
    };

    nextBtn.onclick = () => {
      if (currentStep < stepElements.length - 1) {
        currentStep++;
        updateSteps();
      }
    };

    updateSteps();

    // Mostrar el modal
    const recipeModal = new bootstrap.Modal(
      document.getElementById("recipeModal")
    );
    recipeModal.show();
  });
}

document.querySelectorAll("#foodTable tbody td:nth-child(2), #foodTable tbody td:nth-child(3)").forEach((cell) => {
  cell.setAttribute("contenteditable", "true");
  cell.classList.add("editable-cell");
});
