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
      <div className="flex justify-between items-center mb-7">
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll(-1)}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-none transition-all duration-200 text-white/40 hover:text-white"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >‹</button>
          <button
            onClick={() => scroll(1)}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-none transition-all duration-200 text-white/40 hover:text-white"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >›</button>
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
          overflowY: "visible",  // ← añade esto
        }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        {tracks.map((track) => (
          <div key={track.id} className="flex-shrink-0 w-72 pt-2">
            <TrackCard
              track={track}
              onPlay={onPlay}
              isPlaying={isPlaying(track)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}