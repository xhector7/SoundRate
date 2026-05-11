import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="currentColor">
      <polygon points="3,1 13,7 3,13" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 14 14" fill="currentColor">
      <rect x="2" y="1" width="4" height="12" rx="1" />
      <rect x="8" y="1" width="4" height="12" rx="1" />
    </svg>
  );
}

export default function PlayerBar({ track, audioRef, isPlaying, onTogglePlay }) {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressRef = useRef(null);

  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onDuration);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onDuration);
    };
  }, [audioRef, track]);

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleSeek = (e) => {
    const audio = audioRef?.current;
    if (!audio || !audio.duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
    setProgress(pct);
  };

  if (!track) return null;

  const accent = track.accent || "#00c9b1";
  const coverSrc = track.cover_image
  ? track.cover_image.startsWith("http")
    ? track.cover_image
    : `http://127.0.0.1:8000${track.cover_image}`
  : "/placeholder.jpg";
  const currentTime = audioRef?.current ? audioRef.current.currentTime : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        .pb-syne { font-family: 'Syne', sans-serif; }
        .pb-mono { font-family: 'Space Mono', monospace; }
        @keyframes pbDot { from{transform:scaleY(0.3)} to{transform:scaleY(1)} }
      `}</style>

      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "rgba(10,10,14,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: `1px solid ${accent}22`,
        }}
      >
        {/* barra de progreso clickeable */}
        <div
          ref={progressRef}
          onClick={handleSeek}
          className="w-full h-1 cursor-pointer relative"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="h-full transition-all duration-100"
            style={{ width: `${progress * 100}%`, background: accent }}
          />
          {/* thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            style={{ left: `${progress * 100}%`, background: accent, transform: "translateX(-50%) translateY(-50%)" }}
          />
        </div>

        {/* contenido */}
        <div className="flex items-center justify-between px-8 py-3">

          {/* LEFT — info track */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              {/* deberia estar envuelto en un link q redirige al track */}      
              <Link to={`/track/${track.id}`} className="absolute inset-0 z-10" />       
              <img
                src={coverSrc}
                className="w-11 h-11 rounded-lg object-cover"
                style={{ border: `1px solid ${accent}33` }}
                />
              {isPlaying && (
                <div className="absolute inset-0 rounded-lg flex items-end justify-center gap-0.5 pb-1"
                  style={{ background: "rgba(0,0,0,0.45)" }}
                >
                  {[0,1,2].map(i => (
                    <div key={i} className="w-0.5 rounded-full"
                      style={{
                        height: "8px", background: accent,
                        animation: `pbDot ${0.4 + i * 0.15}s ease-in-out infinite alternate`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="pb-syne text-sm font-bold text-white truncate leading-tight">{track.title}</p>
              <Link to={`/artist/${track.owner?.username}`} className="pb-mono text-[10px] truncate mt-0.5 no-underline hover:underline block" style={{ color: accent }}>
                {track.owner?.username || "Artista"}
              </Link>
            </div>
          </div>

          {/* CENTER — controles */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={onTogglePlay}
              className="flex items-center justify-center rounded-full border-none cursor-pointer transition-all duration-200"
              style={{
                width: "44px", height: "44px",
                background: accent,
                color: "#0f0f12",
                boxShadow: `0 0 20px ${accent}55`,
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
          </div>

          {/* RIGHT — tiempo */}
          <div className="flex-1 flex justify-end">
            <span className="pb-mono text-[10px] text-white/30">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

        </div>
      </div>
    </>
  );
}