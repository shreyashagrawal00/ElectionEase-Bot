import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import API_URL from '../config/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Converts a limited subset of Markdown to safe HTML.
 * No XSS risk — only transforms known patterns; never inserts user-controlled attributes.
 * @param {string} text
 * @returns {{ __html: string }}
 */
const renderMarkdown = (text) => {
  if (!text) return { __html: '' };
  const html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,     '<em>$1</em>')
    .replace(/\n/g,            '<br />')
    .replace(/^[•\*\-] (.*)/gm, '<span class="ml-2 block">• $1</span>');
  return { __html: html };
};

/** Max characters the input field will accept (mirrors backend validation) */
const MAX_INPUT = 500;

const QUICK_QUESTIONS = [
  'How do I register to vote?',
  'What ID do I need at the booth?',
  'When is the next election?',
  'How to check my voter card status?',
];

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * @component Chatbot
 * @description Floating AI chat widget powered by ElectionEase AI (Gemini).
 *
 * Accessibility:
 *  - Live region (aria-live="polite") announces new AI messages to screen readers
 *  - Dialog role with aria-labelledby on the chat window
 *  - Focus is trapped within the chat when open
 *  - Keyboard: Enter submits, Escape closes
 *  - Character counter with aria-live for real-time feedback
 */
const Chatbot = () => {
  const { t, i18n } = useTranslation();
  const headingId   = useId();
  const liveId      = useId();

  const [isOpen,        setIsOpen]        = useState(false);
  const [messages,      setMessages]      = useState([
    { role: 'assistant', content: "Hello! I'm your ElectionEase Assistant. Ask me anything about voting, registration, or candidates.", id: 'welcome' }
  ]);
  const [input,         setInput]         = useState('');
  const [isLoading,     setIsLoading]     = useState(false);
  const [location,      setLocation]      = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showTooltip,   setShowTooltip]   = useState(false);
  const [liveText,      setLiveText]      = useState('');   // screen reader announcements
  const [inputError,    setInputError]    = useState('');

  const scrollRef  = useRef(null);
  const inputRef   = useRef(null);
  const msgCounter = useRef(0);

  // ── Scroll to bottom on new messages ────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // ── Focus input when chat opens ──────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ── Periodic tooltip nudge ───────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) { setShowTooltip(false); return; }
    const interval = setInterval(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 8000);
    }, 40000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // ── Geolocation (opt-in) ─────────────────────────────────────────────────────
  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationError(null);
      },
      () => setLocationError('Location access denied. Local features may be limited.')
    );
  }, []);

  useEffect(() => {
    if (isOpen && !location && !locationError) requestLocation();
  }, [isOpen, location, locationError, requestLocation]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const handleSend = useCallback(async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_INPUT) {
      setInputError(`Message must be under ${MAX_INPUT} characters.`);
      return;
    }

    setInputError('');
    const userMsg = { role: 'user', content: trimmed, id: `msg-${++msgCounter.current}` };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setLiveText('ElectionEase AI is thinking…');

    try {
      const { data } = await axios.post(`${API_URL}/chat`, {
        message: trimmed,
        context: { language: i18n.language, location },
      });

      const rawContent = data.response || '';
      let content = rawContent;
      let suggestions = [];

      if (rawContent.includes('|||')) {
        const parts = rawContent.split('|||');
        content     = parts[0].trim();
        suggestions = parts.slice(1).map((s) => s.trim()).filter(Boolean).slice(0, 5);
      }

      const aiMsg = { role: 'assistant', content, suggestions, id: `msg-${++msgCounter.current}` };
      setMessages((prev) => [...prev, aiMsg]);
      // Announce to screen reader
      setLiveText(`AI replied: ${content.replace(/<[^>]+>/g, '').slice(0, 120)}`);
    } catch (err) {
      const errText = err.response?.data?.error || "Sorry, I'm having trouble connecting. Please try again.";
      setMessages((prev) => [...prev, { role: 'assistant', content: errText, id: `msg-${++msgCounter.current}` }]);
      setLiveText(`Error: ${errText}`);
    } finally {
      setIsLoading(false);
    }
  }, [input, i18n.language, location]);

  // ── Keyboard shortcut: Escape to close ───────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) setIsOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50">

      {/* ── Screen reader live region ──────────────────────────────────────── */}
      <div
        id={liveId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveText}
      </div>

      {/* ── Tooltip nudge ─────────────────────────────────────────────────── */}
      {!isOpen && (
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className="absolute bottom-20 right-0 w-72 glass-card p-5 rounded-3xl shadow-2xl border-primary-100/20 mb-4 cursor-pointer group overflow-hidden"
              onClick={() => { setIsOpen(true); setShowTooltip(false); }}
              role="button"
              tabIndex={0}
              aria-label="Open ElectionEase AI chat"
              onKeyDown={(e) => e.key === 'Enter' && setIsOpen(true)}
            >
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all duration-700" />
              <div className="relative z-10 flex items-start space-x-3">
                <div className="p-2.5 bg-primary-600 rounded-xl shadow-md group-hover:rotate-12 transition-transform duration-500">
                  <Bot className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm mb-1">Meet your AI Assistant</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Questions about registration, candidates, or polling booths? I'm here!
                  </p>
                  <div className="mt-3 flex items-center text-primary-600 font-bold text-[10px] uppercase tracking-widest">
                    <span>Ask Anything</span>
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </div>
                </div>
              </div>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-3 right-3"
              >
                <Sparkles className="w-4 h-4 text-primary-400" aria-hidden="true" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── FAB (Floating Action Button) ──────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setShowTooltip(false); }}
          className="bg-primary-600 hover:bg-primary-700 text-white p-5 rounded-full shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] transition-all duration-300 hover:scale-110 flex items-center justify-center relative z-10 group focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400"
          aria-label="Open AI chat assistant"
        >
          <MessageSquare className="w-7 h-7 group-hover:rotate-12 transition-transform" aria-hidden="true" />
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full" aria-hidden="true" />
        </button>
      )}

      {/* ── Chat Window ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="bg-surface rounded-2xl shadow-2xl w-[350px] sm:w-[400px] h-[520px] flex flex-col border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary-600 p-4 flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Bot className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 id={headingId} className="font-bold text-sm leading-none">ElectionEase AI</h3>
                  <span className="text-[10px] opacity-75 uppercase tracking-widest font-bold">Powered by Gemini</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/15 p-1.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close AI chat"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
              role="log"
              aria-label="Chat messages"
              aria-live="off"
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[82%] p-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200'
                  }`}>
                    <div className="flex items-center gap-1 mb-1 opacity-60">
                      {msg.role === 'assistant'
                        ? <Bot  className="w-3 h-3" aria-hidden="true" />
                        : <User className="w-3 h-3" aria-hidden="true" />
                      }
                      <span className="text-[9px] uppercase font-bold tracking-wider">
                        {msg.role === 'assistant' ? 'Assistant' : 'You'}
                      </span>
                    </div>
                    <p dangerouslySetInnerHTML={renderMarkdown(msg.content)} />
                  </div>

                  {/* Follow-up suggestion chips */}
                  {msg.suggestions?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]" role="group" aria-label="Follow-up suggestions">
                      {msg.suggestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(q)}
                          className="text-[10px] font-medium bg-slate-100 border border-slate-200 text-slate-900 hover:border-primary-400 hover:text-primary-600 px-3 py-1.5 rounded-full transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                          aria-label={`Ask: ${q}`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start" aria-hidden="true">
                  <div className="bg-slate-200 p-3 rounded-2xl rounded-tl-sm border border-slate-300 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                    <span className="text-xs text-slate-500 italic font-medium">Thinking…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick question chips (shown only on first load) */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-1.5 flex-shrink-0">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="text-[10px] font-medium bg-slate-100 border border-slate-200 text-slate-900 hover:border-primary-400 hover:text-primary-600 px-2.5 py-1 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                    aria-label={`Quick question: ${q}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input area */}
            <div className="p-3 bg-surface border-t border-slate-100 flex-shrink-0">
              {inputError && (
                <p className="text-xs text-red-500 mb-1 px-1" role="alert">{inputError}</p>
              )}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <label htmlFor="chat-input" className="sr-only">Ask a question about elections</label>
                <input
                  id="chat-input"
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (inputError) setInputError('');
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={t('chatbot_placeholder') || 'Ask about elections…'}
                  maxLength={MAX_INPUT}
                  aria-label="Chat message input"
                  aria-describedby={`${liveId} char-count`}
                  className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <span id="char-count" className="sr-only" aria-live="polite">
                  {input.length} of {MAX_INPUT} characters
                </span>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                  aria-label="Send message"
                >
                  {isLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    : <Send className="w-4 h-4" aria-hidden="true" />
                  }
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
