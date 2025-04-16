document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("foodInput");
    const resultsContainer = document.getElementById("autocomplete-list");
    let ingredientsList = [];
  
    // Cargar ingredientes desde el JSON
    fetch("/static/data/unique_ingredients.json")
      .then(res => res.json())
      .then(data => ingredientsList = data)
      .catch(err => console.error("Error cargando ingredientes:", err));
  
    input.addEventListener("input", () => {
      const query = input.value.toLowerCase();
      resultsContainer.innerHTML = "";
  
      if (!query) return;
  
      const matches = ingredientsList.filter(item =>
        item.toLowerCase().includes(query)
      ).slice(0, 8); // mostrar máximo 8 sugerencias
  
      matches.forEach(match => {
        const item = document.createElement("div");
        item.className = "list-group-item list-group-item-action";
        item.textContent = match;
        item.style.cursor = "pointer";
        item.addEventListener("click", () => {
          input.value = match;
          resultsContainer.innerHTML = "";
        });
        resultsContainer.appendChild(item);
      });
    });
  
    // Cerrar si haces clic fuera del input o sugerencias
    document.addEventListener("click", (e) => {
      if (e.target !== input) {
        resultsContainer.innerHTML = "";
      }
    });
  });