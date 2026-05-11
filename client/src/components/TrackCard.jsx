import { useState } from "react";
import { Link } from "react-router-dom";

function WaveformBar({ heights = [], accent = "#fff", playing }) {
  return (
    <div className="flex items-center gap-0.5 h-9">
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: "3px",
            height: `${Math.max(4, (h / 58) * 36)}px`,
            background: accent,
            borderRadius: "2px",
            opacity: playing ? 1 : 0.3,
            transition: "opacity 0.3s",
            animation: playing
              ? `srPulse${i % 4} ${0.4 + (i % 5) * 0.1}s ease-in-out infinite alternate`
              : "none",
          }}
        />
      ))}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <polygon points="3,1 13,7 3,13" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="2" y="1" width="4" height="12" rx="1" />
      <rect x="8" y="1" width="4" height="12" rx="1" />
    </svg>
  );
}

export default function TrackCard({ track, onPlay, isPlaying }) {
  const [hovered, setHovered] = useState(false);

  const accent = track.accent || "#00c9b1";
  const genreName = typeof track.genre === "string" ? track.genre : track.genre?.name ?? "Unknown";
  const artistName = track.owner?.username ?? "Unknown";
  const coverSrc = track.cover_image
  ? track.cover_image.startsWith("http")
    ? track.cover_image
    : `http://127.0.0.1:8000${track.cover_image}`
  : "/placeholder.jpg";

  return (
    <>
      <style>{`
        @keyframes srPulse0 { from{height:55%} to{height:100%} }
        @keyframes srPulse1 { from{height:35%} to{height:80%} }
        @keyframes srPulse2 { from{height:65%} to{height:95%} }
        @keyframes srPulse3 { from{height:45%} to{height:85%} }
        @keyframes srDot { from{transform:scaleY(0.4)} to{transform:scaleY(1)} }
      `}</style>

      {/* CARD */}
      <div
        className="relative rounded-2xl p-5 overflow-hidden cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          border: `1px solid ${hovered ? accent + "55" : "rgba(255,255,255,0.07)"}`,
          transform: hovered ? "translateY(-5px) scale(1.02)" : "none",
          boxShadow: hovered ? `0 16px 50px ${accent}22` : "none",
          transition: "0.3s",
        }}
      >

        {/* 🖼️ IMAGEN DE FONDO */}
        <img
          src={coverSrc}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.6s ease",
          }}
        />

        {/* 🌑 OVERLAY */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.85))",
          }}
        />

        {/* 📦 CONTENIDO */}
        <div className="relative z-10">

          {/* género */}
          <div className="flex justify-between mb-3">
            <span
              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
              style={{ color: accent, background: accent + "18" }}
            >
              {genreName}
            </span>
          </div>

          {/* waveform */}
          <WaveformBar
            heights={track.waveform || []}
            accent={accent}
            playing={isPlaying}
          />

          {/* info */}
          <h3 className="text-sm font-bold mt-3 text-white">
            {track.title}
          </h3>
          <p className="text-xs text-white/60">
            {artistName}
          </p>

          {/* acciones */}
          <div className="flex items-center gap-2 mt-4">

            {/* play */}
            <button
              onClick={() => onPlay(track)}
              className="w-9 h-9 flex items-center justify-center rounded-full transition cursor-pointer"
              style={{
                background: isPlaying ? accent : "rgba(255,255,255,0.1)",
                color: isPlaying ? "#000" : "#fff",
                boxShadow: isPlaying ? `0 0 14px ${accent}66` : "none",
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            {/* estado */}
            {isPlaying ? (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full"
                    style={{
                      height: "12px",
                      background: accent,
                      animation: `srDot ${0.4 + i * 0.15}s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
                <span
                  className="text-[10px] uppercase font-bold ml-1 "
                  style={{ color: accent }}
                >
                  Reproduciendo
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-white/30 uppercase flex-1">
                {track.duration || ""}
              </span>
            )}

            {/* ver */}
            <Link
              to={`/track/${track.id}`}
              className="text-[10px] px-3 py-1 rounded-lg border"
              style={{
                borderColor: accent + "44",
                color: accent,
              }}
            >
              Ver
            </Link>

          </div>
        </div>
      </div>
    </>
  );
}