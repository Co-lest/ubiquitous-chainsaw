function initChat() {
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const fileBtn = document.getElementById('file-btn');
    const fileInput = document.getElementById('file-input');

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const content = messageInput.value.trim();
        if (!content) return;
        
        window.chatApp.sendMessage(content);
        messageInput.value = '';
    });
    
    fileBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            window.chatApp.sendFileMessage(file);
            fileInput.value = null;
        }
    });
}

function addMessageToUI(message) {
    const messagesContainer = document.getElementById('messages');
    const isCurrentChat = 
        (window.chatApp.currentChat === 'group' && !message.isPrivate) || 
        (message.isPrivate && 
            (message.sender === window.chatApp.currentChat || 
             message.recipient === window.chatApp.currentChat));

    if (message.type === 'system' || isCurrentChat || 
        message.sender === window.chatApp.user.username ||
        message.recipient === window.chatApp.user.username) {
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('message-appear');

        const timestamp = new Date(message.timestamp);
        const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (message.type === 'system') {
            messageElement.innerHTML = `
                <div class="message system">
                    <p>${message.content}</p>
                    <div class="timestamp">${timeString}</div>
                </div>
            `;
        } else {
            const isSent = message.sender === window.chatApp.user.username;
            const messageClass = isSent ? 'sent' : 'received';
            
            let messageContent = '';
            
            if (message.type === 'file') {
                try {
                    const fileData = JSON.parse(message.content);
                    const isImage = fileData.type.startsWith('image/');
                    
                    if (isImage) {
                        messageContent = `
                            <img src="${fileData.data}" alt="Image" class="max-w-full rounded" style="max-height: 200px;">
                            <div class="file-message">
                                <i class="fas fa-file-image"></i>
                                <span class="file-name">${fileData.name}</span>
                            </div>
                        `;
                    } else {
                        messageContent = `
                            <div class="file-message">
                                <i class="fas fa-file"></i>
                                <span class="file-name">${fileData.name} (${formatFileSize(fileData.size)})</span>
                            </div>
                            <a href="${fileData.data}" download="${fileData.name}" class="text-xs text-blue-500 hover:underline">Download</a>
                        `;
                    }
                } catch (e) {
                    messageContent = '<p>Invalid file data</p>';
                }
            } else {
                messageContent = `<p>${escapeHtml(message.content)}</p>`;
            }
            
            messageElement.innerHTML = `
                <div class="message ${messageClass}">
                    ${!isSent ? `<div class="font-medium text-xs mb-1">${message.sender}</div>` : ''}
                    ${messageContent}
                    <div class="timestamp">${timeString}</div>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageElement);
        scrollToBottom();
    }
}

function updateUsersList() {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';
    
    const sortedUsers = [...window.chatApp.users].sort();
    
    sortedUsers.forEach(username => {
        const userItem = document.createElement('div');
        userItem.className = `user-item p-3 flex items-center space-x-3 hover:bg-gray-50 cursor-pointer ${
            window.chatApp.currentChat === username ? 'active' : ''
        }`;
        userItem.dataset.username = username;
        
        userItem.innerHTML = `
            <div class="relative">
                <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-gray-500"></i>
                </div>
                <div class="status-indicator"></div>
            </div>
            <div>
                <h3 class="font-medium text-gray-800">${username}</h3>
                <p class="text-xs text-gray-500">Online</p>
            </div>
        `;
        
        userItem.addEventListener('click', () => {
            startPrivateChat(username);
        });
        
        usersList.appendChild(userItem);
    });
}

function startPrivateChat(username) {
    window.chatApp.currentChat = username;
    
    document.getElementById('current-chat-label').textContent = `Chatting with ${username}`;
    document.getElementById('mobile-current-chat').textContent = username;
    
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelector(`.user-item[data-username="${username}"]`)?.classList.add('active');
    
    document.getElementById('group-chat-btn').classList.remove('active');

    refreshMessages();
}

function startGroupChat() {
    window.chatApp.currentChat = 'group';
    
    document.getElementById('current-chat-label').textContent = 'Group Chat';
    document.getElementById('mobile-current-chat').textContent = 'Group Chat';

    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById('group-chat-btn').classList.add('active');
    
    refreshMessages();
}

function refreshMessages() {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';
    
    window.chatApp.messages.forEach(message => {
        addMessageToUI(message);
    });
    
    scrollToBottom();
}

function scrollToBottom() {
    const container = document.getElementById('messages-container');
    container.scrollTop = container.scrollHeight;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}
