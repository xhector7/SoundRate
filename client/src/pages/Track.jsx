import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import Comments from "../components/Comments";

export default function Track() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handlePlay, isTrackActive } = usePlayer();

  const [track, setTrack] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [trackRes, relatedRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/v1/tracks/${id}/`, { headers }),
          axios.get(`http://127.0.0.1:8000/api/v1/tracks/${id}/related/`, { headers }),
        ]);
        setTrack(trackRes.data);
        setRelated(relatedRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleFavorite = async () => {
    if (!token) return;
    try {
      if (track.user_has_favorited) {
        const favRes = await axios.get(`http://127.0.0.1:8000/api/v1/favorites/?track=${id}`, { headers });
        const fav = favRes.data.find((f) => f.track === parseInt(id));
        if (fav) await axios.delete(`http://127.0.0.1:8000/api/v1/favorites/${fav.id}/`, { headers });
      } else {
        await axios.post(`http://127.0.0.1:8000/api/v1/favorites/`, { track: id }, { headers });
      }
      setTrack((prev) => ({
        ...prev,
        user_has_favorited: !prev.user_has_favorited,
        favorites_count: prev.user_has_favorited ? prev.favorites_count - 1 : prev.favorites_count + 1,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRate = async (score) => {
    if (!token) return;
    try {
      await axios.post(`http://127.0.0.1:8000/api/v1/ratings/`, { track: id, score }, { headers });
      setTrack((prev) => ({ ...prev, user_rating: score }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="mono text-xs text-white/30 uppercase tracking-widest">Cargando...</p>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="mono text-xs text-white/30 uppercase tracking-widest">Track no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-white pb-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'Space Mono', monospace; }
      `}</style>

      {/* HERO */}
      <div className="relative w-full h-72 md:h-96 overflow-hidden">
        {track.cover_image ? (
          <img
            src={track.cover_image}
            alt={track.title}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.35)" }}
          />
        ) : (
          <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #0f0f12 0%, #1a1a22 100%)" }} />
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 30%, #0f0f12 100%)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 md:px-16 pb-8">
          <p className="mono text-[10px] text-primary uppercase tracking-widest mb-2">{track.genre}</p>
          <h1 className="syne text-3xl md:text-5xl font-black tracking-tight leading-none mb-2">
            {track.title}
          </h1>
          <p className="text-sm text-white/50">
            por <span className="text-white/80 font-medium">@{track.owner?.username}</span>
          </p>
        </div>
      </div>

      {/* BODY */}
      <div className="px-4 sm:px-8 md:px-16 py-8 max-w-5xl mx-auto">

        {/* STATS + ACCIONES */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="syne text-xl font-black">{track.plays}</p>
              <p className="mono text-[9px] text-white/30 uppercase tracking-widest">Plays</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="syne text-xl font-black">
                {track.average_rating ? Number(track.average_rating).toFixed(1) : "—"}
              </p>
              <p className="mono text-[9px] text-white/30 uppercase tracking-widest">Rating</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="syne text-xl font-black">{track.comments_count}</p>
              <p className="mono text-[9px] text-white/30 uppercase tracking-widest">Comentarios</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="syne text-xl font-black">{track.favorites_count}</p>
              <p className="mono text-[9px] text-white/30 uppercase tracking-widest">Favs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePlay(track)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 border-none cursor-pointer"
              style={{
                background: isTrackActive(track) ? "#00c9b1" : "rgba(0,201,177,0.15)",
                color: isTrackActive(track) ? "#0f0f12" : "#00c9b1",
                border: "1px solid rgba(0,201,177,0.3)",
              }}
            >
              {isTrackActive(track) ? "▐▐ Reproduciendo" : "▶ Reproducir"}
            </button>

            {token && (
              <button
                onClick={handleFavorite}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border-none text-lg"
                style={{
                  background: track.user_has_favorited ? "rgba(255,80,80,0.15)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${track.user_has_favorited ? "rgba(255,80,80,0.4)" : "rgba(255,255,255,0.1)"}`,
                  color: track.user_has_favorited ? "#ff5050" : "rgba(255,255,255,0.4)",
                }}
              >
                {track.user_has_favorited ? "♥" : "♡"}
              </button>
            )}
          </div>
        </div>

        {/* RATING STARS */}
        {token && (
          <div className="mb-10">
            <p className="mono text-[10px] text-white/30 uppercase tracking-widest mb-3">Tu valoración</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star * 2)}
                  className="text-2xl transition-all duration-150 cursor-pointer bg-transparent border-none"
                  style={{ color: star * 2 <= (track.user_rating || 0) ? "#00c9b1" : "rgba(255,255,255,0.15)" }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        )}

        {/* GRID — comentarios + relacionadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <Comments trackId={id} />
          </div>

          <div>
            <p className="mono text-[10px] text-white/30 uppercase tracking-widest mb-5">Relacionadas</p>
            <div className="space-y-3">
              {related.length === 0 && (
                <p className="text-sm text-white/20">Sin tracks relacionadas.</p>
              )}
              {related.map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/track/${t.id}`)}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0,201,177,0.25)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
                >
                  {t.cover_image ? (
                    <img src={t.cover_image} alt={t.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: "rgba(0,201,177,0.1)" }} />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{t.title}</p>
                    <p className="mono text-[9px] text-white/30 truncate">{t.plays} plays</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}