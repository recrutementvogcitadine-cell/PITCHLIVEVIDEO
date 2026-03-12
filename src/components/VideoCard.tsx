"use client";


import React, { useState, useEffect } from "react";
import { supabaseClient } from "../lib/supabaseClient";
import { getShareCount, recordShare } from "../lib/shareUtils";
import { useRouter } from "next/navigation";

interface VideoMessage {
  id: string;
  creator: string;
  message: string;
}

interface VideoProps {
  src: string;
  creator: string;
  whatsapp: string;
  messages?: VideoMessage[];
  children?: React.ReactNode;
}

function generatePassword(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pwd = '';
  for (let i = 0; i < length; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

export default function VideoCard({ src, creator, whatsapp, messages = [], children }: VideoProps) {
  const router = useRouter();
  const [showSignup, setShowSignup] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('user_registered');
    }
    return true;
  });
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(generatePassword());
  const [showPwd, setShowPwd] = useState(false);

  const [signupError, setSignupError] = useState<string | null>(null);
  const [error, setError] = React.useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const userId = (typeof window !== 'undefined' && localStorage.getItem('user_pseudo')) || "";
  const [viewerCount, setViewerCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [chatOpen, setChatOpen] = React.useState(true);
  const [shareOpen, setShareOpen] = React.useState(false);
  // Gestion du son vidéo
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = React.useState(true);
  const toggleMute = () => {
    setIsMuted((m) => {
      const newMute = !m;
      if (videoRef.current) videoRef.current.muted = newMute;
      return newMute;
    });
  };

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupError(null);
    // Vérifier unicité pseudo
    const { data: existing } = await supabaseClient.from('users').select('id').eq('username', username);
    if (existing && existing.length > 0) {
      setSignupError('Ce nom d’utilisateur est déjà pris.');
      return;
    }
    // Envoi à Supabase
    const { error } = await supabaseClient.from('users').insert({
      username,
      phone,
      password,
    });
    if (error) {
      setSignupError("Erreur lors de l'inscription : " + error.message);
      return;
    }
    // Connexion automatique et accès au mur
    localStorage.setItem('user_registered', '1');
    localStorage.setItem('user_pseudo', username);
    localStorage.setItem('user_phone', phone);
    setShowSignup(false);
    router.push('/mur');
  }

  useEffect(() => {
    let ignore = false;
    async function fetchShares() {
      const count = await getShareCount(src);
      if (!ignore) setShareCount(count);
    }
    fetchShares();
    // Optionnel : abonnement temps réel
    const channel = supabaseClient
      .channel('public:shares')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shares', filter: `video_id=eq.${src}` }, (payload) => {
        fetchShares();
      })
      .subscribe();
    return () => {
      ignore = true;
      supabaseClient.removeChannel(channel);
    };
  }, [src]);

  useEffect(() => {
    if (!userId) return;
    let ignore = false;
    let interval: any;
    async function upsertViewer() {
      await supabaseClient.from('viewers').upsert({
        video_id: src,
        user_id: userId,
        last_seen: new Date().toISOString(),
      }, { onConflict: 'video_id,user_id' });
    }
    async function fetchViewers() {
      const since = new Date(Date.now() - 60 * 1000).toISOString();
      const { data } = await supabaseClient
        .from('viewers')
        .select('user_id', { count: 'exact' })
        .eq('video_id', src)
        .gt('last_seen', since);
      if (!ignore && data) setViewerCount(data.length);
    }
    upsertViewer();
    fetchViewers();
    interval = setInterval(() => {
      upsertViewer();
      fetchViewers();
    }, 15000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [src, userId]);

  useEffect(() => {
    let ignore = false;
    async function fetchLikes() {
      const { data, error } = await supabaseClient
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('video_id', src);
      if (!ignore && data) {
        setLikeCount(data.length);
        setLiked(!!data.find(l => l.user_id === userId));
      }
    }
    fetchLikes();
    // Optionnel : abonnement temps réel
    const channel = supabaseClient
      .channel('public:likes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes', filter: `video_id=eq.${src}` }, (payload) => {
        fetchLikes();
      })
      .subscribe();
    return () => {
      ignore = true;
      supabaseClient.removeChannel(channel);
    };
  }, [src, userId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.origin + src);
    setShareOpen(false);
    alert("Lien copié !");
  };

  const handleLike = async () => {
    if (!userId) return;
    if (liked) {
      // Supprimer le like
      await supabaseClient.from('likes').delete().eq('video_id', src).eq('user_id', userId);
      setLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
    } else {
      // Ajouter le like
      await supabaseClient.from('likes').insert({ video_id: src, user_id: userId });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  const handleShare = () => {
    setShareOpen((prev) => !prev);
  };

  const handleShareAction = async () => {
    if (userId) {
      await recordShare(src, userId);
    }
    const shareData = {
      title: 'Vidéo Pitch Live',
      text: 'Découvre cette vidéo sur Pitch Live !',
      url: window.location.origin + src,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareOpen(false);
      } catch (e) {}
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`);
      setShareOpen(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col justify-end bg-black">
      // ...fiche d'inscription supprimée, car globale dans page.tsx...
      {/* Profil créateur en overlay haut gauche + spectateurs */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-3 bg-black/60 rounded-full px-3 py-1 shadow-md">
        {/* Avatar généré (initiale) */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 flex items-center justify-center text-white font-bold text-lg uppercase">
          {creator?.charAt(0) || '?'}
        </div>
        {/* Pseudo */}
        <span className="text-white font-semibold text-base">@{creator}</span>
        {/* Spectateurs */}
        <span className="flex items-center gap-1 text-xs text-white/80 bg-black/40 rounded-full px-2 py-1 ml-2">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {viewerCount}
        </span>
      </div>
      {!error ? (
        <>
          <video
            src={src}
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
            autoPlay
            loop
            playsInline
            onError={() => setError(true)}
            muted={isMuted}
            ref={videoRef}
          />
          {/* Bouton son flottant */}
          <button
            onClick={toggleMute}
            className="absolute bottom-8 right-8 z-50 bg-white/80 rounded-full p-3 shadow-lg border border-blue-300 hover:bg-blue-100 transition"
            style={{ backdropFilter: 'blur(4px)' }}
            aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? (
              <svg width="28" height="28" fill="none" stroke="#3182ce" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            ) : (
              <svg width="28" height="28" fill="none" stroke="#3182ce" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19 12c0-2.5-2-4.5-4.5-4.5M19 12c0 2.5-2 4.5-4.5 4.5"/></svg>
            )}
          </button>
        </>
      ) : (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/80 z-10">
          <span className="text-white text-2xl font-bold">Vidéo expirée</span>
        </div>
      )}
      {/* Overlay messages façon TikTok Live */}
      {messages.length > 0 && (
        <div className="absolute left-4 bottom-40 z-30 flex flex-col gap-1 max-w-[60vw] sm:max-w-[220px] pointer-events-none">
          {messages.slice(-5).map((msg) => (
            <div key={msg.id} className="bg-black/50 rounded-2xl px-3 py-1 text-xs text-white shadow-sm flex items-center gap-2">
              <span className="font-bold text-blue-300">{msg.creator}:</span>
              <span>{msg.message}</span>
            </div>
          ))}
        </div>
      )}
      {/* Action rail vertical */}
      <div className="absolute right-4 top-1/2 z-20 flex flex-col gap-4">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex flex-col items-center p-2 rounded-full bg-white/80 shadow transition ${liked ? 'text-red-500 bg-red-100' : 'text-gray-700'}`}
          aria-label="J'aime"
        >
          {/* SVG coeur */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill={liked ? '#e53e3e' : 'none'} stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 3 9.5 3C11.5 3 12 5 12 5C12 5 12.5 3 14.5 3C17.5 3 20 5.5 20 8.5C20 13.5 12 21 12 21Z"/></svg>
          <span className="text-xs font-bold">{likeCount}</span>
        </button>
        {/* Commentaire (toggle chat) */}
        <button
          onClick={() => setChatOpen((v) => !v)}
          className={`flex flex-col items-center p-2 rounded-full bg-white/80 shadow transition ${chatOpen ? 'text-blue-500 bg-blue-100' : 'text-gray-700'}`}
          aria-label="Commentaire"
        >
          {/* SVG chat */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3182ce" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
        {/* Partage */}
        <button
          onClick={handleShare}
          className={`flex flex-col items-center p-2 rounded-full bg-white/80 shadow transition ${shareOpen ? 'text-green-500 bg-green-100' : 'text-gray-700'}`}
          aria-label="Partager"
        >
          {/* SVG share */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38a169" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          <span className="text-xs font-bold">{shareCount}</span>
        </button>
        {/* WhatsApp */}
        <a
          href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center p-2 rounded-full bg-whatsapp text-white shadow transition"
          style={{ boxShadow: '0 2px 16px 0 #25D36655' }}
          aria-label="WhatsApp"
        >
          {/* SVG send */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </a>
      </div>
      {/* Menu de partage */}
      {shareOpen && (
        <div className="absolute right-20 top-1/2 z-30 bg-white rounded shadow p-3 flex flex-col gap-2 border border-blue-200 min-w-[180px]">
          <button
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm"
            onClick={handleShareAction}
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Partager
          </button>
        </div>
      )}
      {/* Overlay gradient et infos */}
      <div className="relative z-10 p-4 flex flex-col gap-4 bg-gradient-to-t from-dark via-black/60 to-transparent">
        <div className="flex items-end justify-between">
          <span className="text-white text-lg font-semibold drop-shadow-md">{creator}</span>
        </div>
        {error && (
          <div className="text-red-500 font-bold">Vidéo non disponible</div>
        )}
      </div>
      {/* Chat overlay : togglable avec animation */}
      <div
        className={`transition-all duration-300 ease-in-out ${chatOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'} w-full`}
        style={{ position: 'relative' }}
      >
        {children}
      </div>
    </div>
  );
}
