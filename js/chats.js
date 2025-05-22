
const submitBtn = document.getElementById('submit-btn');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const logoutBtn = document.getElementById('logoutBtn');
const usernameDisplay = document.querySelector('.profile-details h4');
const sidebar = document.getElementById('sidebar');
const filterDropdown = document.getElementById('user-filter');


const currentUser = JSON.parse(localStorage.getItem("currentUser"));

let selectedContact = null;
let allChats = JSON.parse(localStorage.getItem('allChats')) || {};
let messages = JSON.parse(localStorage.getItem('messages')) || [];

/*code for loading all users that are registered */
let usersData = localStorage.getItem("users");
let users = [];

try {
  users = JSON.parse(usersData);
  if (!Array.isArray(users)) {
    users = [];
  }
} catch (e) {
  users = [];
}

//this removes the currently signed in user from the chat list
const contacts = users.filter(user => user.email !== currentUser.email)
.map(user => ({name: user.firstName, email: user.email, online: true}));

if (!currentUser) {
  window.location.href = "/index.html";
}
document.querySelector('.current-user-email').innerText = currentUser.email;

//filters users by status (online/offline)
if (filterDropdown) {
  filterDropdown.addEventListener('change', renderSidebar);
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem("currentUser");
    window.location.href = "/index.html";
  });
}



submitBtn.addEventListener('click', () => {
  const text = messageInput.value.trim();
  if (!text || !selectedContact) return;

  //save messages for both users in allChats
  const sender = currentUser.email;
  const receiver = selectedContact;

  allChats[sender] = allChats[sender] || {};
  allChats[sender][receiver] = allChats[sender][receiver] || [];

  allChats[receiver] = allChats[receiver] || {};
  allChats[receiver][sender] = allChats[receiver][sender] || [];

  const time = getTimes();
  const messageObj = {
    text: text,
    time: time
  };

  allChats[sender][receiver].push({
    ...messageObj,
    type: 'sent'
  });
  
  allChats[receiver][sender].push({
    ...messageObj,
    type: 'received'
  });
  
  localStorage.setItem('allChats', JSON.stringify(allChats));
  messageInput.value = '';
  renderMessages();
});

//Render functions

function renderSidebar() {
  sidebar.innerHTML = '';
  const filter = filterDropdown?.value || 'all';

  const filteredContacts = contacts.filter(contact =>
    filter === 'online' ? contact.online : true
  );

  filteredContacts.forEach(contact => {
    const item = document.createElement('div');
    item.classList.add('message-item');
    item.innerHTML = `
      <img src="images/avatar.jpg" alt="">
      <div class="message-content">
        <div class="message-header">
          <h4>${contact.name} ${contact.online ? '<span style="color:green;">●</span>' : ''}</h4>
          <span>12:15</span>
        </div>
        <p>Tap to open chat</p>
      </div>
    `;
    item.addEventListener('click', () => {
      selectedContact = contact.email;
      renderChatHeader(contact.name);
      renderMessages();
    });
    sidebar.appendChild(item);
  });
}


function renderChatHeader(name) {
  usernameDisplay.innerText = name;
}


function renderMessages() {
  const chatKey = currentUser.email;
  const userChats = allChats[chatKey] || {};
  const messages = userChats[selectedContact] || [];

  chatMessages.innerHTML = '';
  messages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add(msg.type);
    msgDiv.innerHTML = `
      <p>${msg.text}</p>
      <span class="timestamp">${msg.time}</span>
    `;
    chatMessages.appendChild(msgDiv);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getTimes() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}


window.onload = () => {
  renderSidebar();

  if (contacts.length > 0) {
  selectedContact = contacts[0].email;
  renderChatHeader(contacts[0].name);
}

  renderMessages();
};
