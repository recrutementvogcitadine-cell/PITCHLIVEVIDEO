// Génère une forme d’onde simple (bleue) à partir d’un buffer audio
function Waveform({ audioBuffer, width = 320, height = 48, start = 0, end, onSelect }) {
  const ref = React.useRef(null);
  useEffect(() => {
    if (!audioBuffer || !ref.current) return;
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const data = audioBuffer.getChannelData(0);
    const len = Math.floor((end - start) * audioBuffer.sampleRate);
    for (let x = 0; x < width; x++) {
      const i = Math.floor(start * audioBuffer.sampleRate + (x / width) * len);
      const v = data[i] || 0;
      const y = height / 2 - v * (height / 2 - 4);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [audioBuffer, width, height, start, end]);
  // Drag handles
  return <canvas ref={ref} width={width} height={height} style={{ width, height, background: '#e0e7ff', borderRadius: 8 }} />;
}
  // Pour la forme d’onde
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  useEffect(() => {
    if (!reuseMusic) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    fetch(reuseMusic)
      .then(r => r.arrayBuffer())
      .then(buf => ctx.decodeAudioData(buf))
      .then(setAudioBuffer)
      .catch(() => setAudioBuffer(null));
  }, [reuseMusic]);
import React, { useRef, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// Modes
const MODES = ["photo", "video"] as const;
type Mode = typeof MODES[number];

export default function CameraCapture() {
  // Musique réutilisée
  const [reuseMusic, setReuseMusic] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const src = localStorage.getItem('reuse_music_src');
      if (src) setReuseMusic(src);
    }
  }, []);
  return (
    <>
      <div className="fixed inset-0 flex flex-col bg-black">
        {/* Flèche retour */}
        <button
          className="absolute top-4 left-4 z-50 bg-white/80 rounded-full p-2 shadow border border-blue-200 hover:bg-blue-100 transition"
          onClick={() => window.history.back()}
          aria-label="Retour"
        >
          <svg width="28" height="28" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        </button>
        {/* Musique réutilisée */}
        {reuseMusic && (
          <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/90">
            {/* Aperçu vidéo */}
            <div className="w-[260px] h-[460px] bg-black rounded-3xl shadow-lg flex items-center justify-center mb-2 overflow-hidden">
              {capturedPhoto ? (
                <img src={capturedPhoto} alt="Preview" className="w-full h-full object-cover" />
              ) : recordedVideo ? (
                <video src={recordedVideo} controls className="w-full h-full object-cover" />
              ) : (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              )}
            </div>
            {/* Timeline forme d’onde bleue + slider */}
            <div className="w-[320px] flex flex-col items-center gap-2 mb-2">
              {audioBuffer && (
                <Waveform audioBuffer={audioBuffer} width={320} height={48} start={musicStart} end={musicEnd || musicDuration} />
              )}
              {musicDuration > 0 && (
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between text-xs text-blue-700 font-bold">
                    <span>Début: {formatTime(musicStart)}</span>
                    <span>Fin: {formatTime(musicEnd)}</span>
                  </div>
                  <input type="range" min={0} max={musicEnd-1} value={musicStart} step={0.1} onChange={e => setMusicStart(Number(e.target.value))} />
                  <input type="range" min={musicStart+1} max={musicDuration} value={musicEnd} step={0.1} onChange={e => setMusicEnd(Number(e.target.value))} />
                  <div className="text-xs text-gray-600">Durée sélectionnée : {formatTime(musicEnd-musicStart)}</div>
                </div>
              )}
            </div>
            {/* Boutons édition style TikTok */}
            <div className="flex justify-between w-full max-w-xs mt-4 gap-2">
              <button className="flex-1 bg-gray-800 text-white py-2 rounded-xl font-bold">Modifier</button>
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold">Son</button>
              <button className="flex-1 bg-gray-800 text-white py-2 rounded-xl font-bold">Texte</button>
              <button className="flex-1 bg-gray-800 text-white py-2 rounded-xl font-bold">Effets</button>
              <button className="flex-1 bg-gray-800 text-white py-2 rounded-xl font-bold">Magie</button>
            </div>
            {/* Valider ou annuler */}
            <div className="flex gap-4 mt-6">
              <button className="bg-green-600 text-white px-6 py-2 rounded font-bold" onClick={() => setReuseMusic(null)}>Valider</button>
              <button className="bg-gray-400 text-white px-6 py-2 rounded font-bold" onClick={() => setReuseMusic(null)}>Annuler</button>
            </div>
          </div>
        )}
        {!capturedPhoto && !recordedVideo ? (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : null}
        {capturedPhoto ? (
          <img src={capturedPhoto} alt="Preview" className="w-full h-full object-cover" />
        ) : null}
        {recordedVideo ? (
          <video src={recordedVideo} controls className="w-full h-full object-cover" />
        ) : null}
      </div>
      {/* Progress bar for video */}
      {mode === "video" && recording && (
        <div className="w-full h-2 bg-gray-700">
          <div className="h-2 bg-red-500" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
      {/* Mode selector */}
      <div className="flex justify-center gap-8 py-4">
        {MODES.map(m => (
          <button
            key={m}
            className={`text-lg font-bold px-4 py-2 rounded ${mode === m ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => handleModeSwitch(m)}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>
      {/* Capture button */}
      <div className="flex justify-center items-center py-4">
        {mode === "photo" && !capturedPhoto && (
          <button
            className="w-16 h-16 rounded-full bg-white border-4 border-blue-600 flex items-center justify-center text-2xl font-bold shadow-lg"
            onClick={handleCapturePhoto}
          >
            📸
          </button>
        )}
        {mode === "video" && !recording && !recordedVideo && (
          <button
            className="w-16 h-16 rounded-full bg-red-600 border-4 border-white flex items-center justify-center text-2xl font-bold shadow-lg animate-pulse"
            onClick={handleStartRecording}
          >
            ●
          </button>
        )}
        {mode === "video" && recording && (
          <button
            className="w-16 h-16 rounded-full bg-gray-700 border-4 border-white flex items-center justify-center text-2xl font-bold shadow-lg"
            onClick={handleStopRecording}
          >
            ■
          </button>
        )}
      </div>
      {/* Upload & Gallery */}
      <div className="flex justify-center gap-4 py-2">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded font-bold shadow"
          onClick={handleUpload}
          disabled={uploading || (!capturedPhoto && !recordedVideo)}
        >
          {uploading ? "Publication..." : "Publier"}
        </button>
        <label className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-bold shadow cursor-pointer">
          Galerie
          <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileInput} />
        </label>
      </div>
      {/* Upload message */}
      {uploadMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-blue-700 px-6 py-2 rounded shadow-lg font-bold z-[99999]">
          {uploadMsg}
        </div>
      )}
    </>
  );
  useEffect(() => {
    if (videoTimestamp) {
      const now = Date.now();
      const expire = videoTimestamp + 24 * 60 * 60 * 1000;
      if (now >= expire) {
        setRecordedVideo(null);
        setVideoTimestamp(null);
      } else {
        const timeout = setTimeout(() => {
          setRecordedVideo(null);
          setVideoTimestamp(null);
        }, expire - now);
        return () => clearTimeout(timeout);
      }
    }
  }, [videoTimestamp]);

  // Upload logic
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  async function handleUpload() {
    setUploading(true);
    setUploadMsg(null);
    try {
      let file: File | null = null;
      let ext = "";
      let url = "";
      if (capturedPhoto) {
        // Convert dataURL to File
        const res = await fetch(capturedPhoto);
        const blob = await res.blob();
        ext = "jpg";
        file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
      } else if (recordedVideo) {
        const res = await fetch(recordedVideo);
        const blob = await res.blob();
        ext = "mp4";
        file = new File([blob], `video_${Date.now()}.mp4`, { type: "video/mp4" });
      }
      if (!file) throw new Error("Aucun média à uploader");
      // Upload to Supabase Storage
      const user = typeof window !== 'undefined' ? localStorage.getItem('user_pseudo') : "";
      const path = `${user || "anonymous"}/${file.name}`;
      const { data, error } = await supabase.storage.from("videos").upload(path, file, { upsert: true });
      if (error) throw error;
      // Get public URL
      const { data: pub } = supabase.storage.from("videos").getPublicUrl(path);
      url = pub?.publicUrl || "";
      // Insert metadata in videos table
      const { error: err2 } = await supabase.from("videos").insert({
        src: url,
        creator: user,
        timestamp: new Date().toISOString(),
        whatsapp: typeof window !== 'undefined' ? localStorage.getItem('user_phone') : "",
        music_src: reuseMusic || null
      });
      if (err2) throw err2;
      // Nettoyer reuse_music_src après usage
      if (typeof window !== 'undefined') localStorage.removeItem('reuse_music_src');
      setUploadMsg("✅ Vidéo/photo publiée !");
      setCapturedPhoto(null);
      setPhotoTimestamp(null);
      setRecordedVideo(null);
      setVideoTimestamp(null);
      setTimeout(() => {
        setUploadMsg(null);
        if (typeof window !== 'undefined') {
          window.location.href = "/";
        }
      }, 1500);
    } catch (e: any) {
      setUploadMsg("Erreur : " + (e.message || e.toString()));
    } finally {
      setUploading(false);
    }
  }

  // Galerie handler
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = ev => {
        setCapturedPhoto(ev.target?.result as string);
        setPhotoTimestamp(Date.now());
      };
      reader.readAsDataURL(file);
      setMode("photo");
    } else if (file.type.startsWith("video/")) {
      setRecordedVideo(URL.createObjectURL(file));
      setVideoTimestamp(Date.now());
      setMode("video");
    }
  }

  // UI
  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      {/* Flèche retour */}
      <button
        className="absolute top-4 left-4 z-50 bg-white/80 rounded-full p-2 shadow border border-blue-200 hover:bg-blue-100 transition"
        onClick={() => window.history.back()}
        aria-label="Retour"
      >
        <svg width="28" height="28" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      </button>
      {/* Musique réutilisée */}
      {reuseMusic && (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/90">
          {/* Aperçu vidéo */}
          <div className="w-[260px] h-[460px] bg-black rounded-3xl shadow-lg flex items-center justify-center mb-2 overflow-hidden">
            {capturedPhoto ? (
              <img src={capturedPhoto} alt="Preview" className="w-full h-full object-cover" />
            ) : recordedVideo ? (
              <video src={recordedVideo} controls className="w-full h-full object-cover" />
            ) : (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            )}
          </div>
          {/* Timeline forme d’onde bleue + slider */}
          <div className="w-[320px] flex flex-col items-center gap-2 mb-2">
            {audioBuffer && (
              <Waveform audioBuffer={audioBuffer} width={320} height={48} start={musicStart} end={musicEnd || musicDuration} />
            )}
            {musicDuration > 0 && (
              <div className="flex flex-col gap-1 w-full">
                <div className="flex justify-between text-xs text-blue-700 font-bold">
                  <span>Début: {formatTime(musicStart)}</span>
                  <span>Fin: {formatTime(musicEnd)}</span>
                </div>
                <input type="range" min={0} max={musicEnd-1} value={musicStart} step={0.1} onChange={e => setMusicStart(Number(e.target.value))} />
                <input type="range" min={musicStart+1} max={musicDuration} value={musicEnd} step={0.1} onChange={e => setMusicEnd(Number(e.target.value))} />
                <div className="text-xs text-gray-600">Durée sélectionnée : {formatTime(musicEnd-musicStart)}</div>
              </div>
            )}
          </div>
          {/* Boutons édition style TikTok */}
          <div className="flex justify-between w-full max-w-xs mt-4 gap-2">
            <button className="flex-1 bg-gray-800 text-white py-2 rounded-xl font-bold">Modifier</button>
            <button className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold">Son</button>
            <button className="flex-1 bg-gray-800 text-white py-2 rounded-xl font-bold">Texte</button>
            <button className="flex-1 bg-gray-800 text-white py-2 rounded-xl font-bold">Effets</button>
            <button className="flex-1 bg-gray-800 text-white py-2 rounded-xl font-bold">Magie</button>
          </div>
          {/* Valider ou annuler */}
          <div className="flex gap-4 mt-6">
            <button className="bg-green-600 text-white px-6 py-2 rounded font-bold" onClick={() => setReuseMusic(null)}>Valider</button>
            <button className="bg-gray-400 text-white px-6 py-2 rounded font-bold" onClick={() => setReuseMusic(null)}>Annuler</button>
          </div>
        </div>
      )}
          {!capturedPhoto && !recordedVideo ? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : null}
          {capturedPhoto ? (
            <img src={capturedPhoto} alt="Preview" className="w-full h-full object-cover" />
          ) : null}
          {recordedVideo ? (
            <video src={recordedVideo} controls className="w-full h-full object-cover" />
          ) : null}
        </div>
      {/* Progress bar for video */}
      {mode === "video" && recording && (
        <div className="w-full h-2 bg-gray-700">
          <div className="h-2 bg-red-500" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
      {/* Mode selector */}
      <div className="flex justify-center gap-8 py-4">
        {MODES.map(m => (
          <button
            key={m}
            className={`text-lg font-bold px-4 py-2 rounded ${mode === m ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => handleModeSwitch(m)}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>
      {/* Capture button */}
      <div className="flex justify-center items-center py-4">
        {mode === "photo" && !capturedPhoto && (
          <button
            className="w-16 h-16 rounded-full bg-white border-4 border-blue-600 flex items-center justify-center text-2xl font-bold shadow-lg"
            onClick={handleCapturePhoto}
          >
            📷
          </button>
        )}
        {mode === "video" && !recordedVideo && (
          <button
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg ${recording ? "bg-red-600 border-4 border-red-800" : "bg-white border-4 border-blue-600"}`}
            onClick={recording ? handleStopRecording : handleStartRecording}
          >
            {recording ? "■" : "🎬"}
          </button>
        )}
      </div>
      {/* Preview actions */}
      {(capturedPhoto || recordedVideo) && (
        <div className="flex justify-center gap-4 py-4">
          <button className="bg-green-600 text-white px-6 py-2 rounded font-bold disabled:opacity-60" onClick={handleUpload} disabled={uploading}>{uploading ? "Publication..." : "Publier"}</button>
          <button className="bg-gray-400 text-white px-6 py-2 rounded font-bold" onClick={() => handleModeSwitch(mode)}>
            Refaire
          </button>
        </div>
      )}
      {uploadMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-xl shadow-lg text-center z-[9999999]">{uploadMsg}</div>
      )}
    </div>
  );
}
