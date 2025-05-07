document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = {
        user: null,
        socket: null,
        messages: [],
        users: [],
        currentChat: 'group',
        activeTab: 'login',
        
        init() {
            const savedUser = localStorage.getItem('chatUser');
            if (savedUser) {
                try {
                    this.user = JSON.parse(savedUser);
                    this.showChatSection();
                    this.connectWebSocket();
                } catch (e) {
                    console.error('Error parsing saved user:', e);
                    localStorage.removeItem('chatUser');
                }
            }

            initAuth();
            initUI();
        },

        connectWebSocket() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws?username=${encodeURIComponent(this.user.username)}`;
            
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = () => {
                console.log('WebSocket connection established');
                document.getElementById('username-display').textContent = this.user.username;
            };
            
            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                if (data.isUserList) {
                    this.users = data.users.filter(username => username !== this.user.username);
                    updateUsersList();
                } else {
                    this.messages.push(data);
                    addMessageToUI(data);
                }
            };
            
            this.socket.onclose = () => {
                console.log('WebSocket connection closed');
                // Try to reconnect after 2 seconds
                setTimeout(() => {
                    if (this.user) {
                        this.connectWebSocket();
                    }
                }, 2000);
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        },

        sendMessage(content, recipient = null) {
            if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
                console.error('WebSocket is not connected');
                return;
            }
            
            const message = {
                type: 'text',
                content,
                recipient: recipient || (this.currentChat === 'group' ? 'all' : this.currentChat)
            };
            
            this.socket.send(JSON.stringify(message));
        },
        
        // Send file message
        sendFileMessage(file) {
            if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
                console.error('WebSocket is not connected');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target.result.length > 512 * 1024) {
                    alert('File is too large. Maximum size is 500KB.');
                    return;
                }
                
                const message = {
                    type: 'file',
                    content: JSON.stringify({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: e.target.result
                    }),
                    recipient: this.currentChat === 'group' ? 'all' : this.currentChat
                };
                
                this.socket.send(JSON.stringify(message));
            };
            
            reader.readAsDataURL(file);
        },

        showAuthSection() {
            document.getElementById('auth-section').classList.remove('hidden');
            document.getElementById('chat-section').classList.add('hidden');
        },
        
        showChatSection() {
            document.getElementById('auth-section').classList.add('hidden');
            document.getElementById('chat-section').classList.remove('hidden');
            scrollToBottom();
        },
        
        logout() {
            if (this.socket) {
                this.socket.close();
            }
            
            this.user = null;
            this.messages = [];
            this.users = [];
            this.currentChat = 'group';
            
            localStorage.removeItem('chatUser');

            document.getElementById('messages').innerHTML = '';
            document.getElementById('users-list').innerHTML = '';
            
            this.showAuthSection();
        }
    };
    
    window.chatApp.init();
});