"use client";
import React from "react";

import { supabase } from "../lib/supabaseClient";

interface ChatMessage {
  id: string;
  video_id: string;
  creator: string;
  message: string;
  created_at: string;
}

interface ChatBoxProps {
  videoId: string;
  creator: string;
}

export default function ChatBox({ videoId, creator }: ChatBoxProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [author, setAuthor] = React.useState("");
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = React.useState<'connecting'|'open'|'closed'|'error'>('connecting');
  const [restStatus, setRestStatus] = React.useState<'ok'|'error'|'pending'>('pending');
  const [sendError, setSendError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ignore = false;
    async function fetchMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: true });
      console.log('[ChatBox] fetchMessages', { videoId, data, error });
      if (error) {
        setFetchError(error.message);
        setRestStatus('error');
      } else {
        setFetchError(null);
        setRestStatus('ok');
      }
      if (!ignore && data) setMessages(data as ChatMessage[]);
    }
    fetchMessages();

    // Abonnement temps réel
    setRealtimeStatus('connecting');
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `video_id=eq.${videoId}` }, (payload) => {
        console.log('[ChatBox] Realtime payload', payload);
        setRealtimeStatus('open');
        if (payload.eventType === 'INSERT') {
          setMessages((msgs) => [...msgs, payload.new as ChatMessage]);
        }
      })
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(subscription);
    };
  }, [videoId]);

  // Envoi d'un message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSend called', { input, author, videoId });
        setSendError(null);
        if (!input.trim() || !author.trim()) {
          setSendError("Pseudo et message obligatoires");
          return;
        }
    const { error, data } = await supabase.from('messages').insert({
      video_id: videoId,
      creator: author,
      message: input,
    });
    if (error) {
      console.error('Supabase insert error:', error);
          setSendError('Erreur lors de l\'envoi du message : ' + error.message);
          return;
    }
    console.log('Supabase insert success', data);
    setInput("");
        setSendError(null);
  };

  return (
    <div className="flex flex-col gap-1 w-full max-w-xs pointer-events-auto">
      {/* Messages overlay façon Instagram Live */}
      <div className="flex flex-col gap-1 max-h-32 overflow-y-auto px-1">
        {messages.length === 0 && (
          <div className="text-white/70 text-xs italic">Aucun message</div>
        )}
        {messages.slice(-6).map((msg) => (
          <div key={msg.id} className="flex items-center">
            <span className="bg-black/60 text-white rounded-2xl px-3 py-1 mr-1 text-xs font-semibold shadow-sm max-w-[80%] truncate">
              <span className="text-blue-300 font-bold mr-1">{msg.creator}:</span>
              {msg.message}
            </span>
          </div>
        ))}
      </div>
      {/* Champ de saisie moderne, flottant */}
      <form onSubmit={handleSend} className="flex gap-1 items-center bg-black/40 rounded-2xl px-2 py-1 mt-1 shadow-none border-none">
        <input
          id="chat-pseudo"
          type="text"
          placeholder="Pseudo"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          className="rounded-2xl px-2 py-1 text-xs bg-white/80 text-black placeholder:text-gray-400 border-none outline-none w-16 flex-shrink-0"
          style={{minWidth:'0'}}
        />
        <input
          type="text"
          placeholder="Message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="rounded-2xl px-2 py-1 text-xs bg-white/80 text-black placeholder:text-gray-400 border-none outline-none w-full"
          style={{minWidth:'0'}}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              document.getElementById('chatbox-send-btn')?.click();
            }
          }}
        />
        <button id="chatbox-send-btn" type="submit" className="bg-gradient-to-br from-blue-500 to-blue-700 text-white px-3 py-1 rounded-2xl text-xs font-bold w-auto shadow-sm hover:from-blue-600 hover:to-blue-800 transition-all" style={{maxWidth: '60px'}}>Envoyer</button>
      </form>
      {sendError && <div className="text-red-500 text-xs font-bold mt-1">{sendError}</div>}
      {fetchError && <div className="text-red-500 text-xs font-bold mt-1">Erreur : {fetchError}</div>}
    </div>
  );
}
