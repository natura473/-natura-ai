document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chatBox');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  
  // Thêm tin nhắn vào khung chat
  function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
    messageDiv.textContent = content;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  
  // Gửi tin nhắn đến API
  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    addMessage(message, true);
    userInput.value = '';
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }]
        })
      });
      
      const data = await response.json();
      if (data.response) {
        addMessage(data.response);
      } else if (data.error) {
        addMessage(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      addMessage('Lỗi kết nối đến Natura AI');
      console.error('Error:', error);
    }
  }
  
  // Xử lý sự kiện
  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  
  // Tin nhắn chào mừng
  setTimeout(() => {
    addMessage('Xin chào! Tôi là Natura, trợ lý ảo của bạn. Tôi có thể giúp gì cho bạn?');
  }, 500);
});