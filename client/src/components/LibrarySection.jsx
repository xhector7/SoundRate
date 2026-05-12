import TrackCard from "./TrackCard";
import { usePlayer } from "../context/PlayerContext";

export default function LibrarySection({ title, tag, tracks = [], loading, emptyText }) {
  const { handlePlay, isTrackActive } = usePlayer();

  return (
    <div className="mb-14">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        {tag && (
          <span
            className="mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-bg"
            style={{ background: "#00c9b1" }}
          >
            {tag}
          </span>
        )}
        <h2 className="syne text-xl font-black tracking-tight text-white">{title}</h2>
      </div>

      {/* CONTENIDO */}
      {loading ? (
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-shrink-0 w-56 h-48 rounded-2xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <div className="py-12 text-center rounded-2xl"
          style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
        >
          <p className="text-white/25 text-sm">{emptyText}</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {tracks.map(track => (
            <div key={track.id} className="w-64 flex-shrink-0">
                <TrackCard
                key={track.id}
                track={track}
                onPlay={handlePlay}
                isPlaying={isTrackActive(track)}
                />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}