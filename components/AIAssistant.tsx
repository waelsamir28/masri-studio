import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithAI } from '../services/geminiService';

interface AIAssistantProps {
  lang: 'en' | 'ar';
  onClose: () => void;
  onUseText?: (text: string) => void;
}

const QUICK_PROMPTS = [
  { en: 'Write a mobile ad', ar: 'اكتب إعلان موبايل', icon: 'fa-mobile' },
  { en: 'Improve this script', ar: 'حسّن لي نص', icon: 'fa-wand-magic-sparkles' },
  { en: 'Suggest voice tone', ar: 'اقترح نبرة صوت', icon: 'fa-microphone' },
  { en: 'Write social media post', ar: 'اكتب بوست سوشيال', icon: 'fa-share-nodes' },
];

export const AIAssistant: React.FC<AIAssistantProps> = ({ lang, onClose, onUseText }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Load saved chat
    const saved = localStorage.getItem('masri-ai-chat');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.messages || []);
        setSuggestions(parsed.suggestions || []);
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('masri-ai-chat', JSON.stringify({ messages: messages.slice(-50), suggestions }));
  }, [messages, suggestions]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setSuggestions([]);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithAI(chatHistory, lang);
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        suggestions: response.suggestions
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (response.suggestions.length > 0) setSuggestions(response.suggestions);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: lang === 'ar' ? '⚠️ حدث خطأ. حاول مرة أخرى.' : '⚠️ Error occurred. Try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseText = (text: string) => {
    if (onUseText) {
      // Extract script-like content from the message
      onUseText(text);
      onClose();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSuggestions([]);
    localStorage.removeItem('masri-ai-chat');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative w-full max-w-lg h-[80vh] max-h-[600px] flex flex-col rounded-2xl overflow-hidden win11-card animate-scale-in" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg animate-float">
              <i className="fas fa-robot text-white"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-txt-primary">{lang === 'ar' ? 'المساعد الذكي' : 'AI Assistant'}</h3>
              <p className="text-[9px] text-txt-muted flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                {lang === 'ar' ? 'متصل ونشط' : 'Online & Active'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={clearChat} className="w-8 h-8 rounded-lg hover:bg-surface2 flex items-center justify-center text-txt-muted hover:text-red-400 transition-all" title={lang === 'ar' ? 'مسح المحادثة' : 'Clear chat'}>
              <i className="fas fa-trash text-xs"></i>
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface2 flex items-center justify-center text-txt-muted hover:text-txt-primary transition-all">
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                <i className="fas fa-robot text-3xl text-purple-400"></i>
              </div>
              <h4 className="text-sm font-bold text-txt-primary mb-1">{lang === 'ar' ? 'مرحباً! أنا مساعدك' : 'Hello! I\'m your assistant'}</h4>
              <p className="text-[10px] text-txt-muted mb-4">{lang === 'ar' ? 'اسألني أي حاجة عن النصوص والإعلانات' : 'Ask me anything about scripts & ads'}</p>
              
              <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                {QUICK_PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => sendMessage(lang === 'ar' ? p.ar : p.en)} className="p-2.5 rounded-xl win11-button text-[10px] font-medium flex items-center gap-1.5 hover:border-accent/30 transition-all">
                    <i className={`fas ${p.icon} text-accent text-[10px]`}></i>
                    {lang === 'ar' ? p.ar : p.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white rounded-br-sm' 
                  : 'bg-surface2 text-txt-primary border border-border rounded-bl-sm'
              }`}>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'assistant' && onUseText && msg.content.length > 20 && (
                  <button onClick={() => handleUseText(msg.content)} className="mt-2 text-[9px] text-accent hover:text-accent/80 flex items-center gap-1">
                    <i className="fas fa-arrow-right-to-bracket"></i>
                    {lang === 'ar' ? 'استخدام النص' : 'Use this text'}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-surface2 border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{animationDelay: '0ms'}}></span>
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{animationDelay: '150ms'}}></span>
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{animationDelay: '300ms'}}></span>
                </div>
                <span className="text-[10px] text-txt-muted">{lang === 'ar' ? 'بفكر...' : 'Thinking...'}</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] text-accent font-medium shrink-0 hover:bg-accent/20 transition-all">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-border bg-surface2/50">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }}}
              placeholder={lang === 'ar' ? 'اسأل المساعد الذكي...' : 'Ask the AI assistant...'}
              className="flex-1 py-2.5 px-4 rounded-xl bg-surface border border-border text-sm text-txt-primary placeholder-txt-muted focus:border-accent outline-none"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${input.trim() && !isLoading ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg hover:scale-105' : 'bg-surface2 text-txt-muted cursor-not-allowed'}`}>
              <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-sm`}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
