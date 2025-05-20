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

//registration logic
//adds a submit event listener, and prevents the form from refreshing when submitted.
document.getElementById('registration-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('last-name').value;
    const password = document.getElementById('reg-password').value;
    const confirmPwd = document.getElementById('confirm-pwd').value;

    if(password !== confirmPwd){
        alert('Passwords do not match!');
        return;
    }
    const username = email;
    const users = JSON.parse(localStorage.getItem('users')) || {};

    if(users[username]){
        alert('User already exists.');
        return;
    }
    users[username] = {
        email,
        firstName,
        lastName,
        password
    };

    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! You can now log in.');

    loginBtn.click();
});
//Login logic
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem('users')) || {};

    
    if (!users[username]) {
        alert('User does not exist.');
        return;
    }

    if (users[username].password !== password) {
        alert('Incorrect password.');
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify(users[username]));
    alert('Login successful!');
    window.location.href = '/pages/chats.html';
});