const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
const users = JSON.parse(localStorage.getItem("users")) || {};

if(!currentUser){
    alert("No user logged in.")
    window.location.href = "/index.html";
}

document.getElementById("firstName").innerHTML = currentUser.firstName;
document.getElementById("lastName").innerHTML = currentUser.lastName;
document.getElementById("emailInput").value = currentUser.email;

document.getElementById("updateBtn").addEventListener("click", () => {
    const newEmail = document.getElementById("emailInput").value.trim();

    if(!newEmail || newEmail === currentUser.email){
        alert("No change detected");
        return;
    }
    if(users[newEmail]){
        alert("This email is already in use.");
        return;
    }

    // Update user data
  users[newEmail] = { ...currentUser, email: newEmail };
  delete users[currentUser.email];

  localStorage.setItem("users", JSON.stringify(users));
  sessionStorage.setItem("currentUser", JSON.stringify(users[newEmail]));

  alert("Username updated successfully!");
  window.location.reload();
});
document.getElementById("back").addEventListener("click", () => {
  window.location.href = "/pages/chats.html";
});