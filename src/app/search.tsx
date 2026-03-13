"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabaseClient } from "../lib/supabaseClient";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [popularVideos, setPopularVideos] = useState<any[]>([]);
  const [recommendedProfiles, setRecommendedProfiles] = useState<any[]>([]);

  // Charger historique local
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const h = localStorage.getItem('search_history');
      setHistory(h ? JSON.parse(h) : []);
    }
  }, []);

  // Charger vidéos populaires et profils recommandés
  useEffect(() => {
    async function fetchPopular() {
      // Populaires = plus de likes (top 10)
      const { data: popVids } = await supabaseClient
        .from('videos')
        .select('src, creator, whatsapp, timestamp')
        .order('like_count', { ascending: false })
        .limit(10);
      setPopularVideos(popVids || []);
      // Profils recommandés = plus suivis (top 10)
      const { data: popUsers } = await supabaseClient
        .from('users')
        .select('username, avatar_url, bio')
        .order('follower_count', { ascending: false })
        .limit(10);
      setRecommendedProfiles(popUsers || []);
    }
    fetchPopular();
  }, []);

  // Recherche
  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    // Historique
    if (typeof window !== 'undefined') {
      const h = [query, ...history.filter(q => q !== query)].slice(0, 10);
      setHistory(h);
      localStorage.setItem('search_history', JSON.stringify(h));
    }
    // Profils
    const { data: profs } = await supabaseClient
      .from('users')
      .select('username, avatar_url, bio')
      .ilike('username', `%${query}%`);
    setProfiles(profs || []);
    // Vidéos
    const { data: vids } = await supabaseClient
      .from('videos')
      .select('src, creator, whatsapp, timestamp')
      .ilike('creator', `%${query}%`);
    setVideos(vids || []);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-4 px-2 relative">
      {/* Flèche retour */}
      <button
        className="absolute top-4 left-4 z-50 bg-white/80 rounded-full p-2 shadow border border-blue-200 hover:bg-blue-100 transition"
        onClick={() => window.history.back()}
        aria-label="Retour"
      >
        <svg width="28" height="28" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      </button>
      <form onSubmit={handleSearch} className="w-full max-w-md flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher un profil ou une vidéo..."
          className="flex-1 border rounded px-3 py-2 text-base"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Rechercher</button>
      </form>
      {/* Historique */}
      {history.length > 0 && (
        <div className="w-full max-w-md mb-4">
          <div className="text-xs text-gray-500 mb-1">Historique des recherches :</div>
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <button key={i} className="bg-gray-200 rounded px-2 py-1 text-xs" onClick={() => { setQuery(h); handleSearch(); }}>{h}</button>
            ))}
          </div>
        </div>
      )}
      {/* Résultats profils */}
      {profiles.length > 0 && (
        <div className="w-full max-w-md mb-6">
          <div className="font-bold text-gray-700 mb-2">Profils trouvés :</div>
          <div className="flex flex-col gap-2">
            {profiles.map((p: any) => (
              <Link key={p.username} href={`/creator?u=${encodeURIComponent(p.username)}`} className="flex items-center gap-3 p-2 rounded bg-gray-100 hover:bg-blue-50">
                {p.avatar_url ? <img src={p.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-white font-bold text-xl">{p.username.charAt(0)}</div>}
                <div>
                  <div className="font-bold">{p.username}</div>
                  <div className="text-xs text-gray-500 max-w-xs truncate">{p.bio}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      {/* Résultats vidéos */}
      {videos.length > 0 && (
        <div className="w-full max-w-md mb-6">
          <div className="font-bold text-gray-700 mb-2">Vidéos créateur :</div>
          <div className="flex flex-col gap-2">
            {videos.map((v: any, i: number) => (
              <Link key={i} href={`/mur?video=${encodeURIComponent(v.src)}`} className="flex items-center gap-3 p-2 rounded bg-gray-100 hover:bg-blue-50">
                <div className="w-16 h-10 bg-black rounded overflow-hidden flex items-center justify-center">
                  <video src={v.src} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-bold">{v.creator}</div>
                  <div className="text-xs text-gray-500">Publié le {new Date(v.timestamp).toLocaleString()}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      {/* Suggestions */}
      <div className="w-full max-w-md mb-6">
        <div className="font-bold text-gray-700 mb-2">Vidéos populaires</div>
        <div className="flex flex-col gap-2">
          {popularVideos.map((v: any, i: number) => (
            <Link key={i} href={`/mur?video=${encodeURIComponent(v.src)}`} className="flex items-center gap-3 p-2 rounded bg-yellow-50 hover:bg-yellow-100">
              <div className="w-16 h-10 bg-black rounded overflow-hidden flex items-center justify-center">
                <video src={v.src} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-bold">{v.creator}</div>
                <div className="text-xs text-gray-500">Publié le {new Date(v.timestamp).toLocaleString()}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="w-full max-w-md mb-6">
        <div className="font-bold text-gray-700 mb-2">Profils recommandés</div>
        <div className="flex flex-col gap-2">
          {recommendedProfiles.map((p: any) => (
            <Link key={p.username} href={`/creator?u=${encodeURIComponent(p.username)}`} className="flex items-center gap-3 p-2 rounded bg-pink-50 hover:bg-pink-100">
              {p.avatar_url ? <img src={p.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-white font-bold text-xl">{p.username.charAt(0)}</div>}
              <div>
                <div className="font-bold">{p.username}</div>
                <div className="text-xs text-gray-500 max-w-xs truncate">{p.bio}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
