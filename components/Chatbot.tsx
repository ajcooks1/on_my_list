import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/geminiService';
import { PaperAirplaneIcon } from './common/icons';
import { useLocalization } from '../context/localization';
import Card from './common/Card';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const Chatbot: React.FC = () => {
  const { t } = useLocalization();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: t('initialGreeting') }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  // Update initial message if language changes
  useEffect(() => {
    setMessages(msgs => {
      if (msgs.length === 1 && msgs[0].role === 'model') {
        return [{ role: 'model', text: t('initialGreeting') }];
      }
      return msgs;
    });
  }, [t]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    setMessages(prev => [...prev, { role: 'user', text: trimmedInput }]);
    setInputValue('');
    setIsLoading(true);

    const response = await sendChatMessage(trimmedInput);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  return (
    <Card className="flex flex-col h-[500px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
          <h3 className="text-lg font-bold text-primary-600 dark:text-primary-400">{t('foodAssistant')}</h3>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">S</div>}
              <div
                className={`max-w-[80%] p-3 rounded-xl ${
                  msg.role === 'user'
                    ? 'bg-primary-500 text-white rounded-br-none'
                    : 'bg-gray-200/90 dark:bg-gray-700/90 text-gray-900 dark:text-gray-100 rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">S</div>
                <div className="p-3 rounded-xl bg-gray-200/90 dark:bg-gray-700/90 text-gray-900 dark:text-gray-100 rounded-bl-none">
                  <div className="flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                  </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center gap-2 flex-shrink-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('askMeAnything')}
            className="flex-grow px-4 py-2 bg-white/50 dark:bg-gray-900/50 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="p-2 text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed"
            aria-label={t('sendMessage')}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
    </Card>
  );
};

export default Chatbot;