// ارسال پیام با دکمه
document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);

// ارسال پیام با کلید Enter
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});