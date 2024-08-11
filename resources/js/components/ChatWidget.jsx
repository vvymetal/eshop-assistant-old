import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import './ChatWidget.css';

const ChatWidget = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationContext, setConversationContext] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const chatMessagesRef = useRef(null);

  const formatMessage = (content) => {
    let processedContent = content
      .replace(/# ([^\n]+)/g, '<h1>$1</h1>')
      .replace(/## ([^\n]+)/g, '<h2>$1</h2>')
      .replace(/### ([^\n]+)/g, '<h3>$1</h3>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/^○\s(.+)/gm, '<li>$1</li>')
      .replace(/^(\d+)\.\s(.+)/gm, '<li value="$1">$2</li>')
      .replace(/([A-Za-z]+)-\s/g, '<strong>$1:</strong> ')
      .replace(/^-\s(.+)/gm, '<p class="dialogue">- $1</p>')
      .replace(/\n\s*\n/g, '</p><p>');

    processedContent = processedContent.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
    processedContent = processedContent.replace(/(<li value="\d+">.*?<\/li>)/s, '<ol>$1</ol>');
    processedContent = '<p>' + processedContent + '</p>';
    processedContent = processedContent.replace(/<p>\s*<\/p>/g, '');

    return DOMPurify.sanitize(processedContent, {
      ADD_TAGS: ['h1', 'h2', 'h3', 'ul', 'ol', 'li', 'p', 'strong', 'em'],
      ADD_ATTR: ['value', 'class']
    });
  };

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    await sendMessage(userInput);
  };

  const sendMessage = async (message, isRetry = false) => {
    setLoading(true);
    setError(null);

    if (!isRetry) {
      const newUserMessage = { role: 'user', content: message };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      setConversationContext(prevContext => [...prevContext, newUserMessage]);
      setUserInput('');
    }

    try {
      const response = await fetch('/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({
          message,
          context: conversationContext
        })
      });

      if (!response.ok) throw new Error('Nastala chyba při komunikaci se serverem.');

      const reader = response.body.getReader();
      let assistantResponse = '';

      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              assistantResponse += data.content;

              setMessages(prevMessages => {
                const newMessages = [...prevMessages];
                newMessages[newMessages.length - 1].content = formatMessage(assistantResponse);
                return newMessages;
              });

              scrollToBottom();
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      setConversationContext(prevContext => [
        ...prevContext,
        { role: 'assistant', content: assistantResponse }
      ]);

    } catch (error) {
      console.error('Full error:', error);
      setError('Omlouváme se, došlo k chybě při komunikaci s asistentem. Zkuste to prosím znovu za chvíli.');
      setMessages(prevMessages => prevMessages.filter(msg => msg.role !== 'assistant' || msg.content !== ''));
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleRetry = () => {
    const lastUserMessage = messages.findLast(msg => msg.role === 'user');
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content, true);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-widget">
      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}-message`}>
            {msg.role === 'user' ? 'Vy: ' : 'Asistent: '}
            <span dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
          </div>
        ))}
        {loading && (
          <div className="loading-message">Asistent přemýšlí...</div>
        )}
        {error && (
          <div className="error-message">
            {error}
            <button onClick={handleRetry}>Zkusit znovu</button>
          </div>
        )}
      </div>
      <div className="suggested-products">
        {suggestedProducts.map((product, index) => (
          <div key={index} className="product-item">
            {product.name} - {product.price} Kč
            <button onClick={() => setCart([...cart, product])}>Přidat do košíku</button>
          </div>
        ))}
      </div>
      <div className="cart-preview">
        <h3>Košík</h3>
        {cart.map((item, index) => (
          <div key={index}>{item.name} - {item.price} Kč</div>
        ))}
        <p>Celkem: {cart.reduce((total, item) => total + item.price, 0)} Kč</p>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Napište svou zprávu..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>Odeslat</button>
      </form>
    </div>
  );
};

export default ChatWidget;
