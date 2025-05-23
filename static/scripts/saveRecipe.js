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

window.saveRecipe = function(index) {
  const activeRecipe = JSON.parse(localStorage.getItem('activeRecipe'));

  if (!activeRecipe) {
    alert("No active recipe to save.");
    return;
  }

  const { titulo, descripcion, pasos } = activeRecipe;

  const recipeData = {
    titulo: titulo || "Untitled Recipe",
    descripcion: descripcion || "",
    pasos: Array.isArray(pasos) ? pasos : []
  };

  showLoaderWithMessage("Saving your recipe...");

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
    hideLoader();

    alert("Recipe saved successfully.");
  })
  .catch(error => {
    console.error("Error saving recipe:", error);
    hideLoader();

    alert("There was an error saving your recipe.");
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

function showToast(message, backgroundColor = "#323232") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.backgroundColor = backgroundColor;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}
