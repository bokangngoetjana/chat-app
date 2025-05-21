
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

  const time = getTimes();
  const messageObj = {
    text: text,
    time: time
  };

  const groups = JSON.parse(localStorage.getItem('groups')) || {};

  if(groups[selectedContact]){
    const group = groups[selectedContact];
  

  group.members.forEach(member => {
    allChats[member] = allChats[member] || {};
    allChats[member][selectedContact] = allChats[member][selectedContact] || [];

    allChats[member][selectedContact].push({
      ...messageObj,
      type: member === sender ? 'sent' : 'received',
      senderName: currentUser.firstName
    });
  });
}else{
  const receiver = selectedContact;
  
  allChats[sender] = allChats[sender] || {};
  allChats[sender][receiver] = allChats[sender][receiver] || [];

  allChats[receiver] = allChats[receiver] || {};
  allChats[receiver][sender] = allChats[receiver][sender] || [];

   allChats[sender][receiver].push({
      ...messageObj,
      type: 'sent'
    });
  
  allChats[receiver][sender].push({
    ...messageObj,
    type: 'received'
  });
} 
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
      <img src="assets/avatar.jpg" alt="">
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
  //group chat logic
  const groups = JSON.parse(localStorage.getItem('groups')) || {};
  Object.entries(groups).forEach(([groupId, group]) => {
    if(group.members.includes(currentUser.email)){
      const item = document.createElement('div');
      item.classList.add('message-item');
      item.innerHTML = `
       <img src="assets/group-icon.png" alt="">
        <div class="message-content">
          <div class="message-header">
            <h4>${group.name}</h4>
          </div>
          <p>Tap to open group</p>
        </div>
      `;
      item.addEventListener('click', () => {
        selectedContact = groupId;
        renderChatHeader(group.name);
        renderMessages();
      });
      sidebar.appendChild(item);
    }
  })
}


function renderChatHeader(name) {
  usernameDisplay.innerText = name;
}


function renderMessages() {
  const chatKey = currentUser.email;
  const userChats = allChats[chatKey] || {};
  const messages = userChats[selectedContact] || [];
  const groups = JSON.parse(localStorage.getItem('groups')) || {};
  const isGroup = !!groups[selectedContact];

  chatMessages.innerHTML = '';

  messages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add(msg.type);

    msgDiv.innerHTML = `
  <p>${isGroup && msg.senderName ? `<strong>${msg.senderName}:</strong> ` : ''}${msg.text}</p>
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
const createGroupBtn = document.getElementById('create-group-btn');
const groupModal = document.getElementById('group-modal');
const groupNameInput = document.getElementById('group-name');
const groupMembersDiv = document.getElementById('group-members');
const confirmGroupBtn = document.getElementById('confirm-group');
const cancelGroupBtn = document.getElementById('cancel-group');

// Show the group modal
// Show modal
createGroupBtn.addEventListener('click', () => {
  groupNameInput.value = '';
  groupMembersDiv.innerHTML = '';

  contacts.forEach(contact => {
    const checkbox = document.createElement('div');
    checkbox.innerHTML = `
      <label>
        <input type="checkbox" value="${contact.email}"> ${contact.name}
      </label>
    `;
    groupMembersDiv.appendChild(checkbox);
  });

  groupModal.style.display = 'flex';
});


// Cancel button hides modal
cancelGroupBtn.addEventListener('click', () => {
  groupModal.style.display = 'none';
});

// Confirm group creation
confirmGroupBtn.addEventListener('click', () => {
  const groupName = groupNameInput.value.trim();
  const checkedBoxes = groupMembersDiv.querySelectorAll('input[type="checkbox"]:checked');

  if (!groupName) {
    alert("Please enter a group name.");
    return;
  }

  const selectedEmails = Array.from(checkedBoxes).map(cb => cb.value);

  if (selectedEmails.length === 0) {
    alert("Select at least one member.");
    return;
  }
  selectedEmails.push(currentUser.email);
  const groupId = `group_${Date.now()}`;
  const groupMembers = [...selectedEmails, currentUser.email];

  groupMembers.forEach(member => {
    allChats[member] = allChats[member] || {};
    allChats[member][groupId] = allChats[member][groupId] || [];
  });

  localStorage.setItem('allChats', JSON.stringify(allChats));

  // Save group info separately if needed
  let groups = JSON.parse(localStorage.getItem('groups')) || {};
  groups[groupId] = {
    name: groupName,
    members: groupMembers
  };
  localStorage.setItem('groups', JSON.stringify(groups));

  groupModal.style.display = 'none';
  groupNameInput.value = '';
  renderSidebar(); // refresh sidebar to show the new group
});
