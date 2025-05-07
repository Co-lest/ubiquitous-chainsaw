const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const logoutBtn = document.getElementById('logout-btn');
const authError = document.getElementById('auth-error');

loginTab.addEventListener("click", () => setActiveTab("login") );

registerTab.addEventListener("click", () => setActiveTab("register"));

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || password) {
        showAuthError('Username and password are required');
        return;
    }

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-type":"application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorData = await response.JSON();
            throw new Error(errorData.message || 'Login failed');
        }            
        
        const data = await response.json();
            
        window.chatApp.user = { username };
        localStorage.setItem('chatUser', JSON.stringify({ username }));
        

        loginForm.reset();
        hideAuthError();
        
        window.chatApp.showChatSection();
        window.chatApp.connectWebSocket();
        
    } catch (error) {
        showAuthError(error.message || 'Login failed. Please try again.');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (!username || !password) {
        showAuthError('Username and password are required');
        return;
    }
    
    if (password !== confirmPassword) {
        showAuthError('Passwords do not match');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }
        
        setActiveTab('login');
        document.getElementById('login-username').value = username;
        registerForm.reset();
        hideAuthError();
        
        showAuthError('Registration successful! You can now login.', 'text-green-500');
        
    } catch (error) {
        showAuthError(error.message || 'Registration failed. Please try again.');
    }
});

function setActiveTab(tab) {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    window.chatApp.activeTab = tab;
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }
    
    setTimeout(() => {
        hideAuthError();
    }, 3000);
}

function showAuthError(message, className = 'text-red-500') {
    const authError = document.getElementById('auth-error');
    authError.textContent = message;
    authError.className = `mt-4 ${className} text-sm`;
    authError.classList.remove('hidden');
}

function hideAuthError() {
    const authError = document.getElementById('auth-error');
    authError.classList.add('hidden');
    authError.textContent = '';
}