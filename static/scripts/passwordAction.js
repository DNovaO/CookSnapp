function setupPasswordToggle(buttonId, inputId) {
    const toggleBtn = document.getElementById(buttonId);
    const input = document.getElementById(inputId);

    if (toggleBtn && input) {
        toggleBtn.addEventListener('click', function () {
            const icon = this.querySelector('i');
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            icon.classList.toggle('bi-eye');
            icon.classList.toggle('bi-eye-slash');
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    setupPasswordToggle('togglePassword', 'password');
    setupPasswordToggle('togglePasswordConfirmation', 'password_confirmation');
});

document.addEventListener('DOMContentLoaded', function () {
    const usernameInput = document.getElementById('username');
    const usernameError = document.getElementById('usernameError');
    const usernameRegex = /^[a-zA-Z0-9_]+$/;

    usernameInput.addEventListener('input', function () {
        const value = usernameInput.value;
        if (value === "" || usernameRegex.test(value)) {
            usernameError.style.display = "none";
            usernameInput.classList.remove("is-invalid");
        } else {
            usernameError.style.display = "block";
            usernameInput.classList.add("is-invalid");
        }
    });
});

