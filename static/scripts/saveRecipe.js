document.addEventListener("DOMContentLoaded", function () {
    const saveBtn = document.getElementById("saveBtn");
  
    saveBtn.addEventListener("click", function () {
      const pasos = [];
      const stepElements = document.querySelectorAll("#recipeStepsContainer .step");
      
      stepElements.forEach(step => {
        pasos.push(step.innerText.trim());
      });
  
      const titleElement = stepElements[0];
      const titleLine = titleElement ? titleElement.innerText.trim().split(":")[1] : "Untitled Recipe";
  
      const recipeData = {
        title: titleLine || "Untitled Recipe",
        steps: pasos.join("\n\n"),
      };
  
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
        alert(data.message || "Receta guardada correctamente");
      })
      .catch(error => {
        console.error("Error al guardar receta:", error);
        alert("Ocurrió un error al guardar la receta");
      });
    });
  
    function getCSRFToken() {
      const cookieValue = document.cookie
        .split("; ")
        .find(row => row.startsWith("csrftoken="));
      return cookieValue ? cookieValue.split("=")[1] : "";
    }
  });