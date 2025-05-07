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