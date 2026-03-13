"use client";

import React, { useEffect, useState } from "react";
import { supabaseClient } from "../../lib/supabaseClient";
import VideoCard from "../../components/VideoCard";

interface Video {
  src: string;
  creator: string;
  whatsapp: string;
  timestamp: string;
}

export default function CreatorGallery({ username }: { username: string }) {
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCreatorVideo() {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from("videos")
        .select("src, creator, whatsapp, timestamp")
        .eq("creator", username)
        .order("timestamp", { ascending: false });
      if (!error && data && data.length > 0) {
        // Filtrer sur 24h
        const now = Date.now();
        const filtered = data.filter((v: any) => {
          const created = new Date(v.timestamp).getTime();
          return now - created < 24 * 60 * 60 * 1000;
        });
        setVideo(filtered[0] || null);
      } else {
        setVideo(null);
      }
      setLoading(false);
    }
    fetchCreatorVideo();
    // Optionnel: refresh toutes les 30s pour temps réel
    const interval = setInterval(fetchCreatorVideo, 30000);
    return () => clearInterval(interval);
  }, [username]);

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-white">Chargement…</div>;
  }

  return (
    <div className="w-full flex flex-col items-center">
      {video ? (
        <div className="w-full max-w-xs mx-auto">
          <VideoCard
            src={video.src}
            creator={video.creator}
            whatsapp={video.whatsapp}
          />
        </div>
      ) : (
        <div className="text-gray-400 text-center py-12">Aucune vidéo/photo éphémère publiée par ce créateur dans les dernières 24h.</div>
      )}
    </div>
  );
}
