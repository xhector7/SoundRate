import { useState } from "react";
import { Link } from "react-router-dom";

function WaveformBar({ heights, accent, playing }) {
  return (
    <div className="flex items-center gap-0.5 h-9">
      {heights.map((h, i) => (
        <div key={i} style={{
          width: "3px",
          height: `${Math.max(4, (h / 58) * 36)}px`,
          background: accent,
          borderRadius: "2px",
          opacity: playing ? 1 : 0.3,
          transition: "opacity 0.3s",
          animation: playing ? `srPulse${i % 4} ${0.4 + (i % 5) * 0.1}s ease-in-out infinite alternate` : "none",
        }} />
      ))}
    </div>
  );
}

export default function TrackCard({ track, onPlay, isPlaying }) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <style>{`
        @keyframes srPulse0 { from{height:55%} to{height:100%} }
        @keyframes srPulse1 { from{height:35%} to{height:80%} }
        @keyframes srPulse2 { from{height:65%} to{height:95%} }
        @keyframes srPulse3 { from{height:45%} to{height:85%} }
      `}</style>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative rounded-2xl p-5 overflow-hidden transition-all duration-300 cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${track.color} 0%, rgba(15,15,18,0.95) 100%)`,
          border: `1px solid ${hovered ? track.accent + "55" : "rgba(255,255,255,0.07)"}`,
          transform: hovered ? "translateY(-5px) scale(1.02)" : "translateY(0) scale(1)",
          boxShadow: hovered ? `0 16px 50px ${track.accent}22` : "none",
          transition: "transform 0.3s cubic-bezier(.34,1.56,.64,1), border-color 0.3s, box-shadow 0.3s",
        }}
      >
        {/* glow */}
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none transition-opacity duration-300"
          style={{ background: track.accent, opacity: hovered ? 0.1 : 0.04, filter: "blur(30px)" }}
        />

        {/* género + rating */}
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
            style={{ color: track.accent, background: track.accent + "18" }}
          >
            {track.genre}
          </span>
          <div className="text-right">
            <div className="text-lg font-black text-white leading-none">{track.rating}</div>
            <div className="text-[10px] text-white/30 mt-0.5">{track.reviews} votos</div>
          </div>
        </div>

        {/* waveform */}
        <div className="mb-3">
          <WaveformBar heights={track.waveform} accent={track.accent} playing={isPlaying} />
        </div>

        {/* info */}
        <h3 className="text-sm font-bold text-white mb-1">{track.title}</h3>
        <p className="text-xs text-white/40 mb-4">{track.artist}</p>

        {/* acciones */}
        <div className="flex gap-2">
          <button
            onClick={() => onPlay && onPlay(track)}
            className="flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer border-none transition-all duration-200"
            style={{
              background: isPlaying ? track.accent : "rgba(255,255,255,0.08)",
              color: isPlaying ? "#0f0f12" : "#fff",
            }}
          >
            {isPlaying ? "⏸ Pausa" : "▶ Play"}
          </button>
          <Link to={`/track/${track.id}`} className="flex-1">
            <button className="w-full py-1.5 rounded-lg text-xs font-bold cursor-pointer bg-transparent transition-all duration-200"
              style={{ border: `1px solid ${track.accent}55`, color: track.accent }}
            >
              Ver →
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}