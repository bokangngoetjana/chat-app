const submitBtn = document.getElementById('submit-btn');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const logoutBtn = document.getElementById('logoutBtn');
//load messages from local storage
let messages = JSON.parse(localStorage.getItem('messages')) || [];

//function for time stamps on text messages
function getTimes(){
    const now = new Date();
    return now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
  window.location.href = "login.html";
}

//render messages
function renderMessages(){
    chatMessages.innerHTML = '';
    messages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add(msg.type); //sent or received
        msgDiv.innerHTML = `
        <p>${msg.text}</p>
        <span class="timestamp">${msg.time}</span>`;
        chatMessages.appendChild(msgDiv);
    });
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem("currentUser");  // Correct method
    window.location.href = "/index.html";     // Redirect after logout
});

//send messages
submitBtn.addEventListener('click', () => {
    const text = messageInput.value.trim();
    if(text === '') return;

    const newMsg = {
        text: text,
        type: 'sent',
        time: getTimes()
    };

    messages.push(newMsg);

    //fake received message
    setTimeout(() => {
        messages.push({
            text: 'Auto-reply: got it!',
            type: 'received',
            time: getTimes()
        });
        localStorage.setItem('messages', JSON.stringify(messages));
        renderMessages();
    }, 1000);
    messageInput.value = '';
    localStorage.setItem('message', JSON.stringify(messages));
    renderMessages();
});

renderMessages();