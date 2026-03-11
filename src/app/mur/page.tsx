"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CreatorWall() {
  const router = useRouter();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pseudo, setPseudo] = useState("");
  const [phone, setPhone] = useState("");
  const [followers, setFollowers] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const registered = localStorage.getItem('user_registered');
      const storedPseudo = localStorage.getItem('user_pseudo');
      const storedPhone = localStorage.getItem('user_phone');
      if (!registered || !storedPseudo) {
        router.replace('/');
        return;
      }
      setPseudo(storedPseudo);
      if (storedPhone) setPhone(storedPhone);
      // Charger le nombre d’abonnés (followers)
      supabase
        .from('followers')
        .select('id', { count: 'exact' })
        .eq('creator', storedPseudo)
        .then(({ data }) => {
          setFollowers(data ? data.length : 0);
        });
    }
  }, [router]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  function handleDelete() {
    setVideo(null);
    setPreview(null);
    // Ici, tu pourrais aussi supprimer côté serveur/Supabase
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Ici, tu pourrais envoyer les infos à Supabase ou autre backend
    alert("Profil et vidéo enregistrés (démo, stockage non implémenté)");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 w-full max-w-xs">
        <div className="flex flex-col items-center mb-2">
          <div className="bg-white rounded-full p-2 shadow-lg border-2 border-blue-200">
            <img src="/pitchlive-logo.jpg" alt="Logo Pitch Live" className="w-14 h-14 object-contain" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-blue-700 mb-2 text-center">Mon Mur Créateur</h2>
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-blue-400" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-3xl text-blue-600 font-bold border-2 border-blue-300">+</div>
            )}
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
          <input
            type="text"
            placeholder="Pseudo"
            className="rounded px-2 py-1 border border-blue-300 w-full text-center"
            value={pseudo}
            onChange={e => setPseudo(e.target.value)}
            required
            readOnly={true}
          />
          {/* Suivre & abonnés (aperçu) */}
          <div className="flex flex-col items-center mt-1">
            <button
              type="button"
              tabIndex={-1}
              aria-disabled="true"
              className="bg-blue-400 text-white rounded-full px-4 py-1 text-xs font-bold shadow cursor-not-allowed select-none opacity-70 pointer-events-none border-none outline-none"
              style={{ pointerEvents: 'none' }}
            >
              Suivre
            </button>
             <span className="text-xs text-gray-500 mt-1">{followers} abonnés</span>
          </div>
        </div>
        {/* WhatsApp */}
        <input
          type="text"
          placeholder="Numéro WhatsApp"
          className="rounded px-2 py-1 border border-green-400 w-full"
          value={whatsapp}
          onChange={e => setWhatsapp(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Numéro de téléphone (profil)"
          className="rounded px-2 py-1 border border-gray-300 w-full bg-gray-100 mt-1"
          value={phone}
          readOnly={true}
        />
        {/* Vidéo/photo */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-blue-700">Ajouter une vidéo ou photo</label>
          <input type="file" accept="video/*,image/*" onChange={handleVideoChange} required={!preview} />
          {preview && (
            <div className="relative w-full">
              {preview.match(/video/) ? (
                <video src={preview} controls className="w-full rounded shadow" />
              ) : (
                <img src={preview} alt="preview" className="w-full rounded shadow" />
              )}
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={handleDelete} className="bg-red-500 text-white rounded px-3 py-1 text-xs font-bold hover:bg-red-600">Supprimer</button>
                <label className="bg-blue-500 text-white rounded px-3 py-1 text-xs font-bold hover:bg-blue-600 cursor-pointer">
                  Remplacer
                  <input type="file" accept="video/*,image/*" onChange={handleVideoChange} className="hidden" />
                </label>
              </div>
            </div>
          )}
        </div>
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-bold hover:bg-blue-700 transition">Enregistrer</button>
      </form>
    </div>
  );
}
