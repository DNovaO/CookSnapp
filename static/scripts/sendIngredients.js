document.addEventListener("DOMContentLoaded", function () {
    const submitBtn = document.getElementById("submitIngredientsBtn");
  
    submitBtn.addEventListener("click", function () {
      // Obtener las filas de la tabla
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
  
      // Enviar datos al backend
      fetch("/photo/process-ingredients/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(), // Función para obtener el token CSRF
        },
        body: JSON.stringify({ ingredients: ingredientsList }),
      })
        .then((response) => {
          if (response.ok) {
            alert("Ingredients sent successfully!");
            renderRecipes(response);
          } else {
            alert("Error sending ingredients.");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  
    // Obtener el token CSRF
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
    response.json().then(data => {
        if (data.recipe) {
            const recipeContainer = document.getElementById("recipeContainer");
            recipeContainer.innerHTML = ""; // Limpiar contenido anterior
            
            const recipeTitle = document.createElement("h2");
            recipeTitle.textContent = "Generated Recipe";
            recipeContainer.appendChild(recipeTitle);

            const recipeContent = document.createElement("p");
            recipeContent.textContent = data.recipe;
            recipeContainer.appendChild(recipeContent);
        } else {
            alert("No recipe was generated.");
        }
    });
}

  