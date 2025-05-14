 let selectedIngredient = "";
  let editingCard = null;

  // Abrir modal al hacer clic en "Add to List"
  document.getElementById('addFoodBtn').addEventListener('click', function () {
    const input = document.getElementById('foodInput').value.trim();
    if (input) {
      selectedIngredient = input;
      editingCard = null; // No estamos editando
      document.getElementById('ingredientName').value = selectedIngredient;
      new bootstrap.Modal(document.getElementById('ingredientModal')).show();
    }
  });

  // Asegurar que el input esté bien cuando se muestre el modal
  document.getElementById('ingredientModal').addEventListener('shown.bs.modal', function () {
    document.getElementById('ingredientName').value = selectedIngredient;
  });

  // Subida del formulario (crear o editar ingrediente)
  document.getElementById('ingredientForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const rawName = document.getElementById('ingredientName').value.trim();
    const name = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
    const quantity = document.getElementById('ingredientQuantity').value;
    const unit = document.getElementById('ingredientUnit').value;
    const state = document.getElementById('ingredientState').value;

    const cardHtml = `
      <div class="col-md-4 mb-3">
        <div class="card custom-container2 shadow-sm" 
             data-name="${name}" 
             data-quantity="${quantity}" 
             data-unit="${unit}" 
             data-state="${state}">
          <div class="card-body">
            <h5 class="card-title">${name}</h5>
            <p class="card-text mb-1"><strong>Quantity:</strong> ${quantity} ${unit}</p>
            <p class="card-text mb-1"><strong>Condition:</strong> ${state}</p>
            <button class="btn btn-sm btn-outline-secondary edit-ingredient">Edit</button>
            <button class="btn btn-sm btn-outline-danger remove-ingredient">Remove</button>
          </div>
        </div>
      </div>
    `;

    if (editingCard) {
      editingCard.outerHTML = cardHtml;
    } else {
      document.getElementById('ingredientsCardContainer').insertAdjacentHTML('beforeend', cardHtml);
    }

    // Reset y cerrar modal
    document.getElementById('ingredientForm').reset();
    bootstrap.Modal.getInstance(document.getElementById('ingredientModal')).hide();
    document.getElementById('foodInput').value = "";
  });

  // Manejo de botones "Edit" y "Remove"
  document.getElementById('ingredientsCardContainer').addEventListener('click', function (e) {
    const card = e.target.closest('.card');

    if (e.target.classList.contains('remove-ingredient')) {
      card.closest('.col-md-4').remove();
    }

    if (e.target.classList.contains('edit-ingredient')) {
      selectedIngredient = card.dataset.name;
      document.getElementById('ingredientName').value = card.dataset.name;
      document.getElementById('ingredientQuantity').value = card.dataset.quantity;
      document.getElementById('ingredientUnit').value = card.dataset.unit;
      document.getElementById('ingredientState').value = card.dataset.state;

      editingCard = card.closest('.col-md-4');
      new bootstrap.Modal(document.getElementById('ingredientModal')).show();
    }
  });