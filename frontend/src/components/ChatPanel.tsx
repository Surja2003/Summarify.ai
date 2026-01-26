import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { ChatMessage } from '../types';
import { buildApiUrl } from '../utils/api';

interface ChatPanelProps {
  document: string;
  summary: string;
}

export function ChatPanel({ document, summary }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I can help answer questions about your document. What would you like to know?',
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

    // Simple keyword-based responses
    if (lowerQuestion.includes('summary') || lowerQuestion.includes('summarize')) {
      return `Here's a summary of the document:\n\n${summary}`;
    }

    if (lowerQuestion.includes('main point') || lowerQuestion.includes('key point')) {
      const firstSentence = summary.split('.')[0] + '.';
      return `The main point of the document is: ${firstSentence}`;
    }

    if (lowerQuestion.includes('length') || lowerQuestion.includes('long')) {
      const wordCount = document.split(/\s+/).length;
      return `The document contains approximately ${wordCount} words.`;
    }

    if (lowerQuestion.includes('about') || lowerQuestion.includes('topic')) {
      const firstLine = summary.split('.')[0] + '.';
      return `The document is about: ${firstLine}`;
    }

    // Extract relevant sentences from document
    const sentences = document.match(/[^.!?]+[.!?]+/g) || [];
    const keywords = question
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 3);

    // Find sentences containing keywords
    const relevantSentences = sentences.filter(sentence =>
      keywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );

    if (relevantSentences.length > 0) {
      return `Based on the document: ${relevantSentences.slice(0, 2).join(' ')}`;
    }

    // Default response
    return `I'm analyzing your question about the document. Could you please be more specific? You can ask me about the summary, main points, topics, or specific content from the document.`;
  };

  const callChatApi = async (question: string, history: ChatMessage[]) => {
    const contextText = summary?.trim()
      ? `Summary:\n${summary}\n\nDocument:\n${document}`
      : document;

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

    try {
      const apiResponse = await callChatApi(userMessage.content, nextMessages);
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
    <div className="space-y-4 h-[600px] flex flex-col">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-gray-900 dark:text-white mb-2">
          Interactive Chat
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Ask questions about your document
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                  : 'bg-gradient-to-br from-green-500 to-teal-500'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>

            <div
              className={`flex-1 max-w-[80%] ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-3 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-3">
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

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about the document..."
          className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 dark:bg-gray-800 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Questions */}
      <div className="flex flex-wrap gap-2">
        {[
          'What is the main point?',
          'Summarize the document',
          'What topics are covered?',
          'How long is the document?'
        ].map((question, index) => (
          <button
            key={index}
            onClick={() => setInput(question)}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
