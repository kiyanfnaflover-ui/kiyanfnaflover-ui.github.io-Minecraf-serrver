// ========== متغیرهای سراسری ==========
let currentUser = null;
let users = JSON.parse(localStorage.getItem('cosjol_users')) || [];
let chatMessages = JSON.parse(localStorage.getItem('cosjol_chat')) || [];
let galleryItems = JSON.parse(localStorage.getItem('cosjol_gallery')) || [];

// ========== سیستم راه‌اندازی ==========
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthSystem();
    initializeChatSystem();
    initializeGallerySystem();
    initializeTabNavigation();
    initializeLoadingAnimation();
    
    // بررسی کاربر لاگین شده
    const savedUser = localStorage.getItem('cosjol_currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
});

// ========== سیستم احراز هویت ==========
function initializeAuthSystem() {
    const authForm = document.getElementById('auth-form');
    const googleBtn = document.querySelector('.google-btn');
    
    authForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showNotification('Please enter username and password', 'error');
            return;
        }
        
        const existingUser = users.find(u => u.username === username);
        
        if (existingUser) {
            if (existingUser.password === password) {
                loginUser(existingUser);
            } else {
                showNotification('Incorrect password', 'error');
            }
        } else {
            registerUser(username, password);
        }
    });
    
    googleBtn.addEventListener('click', function() {
        showNotification('Google authentication would open in real application', 'info');
    });
}

function registerUser(username, password) {
    const newUser = {
        id: generateId(),
        username: username,
        password: password,
        avatar: `https://i.pravatar.cc/150?u=${username}`,
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('cosjol_users', JSON.stringify(users));
    loginUser(newUser);
    
    // پیام خوش‌آمدگویی
    const welcomeMessage = {
        id: generateId(),
        userId: 'system',
        username: 'System',
        text: `User ${username} joined the CosJol community!`,
        timestamp: new Date().toISOString(),
        type: 'system'
    };
    
    chatMessages.push(welcomeMessage);
    localStorage.setItem('cosjol_chat', JSON.stringify(chatMessages));
    displayChatMessages();
}

function loginUser(user) {
    currentUser = user;
    currentUser.lastLogin = new Date().toISOString();
    localStorage.setItem('cosjol_currentUser', JSON.stringify(currentUser));
    
    // آپدیت کاربر در لیست
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('cosjol_users', JSON.stringify(users));
    }
    
    updateUIForLoggedInUser();
    showNotification(`Welcome ${user.username}!`, 'success');
    
    // پیام ورود به چت
    const loginMessage = {
        id: generateId(),
        userId: 'system',
        username: 'System',
        text: `${user.username} joined the chat.`,
        timestamp: new Date().toISOString(),
        type: 'system'
    };
    
    chatMessages.push(loginMessage);
    localStorage.setItem('cosjol_chat', JSON.stringify(chatMessages));
    displayChatMessages();
}

function logoutUser() {
    if (currentUser) {
        const logoutMessage = {
            id: generateId(),
            userId: 'system',
            username: 'System',
            text: `${currentUser.username} left the chat.`,
            timestamp: new Date().toISOString(),
            type: 'system'
        };
        
        chatMessages.push(logoutMessage);
        localStorage.setItem('cosjol_chat', JSON.stringify(chatMessages));
        displayChatMessages();
    }
    
    currentUser = null;
    localStorage.removeItem('cosjol_currentUser');
    updateUIForLoggedOutUser();
    showNotification('Logged out successfully', 'info');
}

function updateUIForLoggedInUser() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    const authButtons = document.querySelector('.auth-buttons');
    authButtons.innerHTML = `
        <div class="user-info" style="display: flex; align-items: center; gap: 10px;">
            <img src="${currentUser.avatar}" alt="${currentUser.username}" style="width: 30px; height: 30px; border-radius: 50%;">
            <span>${currentUser.username}</span>
        </div>
        <button type="button" class="auth-btn logout-btn" id="logout-btn" style="background: #ff4e50;">
            <i class="fas fa-sign-out-alt"></i> Logout
        </button>
    `;
    
    document.getElementById('logout-btn').addEventListener('click', logoutUser);
    
    // فعال کردن ویژگی‌ها
    document.getElementById('message-input').disabled = false;
    document.getElementById('send-message').disabled = false;
    document.getElementById('upload-btn').disabled = false;
}

