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
      .on('error', () => {
        setRealtimeStatus('error');
      })
      .on('close', () => {
        setRealtimeStatus('closed');
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
    <div className="bg-white/80 rounded-lg p-3 max-h-60 overflow-y-auto shadow mt-2">
      <div className="flex gap-2 mb-2 text-xs">
        <span className={restStatus === 'ok' ? 'text-green-600' : restStatus === 'pending' ? 'text-gray-400' : 'text-red-600'}>
          REST: {restStatus}
        </span>
        <span className={realtimeStatus === 'open' ? 'text-green-600' : realtimeStatus === 'connecting' ? 'text-gray-400' : 'text-red-600'}>
          Realtime: {realtimeStatus}
        </span>
      </div>
      {fetchError && (
        <div className="text-red-600 font-bold mb-2">Erreur chargement messages : {fetchError}</div>
      )}
      <div className="flex flex-col gap-1 mb-2">
        {messages.length === 0 && (
          <div className="text-gray-400 text-xs">Aucun message pour cette vidéo.</div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span className="font-semibold text-gray-800">{msg.creator}:</span> <span className="text-gray-700">{msg.message}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex flex-col sm:flex-row gap-2 items-end w-full">
        {sendError && <div className="text-red-600 text-xs font-bold mb-2">{sendError}</div>}
        <div className="flex flex-col w-full sm:w-[90px] flex-shrink-0" style={{maxWidth:'100%', minWidth:0}}>
          <label htmlFor="chat-pseudo" className="text-xs font-bold text-blue-700 mb-1">Pseudo</label>
          <input
            id="chat-pseudo"
            type="text"
            placeholder="Pseudo"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            className="rounded px-2 py-1 text-sm border-2 border-blue-400 focus:border-blue-700 outline-none bg-white w-full"
          />
        </div>
        <div className="flex-1 flex flex-col w-full" style={{minWidth:0}}>
          <input
            type="text"
            placeholder="Votre message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="rounded px-2 py-1 text-sm border border-gray-300 w-full"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                document.getElementById('chatbox-send-btn')?.click();
              }
            }}
          />
        </div>
        <button id="chatbox-send-btn" type="submit" className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-bold ml-0 sm:ml-1 w-full sm:w-auto" style={{maxWidth: '120px'}}>Envoyer</button>
      </form>
    </div>
  );
}
