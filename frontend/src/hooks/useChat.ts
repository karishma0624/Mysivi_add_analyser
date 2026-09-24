import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { ChatMessage } from '../lib/types';

export function useChat() {
  const [sessionId] = useState<string>(() => {
    const existing = sessionStorage.getItem('mysivi_chat_session_id');
    if (existing) return existing;
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('mysivi_chat_session_id', newId);
    return newId;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing session messages if Supabase is configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function loadHistory() {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          setMessages(data as ChatMessage[]);
        }
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }

    loadHistory();
  }, [sessionId]);

  const sendMessage = useCallback(
    async (question: string) => {
      if (!question.trim()) return;

      const userMsgId = `usr_${Date.now()}`;
      const userMessage: ChatMessage = {
        id: userMsgId,
        session_id: sessionId,
        role: 'user',
        content: question.trim(),
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setLoading(false);
        const unconfigMsg: ChatMessage = {
          id: `ast_${Date.now()}`,
          session_id: sessionId,
          role: 'assistant',
          content:
            "Supabase is not configured yet. Please provide your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `frontend/.env.local` and deploy the Edge Function to chat with Arya about real MySivi ads.",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, unconfigMsg]);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke('chat', {
          body: { question: question.trim(), sessionId },
        });

        if (fnError) {
          throw new Error(fnError.message || 'Edge Function execution failed');
        }

        const answerText = data?.answer || "I could not analyze that request. Please try again.";
        const assistantMessage: ChatMessage = {
          id: `ast_${Date.now()}`,
          session_id: sessionId,
          role: 'assistant',
          content: answerText,
          created_at: new Date().toISOString(),
          matches: data?.matches || [],
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        console.error('Chat error:', err);
        setError(err.message || 'Failed to get answer from Arya');
        const errorMsg: ChatMessage = {
          id: `ast_${Date.now()}`,
          session_id: sessionId,
          role: 'assistant',
          content: `Sorry, I encountered an issue: ${err.message || 'Failed to connect to Edge Function'}. Ensure the Supabase Edge Function is deployed and has GEMINI_API_KEY configured.`,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setLoading(false);
      }
    },
    [sessionId]
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
    sessionId,
  };
}
