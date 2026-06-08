(function () {

    const form = document.querySelector('form');
    if (!form) return;

    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const isSignUp = firstNameInput && lastNameInput && confirmPasswordInput;

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        validateForm();
    });

    function validateForm() {

        clearState();
        let isValid = true;

        if (isSignUp) {
            if (!validateName(firstNameInput, 'First name')) isValid = false;
            if (!validateName(lastNameInput, 'Last name')) isValid = false;
        }

        if (!validateEmail()) isValid = false;
        if (!validatePassword()) isValid = false;

        if (isSignUp && !validatePasswordConfirm()) isValid = false;

        if (isValid) form.submit();
    }

    function validateName(input, label) {

        const value = input.value.trim();

        if (value.length < 3) {
            setError(input, `${label} must be at least 3 characters.`);
            return false;
        }

        if (value.length > 15) {
            setError(input, `${label} must not exceed 15 characters.`);
            return false;
        }

        setSuccess(input);
        return true;
    }

    function validateEmail() {

        const email = emailInput.value.trim();
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regex.test(email)) {
            setError(emailInput, 'Enter a valid email address.');
            return false;
        }

        setSuccess(emailInput);
        return true;
    }

    function validatePassword() {

        const password = passwordInput.value.trim();
        if (password.length < 6) {
            setError(passwordInput, 'Password must be at least 6 characters.');
            return false;
        }

        setSuccess(passwordInput);
        return true;
    }

    function validatePasswordConfirm() {

        const password = passwordInput.value.trim();
        const confirm = confirmPasswordInput.value.trim();

        if (confirm !== password) {
            setError(confirmPasswordInput, 'Passwords do not match.');
            return false;
        }

        setSuccess(confirmPasswordInput);
        return true;
    }

    function setError(input, message) {

        const group = input.closest('.input-group');
        const small = group?.querySelector('small');

        if (!small) return;

        small.textContent = message;
        small.style.display = 'block';
        small.style.color = '#b91c1c';
        input.style.borderColor = '#b91c1c';
    }

    function setSuccess(input) {

        const group = input.closest('.input-group');
        const small = group?.querySelector('small');

        if (!small) return;

        small.textContent = '';
        small.style.display = 'none';
        input.style.borderColor = '#2563eb';
    }

    function clearState() {

        const inputs = form.querySelectorAll('input');
        const smalls = form.querySelectorAll('small');

        inputs.forEach(i => {
            i.style.borderColor = '#e2e8f0';
        });

        smalls.forEach(s => {
            s.textContent = '';
            s.style.display = 'none';
        });
    }

})();