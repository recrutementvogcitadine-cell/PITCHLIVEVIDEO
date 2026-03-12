"use client";
import React from "react";

import VideoCard from "../components/VideoCard";
import { useState, useEffect } from "react";
import { subscribeToPush } from "../lib/notifyUtils";
import ChatBox from "../components/ChatBox";
import videos from "../../data/videos.json";
import { supabase } from "../lib/supabaseClient";


export default function Home() {
  // Fiche d'inscription globale
  const [showSignup, setShowSignup] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('user_registered');
    }
    return true;
  });
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(() => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pwd = '';
    for (let i = 0; i < 8; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    return pwd;
  });
  const [showPwd, setShowPwd] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupError(null);
    // Vérifier unicité pseudo
    const { data: existing } = await supabase.from('users').select('id').eq('username', username);
    if (existing && existing.length > 0) {
      setSignupError('Ce nom d’utilisateur est déjà pris.');
      return;
    }
    // Envoi à Supabase
    const { error } = await supabase.from('users').insert({
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
    // Demander la permission de notification push
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }
      try {
        await subscribeToPush(username);
      } catch {}
    }
    window.location.reload();
    // À l'accès au mur, demander la permission si pas déjà fait
    useEffect(() => {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
      // Si déjà inscrit, enregistrer l'abonnement push
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_pseudo') : null;
      if (userId) {
        subscribeToPush(userId).catch(() => {});
      }
    }, []);
  }
  // Filtrer les vidéos de moins de 24h
  const now = Date.now();
  const validVideos = Array.isArray(videos)
    ? videos.filter(v => {
        const ts = typeof v.timestamp === 'string' ? Date.parse(v.timestamp) : v.timestamp;
        return ts && now - ts < 24 * 60 * 60 * 1000;
      })
    : [];
  const [messages, setMessages] = React.useState<any[]>([]);
  // Index de la vidéo actuellement affichée
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentVideo = validVideos[currentIdx] || null;

  React.useEffect(() => {
    let ignore = false;
    async function fetchMessages() {
      if (!currentVideo) return;
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('video_id', currentVideo.src)
        .order('created_at', { ascending: true });
      if (!ignore && data) setMessages(data);
    }
    fetchMessages();
    // Optionnel: abonnement temps réel
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `video_id=eq.${currentVideo?.src}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages((msgs) => [...msgs, payload.new]);
        }
      })
      .subscribe();
    return () => {
      ignore = true;
      supabase.removeChannel(subscription);
    };
  }, [currentVideo?.src]);

  // Si la vidéo courante expire, passer automatiquement à la suivante
  useEffect(() => {
    if (!validVideos.length) return;
    // Si l'index courant est hors limites, le ramener à 0
    if (currentIdx >= validVideos.length) {
      setCurrentIdx(0);
      return;
    }
    // Vérifier si la vidéo courante est toujours active
    const ts = typeof currentVideo?.timestamp === 'string' ? Date.parse(currentVideo?.timestamp) : currentVideo?.timestamp;
    if (ts && now - ts >= 24 * 60 * 60 * 1000) {
      // Passer à la prochaine vidéo active
      const nextIdx = validVideos.findIndex((v, i) => i > currentIdx && now - (typeof v.timestamp === 'string' ? Date.parse(v.timestamp) : v.timestamp) < 24 * 60 * 60 * 1000);
      if (nextIdx !== -1) {
        setCurrentIdx(nextIdx);
      } else {
        // Sinon, revenir à la première vidéo active
        setCurrentIdx(0);
      }
    }
  }, [validVideos, currentIdx, now, currentVideo]);

  if (!validVideos.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-2xl">
        Aucune vidéo disponible.
      </div>
    );
  }
  return (
    <div className="w-full min-h-screen flex flex-col bg-black">
      <div className="w-full flex justify-end p-4">
        <a href="/camera" className="bg-blue-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-blue-700 transition">📷 Accéder à la caméra</a>
      </div>
      <div className="flex-1 flex items-center justify-center">
      {/* Fiche d'inscription globale, transparente et flottante */}
      {showSignup && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40">
          <form onSubmit={handleSignup} className="bg-white/60 rounded-2xl shadow-xl p-6 flex flex-col gap-4 w-[90vw] max-w-xs backdrop-blur-md border border-blue-200" style={{boxShadow:'0 8px 32px 0 rgba(31,38,135,0.37)'}}>
            <div className="flex flex-col items-center mb-2">
              <div className="bg-white rounded-full p-2 shadow-lg border-2 border-blue-200">
                <img src="/pitchlive-logo.jpg" alt="Logo Pitch Live" className="w-16 h-16 object-contain" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-blue-700 text-center">Inscription rapide</h2>
            <input
              type="text"
              placeholder="Nom d’utilisateur"
              className="rounded px-2 py-1 border border-blue-300 w-full"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Numéro de téléphone"
              className="rounded px-2 py-1 border border-green-400 w-full"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Mot de passe généré automatiquement</label>
              <div className="flex items-center gap-2">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  readOnly
                  className="rounded px-2 py-1 border border-gray-300 w-full bg-gray-100"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="text-xs text-blue-600 underline">{showPwd ? "Masquer" : "Voir"}</button>
              </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-bold hover:bg-blue-700 transition">S’inscrire</button>
            {signupError && <div className="text-red-600 text-xs font-bold text-center">{signupError}</div>}
            <div className="text-xs text-gray-500 text-center">Vous pouvez voir les vidéos sans inscription, mais la fiche restera affichée.</div>
          </form>
        </div>
      )}
      {/* Conteneur smartphone preview */}
      <div className="relative w-[370px] h-[740px] rounded-3xl shadow-2xl border-4 border-gray-800 overflow-hidden bg-black flex flex-col">
        <div className="flex-1 h-full w-full overflow-y-scroll snap-y snap-mandatory bg-black">
          {/* Afficher uniquement la vidéo courante */}
          {currentVideo && (
            <div className="snap-start h-full w-full">
              <VideoCard src={currentVideo.src} creator={currentVideo.creator} whatsapp={currentVideo.whatsapp} messages={messages} />
            </div>
          )}
        </div>
        {/* Chat overlay façon Instagram Live */}
        <div className="absolute bottom-4 left-2 z-[9999] w-full max-w-xs flex flex-col items-start pointer-events-none">
          <div className="pointer-events-auto border-none shadow-none bg-transparent">
            <ChatBox videoId={currentVideo?.src || "demo"} creator={currentVideo?.creator || ""} />
          </div>
        </div>
      </div>
        </div> {/* fermeture du .flex-1 */}
      </div> {/* fermeture du .w-full min-h-screen */}
    </div>
  );
