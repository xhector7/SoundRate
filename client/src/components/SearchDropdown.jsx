import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function SearchDropdown() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ tracks: [], artists: [], genres: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ tracks: [], artists: [], genres: [] });
      setIsOpen(false);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      setIsOpen(true);
      try {
        const res = await api.get(`search/?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar..."
        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary w-56"
      />

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-[#1a1a1f] rounded-lg border border-white/10 shadow-xl z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-white/40 text-sm">Buscando...</div>
          )}

          {!loading && results.artists.length === 0 && results.tracks.length === 0 && results.genres.length === 0 && query && (
            <div className="p-4 text-center text-white/40 text-sm">No hay resultados</div>
          )}

          {/* Artistas */}
          {results.artists.length > 0 && (
            <div className="p-2">
              <p className="text-[9px] uppercase tracking-widest text-white/30 px-2 mb-1">Artistas</p>
              {results.artists.map((artist) => (
                <Link
                  key={artist.id}
                  to={`/artist/${artist.username}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold">{artist.username[0].toUpperCase()}</span>
                  </div>
                  <span className="text-sm">@{artist.username}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Géneros */}
          {results.genres.length > 0 && (
            <div className="p-2 border-t border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-white/30 px-2 mb-1">Géneros</p>
              <div className="flex flex-wrap gap-1 px-2">
                {results.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    to={`/genre/${genre.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tracks */}
          {results.tracks.length > 0 && (
            <div className="p-2 border-t border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-white/30 px-2 mb-1">Canciones</p>
              {results.tracks.map((track) => (
                <Link
                  key={track.id}
                  to={`/track/${track.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <img src={track.cover_image} alt={track.title} className="w-8 h-8 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{track.title}</p>
                    <p className="text-[10px] text-white/40 truncate">{track.owner?.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}