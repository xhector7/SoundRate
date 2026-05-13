import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import LibrarySection from "../components/LibrarySection";

export default function Library() {
  const token = localStorage.getItem("access");
  const [favorites, setFavorites] = useState([]);
  const [rated, setRated] = useState([]);
  const [loadingFav, setLoadingFav] = useState(true);
  const [loadingRated, setLoadingRated] = useState(true);

  useEffect(() => {
    if (!token) return;

    api.get("favorites/")
      .then(res => setFavorites(res.data.map(f => f.track).filter(Boolean)))
      .catch(() => {})
      .finally(() => setLoadingFav(false));

    api.get("ratings/")
      .then(res => setRated(res.data.map(r => ({ ...r.track, user_rating: r.score })).filter(Boolean)))
      .catch(() => {})
      .finally(() => setLoadingRated(false));
  }, [token]);

  if (!token) return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
          style={{ border: "1px solid rgba(0,201,177,0.2)" }}>
          <span className="text-3xl">♪</span>
        </div>
        <h2 className="syne text-2xl font-black tracking-tight mb-2">Tu biblioteca</h2>
        <p className="text-white/40 text-sm mb-8 max-w-xs mx-auto">
          Inicia sesión para ver tus favoritos y tracks valorados
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="no-underline">
            <button className="px-6 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
            >
              Entrar
            </button>
          </Link>
          <Link to="/register" className="no-underline">
            <button className="px-6 py-2.5 rounded-lg text-sm font-bold cursor-pointer border-none transition-all duration-200"
              style={{ background: "#00c9b1", color: "#0f0f12", boxShadow: "0 0 20px rgba(0,201,177,0.3)" }}
            >
              Registrarse
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-white px-6 md:px-16 py-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'Space Mono', monospace; }
      `}</style>

      {/* HEADER */}
      <div className="mb-12">
        <p className="mono text-[10px] text-primary uppercase tracking-widest mb-2">Tu espacio</p>
        <h1 className="syne text-4xl font-black tracking-tight mb-1">Biblioteca</h1>
        <p className="text-sm text-muted">Tus favoritos y valoraciones</p>
      </div>

      <LibrarySection
        title="Favoritos"
        tag="❤️"
        tracks={favorites}
        loading={loadingFav}
        emptyText="Aún no tienes tracks favoritos — dale ♥ a los que te gusten"
      />

      <LibrarySection
        title="Valorados"
        tag="★"
        tracks={rated}
        loading={loadingRated}
        emptyText="Aún no has valorado ningún track"
      />
    </div>
  );
}