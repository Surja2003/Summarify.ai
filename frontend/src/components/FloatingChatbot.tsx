import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types';
import { buildApiUrl } from '../utils/api';

interface FloatingChatbotProps {
  document: string;
  summary: string;
  documents?: Array<{ id: string; fileName: string; text: string }>;
}

export function FloatingChatbot({ document, summary, documents }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. Ask me anything about your document(s)!',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    // Context from documents
    const allText = documents 
      ? documents.map(d => d.text).join('\n\n')
      : document;
    
    // Simple keyword-based responses (you can enhance this with actual AI later)
    if (lowerQuestion.includes('summary') || lowerQuestion.includes('summarize')) {
      return `Here's the summary:\n\n${summary}`;
    }
    
    if (lowerQuestion.includes('how many') && (lowerQuestion.includes('document') || lowerQuestion.includes('file'))) {
      const count = documents ? documents.length : 1;
      return `You have ${count} document${count > 1 ? 's' : ''} loaded.`;
    }
    
    if (lowerQuestion.includes('what') && lowerQuestion.includes('about')) {
      const firstSentence = summary.split('.')[0] + '.';
      return `Based on the document(s), ${firstSentence} Would you like me to provide more details on any specific aspect?`;
    }
    
    if (lowerQuestion.includes('key point') || lowerQuestion.includes('main point')) {
      const sentences = summary.split('.').filter(s => s.trim().length > 0);
      const keyPoints = sentences.slice(0, 3).map((s, i) => `${i + 1}. ${s.trim()}.`).join('\n');
      return `Here are the main points:\n\n${keyPoints}`;
    }
    
    if (lowerQuestion.includes('explain') || lowerQuestion.includes('tell me more')) {
      return `${summary}\n\nThe document contains ${allText.split(' ').length} words and covers the topics mentioned above. Would you like me to focus on any particular section?`;
    }

    if (documents && lowerQuestion.includes('compare')) {
      return `I can help compare the ${documents.length} documents. The documents are: ${documents.map(d => d.fileName).join(', ')}. What specific aspects would you like me to compare?`;
    }
    
    // Default response with context
    const relevantSentences = allText.split('.').filter(s => {
      const keywords = lowerQuestion.split(' ').filter(w => w.length > 3);
      return keywords.some(kw => s.toLowerCase().includes(kw));
    });
    
    if (relevantSentences.length > 0) {
      return `Based on your question, here's what I found:\n\n${relevantSentences.slice(0, 2).join('. ')}.`;
    }
    
    return `I've analyzed your document(s). Could you please rephrase your question or ask about specific topics mentioned in the summary? For example, you can ask me to explain key points, provide more details, or compare documents.`;
  };

  const callChatApi = async (question: string, history: ChatMessage[], allText: string) => {
    const contextText = summary?.trim()
      ? `Summary:\n${summary}\n\nDocument(s):\n${allText}`
      : allText;

    const response = await fetch(buildApiUrl('/api/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        documentText: contextText,
        conversationHistory: history.map(m => ({ role: m.role, content: m.content }))
      })
    });

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.status}`);
    }

    return (await response.json()) as { role: 'assistant'; content: string; timestamp: string };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsTyping(true);

    const allText = documents 
      ? documents.map(d => d.text).join('\n\n')
      : document;

    try {
      const apiResponse = await callChatApi(userMessage.content, nextMessages, allText);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: apiResponse.content,
        timestamp: apiResponse.timestamp || new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      // Fallback to local heuristic so the UI still works in dev/offline.
      const response = generateResponse(userMessage.content);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all z-50 group"
          >
            <MessageSquare className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className={`fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 flex flex-col ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
            } transition-all`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white">AI Assistant</h3>
                  <p className="text-xs text-white/80">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label={isMinimized ? 'Maximize chat' : 'Minimize chat'}
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4 text-white" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white'
                            : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
