// اضافه کردن این متغیرها در بالای اسکریپت
let stompClient = null;
let currentUsername = null;

// تابع اتصال به WebSocket
function connect() {
    const socket = new SockJS('/ws-chat');
    stompClient = Stomp.over(socket);
    
    stompClient.connect({}, function(frame) {
        console.log('Connected: ' + frame);
        
        // عضویت در topic چت
        stompClient.subscribe('/topic/public', function(message) {
            const chatMessage = JSON.parse(message.body);
            displayMessage(chatMessage);
        });
        
        // درخواست تاریخچه پیام‌ها
        fetchMessageHistory();
    });
}

// دریافت تاریخچه پیام‌ها
function fetchMessageHistory() {
    fetch('/api/messages')
        .then(response => response.json())
        .then(messages => {
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = '';
            
            messages.reverse().forEach(message => {
                displayMessage(message);
            });
        });
}

// نمایش پیام
function displayMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    
    const messageClass = message.sender === currentUsername ? 'sent' : 'received';
    messageEl.className = `message ${messageClass}`;
    
    messageEl.innerHTML = `
        <div class="message-sender">${message.sender}</div>
        <div class="message-text">${message.content}</div>
        <div class="message-time">${message.timestamp}</div>
    `;
    
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ارسال پیام
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    
    if (messageText && stompClient && currentUsername) {
        const chatMessage = {
            sender: currentUsername,
            content: messageText,
            messageType: 'CHAT'
        };
        
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
}

// تغییر در تابع showMainPage برای اتصال به WebSocket
function showMainPage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
    
    if (currentUser) {
        currentUsername = currentUser.username;
        document.getElementById('userDisplayName').textContent = currentUser.username;
        
        if (currentUser.picture) {
            document.getElementById('userAvatar').innerHTML = `<img src="${currentUser.picture}" alt="User Avatar">`;
        } else {
            document.getElementById('userAvatar').textContent = currentUser.username.charAt(0).toUpperCase();
        }
        
        // اتصال به WebSocket پس از ورود
        connect();
        
        // ارسال پیام ورود کاربر
        if (stompClient) {
            const chatMessage = {
                sender: currentUsername,
                content: `${currentUsername} به چت پیوست`,
                messageType: 'JOIN'
            };
            stompClient.send("/app/chat.addUser", {}, JSON.stringify(chatMessage));
        }
    }
    
    renderUsers();
    updateTabHighlight();
}

// تغییر در event listener ارسال پیام
document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});