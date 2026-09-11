import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types.ts';
import { Send, Bot, User, Sparkles } from 'lucide-react';

export const ChatbotTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Hello! I'm StudyBot, your personal learning and math assistant. Ask me anything about math tables, shortcuts, study plans, or grammar rules!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    'How do I memorize the 7s times table?',
    'What is the rule for order of adjectives?',
    'Explain fact families in math',
    'Give me a tip for staying focused',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      
      if (!response.ok) {
        const error = new Error("Failed to get response");
        (error as any).status = response.status;
        throw error;
      }
      
      const data = await response.json();
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      console.error("Chat error:", error);
      let errorText = "Sorry, the AI is experiencing high demand. Please try again in a moment!";
      
      if (error.message === "Failed to fetch") {
        errorText = "I'm having trouble connecting to the server. Please check your connection.";
      } else if (error.status === 429) {
        errorText = "Daily AI quota exceeded. Please try again tomorrow.";
      }
      
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 flex flex-col h-[75vh] max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">StudyBot Assistant</h3>
            <span className="text-[11px] text-emerald-600 flex items-center font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
              Online & Ready to help
            </span>
          </div>
        </div>

        <span className="text-xs text-slate-400">Powered by StudyVerse</span>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex gap-2 overflow-x-auto text-xs">
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 whitespace-nowrap hover:bg-indigo-50 transition text-[11px] flex items-center space-x-1 shrink-0"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-lg rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none whitespace-pre-line'
                }`}
              >
                <p>{m.text}</p>
                <span
                  className={`text-[9px] block text-right mt-1.5 ${
                    isUser ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs pl-9">
            <span className="animate-pulse">StudyBot is formulating an answer...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-100 bg-white flex gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a study or math question..."
          className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 bg-slate-50/50"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl transition flex items-center justify-center text-xs font-semibold shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
