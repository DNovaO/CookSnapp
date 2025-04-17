document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("customModal");
    const modalTitle = document.getElementById("modalRecipeTitle");
    const modalSteps = document.getElementById("modalRecipeSteps");
    const closeModal = document.getElementById("closeModal");
  
    document.querySelectorAll("a[data-title]").forEach(link => {
      link.addEventListener("click", function () {
        const title = this.getAttribute("data-title") || "No title";
        const steps = this.getAttribute("data-steps") || "No steps";
  
        modalTitle.textContent = title;
        modalSteps.textContent = steps;
        modal.style.display = "block";
      });
    });
  
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });
  
    window.addEventListener("click", function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    });
  
  });
  