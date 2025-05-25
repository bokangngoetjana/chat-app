const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
const users = JSON.parse(localStorage.getItem("users")) || {};

const showToast = (message, type='success') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    };


if(!currentUser){
    showToast("No user logged in.", 'error')
    window.location.href = "/index.html";
}

document.getElementById("firstName").innerHTML = currentUser.firstName;
document.getElementById("lastName").innerHTML = currentUser.lastName;
document.getElementById("emailInput").value = currentUser.email;

document.getElementById("updateBtn").addEventListener("click", () => {
    const newEmail = document.getElementById("emailInput").value.trim();

    if(!newEmail || newEmail === currentUser.email){
        showToast("No change detected", 'error');
        return;
    }
    if(users[newEmail]){
        showToast("This email is already in use.",'error');
        return;
    }

    // Update user data
  users[newEmail] = { ...currentUser, email: newEmail };
  delete users[currentUser.email];

  localStorage.setItem("users", JSON.stringify(users));
  sessionStorage.setItem("currentUser", JSON.stringify(users[newEmail]));

  showToast("Username updated successfully!",'success');
  window.location.reload();
});
document.getElementById("back").addEventListener("click", () => {
  window.location.href = "/pages/chats.html";
});