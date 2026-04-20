import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, User, Bot } from 'lucide-react';
import axios from 'axios';

export default function ChatView() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your Vernacular AI Money Coach. You can ask me how to save, where you spend your money, or about FDs! Speak in English or Tamil.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize Speech Recognition wrapper
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      // You can set to 'ta-IN' for Tamil, but 'en-US' usually handles basic multi-lingual if they switch. 
      // For demo we'll let it auto detect or set to English with Tamil keywords.
      recog.lang = 'en-IN'; 

      recog.onstart = () => {
        setIsListening(true);
      };

      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSend(transcript);
      };

      recog.onerror = (event) => {
        console.error('Speech Recognition Error', event.error);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      try {
        recognition?.start();
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleSend = async (textToSend) => {
    const txt = textToSend || inputText;
    if (!txt.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: txt }]);
    setInputText('');

    try {
      // Call backend
      const res = await axios.post('http://localhost:8000/api/chat', { message: txt });
      
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error connecting to the coaching server.' }]);
    }
  };

  return (
    <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="view-header">
        <h1>Voice Assistant</h1>
        <p>Speak naturally. I understand English and Tamil logic.</p>
      </div>

      <div className="messages-area" style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '16px'
          }}>
            <div style={{
              maxWidth: '70%',
              display: 'flex',
              gap: '12px',
              padding: '16px',
              borderRadius: '16px',
              background: msg.sender === 'user' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
              border: msg.sender === 'bot' ? '1px solid var(--border)' : 'none',
              borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
              borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
            }}>
              <div style={{ marginTop: '2px' }}>
                {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} color="#60a5fa" />}
              </div>
              <div style={{ lineHeight: '1.5', fontSize: '1.05rem' }}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area" style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <button 
          onClick={toggleListen}
          className={`btn-icon ${isListening ? 'mic-active' : ''}`}
          style={{ 
            background: isListening ? 'var(--danger)' : 'rgba(255,255,255,0.1)', 
            border: 'none', 
            padding: '12px', 
            borderRadius: '50%', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            transition: 'all 0.3s'
          }}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me about your expenses..."
          className="input-field"
          style={{ flex: 1, background: 'transparent', border: 'none', boxShadow: 'none' }}
        />

        <button 
          onClick={() => handleSend()}
          className="btn-primary"
          style={{ padding: '12px', borderRadius: '12px' }}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
