//  start from here
//inserting value in db
axios.defaults.withCredentials = true;

// Validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$]/.test(password);
    
    const errors = [];
    if (password.length < minLength) errors.push("at least 8 characters");
    if (!hasUpperCase) errors.push("an uppercase letter");
    if (!hasLowerCase) errors.push("a lowercase letter");
    if (!hasNumbers) errors.push("a number");
    if (!hasSpecialChar) errors.push("a special character (!@#$)");
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

function showError(message, field = null) {
    if (!field) {
        const errorToast = document.createElement('div');
        errorToast.className = 'toast error';
        errorToast.innerHTML = `
            <span class="error-icon">⚠️</span>
            <span class="error-text">${message}</span>
        `;
        document.body.appendChild(errorToast);
        setTimeout(() => errorToast.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            errorToast.style.transform = 'translateX(120%)';
            setTimeout(() => errorToast.remove(), 300);
        }, 5000);
    } else {
        field.classList.add('error');
        const errorMessage = field.parentElement.querySelector('.error-message');
        errorMessage.textContent = message;
        errorMessage.classList.add('visible');
    }
}

function clearErrors() {
    document.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
    document.querySelectorAll('.error-message').forEach(msg => msg.classList.remove('visible'));
}

async function inserting(email, passwd) {
    try {
        console.log("here");
        const response = await axios.post("http://localhost:3001/signup",
            {},
            {
                headers: {
                    username: email,
                    password: passwd
                }
            }
        );
        console.log(response.data);
            
        if (response.data === "success") {
            // Automatically sign in after successful signup
           try{
                    window.location.href = '/home';
                }
             catch (signinError) {
                showError("Account created but couldn't sign in automatically. Please sign in manually.");
                window.location.href = '/signin';
            }
        }
    } catch (error) {
        if (error.response) {
            showError(error.response.data.message || "An error occurred while signing up");
        } else {
            showError("Unable to connect to the server. Please try again later.");
        }
    }
}

async function verify(email, passwd) {
    try {
        const response = await axios.post("http://localhost:3001/signin",
            {},
            {
                headers: {
                    username: email,
                    password: passwd
                }
            }
        );
    
        if (response.status === 200) {
            window.location.href = '/home';
        }
    } catch (error) {
        if (error.response) {
            switch (error.response.status) {
                case 406:
                    showError("Incorrect password. Please try again.");
                    break;
                case 409:
                    showError("Email not found. Please sign up first.");
                    break;
                default:
                    showError(error.response.data.message || "An error occurred while signing in");
            }
        } else {
            showError("Unable to connect to the server. Please try again later.");
        }
    }
}

async function signup() {
    clearErrors();
    const emailField = document.querySelector(".email");
    const passwordField = document.querySelector(".pswd");
    const email = emailField.value.trim();
    const password = passwordField.value;
    
    let hasErrors = false;
    
    if (!email) {
        showError("Email is required", emailField);
        hasErrors = true;
    } else if (!validateEmail(email)) {
        showError("Please enter a valid email address", emailField);
        hasErrors = true;
    }
    
    const passwordValidation = validatePassword(password);
    if (!password) {
        showError("Password is required", passwordField);
        hasErrors = true;
    } else if (!passwordValidation.isValid) {
        showError(`Password must contain ${passwordValidation.errors.join(", ")}`, passwordField);
        hasErrors = true;
    }
    
    if (!hasErrors) {
        await inserting(email, password);
    }
}

async function signin() {
    clearErrors();
    const emailField = document.querySelector(".email");
    const passwordField = document.querySelector(".pswd");
    const email = emailField.value.trim();
    const password = passwordField.value;
    
    let hasErrors = false;
    
    if (!email) {
        showError("Email is required", emailField);
        hasErrors = true;
    } else if (!validateEmail(email)) {
        showError("Please enter a valid email address", emailField);
        hasErrors = true;
    }
    
    if (!password) {
        showError("Password is required", passwordField);
        hasErrors = true;
    }
    
    if (!hasErrors) {
        await verify(email, password);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.email, .pswd');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            clearErrors();
        });
    });
});

function hide(){
    const alert=document.querySelector(".alert");
    alert.style.display="none";
}