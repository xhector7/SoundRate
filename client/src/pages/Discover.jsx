import { useState, useEffect } from "react";
import api from "../services/api";
import RecommendationRow from "../components/RecommendationRow";
import { usePlayer } from "../context/PlayerContext";

export default function Discover() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { handlePlay, isTrackActive } = usePlayer();

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access");

        const requests = [
          api.get("recommendations/trending/"),
          api.get("recommendations/seasonal/"),
          api.get("recommendations/emerging/"),
        ];

        if (token) {
          requests.push(api.get("recommendations/taste/"));
        }

        const responses = await Promise.allSettled(requests);
        const data = responses
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value?.data)
          .filter(Boolean);

        setRows(data);
      } catch (err) {
        console.error("Error loading recommendations:", err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-bg text-white px-4 sm:px-8 md:px-16 py-32">
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

      {loading ? (
        <p className="text-white/40">Cargando recomendaciones...</p>
      ) : (
        rows.map((row) => (
          <RecommendationRow
            key={row.key}
            rowKey={row.key}
            title={row.title}
            tag={row.tag}
            tracks={row.tracks}
            onPlay={(track, tracks) => handlePlay(track, tracks)}
            isPlaying={(track) => isTrackActive(track)}
          />
        ))
      )}
    </div>
  );
}