function updateUIForLoggedOutUser() {
    const authButtons = document.querySelector('.auth-buttons');
    authButtons.innerHTML = `
        <button type="button" class="auth-btn google-btn">
            <i class="fab fa-google"></i> Login with Google
        </button>
        <button type="submit" class="auth-btn register-btn">Register / Login</button>
    `;
    
    // غیرفعال کردن ویژگی‌ها
    document.getElementById('message-input').disabled = true;
    document.getElementById('send-message').disabled = true;
    document.getElementById('upload-btn').disabled = true;
    
    // ریست ایونت‌ها
    initializeAuthSystem();
}

// ========== سیستم چت ==========
function initializeChatSystem() {
    const messageInput = document.getElementById('message-input');
    const sendMessageBtn = document.getElementById('send-message');
    
    displayChatMessages();
    updateOnlineUsers();
    
    function sendMessage() {
        if (!currentUser) {
            showNotification('Please login first', 'error');
            return;
        }
        
        const text = messageInput.value.trim();
        if (!text) return;
        
        const newMessage = {
            id: generateId(),
            userId: currentUser.id,
            username: currentUser.username,
            userAvatar: currentUser.avatar,
            text: text,
            timestamp: new Date().toISOString(),
            type: 'user'
        };
        
        chatMessages.push(newMessage);
        localStorage.setItem('cosjol_chat', JSON.stringify(chatMessages));
        
        displayChatMessages();
        messageInput.value = '';
    }
    
    sendMessageBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // آپدیت آنلاین کاربران هر 30 ثانیه
    setInterval(updateOnlineUsers, 30000);
}

function displayChatMessages() {
    const chatMessagesContainer = document.getElementById('chat-messages');
    chatMessagesContainer.innerHTML = '';
    
    const sortedMessages = [...chatMessages].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    sortedMessages.forEach(msg => {
        const messageEl = document.createElement('div');
        const isOwnMessage = currentUser && msg.userId === currentUser.id;
        
        if (msg.type === 'system') {
            messageEl.className = 'message system';
            messageEl.innerHTML = `
                <div class="message-system">${msg.text}</div>
                <div class="message-time">${formatTime(msg.timestamp)}</div>
            `;
        } else {
            messageEl.className = `message ${isOwnMessage ? 'user' : 'other'}`;
            messageEl.innerHTML = `
                <div class="message-header">
                    <img src="${msg.userAvatar}" alt="${msg.username}" class="message-avatar">
                    <span class="message-sender">${msg.username}</span>
                </div>
                <div class="message-text">${msg.text}</div>
                <div class="message-time">${formatTime(msg.timestamp)}</div>
            `;
        }
        
        chatMessagesContainer.appendChild(messageEl);
    });
    
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function updateOnlineUsers() {
    const onlineUsers = users.filter(user => {
        const lastLogin = new Date(user.lastLogin);
        const now = new Date();
        return (now - lastLogin) < 5 * 60 * 1000; // 5 minutes
    });
    
    document.getElementById('online-users').textContent = `Online: ${onlineUsers.length}`;
}

// ========== سیستم گالری ==========
function initializeGallerySystem() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadModal = document.getElementById('upload-modal');
    const closeModal = document.getElementById('close-modal');
    const fileInput = document.getElementById('file-input');
    const uploadPreview = document.getElementById('upload-preview');
    const uploadForm = document.getElementById('upload-form');
    
    displayGallery();
    
    // اسکرول گالری
    prevBtn.addEventListener('click', function() {
        document.getElementById('gallery-container').scrollBy({
            left: -300,
            behavior: 'smooth'
        });
    });
    
    nextBtn.addEventListener('click', function() {
        document.getElementById('gallery-container').scrollBy({
            left: 300,
            behavior: 'smooth'
        });
    });
    
    // آپلود مدال
    uploadBtn.addEventListener('click', function() {
        if (!currentUser) {
            showNotification('Please login to upload images', 'error');
            return;
        }
        uploadModal.style.display = 'flex';
    });
    
    closeModal.addEventListener('click', function() {
        uploadModal.style.display = 'none';
        uploadForm.reset();
        uploadPreview.innerHTML = '<span class="upload-preview-text">Preview will appear here</span>';
    });
    
    // پیش‌نمایش فایل
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener('load', function() {
                uploadPreview.innerHTML = `<img src="${this.result}" alt="Preview">`;
            });
            reader.readAsDataURL(file);
        }
    });
    
    // آپلود تصویر
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const file = fileInput.files[0];
        const title = document.getElementById('image-title').value;
        
        if (!file || !title) {
            showNotification('Please select an image and enter a title', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.addEventListener('load', function() {
            const newItem = {
                id: generateId(),
                title: title,
                userId: currentUser.id,
                username: currentUser.username,
                userAvatar: currentUser.avatar,
                image: this.result,
                timestamp: new Date().toISOString()
            };
            
            galleryItems.push(newItem);
            localStorage.setItem('cosjol_gallery', JSON.stringify(galleryItems));
            displayGallery();
            
            uploadModal.style.display = 'none';
            uploadForm.reset();
            uploadPreview.innerHTML = '<span class="upload-preview-text">Preview will appear here</span>';
            
            showNotification('Image uploaded successfully!', 'success');
        });
        reader.readAsDataURL(file);
    });
}

