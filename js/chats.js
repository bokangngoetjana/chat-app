const submitBtn = document.getElementById('submit-btn');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const logoutBtn = document.getElementById('logoutBtn');
const usernameDisplay = document.querySelector('.profile-details h4');
const sidebar = document.getElementById('sidebar');
const filterDropdown = document.getElementById('user-filter');
const typingIndicator = document.getElementById("typing-indicator");
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const messageList = document.querySelector('.message-list');

const createGroupBtn = document.getElementById('create-group-btn');
const groupModal = document.getElementById('group-modal');
const groupNameInput = document.getElementById('group-name');
const groupMembersDiv = document.getElementById('group-members');
const confirmGroupBtn = document.getElementById('confirm-group');
const cancelGroupBtn = document.getElementById('cancel-group');


let typingTimeout;
let currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
let allChats = JSON.parse(localStorage.getItem('allChats')) || {};
let users = [];
let contacts = [];
let selectedContact = null;

//first render function

const getTimes = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const autoCloseSidebarOnSmallScreen = () => {
  if (window.innerWidth <= 768) {
    messageList.classList.remove('show');
  }
}

const showTypingIndicator = (message) => {
  typingIndicator.innerText = message;
}

const renderChatHeader = (name) => {
  usernameDisplay.innerText = name;
}

const renderMessages = () => {
  if (!selectedContact) {
    chatMessages.innerHTML = '<p style="text-align:center; color:#888;">Select a chat to start messaging</p>';
    return;
  }

  const userChats = allChats[currentUser.email] || {};
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

const renderSidebar = () => {
  sidebar.innerHTML = '';
  const filter = filterDropdown?.value || 'all';

  const onlineUsers = JSON.parse(localStorage.getItem('onlineUsers')) || {};
  const onlineSet = new Set(Object.keys(onlineUsers));

  const filteredContacts = users.filter(user => user.email !== currentUser.email)
  .map(user => ({
    name: user.firstName,
    email: user.email,
    online: onlineSet.has(user.email)
  })).filter(contact => {
    return filter === 'online' ? contact.online : true;
  });

  //render contacts
  filteredContacts.forEach(contact => {
    const item = document.createElement('div');
    item.classList.add('message-item');
    item.innerHTML = `
      <img src="../assets/profile1.jpg" alt="Avatar" class="profile-img" />
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
      autoCloseSidebarOnSmallScreen();
    });
    sidebar.appendChild(item);
  });

  const groups = JSON.parse(localStorage.getItem('groups')) || {};
  Object.entries(groups).forEach(([groupId, group]) => {
    if (group.members.includes(currentUser.email)) {
      const item = document.createElement('div');
      item.classList.add('message-item');
      item.innerHTML = `
        <img src="assets/group-icon.png" alt="Group Icon" />
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
        autoCloseSidebarOnSmallScreen();
      });
      sidebar.appendChild(item);
    }
  });
}

if(sidebar.innerHTML.trim() === ''){
  sidebar.innerHTML = `<p>no contacts found</p>`
}

toggleSidebarBtn.addEventListener('click', () => {
  messageList.classList.toggle('show');
});

submitBtn.addEventListener('click', () => {
  const text = messageInput.value.trim();
  if (!text || !selectedContact) return;

  const sender = currentUser.email;
  const time = getTimes();
  const messageObj = { text, time };
  const groups = JSON.parse(localStorage.getItem('groups')) || {};

  if (groups[selectedContact]) {
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
  } else {
    const receiver = selectedContact;
    allChats[sender] = allChats[sender] || {};
    allChats[sender][receiver] = allChats[sender][receiver] || [];
    allChats[receiver] = allChats[receiver] || {};
    allChats[receiver][sender] = allChats[receiver][sender] || [];
    allChats[sender][receiver].push({ ...messageObj, type: 'sent' });
    allChats[receiver][sender].push({ ...messageObj, type: 'received' });
  }

  localStorage.setItem('allChats', JSON.stringify(allChats));
  messageInput.value = '';
  renderMessages();
});

messageInput.addEventListener("input", () => {
  if (!selectedContact) return;

  const typingStatus = {
    from: currentUser.email,
    to: selectedContact,
    name: currentUser.firstName,
    time: Date.now()
  };

  localStorage.setItem("typingStatus", JSON.stringify(typingStatus));

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    localStorage.removeItem("typingStatus");
  }, 6000);
});

