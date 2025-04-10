document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("addAllergyModalBtn");
    const input = document.getElementById("customAllergyModal");
    const container = document.getElementById("customAllergiesListModal");

    if (addBtn && input && container) {
        addBtn.addEventListener("click", () => {
            const allergy = input.value.trim();
            if (allergy) {
                const badge = document.createElement("span");
                badge.className = "badge bg-success rounded-pill px-3 py-2";
                badge.innerText = allergy;
                container.appendChild(badge);

                const hiddenInput = document.createElement("input");
                hiddenInput.type = "hidden";
                hiddenInput.name = "allergies";
                hiddenInput.value = allergy;
                container.appendChild(hiddenInput);

                input.value = "";
            }
        });
    }
});
