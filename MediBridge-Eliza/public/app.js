document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Add welcome message
    addMessage('bot', 'Hello! I am your medical assistant. I can help you with first aid advice, finding doctors, and general medical information. How can I help you today?');

    // Handle send button click
    sendButton.addEventListener('click', sendMessage);

    // Handle Enter key press
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Socket event listeners
    socket.on('bot_response', (data) => {
        addMessage('bot', data.message);
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage('user', message);
            socket.emit('chat_message', { message });
            userInput.value = '';
        }
    }

    function addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(type === 'user' ? 'user-message' : 'bot-message');
        messageDiv.textContent = content;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}); 