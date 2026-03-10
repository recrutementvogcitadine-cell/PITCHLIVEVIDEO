"use client";
import React from "react";

interface VideoProps {
  src: string;
  creator: string;
  whatsapp: string;
  children?: React.ReactNode;
}

export default function VideoCard({ src, creator, whatsapp, children }: VideoProps) {
  const [error, setError] = React.useState(false);
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(0);
  // Chat toujours visible
  const [shareOpen, setShareOpen] = React.useState(false);

  // Copier le lien
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.origin + src);
    setShareOpen(false);
    alert("Lien copié !");
  };

  // Like
  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => liked ? prev - 1 : prev + 1);
  };

  // Commentaire
  const handleComment = () => {
    setChatOpen((prev) => !prev);
  };

  // Partage
  const handleShare = () => {
    setShareOpen((prev) => !prev);
  };

  return (
    <div className="relative w-full h-screen flex flex-col justify-end bg-black">
      {!error ? (
        <video
          src={src}
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setError(true)}
        />
      ) : (
        <img
          src="/fallback.jpg"
          alt="Vidéo non disponible"
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        />
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
        {/* Commentaire (désactivé, chat toujours visible) */}
        <button
          className="flex flex-col items-center p-2 rounded-full bg-white/80 shadow transition text-blue-500 bg-blue-100 cursor-default"
          aria-label="Commentaire"
          disabled
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
        <div className="absolute right-20 top-1/2 z-30 bg-white rounded shadow p-3 flex flex-col gap-2 border border-green-400">
          <button onClick={handleCopy} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm font-bold">Copier le lien</button>
          <a
            href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded bg-green-500 text-white text-sm font-bold hover:bg-green-600"
          >Partager WhatsApp</a>
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
      {/* Chat flottant en overlay en bas à droite */}
      <div className="fixed bottom-24 right-6 z-[9999] w-[95vw] max-w-md sm:w-96 bg-white border-4 border-blue-700 shadow-2xl rounded-xl p-2 flex flex-col items-stretch" style={{pointerEvents:'auto'}}>
        {children}
      </div>
    </div>
  );
}
