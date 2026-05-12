import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import TrackCard from "../components/TrackCard";
import { usePlayer } from "../context/PlayerContext";

export default function Genre() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [genre, setGenre] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { handlePlay, isTrackActive } = usePlayer();

  useEffect(() => {
    const fetchGenre = async () => {
    setLoading(true);
    try {
        const genreRes = await api.get(`genres/?slug=${slug}`);
        
        
        if (genreRes.data.length === 0) {
        setLoading(false);
        return;
        }
        const genreData = genreRes.data[0];
        setGenre(genreData);

        const tracksRes = await api.get(`tracks/?genre=${genreData.id}`);

        setTracks(tracksRes.data);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        setLoading(false);
    }
    };
    fetchGenre();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!genre) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <p className="syne text-2xl font-black text-white mb-2">404</p>
          <p className="text-white/40 text-sm">Género no encontrado</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-6 text-primary text-sm cursor-pointer bg-transparent border-none hover:underline"
          >
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  const accent = "#00c9b1";

  return (
    <div className="min-h-screen bg-bg text-white pt-24 pb-16">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'Space Mono', monospace; }
      `}</style>

      {/* Header */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <div 
          className="w-full h-full"
          style={{
            background: `linear-gradient(135deg, ${accent}22 0%, #0f0f12 100%)`,
          }}
        >
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, ${accent}80 0%, transparent 50%)`,
          }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-8">
          <p className="mono text-[10px] uppercase tracking-widest mb-2" style={{ color: accent }}>
            GÉNERO
          </p>
          <h1 className="syne text-4xl md:text-6xl font-black tracking-tight">
            {genre.name}
          </h1>
        </div>
      </div>

      {/* Tracks */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        {tracks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-white/30">No hay canciones en este género aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onPlay={handlePlay}
                isPlaying={isTrackActive(track)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}