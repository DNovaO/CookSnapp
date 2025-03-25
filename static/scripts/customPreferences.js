let currentStep = 1;
const totalSteps = 4;

function updateSteps() {
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index + 1 === currentStep) {
            step.classList.remove('d-none');
            setTimeout(() => {
                step.classList.add('active');
            }, 10);
        } else {
            step.classList.remove('active');
            setTimeout(() => {
                step.classList.add('d-none');
            }, 500); // Espera la duración de la transición
        }
    });

    // Mostrar/ocultar botones
    document.getElementById('prevBtn').classList.toggle('d-none', currentStep === 1);
    document.getElementById('nextBtn').classList.toggle('d-none', currentStep === totalSteps);
    document.getElementById('submitBtn').classList.toggle('d-none', currentStep < totalSteps);
}

// Evento para botón "Next"
document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentStep < totalSteps) {
        currentStep++;
        updateSteps();
    }
});

// Evento para botón "Previous"
document.getElementById('prevBtn').addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        updateSteps();
    }
});

// Mostrar paso inicial
updateSteps();

function generateSummary() {
    // 1. Capturar alergias seleccionadas
    const allergyCheckboxes = document.querySelectorAll('input[name="allergies"]:checked');
    const allergies = Array.from(allergyCheckboxes).map(cb => cb.value).join(', ') || 'None';
    document.getElementById('summaryAllergies').textContent = allergies;

    // 2. Capturar objetivos nutricionales
    const nutritionCheckboxes = document.querySelectorAll('input[name="nutrition"]:checked');
    const nutrition = Array.from(nutritionCheckboxes).map(cb => cb.value).join(', ') || 'None';
    document.getElementById('summaryNutrition').textContent = nutrition;

    // 3. Capturar nivel de cocina
    const cookingLevel = document.getElementById('cookingLevel').value || 'None';
    document.getElementById('summaryCookingLevel').textContent = cookingLevel;
}

// Llamar a la función cuando se llegue al paso 4
document.getElementById('nextBtn').addEventListener('click', () => {
    if (currentStep === 4) {
        generateSummary();
    }
});

document.getElementById('submitBtn').addEventListener('click', function() {
    alert('OK! Preferences saved successfully.');
    window.location.href = "{% url 'main' %}"; 
});

document.getElementById('addAllergyBtn').addEventListener('click', () => {
    const input = document.getElementById('customAllergy');
    const allergyName = input.value.trim();

    if (allergyName) {
        const container = document.getElementById('customAllergiesList');

        // Crear el elemento de tarjeta personalizada
        const allergyCard = document.createElement('div');
        allergyCard.classList.add('col-6', 'col-md-4', 'col-lg-3');
        allergyCard.innerHTML = `
          <label class="custom-card custom-allergy-card">
              <input type="checkbox" class="form-check-input d-none" name="allergies" value="${allergyName}" checked>
              <div class="custom-card-body justify-content-right">
                  ${allergyName}
                  <span class="custom-allergy-remove" onclick="removeAllergy(this)">✖</span>
              </div>
          </label>
      `;

        container.appendChild(allergyCard);
        input.value = ''; // Limpiar campo
    } else {
        alert('Please enter an allergy.');
    }
});

function removeAllergy(element) {
    element.closest('.col-6').remove();
}