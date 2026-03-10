"use client";
import React from "react";

interface VideoProps {
  src: string;
  creator: string;
  whatsapp: string;
  children?: React.ReactNode;
}

export default function VideoCard({ src, creator, whatsapp, children }: VideoProps) {
  return (
    <div className="relative w-full h-screen flex flex-col justify-end bg-black">
      <video
        src={src}
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="relative z-10 p-4 flex flex-col gap-4 bg-gradient-to-t from-dark/90 via-black/60 to-transparent">
        <div className="flex items-end justify-between">
          <span className="text-white text-lg font-semibold drop-shadow-md">{creator}</span>
          <a
            href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-whatsapp text-white px-4 py-2 rounded-full font-bold shadow hover:bg-red transition"
            style={{ boxShadow: '0 2px 16px 0 #25D36655' }}
          >
            WhatsApp
          </a>
        </div>
        {children}
      </div>
    </div>
  );
}
