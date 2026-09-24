import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  Minimize2,
  Maximize2,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { ChatMessage } from './ChatMessage';

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  initialQuestion?: string;
  onClearInitialQuestion?: () => void;
}

const SAMPLE_PROMPTS = [
  'Which ad is the best and why?',
  'Why isn\'t the ₹1 trial ad ranked #1?',
  'Compare the hook strength of ad variants',
  'Which ads have been running the longest?',
];

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  isOpen,
  onToggle,
  initialQuestion,
  onClearInitialQuestion,
}) => {
  const { messages, loading, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Handle external prompt injection (e.g. from Ad Card "Ask Arya" button)
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      sendMessage(initialQuestion);
      if (onClearInitialQuestion) onClearInitialQuestion();
    }
  }, [initialQuestion, sendMessage, onClearInitialQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput('');
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <>
      {/* Floating Toggle Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 bg-gradient-to-tr from-brand to-brand-purple text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-xl shadow-brand/35 hover:scale-105 active:scale-95 transition-all duration-300"
          aria-label="Ask Arya AI"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-sm">
              <Sparkles className="w-4 h-4 fill-current text-white animate-pulse-subtle" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-brand rounded-full" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-bold leading-tight">Ask Arya AI</span>
            <span className="block text-[10px] text-brand-100 font-medium leading-tight">
              Ad Intelligence Assistant
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-fadeIn">
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-brand to-brand-purple text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-brand rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight leading-tight">Arya</h3>
                  <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.2 rounded-full">
                    RAG Assistant
                  </span>
                </div>
                <p className="text-[11px] text-brand-100 leading-tight">
                  MySivi Performance Creative Strategist
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onToggle}
                className="w-7 h-7 rounded-xl hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Header Notice */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand" />
              Grounded in Supabase vector embeddings
            </span>
            <span className="font-mono text-[10px] text-slate-400">Gemini 2.5 Flash</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
            {messages.length === 0 ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand flex items-center justify-center mx-auto shadow-inner">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Hi! I'm Arya, your Ad Intelligence assistant.
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                    Ask me anything about MySivi's Facebook ad creatives, hook strength, proxy scores, or why specific ads won.
                  </p>
                </div>

                {/* Pre-made quick questions */}
                <div className="pt-2 text-left space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                    Suggested Questions:
                  </span>
                  <div className="space-y-1.5">
                    {SAMPLE_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handlePromptClick(prompt)}
                        className="w-full text-left text-xs p-2.5 rounded-xl bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-slate-700 hover:text-brand font-medium transition-all shadow-2xs"
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs pl-2">
                <div className="w-6 h-6 rounded-full bg-brand-50 text-brand flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>Arya is searching ad embeddings & reasoning...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Arya about any ad or score..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center hover:bg-brand-600 disabled:opacity-40 disabled:hover:bg-brand transition-all shadow-md shadow-brand/20 flex-shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
