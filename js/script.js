const loginBtn = document.getElementById('show-login');
const registerBtn = document.getElementById('show-register');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('registration-form');

//toggle to login form
loginBtn.addEventListener('click', () => {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginBtn.classList.add('active');
    registerBtn.classList.remove('active');
});
registerBtn.addEventListener('click', () => {
    registerForm.classList.add('active');
    loginForm.classList.remove('active')
    registerBtn.classList.add('active');
    loginBtn.classList.remove('active')
})