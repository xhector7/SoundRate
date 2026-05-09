import { useState } from "react";
import { tracks } from "../services/tracks";
import RecommendationRow from "../components/RecommendationRow";

const ROWS = [
  { rowKey: "trending", slice: [0, 6] },
  { rowKey: "summer",   slice: [2, 8] },
  { rowKey: "emerging", slice: [1, 7] },
  { rowKey: "taste",    slice: [3, 9] },
];

export default function Discover() {
  const [playingId, setPlayingId] = useState(null);
  const handlePlay = (track) => setPlayingId(playingId === track.id ? null : track.id);

  return (
    <div className="min-h-screen bg-bg text-white px-16 py-32">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'Space Mono', monospace; }
      `}</style>

      <div className="mb-12">
        <p className="mono text-[10px] text-primary uppercase tracking-widest mb-2">Explorar</p>
        <h1 className="syne text-4xl font-black tracking-tight mb-1">Descubrir</h1>
        <p className="text-sm text-muted">Música nueva, recomendaciones y tendencias para ti</p>
      </div>

      {ROWS.map(({ rowKey, slice }, i) => (
        <RecommendationRow
            key={rowKey}
            rowKey={rowKey}
            tracks={i === 0 ? [...tracks, ...tracks] : tracks.slice(...slice)}
            onPlay={handlePlay}
            playingId={playingId}
        />
        ))}
    </div>
  );
}