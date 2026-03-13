"use client";
import { useEffect, useState, Suspense } from "react";
import CreatorGallery from "./gallery";
import { supabaseClient } from "../../lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

function CreatorProfilePageContent() {
    // Hooks Next.js
    const router = useRouter();
    const params = useSearchParams();
    // Récupérer le pseudo du créateur depuis l'URL (?u=...)
    const username = (params && params.get && params.get("u")) || (typeof window !== 'undefined' ? localStorage.getItem('user_pseudo') : "");
    // État pour édition du pseudo
    const [editPseudo, setEditPseudo] = useState(false);
    const [newPseudo, setNewPseudo] = useState<string>(username || "");
    const [updateMsg, setUpdateMsg] = useState<string|null>(null);

  // Infos profil créateur
  const [profile, setProfile] = useState<{ avatar_url?: string; bio?: string; followers: number }>({ followers: 0 });
  useEffect(() => {
    async function fetchProfile() {
      if (!username) return;
      // Récupérer avatar, bio
      const { data: userData } = await supabaseClient
        .from('users')
        .select('avatar_url, bio')
        .eq('username', username)
        .maybeSingle();
      // Compter les followers
      const { count: followersCount } = await supabaseClient
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', username);
      setProfile({
        avatar_url: userData?.avatar_url,
        bio: userData?.bio,
        followers: followersCount || 0,
      });
    }
    fetchProfile();
  }, [username]);

  if (!username) {
    return <div className="flex items-center justify-center h-96 text-white">Aucun créateur sélectionné.</div>;
  }

  // Vérifier si c’est le mur de l’utilisateur connecté
  const isOwnProfile = typeof window !== 'undefined' && localStorage.getItem('user_pseudo') === username;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Header profil style TikTok */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center py-6 bg-white border-b border-gray-200">
        <div className="relative">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 flex items-center justify-center text-white font-bold text-4xl uppercase border-4 border-white shadow-lg">
              {username.charAt(0)}
            </div>
          )}
          <button className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow">+</button>
        </div>
        <div className="mt-2 text-lg font-bold text-gray-900">
          {editPseudo ? (
            <form
              onSubmit={async e => {
                e.preventDefault();
                setUpdateMsg(null);
                if (!newPseudo.trim()) return;
                // Update Supabase
                const { error } = await supabaseClient
                  .from('users')
                  .update({ username: newPseudo })
                  .eq('username', username);
                if (!error) {
                  setUpdateMsg('Pseudo modifié !');
                  setEditPseudo(false);
                  // Mettre à jour localStorage
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('user_pseudo', newPseudo);
                  }
                  // Recharger la page avec le nouveau pseudo dans l’URL
                  window.location.href = `/creator?u=${encodeURIComponent(newPseudo)}`;
                } else {
                  setUpdateMsg("Erreur : " + error.message);
                }
              }}
              className="flex gap-2 items-center"
            >
              <input
                type="text"
                value={newPseudo}
                onChange={e => setNewPseudo(e.target.value)}
                className="border rounded px-2 py-1 text-base"
                maxLength={32}
                autoFocus
              />
              <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded font-bold">OK</button>
              <button type="button" className="text-gray-500 px-2" onClick={() => { setEditPseudo(false); setNewPseudo(username); }}>Annuler</button>
            </form>
          ) : (
            <>
              {username}
              {isOwnProfile && (
                <button className="ml-2 text-xs text-blue-600 underline" onClick={() => setEditPseudo(true)}>Modifier</button>
              )}
            </>
          )}
        </div>
        {updateMsg && <div className="text-xs text-green-600 mt-1">{updateMsg}</div>}
        <div className="flex gap-6 mt-2 text-gray-600 text-sm">
          <div><span className="font-bold">{profile.followers}</span> Abonnés</div>
        </div>
        {profile.bio && (
          <div className="mt-2 text-center text-gray-700 text-sm max-w-xs whitespace-pre-line">{profile.bio}</div>
        )}
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