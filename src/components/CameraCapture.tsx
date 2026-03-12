import React, { useRef, useState, useEffect } from "react";

// Modes
const MODES = ["photo", "video"] as const;
type Mode = typeof MODES[number];

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<Mode>("photo");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const maxDuration = 300; // 5 minutes in seconds

  // Camera access
  useEffect(() => {
    async function getCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: mode === "video" });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (e) {
        alert("Impossible d'accéder à la caméra.");
      }
    }
    getCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line
  }, [mode]);

  // Video preview
  useEffect(() => {
    if (videoRef.current && stream) {
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [photoTimestamp, setPhotoTimestamp] = useState<number | null>(null);
    }
  }, [stream]);
    const [videoTimestamp, setVideoTimestamp] = useState<number | null>(null);

  // Timer for video
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (recording) {
      interval = setInterval(() => {
        setTimer(t => {
          if (t >= maxDuration) {
            handleStopRecording();
            return t;
          }
          setProgress((t + 1) / maxDuration);
          return t + 1;
        });
      }, 1000);
    } else {
      setTimer(0);
      setProgress(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line
  }, [recording]);

  // Start video recording
  const handleStartRecording = () => {
    if (!stream) return;
    const recorder = new MediaRecorder(stream, { mimeType: "video/mp4" });
    setMediaRecorder(recorder);
    setChunks([]);
    recorder.ondataavailable = e => {
      if (e.data.size > 0) setChunks(prev => [...prev, e.data]);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/mp4" });
      setRecordedVideo(URL.createObjectURL(blob));
      setRecording(false);
    };
    recorder.start();
    setRecording(true);
  };

  // Stop video recording
  const handleStopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  // Capture photo
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setCapturedPhoto(canvas.toDataURL("image/jpeg"));
    }
  };

  // Mode switch
  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setCapturedPhoto(null);
    setRecordedVideo(null);
    setRecording(false);
    setTimer(0);
    setProgress(0);
  };

  // UI
  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      {/* Flash / Switch camera (placeholder) */}
      <div className="flex justify-between items-center p-4 text-white">
        <button disabled className="opacity-50">Flash</button>
        <button disabled className="opacity-50">Switch</button>
      </div>
      {/* Camera preview */}
      <div className="flex-1 flex items-center justify-center">
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
        {/* ...existing code... */}
      </div>
    </div>
  );
}

// Expiration automatique à 24h
useEffect(() => {
  if (photoTimestamp) {
    const now = Date.now();
    const expire = photoTimestamp + 24 * 60 * 60 * 1000;
    if (now >= expire) {
      setCapturedPhoto(null);
      setPhotoTimestamp(null);
    } else {
      const timeout = setTimeout(() => {
        setCapturedPhoto(null);
        setPhotoTimestamp(null);
      }, expire - now);
      return () => clearTimeout(timeout);
    }
  }
}, [photoTimestamp]);

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
          <button className="bg-green-600 text-white px-6 py-2 rounded font-bold">Publier</button>
          <button className="bg-gray-400 text-white px-6 py-2 rounded font-bold" onClick={() => handleModeSwitch(mode)}>
            Refaire
          </button>
        </div>
      )}
    </div>
  );
}
