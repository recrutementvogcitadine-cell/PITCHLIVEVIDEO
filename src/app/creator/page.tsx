"use client";

import React, { useEffect, useState, Suspense } from "react";
import CreatorGallery from "./gallery";
import { useRouter, useSearchParams } from "next/navigation";

function CreatorProfilePageContent() {
  const router = useRouter();
  const params = useSearchParams();
  // Récupérer le pseudo du créateur depuis l'URL (?u=...)
  const username = (params && params.get && params.get("u")) || (typeof window !== 'undefined' ? localStorage.getItem('user_pseudo') : "");

  // Simuler stats (à remplacer par des requêtes réelles si besoin)
  const [stats, setStats] = useState({ followers: 0, likes: 0 });
  useEffect(() => {
    // TODO: fetch stats from Supabase
    setStats({ followers: 123, likes: 456 });
  }, [username]);

  if (!username) {
    return <div className="flex items-center justify-center h-96 text-white">Aucun créateur sélectionné.</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Header profil style TikTok */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center py-6 bg-white border-b border-gray-200">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 flex items-center justify-center text-white font-bold text-4xl uppercase border-4 border-white shadow-lg">
            {username.charAt(0)}
          </div>
          <button className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow">+</button>
        </div>
        <div className="mt-2 text-lg font-bold text-gray-900">{username}</div>
        <div className="flex gap-6 mt-2 text-gray-600 text-sm">
          <div><span className="font-bold">{stats.followers}</span> Abonnés</div>
          <div><span className="font-bold">{stats.likes}</span> J'aime</div>
        </div>
        <div className="flex gap-4 mt-4">
          <button className="bg-blue-600 text-white px-4 py-1 rounded font-bold shadow hover:bg-blue-700 transition">Partager</button>
          <button className="bg-gray-200 text-gray-700 px-4 py-1 rounded font-bold shadow hover:bg-gray-300 transition">Modifier</button>
        </div>
      </div>
      {/* Galerie éphémère (1 vidéo/photo max, 24h) */}
      <div className="w-full max-w-md mx-auto py-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Galerie éphémère</h2>
        <CreatorGallery username={username} />
      </div>
    </div>
  );
}

export default function CreatorProfilePage() {
  return (
    <Suspense fallback={<div>Chargement…</div>}>
      <CreatorProfilePageContent />
    </Suspense>
  );
}