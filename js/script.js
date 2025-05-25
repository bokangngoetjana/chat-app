const loginBtn = document.getElementById('show-login');
const registerBtn = document.getElementById('show-register');
const loginForm = document.getElementById('login-toggle');
const registerForm = document.getElementById('register-toggle');
const users = JSON.parse(localStorage.getItem('users')) || [];
const showToast = (message, type='success') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 6000);
    };

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

const hashPassword = async (password) => {
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
        showToast('Passwords do not match!', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
   
    const userExists = users.some(user => user.email === email);

    if (userExists) {
        showToast('User already exists.','error');
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
    showToast('Registration successful! You can now log in.', 'success');
    loginBtn.click();
});

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
   
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    let users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(user => user.email === username);

    if (!user) {
        showToast('User does not exist.', 'error');
        return;
    }

    const hashedPassword = await hashPassword(password);

    if (user.password !== hashedPassword) {
        showToast('Incorrect password.','error');
        return;
    }

    sessionStorage.setItem('currentUser', JSON.stringify(user));
    showToast('Login successful!','success');
    window.location.href = 'pages/chats.html';

});
