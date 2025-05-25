const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
let users = JSON.parse(localStorage.getItem("users")) || [];

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
    const oldEmail = currentUser.email;
    const updatedUser = {...currentUser, email: newEmail};

    //update users
    users[newEmail] = updatedUser;
    delete users[oldEmail];

    users = users.map(user => user.email === oldEmail ? updatedUser : user);
    localStorage.setItem("users", JSON.stringify(users));

    //update all chats
    let allChats = JSON.parse(localStorage.getItem("allChats")) || {};

    //rename top-level key
    if(allChats[oldEmail]) {
        allChats[newEmail] = allChats[oldEmail];
        delete allChats[oldEmail];
    }

    //update nested references
    for(let user in allChats){
        if(allChats[user][oldEmail]){
            allChats[user][newEmail] = allChats[user][oldEmail];
            delete allChats[user][oldEmail];
        }
    }
    localStorage.setItem("allChats", JSON.stringify(allChats));

    //update online users
    let onlineUsers = JSON.parse(localStorage.getItem("onlineUsers")) || {};
    if(onlineUsers[oldEmail]){
        onlineUsers[newEmail] = {...onlineUsers[oldEmail], email: newEmail};
        delete onlineUsers[oldEmail];
    }
    localStorage.setItem("onlineUsers", JSON.stringify(onlineUsers));

    //update groups
    let groups = JSON.parse(localStorage.getItem("groups")) || {};
    for(let groupId in groups) {
        const group = groups[groupId];
        if(group.members.includes(oldEmail)){
            group.members = group.members.map(email => email === oldEmail ? newEmail : email);
        }
    }
    localStorage.setItem("groups", JSON.stringify(groups));

    sessionStorage.setItem("currentUser", JSON.stringify(updatedUser));

  showToast("Username updated successfully!",'success');
  window.location.reload();
});
document.getElementById("back").addEventListener("click", () => {
  window.location.href = "/pages/chats.html";
});