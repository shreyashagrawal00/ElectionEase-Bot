import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import API_URL from '../config/api';

const renderMarkdown = (text) => {
  if (!text) return { __html: '' };
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />')
    .replace(/^\* (.*)/gm, '&bull; $1'); // Basic bullet point handling
  return { __html: html };
};

const Chatbot = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your ElectionEase Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let intervalId;
    let timeoutId;

    if (!isOpen) {
      // Set interval for every 40 seconds
      intervalId = setInterval(() => {
        setShowTooltip(true);
        
        // Hide it after 8 seconds
        timeoutId = setTimeout(() => {
          setShowTooltip(false);
        }, 8000);
      }, 40000);
    } else {
      setShowTooltip(false);
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setLocationError(null);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Location access denied. Some local features might be limited.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    if (isOpen && !location && !locationError) {
      requestLocation();
    }
  }, [isOpen]);

  const quickQuestions = [
    "How do I register to vote?",
    "What ID do I need?",
    "When is the next election?",
    "How to check my voter card?"
  ];

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, { 
        message: text,
        context: { 
          language: i18n.language,
          location: location 
        }
      });
      
      const rawContent = res.data.response;
      let content = rawContent;
      let suggestions = [];

      if (rawContent.includes('|||')) {
        const parts = rawContent.split('|||');
        content = parts[0].trim();
        suggestions = parts.slice(1).map(s => s.trim()).filter(s => s.length > 0).slice(0, 3);
      }
      
      const assistantMessage = { role: 'assistant', content: content, suggestions: suggestions };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || "Sorry, I'm having trouble connecting to the AI service right now. Please try again later.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Stunning Hero Invite Popup */}
      {!isOpen && (
        <AnimatePresence>
          {showTooltip && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className="absolute bottom-20 right-0 w-[280px] sm:w-[320px] glass-card p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-primary-100 mb-4 cursor-pointer group overflow-hidden"
              onClick={() => { setIsOpen(true); setShowTooltip(false); }}
            >
              {/* Background Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all duration-700" />
              
              <div className="relative z-10 flex items-start space-x-4">
                <div className="p-3 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200 group-hover:rotate-12 transition-transform duration-500">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm mb-1">Meet your AI Assistant</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Have questions about registration, candidates, or polling booths? I'm here to help!
                  </p>
                  <div className="mt-4 flex items-center text-primary-600 font-bold text-[10px] uppercase tracking-widest">
                    <span>Ask Anything</span>
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
              
              {/* Animated Sparkles */}
              <motion.div 
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-4 right-4"
              >
                <Sparkles className="w-4 h-4 text-primary-400" />
              </motion.div>
            </motion.div>
          )}
          <button 
            onClick={() => { setIsOpen(true); setShowTooltip(false); }}
            className="bg-primary-600 hover:bg-primary-700 text-white p-5 rounded-full shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] transition-all duration-300 transform hover:scale-110 flex items-center justify-center relative z-10 group"
          >
            <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            {/* Notification Dot */}
            <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-bounce"></div>
          </button>
        </AnimatePresence>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="bg-surface rounded-2xl shadow-2xl w-[350px] sm:w-[400px] h-[500px] flex flex-col border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-primary-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">ElectionEase Assistant</h3>
                <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">AI Powered</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} mb-4`}>
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary-600 text-white rounded-tr-none' 
                      : 'bg-surface text-slate-800 rounded-tl-none border border-slate-200'
                  }`}>
                    <div className="flex items-center mb-1">
                      {msg.role === 'assistant' ? <Bot className="w-3 h-3 mr-1 opacity-50" /> : <User className="w-3 h-3 mr-1 opacity-50" />}
                      <span className="text-[10px] uppercase font-bold opacity-50">
                        {msg.role === 'assistant' ? 'Assistant' : 'You'}
                      </span>
                    </div>
                    <p 
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={renderMarkdown(msg.content)}
                    />
                  </div>
                </div>
                
                {msg.suggestions && msg.suggestions.length > 0 && idx === messages.length - 1 && !isLoading && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-2 max-w-[90%]">
                    {msg.suggestions.map((q, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleSend(q)}
                        className="text-[10px] font-medium bg-white border border-slate-200 text-slate-600 hover:border-primary-500 hover:text-primary-600 px-3 py-1.5 rounded-full transition-all text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface p-3 rounded-2xl rounded-tl-none border border-slate-200 flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                  <span className="text-xs text-slate-400 italic">Writing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-2 bg-slate-100/50 flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(q)}
                  className="text-[10px] font-medium bg-surface border border-slate-200 text-slate-600 hover:border-primary-500 hover:text-primary-600 px-2 py-1 rounded-full transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-surface border-t border-slate-100">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center space-x-2"
            >
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something about elections..."
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <button 
                disabled={!input.trim() || isLoading}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white p-2 rounded-xl transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
