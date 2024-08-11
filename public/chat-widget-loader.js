// Function to load external scripts
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
  }

  // Function to create chat widget container
  function createChatWidgetContainer() {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'toggle-chat-container';
    chatContainer.className = 'chat-widget-container';

    const chatHeader = document.createElement('div');
    chatHeader.className = 'chat-header';
    chatHeader.textContent = 'Chat';
    chatHeader.onclick = toggleChat;

    const chatBody = document.createElement('div');
    chatBody.className = 'chat-body';

    const chatWidgetContainer = document.createElement('div');
    chatWidgetContainer.id = 'chat-widget-container';

    chatBody.appendChild(chatWidgetContainer);
    chatContainer.appendChild(chatHeader);
    chatContainer.appendChild(chatBody);
    document.body.appendChild(chatContainer);
  }

  // Function to toggle chat visibility
  function toggleChat() {
    const chatContainer = document.getElementById('toggle-chat-container');
    chatContainer.classList.toggle('open');
  }

  // Add necessary CSS
  const css = `
  .chat-widget-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 300px;
    max-height: 400px;
    z-index: 1000;
    border: 1px solid #ccc;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    background-color: #f9f9f9;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .chat-header {
    background-color: #0288d1;
    color: #fff;
    padding: 10px;
    text-align: center;
    border-radius: 10px 10px 0 0;
    cursor: pointer;
  }
  .chat-body {
    display: none;
    flex-grow: 1;
  }
  .chat-widget-container.open .chat-body {
    display: flex;
    flex-direction: column;
    padding: 10px;
  }
  `;

  // Add CSS to the page
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  // Create chat widget container
  createChatWidgetContainer();

  // Load React and then the chat widget script
  loadScript('https://unpkg.com/react@17/umd/react.production.min.js', () => {
    loadScript('https://unpkg.com/react-dom@17/umd/react-dom.production.min.js', () => {
      loadScript('/js/dist/app.js'); // Replace with the actual path to your bundled React app script
    });
  });
