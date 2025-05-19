const loginBtn = document.getElementById('show-login');
const registerBtn = document.getElementById('show-register');

//links to the div containing both forms
const loginForm = document.getElementById('login-toggle');
const registerForm = document.getElementById('register-toggle');

//toggle to login form
loginBtn.addEventListener('click', () => {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginBtn.classList.add('active');
    registerBtn.classList.remove('active');
});
//switches to the registration form
registerBtn.addEventListener('click', () => {
    registerForm.classList.add('active');
    loginForm.classList.remove('active')
    registerBtn.classList.add('active');
    loginBtn.classList.remove('active')
})
