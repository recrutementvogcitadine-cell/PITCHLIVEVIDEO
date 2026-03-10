
"use client";
import React from "react";
import VideoCard from "../components/VideoCard";
import ChatBox from "../components/ChatBox";
import videos from "../../data/videos.json";

export default function Home() {
  const validVideos = Array.isArray(videos) ? videos : [];

  if (!validVideos.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-2xl">
        Aucune vidéo disponible.
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black">
      {validVideos.map((video, idx) => (
        <div key={idx} className="snap-start h-screen w-full">
          <VideoCard src={video.src} creator={video.creator} whatsapp={video.whatsapp} />
        </div>
      ))}
      {/* Chat flottant global, toujours visible */}
      <div className="fixed bottom-20 right-4 z-[9999] w-[92vw] max-w-xs sm:max-w-sm bg-gradient-to-br from-blue-50 via-white to-blue-100 border-2 border-blue-500 shadow-xl rounded-2xl p-1 sm:p-2 flex flex-col items-stretch backdrop-blur-md" style={{pointerEvents:'auto'}}>
        <div className="w-full flex items-center justify-between px-2 py-1 border-b border-blue-200 mb-1">
          <span className="text-blue-700 font-bold text-sm tracking-wide">Chat en direct</span>
          <span className="text-xs text-blue-400 font-mono">PITCH LIVE</span>
        </div>
        <ChatBox videoId={validVideos[0]?.src || "demo"} creator={validVideos[0]?.creator || ""} />
      </div>
    </div>
  );
}
