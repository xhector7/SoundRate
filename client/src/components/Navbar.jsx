import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../services/api";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Estados del buscador
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ tracks: [], artists: [], genres: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    setUser(stored ? JSON.parse(stored) : null);
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setQuery("");
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ tracks: [], artists: [], genres: [] });
      setSearchOpen(false);
      return;
    }

    const delay = setTimeout(async () => {
      setSearchLoading(true);
      setSearchOpen(true);
      try {
        const res = await api.get(`search/?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  const links = [
    { to: "/discover", label: "Descubrir" },
    { to: "/trending", label: "Tendencias" },
    { to: "/library", label: "Biblioteca" },
  ];

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 border-b border-white/5"
        style={{ background: "rgba(15,15,18,0.75)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
      >
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="#0f0f12" strokeWidth="1.8"/>
              <circle cx="9" cy="9" r="3" fill="#0f0f12"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Space Mono', monospace" }} className="text-sm font-bold text-white tracking-tight">
            Sound<span className="text-primary">Rate</span>
          </span>
        </Link>

        {/* BUSCADOR - desktop */}
        <div ref={searchRef} className="hidden md:block relative" style={{ width: "320px" }}>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar canciones, artistas..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>
          
          {searchOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1a1f] rounded-lg border border-white/10 shadow-xl z-50 max-h-96 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
              {searchLoading && (
                <div className="p-4 text-center text-white/40 text-sm">Buscando...</div>
              )}

              {!searchLoading && results.artists.length === 0 && results.tracks.length === 0 && results.genres.length === 0 && query && (
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
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{artist.username[0].toUpperCase()}</span>
                      </div>
                      <span className="text-sm text-white">@{artist.username}</span>
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
                        onClick={() => setSearchOpen(false)}
                        className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
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
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <img 
                        src={track.cover_image || "/placeholder.jpg"} 
                        alt={track.title} 
                        className="w-8 h-8 rounded object-cover" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{track.title}</p>
                        <p className="text-[10px] text-white/40 truncate">{track.owner?.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* LINKS — solo desktop */}
        <div className="hidden md:flex gap-8 items-center">
          {links.map(({ to, label }) => (
            <Link key={to} to={to}
              className="no-underline text-xs font-medium uppercase tracking-widest transition-colors duration-200"
              style={{ color: location.pathname === to ? "#00c9b1" : "rgba(255,255,255,0.45)" }}
              onMouseEnter={e => { if (location.pathname !== to) e.target.style.color = "#fff"; }}
              onMouseLeave={e => { if (location.pathname !== to) e.target.style.color = "rgba(255,255,255,0.45)"; }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* RIGHT — desktop */}
        <div className="hidden md:flex gap-3 items-center">
          {user ? (
            <>
              {/* botón subir */}
              <Link to="/upload" className="no-underline">
                <button
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer border-none transition-all duration-200 hover:scale-105"
                  style={{ background: "rgba(0,201,177,0.12)", color: "#00c9b1", border: "1px solid rgba(0,201,177,0.25)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(0,201,177,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(0,201,177,0.12)"}
                >
                  <span style={{ fontSize: "14px", lineHeight: 1 }}>+</span> Subir
                </button>
              </Link>

              {/* avatar */}
              <Link to={`/artist/${user.username}`} className="no-underline flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,201,177,0.4)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
              >
                {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-bg text-[10px] font-black">
                  {user.username?.[0]?.toUpperCase()}
                </div>
              )}
                <span className="text-sm text-white font-medium">{user.username}</span>
              </Link>

              <button onClick={logout} className="text-xs text-white/35 hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="no-underline">
                <button className="bg-transparent border-none text-white/50 text-sm font-medium cursor-pointer px-3 py-1.5 transition-colors duration-200 hover:text-white">
                  Entrar
                </button>
              </Link>
              <Link to="/register" className="no-underline">
                <button
                  className="bg-primary border-none text-bg text-sm font-bold cursor-pointer px-5 py-2 rounded-lg transition-all duration-200 hover:opacity-85 hover:scale-105"
                  style={{ boxShadow: "0 0 20px rgba(0,201,177,0.25)" }}
                >
                  Registrarse
                </button>
              </Link>
            </>
          )}
        </div>

        {/* HAMBURGER */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden cursor-pointer bg-transparent border-none -mr-1"
          style={{ width: 36, height: 36, position: "relative" }}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <span style={{ display: "block", width: 20, height: 1.5, background: "white", borderRadius: 2, position: "absolute", top: "50%", left: "50%", marginLeft: -10, transition: "transform 0.2s ease, opacity 0.2s ease", transform: menuOpen ? "translateY(0) rotate(45deg)" : "translateY(-6px)" }} />
          <span style={{ display: "block", width: 20, height: 1.5, background: "white", borderRadius: 2, position: "absolute", top: "50%", left: "50%", marginLeft: -10, transition: "opacity 0.2s ease", opacity: menuOpen ? 0 : 1 }} />
          <span style={{ display: "block", width: 20, height: 1.5, background: "white", borderRadius: 2, position: "absolute", top: "50%", left: "50%", marginLeft: -10, transition: "transform 0.2s ease", transform: menuOpen ? "translateY(0) rotate(-45deg)" : "translateY(6px)" }} />
        </button>
      </nav>

      {/* MENU MÓVIL */}
      {menuOpen && (
        <div
          className="fixed top-16 left-0 right-0 z-40 flex flex-col gap-1 px-6 py-4 md:hidden"
          style={{ background: "rgba(15,15,18,0.97)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Buscador móvil */}
          <div className="mb-3">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar canciones, artistas..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
            {query && (
              <div className="mt-2 max-h-64 overflow-y-auto">
                {results.tracks.slice(0, 3).map((track) => (
                  <Link
                    key={track.id}
                    to={`/track/${track.id}`}
                    onClick={() => { setMenuOpen(false); setQuery(""); }}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <img src={track.cover_image || "/placeholder.jpg"} alt={track.title} className="w-8 h-8 rounded object-cover" />
                    <div>
                      <p className="text-sm text-white">{track.title}</p>
                      <p className="text-[10px] text-white/40">{track.owner?.username}</p>
                    </div>
                  </Link>
                ))}
                {results.artists.slice(0, 3).map((artist) => (
                  <Link
                    key={artist.id}
                    to={`/artist/${artist.username}`}
                    onClick={() => { setMenuOpen(false); setQuery(""); }}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{artist.username[0].toUpperCase()}</span>
                    </div>
                    <span className="text-sm text-white">@{artist.username}</span>
                  </Link>
                ))}
                {results.genres.slice(0, 3).map((genre) => (
                  <Link
                    key={genre.id}
                    to={`/genre/${genre.slug}`}
                    onClick={() => { setMenuOpen(false); setQuery(""); }}
                    className="inline-block px-2 py-1 m-1 rounded-full text-xs bg-primary/20 text-primary"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {links.map(({ to, label }) => (
            <Link key={to} to={to}
              className="no-underline text-sm font-medium py-3 border-b border-white/5"
              style={{ color: location.pathname === to ? "#00c9b1" : "rgba(255,255,255,0.6)" }}
            >
              {label}
            </Link>
          ))}

          <div className="flex flex-col gap-2 pt-3">
            {user ? (
              <>
                <Link to="/upload" className="no-underline py-3 text-sm font-bold border-b border-white/5" style={{ color: "#00c9b1" }}>
                  + Subir track
                </Link>
                <Link to={`/artist/${user.username}`} className="no-underline flex items-center gap-2 py-2">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-bg text-xs font-black">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-white font-medium">{user.username}</span>
                </Link>
                <button onClick={logout} className="text-sm text-white/40 cursor-pointer bg-transparent border-none text-left py-2">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="no-underline py-3 text-sm text-white/60">Entrar</Link>
                <Link to="/register" className="no-underline">
                  <button className="w-full bg-primary text-bg font-bold py-3 rounded-lg text-sm border-none cursor-pointer">
                    Registrarse
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}