window.addEventListener("storage", (event) => {
  if (event.key === "allChats") {
    allChats = JSON.parse(event.newValue);
    renderMessages();
  }

  if (event.key === "typingStatus") {
    const typingData = JSON.parse(event.newValue);
    if (
      typingData &&
      typingData.to === currentUser.email &&
      typingData.from !== currentUser.email
    ) {
      showTypingIndicator(`${typingData.name} is typing...`);
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        typingIndicator.innerText = '';
      }, 3000);
    }
  }
  if(event.key === "onlineUsers"){
    renderSidebar();
  }
});

//Group Chat Modal 
createGroupBtn.addEventListener('click', () => {
  groupNameInput.value = '';
  groupMembersDiv.innerHTML = '';
  contacts.forEach(contact => {
    const checkbox = document.createElement('div');
    checkbox.innerHTML = `
      <label><input type="checkbox" value="${contact.email}"> ${contact.name}</label>
    `;
    groupMembersDiv.appendChild(checkbox);
  });
  groupModal.style.display = 'flex';
});

cancelGroupBtn.addEventListener('click', () => {
  groupModal.style.display = 'none';
});

confirmGroupBtn.addEventListener('click', () => {
  const groupName = groupNameInput.value.trim();
  const checkedBoxes = groupMembersDiv.querySelectorAll('input[type="checkbox"]:checked');

  if (!groupName) return alert("Please enter a group name.");
  if (checkedBoxes.length === 0) return alert("Select at least one member.");

  const selectedEmails = Array.from(checkedBoxes).map(cb => cb.value);
  if (!selectedEmails.includes(currentUser.email)) {
    selectedEmails.push(currentUser.email);
  }

  const groupId = `group_${Date.now()}`;
  const groupMembers = [...new Set(selectedEmails)];

  groupMembers.forEach(member => {
    allChats[member] = allChats[member] || {};
    allChats[member][groupId] = allChats[member][groupId] || [];
  });

  localStorage.setItem('allChats', JSON.stringify(allChats));

  let groups = JSON.parse(localStorage.getItem('groups')) || {};
  groups[groupId] = { name: groupName, members: groupMembers };
  localStorage.setItem('groups', JSON.stringify(groups));

  groupModal.style.display = 'none';
  groupNameInput.value = '';
  renderSidebar();
});

window.onload = () => {
  if (!currentUser) {
    window.location.href = "/index.html";
    return;
  }

  try {
    users = JSON.parse(localStorage.getItem("users")) || [];
    if (!Array.isArray(users)) users = [];
  } catch {
    users = [];
  }

  if (filterDropdown) {
    filterDropdown.value = 'all';
    filterDropdown.addEventListener('change', renderSidebar);
  }
  sessionStorage.setItem(currentUser.email, 'online');

  const getOnlineUsers = () => {
    const onlineUsers = JSON.parse(localStorage.getItem("onlineUsers")) || {};
    return new Set(Object.keys(onlineUsers));
  }

  
  const onlineUsers = JSON.parse(localStorage.getItem("onlineUsers")) || {};
  onlineUsers[currentUser.email] = {
    email: currentUser.email,
    name: currentUser.email,
    timestamp: Date.now()
  };

  localStorage.setItem("onlineUsers", JSON.stringify(onlineUsers));
  renderSidebar();
  }
  document.querySelector('.current-user-email').innerText = currentUser.email;
  sessionStorage.setItem(currentUser.email, 'online');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem("currentUser");
      sessionStorage.removeItem(currentUser.email);

      const onlineUsers = JSON.parse(localStorage.getItem("onlineUsers")) || {};
      delete onlineUsers[currentUser.email];
      localStorage.setItem("onlineUsers", JSON.stringify(onlineUsers));
      window.location.href = "../index.html";
    });
  }

  renderSidebar();

  // Auto-select first contact or group
  if (contacts.length > 0) {
    selectedContact = contacts[0].email;
    renderChatHeader(contacts[0].name);
  } else {
    const groups = JSON.parse(localStorage.getItem('groups')) || {};
    const userGroups = Object.entries(groups).filter(([_, g]) => g.members.includes(currentUser.email));
    if (userGroups.length > 0) {
      selectedContact = userGroups[0][0];
      renderChatHeader(userGroups[0][1].name);
    }
  }

  renderMessages();