function showLoader() {
  document.getElementById("fullscreenLoader").style.display = "block";
}

function hideLoader() {
  document.getElementById("fullscreenLoader").style.display = "none";
}

window.saveRecipe = function(index) {
  const activeRecipe = JSON.parse(localStorage.getItem('activeRecipe'));

  if (!activeRecipe) {
    alert("No hay receta activa para guardar.");
    return;
  }

  const { titulo, descripcion, pasos } = activeRecipe;

  const recipeData = {
    titulo: titulo || "Untitled Recipe",
    descripcion: descripcion || "",
    pasos: Array.isArray(pasos) ? pasos : []
  };

  showLoader(); // ← Mostrar el loader de pantalla completa

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
    localStorage.removeItem('activeRecipe');
    hideLoader(); // ← Ocultar al terminar

    alert("Receta guardada exitosamente.");
  })
  .catch(error => {
    console.error("Error al guardar receta:", error);
    hideLoader(); // ← Asegúrate de ocultarlo también en error

    alert("Error al guardar receta.");
  });
};


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