function displayGallery() {
    const galleryContainer = document.getElementById('gallery-container');
    galleryContainer.innerHTML = '';
    
    galleryItems.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        galleryItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="gallery-item-overlay">
                <div class="gallery-item-title">${item.title}</div>
                <div class="gallery-item-user">
                    <img src="${item.userAvatar}" alt="${item.username}" style="width: 20px; height: 20px; border-radius: 50%; margin-right: 5px;">
                    By ${item.username}
                </div>
                <div class="gallery-item-time">${formatTime(item.timestamp)}</div>
            </div>
        `;
        
        galleryContainer.appendChild(galleryItem);
    });
}

// ========== سیستم تب‌ها ==========
function initializeTabNavigation() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// ========== انیمیشن لودینگ ==========
function initializeLoadingAnimation() {
    const diamondContainer = document.getElementById('diamond-container');
    const diamonds = [];
    let diamondId = 0;
    
    let lastDiamondTime = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastDiamondTime > 100) {
            createDiamondAtMouse(e.clientX, e.clientY);
            lastDiamondTime = now;
        }
    });
    
    function createDiamondAtMouse(x, y) {
        diamondId++;
        
        const diamond = document.createElement('div');
        diamond.className = 'diamond';
        diamond.id = `diamond-${diamondId}`;
        diamond.style.left = (x - 40) + 'px';
        diamond.style.top = (y - 40) + 'px';
        
        const rotation = Math.random() * 360;
        const scale = 0.8 + Math.random() * 0.4;
        diamond.style.transform = `rotate(${rotation}deg) scale(${scale})`;
        
        diamondContainer.appendChild(diamond);
        
        const physics = {
            x: x - 40,
            y: y - 40,
            velocityY: 0,
            rotation: rotation,
            rotationSpeed: (Math.random() - 0.5) * 10,
            scale: scale,
            isFalling: true
        };
        
        diamonds.push({
            element: diamond,
            physics: physics
        });
        
        if (diamonds.length > 50) {
            const oldDiamond = diamonds.shift();
            diamondContainer.removeChild(oldDiamond.element);
        }
    }
    
    function updatePhysics() {
        for (let i = diamonds.length - 1; i >= 0; i--) {
            const diamond = diamonds[i];
            const physics = diamond.physics;
            
            if (physics.isFalling) {
                physics.velocityY += 0.5;
                physics.y += physics.velocityY;
                physics.rotation += physics.rotationSpeed;
                
                if (physics.y > window.innerHeight - 80) {
                    physics.y = window.innerHeight - 80;
                    physics.velocityY = -physics.velocityY * 0.6;
                    physics.rotationSpeed *= 0.9;
                    
                    if (Math.abs(physics.velocityY) < 2) {
                        physics.isFalling = false;
                    }
                }
                
                diamond.element.style.top = physics.y + 'px';
                diamond.element.style.transform = `rotate(${physics.rotation}deg) scale(${physics.scale})`;
            }
        }
        requestAnimationFrame(updatePhysics);
    }
    updatePhysics();
    
    // لودینگ 20 ثانیه‌ای
    const progressBar = document.getElementById('progress-bar');
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');
    
    let progress = 0;
    const totalTime = 20000;
    const intervalTime = 200;
    const steps = totalTime / intervalTime;
    const progressIncrement = 100 / steps;
    
    const loadingInterval = setInterval(() => {
        progress += progressIncrement;
        progressBar.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    mainContent.style.display = 'block';
                    setTimeout(() => {
                        mainContent.style.opacity = '1';
                    }, 100);
                }, 1000);
            }, 500);
        }
    }, intervalTime);
}

// ========== ابزارک‌های کمکی ==========
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ========== کپی آدرس سرور ==========
document.getElementById('server-address').addEventListener('click', copyServerAddress);
document.getElementById('copy-button').addEventListener('click', copyServerAddress);

function copyServerAddress() {
    const text = 'cosjolserver.aternos.me:11940';
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Server address copied to clipboard!', 'success');
    }).catch(err => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Server address copied to clipboard!', 'success');
    });
}