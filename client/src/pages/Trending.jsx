import { useEffect, useState } from "react";
import api from "../services/api";
import { usePlayer } from "../context/PlayerContext";
import { useNavigate } from "react-router-dom";

export default function Trending() {
  const [tracks, setTracks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [activeGenre, setActiveGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const { handlePlay, isTrackActive } = usePlayer();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("genres/?with_tracks=true").then((res) => setGenres(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = activeGenre ? `trending/?genre=${activeGenre}` : "trending/";
    api.get(url)
      .then((res) => setTracks(res.data.tracks || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeGenre]);

  const top3 = tracks.slice(0, 3);
  const rest = tracks.slice(3);

  const MEDAL = ["🥇", "🥈", "🥉"];
  const coverSrc = (track) =>
  track.cover_image
    ? track.cover_image.startsWith("http")
      ? track.cover_image
      : `${import.meta.env.VITE_API_URL}${track.cover_image}`
    : null;

  return (
    <div className="min-h-screen bg-bg text-white pt-24 pb-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'Space Mono', monospace; }
      `}</style>

      {/* HEADER */}
      <div className="px-4 sm:px-8 md:px-16 mb-10">
        <p className="mono text-[10px] text-primary uppercase tracking-widest mb-2">Charts</p>
        <h1 className="syne text-4xl md:text-5xl font-black tracking-tight mb-1">Tendencias</h1>
        <p className="text-sm text-white/30">Top 50 ordenado por plays y valoración</p>
      </div>

      {/* TABS GÉNEROS */}
      <div className="px-4 sm:px-8 md:px-16 mb-10">
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-2 w-8 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, #0f0f12, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-2 w-12 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, #0f0f12, transparent)" }} />
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setActiveGenre(null)}
              className="flex-shrink-0 mono text-[10px] uppercase tracking-widest px-4 py-2 rounded-full cursor-pointer border-none transition-all duration-200"
              style={{
                background: activeGenre === null ? "#00c9b1" : "rgba(255,255,255,0.06)",
                color: activeGenre === null ? "#0f0f12" : "rgba(255,255,255,0.5)",
              }}
            >
              🌍 Global
            </button>
            {genres.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGenre(g.slug)}
                className="flex-shrink-0 mono text-[10px] uppercase tracking-widest px-4 py-2 rounded-full cursor-pointer border-none transition-all duration-200"
                style={{
                  background: activeGenre === g.slug ? "#00c9b1" : "rgba(255,255,255,0.06)",
                  color: activeGenre === g.slug ? "#0f0f12" : "rgba(255,255,255,0.5)",
                }}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : tracks.length === 0 ? (
        <p className="text-white/30 text-sm py-16 text-center">No hay canciones en este ranking todavía.</p>
      ) : (
        <div className="px-4 sm:px-8 md:px-16">

          {/* TOP 3 — cards grandes */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 max-w-3xl mx-auto">
            {top3.map((track, i) => {
              const src = coverSrc(track);
              const isActive = isTrackActive(track);
              return (
                <div key={track.id} className="relative rounded-2xl overflow-hidden cursor-pointer group"
                  style={{ aspectRatio: "3/4" }}
                  onClick={() => navigate(`/track/${track.id}`)}
                >
                  {/* COVER */}
                  {src ? (
                    <img src={src} alt={track.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0" style={{ background: "rgba(0,201,177,0.1)" }} />
                  )}

                  {/* OVERLAY */}
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.92) 100%)" }}
                  />

                  {/* NÚMERO GRANDE */}
                  <div className="absolute top-2 left-3 syne font-black leading-none select-none"
                    style={{ fontSize: "clamp(40px, 8vw, 64px)", color: "rgba(255,255,255,0.15)" }}
                  >
                    {i + 1}
                  </div>

                  {/* MEDALLA */}
                  <div className="absolute top-2 right-2 text-lg">{MEDAL[i]}</div>

                  {/* INFO */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    {i === 0 && (
                      <div className="mono text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mb-1"
                        style={{ background: "#00c9b1", color: "#0f0f12" }}
                      >
                        #{i + 1}
                      </div>
                    )}
                    <p className="syne text-xs font-black text-white leading-tight truncate">{track.title}</p>
                    <p className="mono text-[9px] truncate mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                      @{track.owner?.username}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="mono text-[9px] font-bold" style={{ color: "#00c9b1" }}>
                        {track.average_rating ? Number(track.average_rating).toFixed(1) : "—"}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePlay(track); }}
                        className="w-7 h-7 rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-200"
                        style={{
                          background: isActive ? "#00c9b1" : "rgba(255,255,255,0.15)",
                          color: isActive ? "#0f0f12" : "white",
                        }}
                      >
                        {isActive ? (
                          <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor">
                            <rect x="2" y="1" width="4" height="12" rx="1" />
                            <rect x="8" y="1" width="4" height="12" rx="1" />
                          </svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor">
                            <polygon points="3,1 13,7 3,13" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* borde activo */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{ border: "1.5px solid #00c9b1" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* RESTO — lista compacta */}
          <div className="max-w-3xl mx-auto space-y-1">
            {rest.map((track, i) => {
              const src = coverSrc(track);
              const isActive = isTrackActive(track);
              return (
                <div
                  key={track.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
                  style={{
                    background: isActive ? "rgba(0,201,177,0.06)" : "transparent",
                    border: `1px solid ${isActive ? "rgba(0,201,177,0.2)" : "transparent"}`,
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  onClick={() => navigate(`/track/${track.id}`)}
                >
                  {/* posición */}
                  <span className="mono text-xs w-5 text-center flex-shrink-0"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                  >
                    {i + 4}
                  </span>

                  {/* cover */}
                  {src ? (
                    <img src={src} alt={track.title} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg flex-shrink-0" style={{ background: "rgba(0,201,177,0.1)" }} />
                  )}

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <p className="syne text-sm font-black truncate leading-tight text-white">{track.title}</p>
                    <p className="mono text-[9px] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
                      @{track.owner?.username} · {track.genre}
                    </p>
                  </div>

                  {/* stats */}
                  <div className="flex-shrink-0 text-right hidden sm:block">
                    <p className="mono text-xs font-bold" style={{ color: "#00c9b1" }}>
                      {track.average_rating ? Number(track.average_rating).toFixed(1) : "—"}
                    </p>
                    <p className="mono text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {track.plays.toLocaleString()} plays
                    </p>
                  </div>

                  {/* play */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePlay(track); }}
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-200"
                    style={{
                      background: isActive ? "#00c9b1" : "rgba(255,255,255,0.06)",
                      color: isActive ? "#0f0f12" : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {isActive ? (
                      <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor">
                        <rect x="2" y="1" width="4" height="12" rx="1" />
                        <rect x="8" y="1" width="4" height="12" rx="1" />
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor">
                        <polygon points="3,1 13,7 3,13" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}