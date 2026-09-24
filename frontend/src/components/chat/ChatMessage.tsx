import React from 'react';
import { Sparkles, User, FileText } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../lib/types';

interface ChatMessageProps {
  message: ChatMessageType;
  onAdClick?: (libraryId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onAdClick }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-brand-purple flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
          isUser
            ? 'bg-brand text-white shadow-md shadow-brand/20 font-medium'
            : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>

        {/* Citations / Grounded matches */}
        {message.matches && message.matches.length > 0 && !isUser && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Grounded Sources from Supabase:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.matches.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => onAdClick && onAdClick(m.ad_id)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 hover:bg-brand-50 border border-slate-200 text-[10px] font-medium text-slate-600 hover:text-brand transition-colors"
                >
                  <FileText className="w-3 h-3 text-brand" />
                  <span>Matched Source #{idx + 1} ({Math.round(m.similarity * 100)}% match)</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          className={`text-[9px] mt-1.5 text-right ${
            isUser ? 'text-brand-100' : 'text-slate-400'
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0 mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
