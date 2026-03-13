
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import videos from "../../data/videos.json";
import VideoCard from "../components/VideoCard";
import ChatBox from "../components/ChatBox";

import { supabase } from "../lib/supabaseClient";
import { subscribeToPush } from "../lib/notifyUtils";

export default function Home() {
  // États pour l'inscription et l'utilisateur
  const [showSignup, setShowSignup] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Synchroniser showSignup avec localStorage côté client après le premier rendu (une seule fois)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShowSignup(!localStorage.getItem('user_registered'));
      setHydrated(true);
    }
  }, []);
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

  // Fonction d'inscription utilisateur
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
    // window.location.reload();
  }

  // useEffect pour notifications push à l'accès au mur
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

  // Filtrer les vidéos de moins de 24h
  const now = Date.now();
  const validVideos = Array.isArray(videos)
    ? videos.filter(v => {
        const ts = typeof v.timestamp === 'string' ? Date.parse(v.timestamp) : v.timestamp;
        return ts && now - ts < 24 * 60 * 60 * 1000;
      })
    : [];
  const [messages, setMessages] = useState<any[]>([]);
  // État pour afficher la modale d'upload vidéo
  const [showUpload, setShowUpload] = useState(false);
  // Lazy import CameraCapture pour éviter SSR
  const CameraCapture = React.useMemo(() => typeof window !== 'undefined' ? require('../components/CameraCapture').default : null, []);
  // Index de la vidéo actuellement affichée
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentVideo = validVideos[currentIdx] || null;

  if (!validVideos.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-2xl">
        Aucune vidéo disponible.
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-black">
      <div className="w-full flex justify-between items-center gap-2 p-4 relative">
        {/* Flèche retour */}
        <button
          className="absolute top-1 left-1 z-50 bg-white/80 rounded-full p-2 shadow border border-blue-200 hover:bg-blue-100 transition"
          onClick={() => window.history.back()}
          aria-label="Retour"
        >
          <svg width="28" height="28" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="flex-1 flex gap-2">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-green-700 transition"
            onClick={() => setShowUpload(true)}
          >
            📤 Publier une vidéo
          </button>
          <a href="/camera" className="bg-blue-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-blue-700 transition">📷 Accéder à la caméra</a>
        </div>
        <Link href="/search" className="p-2" aria-label="Recherche">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-blue-700 hover:text-blue-900 transition">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
          </svg>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {/* Modale d'upload vidéo */}
        {showUpload && CameraCapture && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80">
            <div className="relative w-full max-w-md mx-auto">
              <button
                className="absolute top-2 right-2 bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center z-10"
                onClick={() => setShowUpload(false)}
                aria-label="Fermer"
              >✕</button>
              <CameraCapture />
            </div>
          </div>
        )}
        {/* Fiche d'inscription globale, transparente et flottante */}
        {hydrated && showSignup && (
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
        </div> {/* fermeture du .flex-1 */}
      </div> {/* fermeture du .w-full min-h-screen */}
    </div>
  );
}
