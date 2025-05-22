const submitBtn = document.getElementById('submit-btn');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const logoutBtn = document.getElementById('logoutBtn');

const usernameDisplay = document.querySelector('.profile-details h4');
const sidebar = document.getElementById('sidebar');
//load messages from local storage
let messages = JSON.parse(localStorage.getItem('messages')) || [];


const contacts = [
  {name: 'Leigh', online: true},
  {name: 'Lerato', online: false},
  {name: 'Kayleen', online: false},
  {name: 'Murray', online: true},
  {name: 'Lesedi', online: false}
]

function renderSidebar(){
    sidebar.innerHTML = '';

    const filter = document.getElementById('user-filter')?.value || 'all';
    const filteredContacts = contacts.filter(contact => {
    return filter === 'online' ? contact.online : true;
  });


    filteredContacts.forEach(contacts => {
        const item = document.createElement('div');
        item.classList.add('message-item');
        item.innerHTML =  `
         <img src="images/avatar.jpg" alt="">
      <div class="message-content">
        <div class="message-header">
          <h4>${contacts.name} ${contacts.online ? '<span style="color:green;">●</span>' : ''}</h4>
          <span>12:15</span>
        </div>
        <p>Tap to open chat</p>
      </div>
        `;
        item.addEventListener('click', () => {
            selectedContact = contacts.name;
            renderChatHeader(contacts.name);
            renderMessages();
        });
        sidebar.appendChild(item);
    })
}
const filterDropdown = document.getElementById('user-filter');
if (filterDropdown) {
  filterDropdown.addEventListener('change', renderSidebar);
}

function renderChatHeader(name) {
  usernameDisplay.innerText = name;
}
//function for time stamps on text messages
function getTimes(){
    const now = new Date();
    return now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
  window.location.href = "/index.html";
}
document.querySelector('.current-user-email').innerText = currentUser.email;

let selectedContact = null;
let allChats = JSON.parse(localStorage.getItem('allChats')) || {};


//render messages
function renderMessages(){
    const chatKey = currentUser.email;
    const userChats = allChats[chatKey] || {};
    const messages = userChats[selectedContact] || [];

    chatMessages.innerHTML = '';
    messages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add(msg.type);
        msgDiv.innerHTML = `
        <p>${msg.text}</p>
        <span class="timestamp">${msg.time}</span>`;
        chatMessages.appendChild(msgDiv);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem("currentUser");  // Correct method
    window.location.href = "/index.html";     // Redirect after logout
});

//send messages
submitBtn.addEventListener('click', () => {
    const text = messageInput.value.trim();
    if(!text || !selectedContact) return;

    const chatKey = currentUser.email;
    allChats[chatKey] = allChats[chatKey] || {};
    allChats[chatKey][selectedContact] = allChats[chatKey][selectedContact] || [];

    allChats[chatKey][selectedContact].push({
        type: 'sent',
        text: text,
        time: getTimes()
    });

    //auto reply
    setTimeout(() => {
        allChats[chatKey][selectedContact].push({
            text: 'Got it!',
            type: 'received',
            time: getTimes()
        });
        localStorage.setItem('allChats', JSON.stringify(allChats));
        renderMessages();
    }, 1000);
    localStorage.setItem('allChats', JSON.stringify(allChats));
    messageInput.value = '';
    renderMessages();
});
// Default to first contact
window.onload = () => {
  renderSidebar();
  selectedContact = contacts[0];
  renderChatHeader(selectedContact);
  renderMessages();
};

renderMessages();