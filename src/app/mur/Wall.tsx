"use client";

import React, { useRef, useEffect, useState } from "react";
import VideoCard from "../../components/VideoCard";
import { supabaseClient } from "../../lib/supabaseClient";
import { useSwipeable } from "react-swipeable";

interface Video {
  src: string;
  creator: string;
  whatsapp: string;
  timestamp: string;
}

export default function Wall() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videos, setVideos] = useState<Video[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const now = new Date();

  // Charger les vidéos depuis Supabase (table "videos")
  useEffect(() => {
    async function fetchVideos() {
      const { data, error } = await supabaseClient
        .from('videos')
        .select('src, creator, whatsapp, timestamp')
        .order('timestamp', { ascending: false });
      if (!error && data) {
        // Filtrer sur 24h
        const filtered = data.filter((v: any) => {
          const created = new Date(v.timestamp);
          return now.getTime() - created.getTime() < 24 * 60 * 60 * 1000;
        });
        setVideos(filtered);
      }
    }
    fetchVideos();
  }, []);


  // Scroll handler pour changer de vidéo (scroll classique)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const height = window.innerHeight;
    const idx = Math.round(scrollTop / height);
    setActiveIndex(idx);
  };

  // Swipe handler (mobile/desktop)
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => setActiveIndex(i => Math.min(i + 1, videos.length - 1)),
    onSwipedDown: () => setActiveIndex(i => Math.max(i - 1, 0)),
    trackMouse: true,
  });

  // Scroll to active video
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: activeIndex * window.innerHeight,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  // Auto play/pause selon la vidéo visible
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        if (idx === activeIndex) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
  }, [activeIndex, videos.length]);

  // ATTENTION : useSwipeable ajoute déjà le ref dans {...swipeHandlers}, donc on ne doit pas passer deux fois le ref
  // On retire swipeHandlers.ref du spread pour éviter le conflit
  const { ref: _swipeRef, ...handlersWithoutRef } = swipeHandlers;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: "100vh", overflowY: "scroll", scrollSnapType: "y mandatory" }}
      {...handlersWithoutRef}
    >
      {videos.length === 0 ? (
        <div className="flex items-center justify-center h-screen bg-black text-white text-2xl font-bold">
          Aucune vidéo disponible
        </div>
      ) : (
        videos.map((video, i) => (
          <div
            key={video.src}
            style={{ height: "100vh", scrollSnapAlign: "start" }}
          >
            <VideoCard
              src={video.src}
              creator={video.creator}
              whatsapp={video.whatsapp}
              videoRef={el => (videoRefs.current[i] = el)}
            />
          </div>
        ))
      )}
    </div>
  );
}
