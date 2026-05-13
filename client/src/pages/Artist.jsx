import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import TrackCard from "../components/TrackCard";
import { usePlayer } from "../context/PlayerContext";

export default function Artist() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const { handlePlay, isTrackActive } = usePlayer();

  const token = localStorage.getItem("access");
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isOwn = currentUser?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`artist/${username}/`);
        setProfile(res.data);
      } catch {
        setError("Usuario no encontrado");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    try {
      const res = await api.post(`follows/toggle/${username}/`, {});
      setProfile((prev) => ({
        ...prev,
        is_following: res.data.following,
        followers_count: res.data.followers_count,
      }));
    } catch (err) {
      console.error(err.response?.data?.error || err.message);
    }
  };

  const handleDeleteTrack = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`tracks/${deleteModal.id}/`);
      setProfile((prev) => ({
        ...prev,
        tracks: prev.tracks.filter((t) => t.id !== deleteModal.id),
      }));
      setDeleteModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="mono text-[10px] text-white/30 uppercase tracking-widest">Cargando perfil</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <p className="syne text-2xl font-black text-white mb-2">404</p>
        <p className="text-white/40 text-sm mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="text-primary text-sm cursor-pointer bg-transparent border-none hover:underline">
          ← Volver
        </button>
      </div>
    </div>
  );

  const {
    user, display_name, avatar, banner, bio,
    followers_count, following_count, total_plays,
    is_following, tracks,
    instagram_url, twitter_url, youtube_url, soundcloud_url,
  } = profile;

  const socialLinks = [
    { url: instagram_url, label: "IG" },
    { url: twitter_url,   label: "TW" },
    { url: youtube_url,   label: "YT" },
    { url: soundcloud_url, label: "SC" },
  ].filter((s) => s.url);

  return (
    <div className="min-h-screen bg-bg text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'Space Mono', monospace; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .fu1{animation-delay:0.05s}.fu2{animation-delay:0.15s}.fu3{animation-delay:0.25s}.fu4{animation-delay:0.35s}
      `}</style>

      {/* BANNER */}
      <div className="relative w-full h-52 md:h-72 overflow-hidden">
        {banner ? (
          <img src={banner} className="w-full h-full object-cover" alt="banner" />
        ) : (
          <div className="w-full h-full" style={{
            background: "linear-gradient(135deg, #0a1a18 0%, #0f0f12 50%, #0a0a1a 100%)",
          }}>
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, rgba(0,201,177,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(124,92,255,0.3) 0%, transparent 50%)",
            }} />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, #0f0f12 100%)" }} />
      </div>

      {/* PERFIL */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 -mt-16 relative z-10 pb-24">

        {/* avatar + info */}
        <div className="fu fu1 flex flex-col sm:flex-row sm:items-end gap-5 mb-8">
          <div className="flex-shrink-0">
            {avatar ? (
              <img
                src={avatar}
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover"
                style={{ border: "3px solid rgba(0,201,177,0.4)", boxShadow: "0 0 32px rgba(0,201,177,0.2)" }}
                alt="avatar"
              />
            ) : (
              <div
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-primary flex items-center justify-center"
                style={{ border: "3px solid rgba(0,201,177,0.4)", boxShadow: "0 0 32px rgba(0,201,177,0.2)" }}
              >
                <span className="syne text-4xl font-black text-bg">
                  {(display_name || user?.username)?.[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="syne text-2xl md:text-3xl font-black tracking-tight truncate">
                {display_name || user?.username}
              </h1>
              {isOwn && (
                <span
                  className="mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full text-bg"
                  style={{ background: "#00c9b1" }}
                >
                  Tú
                </span>
              )}
            </div>
            <p className="mono text-xs text-white/35 mb-3">@{user?.username}</p>
            {bio && <p className="text-sm text-white/55 leading-relaxed max-w-lg mb-3">{bio}</p>}
            {socialLinks.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {socialLinks.map(({ url, label }) => (
                  <a key={label} href={url} target="_blank" rel="noreferrer"
                    className="mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg no-underline transition-all duration-200"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,201,177,0.4)"; e.currentTarget.style.color = "#00c9b1"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            {isOwn ? (
              <button
                onClick={() => navigate("/settings")}
                className="px-5 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,201,177,0.4)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              >
                Editar perfil
              </button>
            ) : token ? (
              <button
                onClick={handleFollow}
                className="px-5 py-2 rounded-lg text-sm font-bold cursor-pointer border-none transition-all duration-200"
                style={{
                  background: is_following ? "rgba(255,255,255,0.06)" : "#00c9b1",
                  color: is_following ? "rgba(255,255,255,0.7)" : "#0f0f12",
                  border: is_following ? "1px solid rgba(255,255,255,0.1)" : "none",
                  boxShadow: is_following ? "none" : "0 0 20px rgba(0,201,177,0.3)",
                }}
              >
                {is_following ? "Siguiendo" : "Seguir"}
              </button>
            ) : null}
          </div>
        </div>

        {/* STATS */}
        <div
          className="fu fu2 flex gap-6 md:gap-10 mb-10 pb-8 flex-wrap"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {[
            { value: tracks?.length ?? 0,   label: "Tracks" },
            { value: followers_count ?? 0,   label: "Seguidores" },
            { value: following_count ?? 0,   label: "Siguiendo" },
            { value: total_plays ?? 0,       label: "Reproducciones" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="mono text-xl font-bold text-white">{value.toLocaleString()}</div>
              <div className="text-xs text-white/30 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* TRACKS */}
        <div className="fu fu3">
          <p className="mono text-[10px] text-primary uppercase tracking-widest mb-2">Discografía</p>
          <h2 className="syne text-2xl font-black tracking-tight mb-6">
            {isOwn ? "Tus tracks" : `Tracks de ${display_name || user?.username}`}
          </h2>

          {tracks?.length === 0 ? (
            <div
              className="py-16 text-center"
              style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", background: "rgba(255,255,255,0.02)" }}
            >
              <p className="text-white/25 text-sm">
                {isOwn ? "Aún no has subido ningún track." : "Este artista no tiene tracks públicos."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-3">
              {tracks.map((track) => (
                <div key={track.id} className="relative group">
                  <TrackCard
                    track={track}
                    onPlay={handlePlay}
                    isPlaying={isTrackActive(track)}
                  />
                  {isOwn && (
                    <button
                      onClick={() => setDeleteModal(track)}
                      className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-200"
                      style={{ background: "rgba(255,50,50,0.85)", color: "white", fontSize: 14 }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL BORRAR */}
      {deleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setDeleteModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: "#1a1a22", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="syne text-lg font-black text-white mb-1">¿Borrar track?</h3>
            <p className="text-sm text-white/40 mb-6">
              "<span className="text-white/70">{deleteModal.title}</span>" se eliminará permanentemente. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer border-none transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteTrack}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer border-none transition-all duration-200"
                style={{ background: "rgba(255,50,50,0.15)", color: "#ff5050", border: "1px solid rgba(255,50,50,0.3)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,50,50,0.25)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,50,50,0.15)"; }}
              >
                Sí, borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}