import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';
import api from '../api/axios';
import { type Message } from '../types';
import ReactMarkdown from 'react-markdown';
import { useAuthStore } from '../store/authStore';


export const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const user = useAuthStore((state) => state.user);
  const storageKey = user?.id ? `ai_chat_history_${user.id}` : null;

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (storageKey) {
      const saved = sessionStorage.getItem(storageKey);
      setMessages(saved ? JSON.parse(saved) : []);
    } else {
      setMessages([]);
    }
  }, [storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !storageKey) return;

    const userQuery = query.trim();
    const updatedMessages: Message[] = [...messages, { role: 'user', content: userQuery }];
    
    setMessages(updatedMessages);
    setQuery('');
    setIsLoading(true);
    setError('');

    sessionStorage.setItem(storageKey, JSON.stringify(updatedMessages));

    try {
      const res = await api.post('/ai/ask', { messages: updatedMessages });
      
      setMessages(prev => {
        const newMessage: Message = { role: 'assistant', content: res.data.answer };
        const newMessages = [...prev, newMessage];
        
        sessionStorage.setItem(storageKey, JSON.stringify(newMessages));
        return newMessages;
      });
    } catch (err: any) {
      console.error('AI Error:', err);
      setError(err.response?.data?.message || 'Oops, something went wrong. Brain temporarily unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed sm:bottom-6 sm:right-6 z-50">
      
      {isOpen && (
        <div className="fixed inset-0 sm:absolute sm:inset-auto sm:bottom-16 sm:right-0 sm:mb-4 w-full h-[100dvh] sm:h-[500px] sm:w-96 bg-white dark:bg-brand-darkCard sm:rounded-2xl shadow-2xl sm:border border-gray-100 dark:border-brand-darkBorder overflow-hidden flex flex-col z-50 transition-all">
          
          <div className="bg-brand-blue p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="w-6 h-6 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 bg-gray-50 dark:bg-brand-darkBg overflow-y-auto flex flex-col gap-3 text-sm">
            {messages.length === 0 && !isLoading && !error && (
              <p className="text-gray-500 dark:text-brand-darkText text-center mt-8">
                Ask me about your events, schedule, or tags!
              </p>
            )}

            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'self-end bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue rounded-tr-sm' 
                    : 'self-start bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder text-gray-800 dark:text-gray-200 rounded-tl-sm'
                }`}
              >
                <ReactMarkdown>
                    {msg.content}
                </ReactMarkdown>
              </div>
            ))}

            {isLoading && (
              <div className="self-start bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%] flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
                <span>Thinking...</span>
              </div>
            )}

            {error && (
              <div className="self-start bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 py-2 rounded-2xl rounded-tl-sm max-w-[85%]">
                {error}
              </div>
            )}
            
            <div ref={messagesEndRef} className="h-1 shrink-0" />
          </div>

          <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-brand-darkCard border-t border-gray-100 dark:border-brand-darkBorder flex gap-2 shrink-0 pb-safe">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What events am I attending?"
              disabled={isLoading}
              className="flex-1 bg-gray-50 dark:bg-brand-darkBg text-gray-900 dark:text-white border border-gray-200 dark:border-brand-darkBorder rounded-xl px-4 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl px-4 sm:px-3 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'hidden sm:flex bg-gray-800 dark:bg-gray-700' : 'flex bg-brand-blue hover:bg-brand-blue/90'} text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-blue/30 fixed bottom-6 right-6 sm:static`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};