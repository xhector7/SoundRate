import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LikeButton from "./LikeButton";

const BASE = import.meta.env.VITE_API_URL;

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

function PrevIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="19,20 9,12 19,4" />
      <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,4 15,12 5,20" />
      <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function PlayerBar({ track, audioRef, isPlaying, onTogglePlay, onNext, onPrev }) {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const progressRef = useRef(null);
  const isSeeking = useRef(false);

  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
        setCurrentTime(audio.currentTime);
      }
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
    const newTime = pct * audio.duration;
    audio.currentTime = newTime;
    setProgress(pct);
    setCurrentTime(newTime);
    isSeeking.current = true;
    const onSeekComplete = () => {
      if (Math.abs(audio.currentTime - newTime) < 0.1) {
        isSeeking.current = false;
        audio.removeEventListener("timeupdate", onSeekComplete);
      }
    };
    audio.addEventListener("timeupdate", onSeekComplete);
    setTimeout(() => {
      isSeeking.current = false;
      audio.removeEventListener("timeupdate", onSeekComplete);
    }, 1000);
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef?.current) audioRef.current.volume = v;
  };

  const handlePrev = () => {
    const audio = audioRef?.current;
    console.log("audio:", audio);
    console.log("currentTime:", audio?.currentTime);
    if (!audio) return;
    if (audio.currentTime > 3) {
      console.log("REBOBINANDO");
      audio.currentTime = 0;
      setProgress(0);
      setCurrentTime(0);
    } else {
      console.log("CANCION ANTERIOR");
      onPrev?.();
    }
  };

  if (!track) return null;

  const accent = track.accent || "#00c9b1";
  const coverSrc = track.cover_image
    ? track.cover_image.startsWith("http") ? track.cover_image : `${BASE}${track.cover_image}`
    : "/placeholder.jpg";

  const btnStyle = {
    color: "rgba(255,255,255,0.4)",
    width: 32,
    height: 32,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s",
    borderRadius: "50%",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        .pb-syne { font-family: 'Syne', sans-serif; }
        .pb-mono { font-family: 'Space Mono', monospace; }
        @keyframes pbDot { from{transform:scaleY(0.3)} to{transform:scaleY(1)} }
        .pb-skip:hover { color: #fff !important; }
      `}</style>

      <div className="fixed bottom-0 left-0 right-0 z-50"
        style={{ background: "rgba(10,10,14,0.92)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderTop: `1px solid ${accent}22` }}
      >
        <div ref={progressRef} onClick={handleSeek}
          className="w-full h-1 cursor-pointer relative"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <div className="h-full transition-all duration-100" style={{ width: `${progress * 100}%`, background: accent }} />
          <div className="absolute top-1/2 w-3 h-3 rounded-full"
            style={{ left: `${progress * 100}%`, background: accent, transform: "translateX(-50%) translateY(-50%)" }}
          />
        </div>

        <div className="flex items-center justify-between px-4 sm:px-8 py-3">
          {/* LEFT — portada + título */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <Link to={`/track/${track.id}`} className="absolute inset-0 z-10" />
              <img src={coverSrc} className="w-11 h-11 rounded-lg object-cover"
                style={{ border: `1px solid ${accent}33` }}
              />
              {isPlaying && (
                <div className="absolute inset-0 rounded-lg flex items-end justify-center gap-0.5 pb-1"
                  style={{ background: "rgba(0,0,0,0.45)" }}
                >
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-0.5 rounded-full"
                      style={{ height: "8px", background: accent, animation: `pbDot ${0.4 + i * 0.15}s ease-in-out infinite alternate` }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="pb-syne text-sm font-bold text-white truncate leading-tight">{track.title}</p>
              <Link to={`/artist/${track.owner?.username}`}
                className="pb-mono text-[10px] truncate mt-0.5 no-underline hover:underline block"
                style={{ color: accent }}
              >
                {track.owner?.username || "Artista"}
              </Link>
            </div>
          </div>

          {/* CENTER — prev / play / next */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="pb-skip" style={btnStyle} onClick={handlePrev} aria-label="Rebobinar">
              <PrevIcon />
            </button>

            <button onClick={onTogglePlay}
              className="flex items-center justify-center rounded-full border-none cursor-pointer transition-all duration-200"
              style={{ width: "44px", height: "44px", background: accent, color: "#0f0f12", boxShadow: `0 0 20px ${accent}55` }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            <button className="pb-skip" style={btnStyle} onClick={onNext} aria-label="Siguiente canción">
              <NextIcon />
            </button>
          </div>

          {/* RIGHT — like + volumen + tiempo */}
          <div className="flex-1 flex items-center justify-end gap-3">
            <LikeButton trackId={track.id} initialLiked={track.user_has_favorited} initialCount={track.favorites_count} />

            <div className="hidden sm:flex items-center gap-2">
              <span style={{ color: volume === 0 ? "rgba(255,255,255,0.3)" : accent }}>
                {volume === 0 ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                )}
              </span>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolume}
                style={{ width: "72px", accentColor: accent, cursor: "pointer" }}
              />
            </div>

            <span className="hidden sm:block pb-mono text-[10px] text-white/30">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}