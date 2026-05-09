import { useRef } from "react";
import TrackCard from "./TrackCard";

const ROW_LABELS = {
  trending:  { label: "Trending ahora",         tag: "POPULAR" },
  summer:    { label: "Verano · Buenas vibras",  tag: "SEASONAL" },
  emerging:  { label: "Artistas emergentes",     tag: "NUEVO" },
  taste:     { label: "Para tu gusto",           tag: "PARA TI" },
};

export default function RecommendationRow({ rowKey = "trending", title, tracks, onPlay, playingId }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  const meta = ROW_LABELS[rowKey] || { label: title, tag: "DESTACADO" };

  return (
    <div className="mb-16">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-7">
        <div className="flex items-center gap-3">
          <span
            className="mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-bg"
            style={{ background: "#00c9b1" }}
          >
            {meta.tag}
          </span>
          <h2 className="syne text-lg font-black tracking-tight text-white">{meta.label}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* flechas */}
          <button
            onClick={() => scroll(-1)}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-none transition-all duration-200 text-white/40 hover:text-white"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            ‹
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-none transition-all duration-200 text-white/40 hover:text-white"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            ›
          </button>
          <button className="mono text-[10px] text-white/30 hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none uppercase tracking-widest ml-2">
            Ver todo →
          </button>
        </div>
      </div>

      {/* SLIDER */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-3"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
        {tracks.map((track) => (
          <div key={track.id} className="flex-shrink-0 w-72">
            <TrackCard
              track={track}
              onPlay={onPlay}
              isPlaying={playingId === track.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}