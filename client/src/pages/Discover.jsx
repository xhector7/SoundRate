import { useState, useEffect } from "react";
import axios from "axios";
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
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const requests = [
          axios.get("http://127.0.0.1:8000/api/v1/recommendations/trending/", { headers }),
          axios.get("http://127.0.0.1:8000/api/v1/recommendations/seasonal/", { headers }),
          axios.get("http://127.0.0.1:8000/api/v1/recommendations/emerging/", { headers }),
        ];

        if (token) {
          requests.push(
            axios.get("http://127.0.0.1:8000/api/v1/recommendations/taste/", { headers })
          );
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
            onPlay={(track) => handlePlay(track)}
            isPlaying={(track) => isTrackActive(track)}     
          />
        ))
      )}
    </div>
  );
}