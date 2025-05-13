let currentStep = 1;
const totalSteps = 3;

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressBar = document.getElementById('progressBar');
const lowCaloriesCheckbox = document.getElementById('lowCalories');
const highProteinCheckbox = document.getElementById('highProtein');
const customAllergyInput = document.getElementById('customAllergy');
const customAllergiesList = document.getElementById('customAllergiesList');

function updateSteps() {
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.toggle('d-none', index + 1 !== currentStep);
    });
    prevBtn.classList.toggle('d-none', currentStep === 1);
    nextBtn.classList.toggle('d-none', currentStep === totalSteps);
    submitBtn.classList.toggle('d-none', currentStep < totalSteps);
    updateProgressBar();
}

function updateProgressBar() {
    const progress = Math.round((currentStep / totalSteps) * 100);
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', progress);
    progressBar.textContent = `Step ${currentStep} of ${totalSteps}`;
}

function generateSummary() {
    const getCheckedValues = (name) =>
        [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(cb => cb.value).join(', ') || 'None';

    document.getElementById('summaryAllergies').textContent = getCheckedValues('allergies');
    document.getElementById('summaryNutrition').textContent = getCheckedValues('nutrition');
    document.getElementById('summaryCookingLevel').textContent = document.getElementById('cookingLevel').value || 'None';
}

function addAllergy() {
    const allergyName = customAllergyInput.value.trim();
    if (!allergyName) {
        alert('Please enter an allergy.');
        return;
    }

    const allergyCard = document.createElement('div');
    allergyCard.classList.add('col-auto');
    allergyCard.innerHTML = `
        <label class="custom-card custom-allergy-card">
            <input type="checkbox" class="form-check-input d-none" name="allergies" value="${allergyName}" checked>
            <div class="custom-card-body">
                ${allergyName}
                <span class="custom-allergy-remove" onclick="removeAllergy(this)">✖</span>
            </div>
        </label>`;
    customAllergiesList.appendChild(allergyCard);
    customAllergyInput.value = '';
}

function removeAllergy(element) {
    element.closest('.col-auto').remove();
}

function toggleExclusiveCheckboxes(checkbox1, checkbox2) {
    checkbox1.addEventListener('change', () => {
        if (checkbox1.checked) checkbox2.checked = false;
    });
    checkbox2.addEventListener('change', () => {
        if (checkbox2.checked) checkbox1.checked = false;
    });
}

// Event Listeners
nextBtn.addEventListener('click', () => {
    if (currentStep < totalSteps) {
        currentStep++;
        updateSteps();
        if (currentStep === totalSteps) generateSummary();
    }
});

prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        updateSteps();
    }
});

document.getElementById('submitBtn').addEventListener('click', function (e) {
    // Esperar la respuesta antes de mostrar mensaje
    e.preventDefault(); // Prevenir el comportamiento por defecto del botón
    sendPreferencesToServer();
});

function sendPreferencesToServer() {
    console.log('Sending preferences to server...');

    // Mover la función getCheckedValues aquí
    const getCheckedValues = (name) =>
        [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(cb => cb.value).join(', ') || 'None';

    const body = {
        allergies: getCheckedValues('allergies'),
        nutrition: getCheckedValues('nutrition'),
        cooking_level: document.getElementById('cookingLevel').value,
    };
    console.log(body);

    fetch("/main/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify(body),
    }).then(response => {
        if (response.ok) {
            // Mostrar mensaje de éxito
            document.getElementById('successMessage').classList.remove('d-none');
            document.getElementById('submitBtn').classList.add('d-none');
            document.querySelector('.step').classList.add('d-none');

            // Redirigir después de 2 segundos
            setTimeout(() => {
                window.location.href = "/main/";
            }, 2000);

        } else {
            alert("Error sending preferences.");
        }
    }).catch(error => {
        console.error("Error:", error);
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
}

document.getElementById('addAllergyBtn').addEventListener('click', addAllergy);
toggleExclusiveCheckboxes(lowCaloriesCheckbox, highProteinCheckbox);
updateSteps();