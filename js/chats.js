const submitBtn = document.getElementById('submit-btn');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const logoutBtn = document.getElementById('logoutBtn');
const usernameDisplay = document.querySelector('.profile-details h4');
const sidebar = document.getElementById('sidebar');
const filterDropdown = document.getElementById('user-filter');

const typingIndicator = document.getElementById("typing-indicator");
let typingTimeout;

const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

let selectedContact = null;

// ✅ Now using ONLY localStorage for allChats
let allChats = JSON.parse(localStorage.getItem('allChats')) || {};

// Users array & contacts list will be set inside onload to ensure proper scope
let users = [];
let contacts = [];

function getTimes() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderChatHeader(name) {
  usernameDisplay.innerText = name;
}

function renderMessages() {
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

function renderSidebar() {
  sidebar.innerHTML = '';
  const filter = filterDropdown?.value || 'all';

  // Filter contacts by online status if needed
  const filteredContacts = contacts.filter(contact => {
    return filter === 'online' ? contact.online : true;
  });

  filteredContacts.forEach(contact => {
    const item = document.createElement('div');
    item.classList.add('message-item');
    item.innerHTML = `
      <img src="/assets/profile1.jpg" alt="Avatar" class="profile-img" />
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

  // Render groups user is a member of
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
      });
      sidebar.appendChild(item);
    }
  });
}

window.onload = () => {
  if (!currentUser) {
    window.location.href = "/index.html";
    return;
  }

  // Load users from localStorage and filter out current user for contacts
  let usersData = localStorage.getItem("users");
  try {
    users = JSON.parse(usersData);
    if (!Array.isArray(users)) users = [];
  } catch {
    users = [];
  }

  contacts = users
    .filter(user => user.email !== currentUser.email)
    .map(user => ({
      name: user.firstName,
      email: user.email,
      online: sessionStorage.getItem(user.email) ? true : false
    }));

  document.querySelector('.current-user-email').innerText = currentUser.email;
  sessionStorage.setItem(currentUser.email, 'online');

  // Setup event listeners
  if (filterDropdown) {
    filterDropdown.addEventListener('change', () => {
      renderSidebar();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem("currentUser");
      sessionStorage.removeItem(currentUser.email);
      window.location.href = "/index.html";
    });
  }

  submitBtn.addEventListener('click', () => {
    const text = messageInput.value.trim();
    if (!text || !selectedContact) return;

    const sender = currentUser.email;
    const time = getTimes();
    const messageObj = {
      text: text,
      time: time
    };

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

      localStorage.setItem('allChats', JSON.stringify(allChats));
      messageInput.value = '';
      renderMessages();
      return;
    } else {
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

      localStorage.setItem('allChats', JSON.stringify(allChats));
      messageInput.value = '';
      renderMessages();
    }
  });

  // Sync messages between tabs using storage event
  window.addEventListener("storage", (event) => {
    if (event.key === "allChats") {
      allChats = JSON.parse(event.newValue);
      renderMessages();
    }
  });

window.addEventListener("storage", (event) => {
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
});

messageInput.addEventListener("input", () => {
  if(!selectedContact) return;

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

  // Group modal elements & buttons
  const createGroupBtn = document.getElementById('create-group-btn');
  const groupModal = document.getElementById('group-modal');
  const groupNameInput = document.getElementById('group-name');
  const groupMembersDiv = document.getElementById('group-members');
  const confirmGroupBtn = document.getElementById('confirm-group');
  const cancelGroupBtn = document.getElementById('cancel-group');

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

  cancelGroupBtn.addEventListener('click', () => {
    groupModal.style.display = 'none';
  });

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

    // Always add current user
    if (!selectedEmails.includes(currentUser.email)) {
      selectedEmails.push(currentUser.email);
    }

    const groupId = `group_${Date.now()}`;

    const groupMembers = Array.from(new Set(selectedEmails));

    groupMembers.forEach(member => {
      allChats[member] = allChats[member] || {};
      allChats[member][groupId] = allChats[member][groupId] || [];
    });

    localStorage.setItem('allChats', JSON.stringify(allChats));

    let groups = JSON.parse(localStorage.getItem('groups')) || {};
    groups[groupId] = {
      name: groupName,
      members: groupMembers
    };
    localStorage.setItem('groups', JSON.stringify(groups));

    groupModal.style.display = 'none';
    groupNameInput.value = '';
    renderSidebar();
  });

  // Initial render
  renderSidebar();

  // Select first contact or group if available
  if (contacts.length > 0) {
    selectedContact = contacts[0].email;
    renderChatHeader(contacts[0].name);
    renderMessages();
  } else {
    // If no contacts, check groups
    const groups = JSON.parse(localStorage.getItem('groups')) || {};
    const userGroups = Object.entries(groups).filter(([id, g]) => g.members.includes(currentUser.email));
    if (userGroups.length > 0) {
      selectedContact = userGroups[0][0];
      renderChatHeader(userGroups[0][1].name);
      renderMessages();
    }
  }
  function showTypingIndicator(message) {
  typingIndicator.innerText = message;
}

};
