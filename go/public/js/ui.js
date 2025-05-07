
function initUI() {
    const groupChatBtn = document.getElementById('group-chat-btn');
    // const sidebar = document.getElementById('sidebar');

    initChat();

    groupChatBtn.addEventListener('click', () => {
        startGroupChat();
    });

    document.getElementById('users-list').addEventListener('click', (e) => {
        const userItem = e.target.closest('.user-item');
        if (userItem) {
            const username = userItem.dataset.username;
            startPrivateChat(username);
        }
    });
}