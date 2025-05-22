const loginBtn = document.getElementById('show-login');
const registerBtn = document.getElementById('show-register');
const loginForm = document.getElementById('login-toggle');
const registerForm = document.getElementById('register-toggle');

loginBtn.addEventListener('click', () => {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginBtn.classList.add('active');
    registerBtn.classList.remove('active');
});

registerBtn.addEventListener('click', () => {
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    registerBtn.classList.add('active');
    loginBtn.classList.remove('active');
});

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

document.getElementById('registration-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('last-name').value;
    const password = document.getElementById('reg-password').value;
    const confirmPwd = document.getElementById('confirm-pwd').value;

    if (password !== confirmPwd) {
        alert('Passwords do not match!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.email === email);

    if (userExists) {
        alert('User already exists.');
        return;
    }

    const hashedPassword = await hashPassword(password);

    users.push({
        email,
        firstName,
        lastName,
        password: hashedPassword
    });

    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! You can now log in.');
    loginBtn.click();
});

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    let users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(user => user.email === username);

    if (!user) {
        alert('User does not exist.');
        return;
    }

    const hashedPassword = await hashPassword(password);

    if (user.password !== hashedPassword) {
        alert('Incorrect password.');
        return;
    }

    sessionStorage.setItem('currentUser', JSON.stringify(user));
    alert('Login successful!');
    window.location.href = '../pages/chats.html';
});
