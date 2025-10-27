let ws;

function connectWebSocket() {
    // آدرس سرور WebSocket را تنظیم کنید
    ws = new WebSocket('ws://localhost:8080/chat');

    ws.onopen = function() {
        console.log('WebSocket connection established');
    };

    ws.onmessage = function(event) {
        const message = JSON.parse(event.data);
        // اضافه کردن پیام به چت
        addMessageToChat(message);
    };

    ws.onclose = function() {
        console.log('WebSocket connection closed');
        // تلاش برای اتصال مجدد پس از 5 ثانیه
        setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
}

function addMessageToChat(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.sender === currentUser.username ? 'sent' : 'received'}`;
    messageEl.innerHTML = `
        <div class="message-sender">${message.sender}</div>
        <div class="message-text">${message.text}</div>
        <div class="message-time">${message.time}</div>
    `;
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();

    if (messageText && currentUser && ws) {
        const now = new Date();
        const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

        const message = {
            sender: currentUser.username,
            text: messageText,
            time: time
        };

        // ارسال پیام به سرور
        ws.send(JSON.stringify(message));

        // پاک کردن input
        messageInput.value = '';
    }
}