import { useRef } from "react";
import TrackCard from "./TrackCard";

export default function RecommendationRow({ rowKey, title, tag, tracks = [], onPlay, isPlaying }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <div className="mb-16">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-7 px-4 sm:px-0">
        <div className="flex items-center gap-3">
          {tag && (
            <span
              className="mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-bg"
              style={{ background: "#00c9b1" }}
            >
              {tag}
            </span>
          )}
          <h2 className="syne text-lg font-black tracking-tight text-white">{title}</h2>
        </div>

        <button className="mono text-[10px] text-white/30 hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none uppercase tracking-widest">
          Ver todo →
        </button>
      </div>

      {/* SLIDER */}
      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full items-center justify-center cursor-pointer border-none z-10 text-white/40 hover:text-white transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
        >‹</button>

        {/* 
          Patrón negative margin: el scroll container "escapa" del padding del padre
          en móvil (-mx-4 cancela el px-4 de Discover) y añade padding interno
          para que la primera card no quede pegada al borde
        */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            overflowY: "visible",
          }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          {tracks.map((track) => (
            <div key={track.id} className="flex-shrink-0 w-64 sm:w-72 pt-2">
              <TrackCard
                track={track}
                 onPlay={(t) => onPlay(t, tracks)}
                isPlaying={isPlaying(track)}
              />
            </div>
          ))}
          {/* Spacer final para que la última card no quede cortada */}
          <div className="flex-shrink-0 w-4 sm:hidden" />
        </div>
        {/* EMPTY STATE */}
        {tracks.length === 0 && (
          <p className="mono text-[10px] text-white/30 uppercase tracking-widest py-4 px-4 sm:px-0">
            Escucha y valora canciones para recibir recomendaciones personalizadas
          </p>
        )}

        <button
          onClick={() => scroll(1)}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full items-center justify-center cursor-pointer border-none z-10 text-white/40 hover:text-white transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
        >›</button>
      </div>
    </div>
  );
}