import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import TrackCard from "../components/TrackCard";
import { tracks } from "../services/tracks";

const stats = [
  { value: "2.4M+", label: "Tracks valorados" },
  { value: "180K",  label: "Oyentes activos" },
  { value: "94%",   label: "Tasa de descubrimiento" },
];

export default function Home() {
  const [scrollY, setScrollY]   = useState(0);
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handlePlay = (track) => setPlayingId(playingId === track.id ? null : track.id);
  const featured = tracks.slice(0, 4);

  return (
    <div className="min-h-screen bg-bg text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatA  { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(3deg)} }
        @keyframes floatB  { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(-2deg)} }
        .fu  { animation: fadeUp 0.75s ease forwards; opacity: 0; }
        .fu1 { animation-delay: 0.05s }
        .fu2 { animation-delay: 0.18s }
        .fu3 { animation-delay: 0.32s }
        .fu4 { animation-delay: 0.46s }
        .fu5 { animation-delay: 0.60s }
        .syne { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'Space Mono', monospace; }
      `}</style>

      {/* ORBS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full"
          style={{ top:"8%", left:"12%", width:"480px", height:"480px", background:"radial-gradient(circle,rgba(0,201,177,0.09) 0%,transparent 70%)", transform:`translateY(${scrollY*0.12}px)`, animation:"floatA 9s ease-in-out infinite" }}
        />
        <div className="absolute rounded-full"
          style={{ top:"28%", right:"8%", width:"380px", height:"380px", background:"radial-gradient(circle,rgba(124,92,255,0.07) 0%,transparent 70%)", transform:`translateY(${scrollY*0.08}px)`, animation:"floatB 11s ease-in-out infinite" }}
        />
        <div className="absolute rounded-full"
          style={{ bottom:"12%", left:"28%", width:"320px", height:"320px", background:"radial-gradient(circle,rgba(0,201,177,0.05) 0%,transparent 70%)", animation:"floatA 13s ease-in-out infinite reverse" }}
        />
      </div>

      {/* ── HERO, contenedor principal ── */}
      <section className="relative z-10 min-h-[70vh] flex flex-col justify-center px-10 pt-32 pb-20 max-w-7xl mx-auto">

        {/* pill */}
        <div className="mono fu fu1 inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7 w-fit text-[10px] tracking-widest uppercase text-primary"
          style={{ background:"rgba(0,201,177,0.1)", border:"1px solid rgba(0,201,177,0.28)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          Plataforma de descubrimiento musical
        </div>

        {/* headline */}
        <h1 className="syne fu fu2 font-black leading-none mb-6 tracking-tight"
          style={{ fontSize:"clamp(2.8rem,7.5vw,6rem)" }}
        >
          Tu gusto,<br />
          <span style={{ WebkitTextStroke:"2px #00c9b1", color:"transparent" }}>cuantificado.</span>
        </h1>

        <p className="fu fu3 text-lg text-muted max-w-md leading-relaxed mb-9">
          Valora canciones. Descubre obsesiones. Construye un perfil que hable por ti mejor que cualquier playlist.
        </p>

        {/* CTAs */}
        <div className="fu fu4 flex gap-3 items-center flex-wrap">
          <Link to="/register" className="no-underline">
            <button
              className="bg-primary text-bg font-bold px-8 py-3.5 rounded-xl text-sm cursor-pointer border-none transition-all duration-200 hover:scale-105"
              style={{ boxShadow:"0 0 36px rgba(0,201,177,0.3)" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow="0 0 56px rgba(0,201,177,0.5)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow="0 0 36px rgba(0,201,177,0.3)"}
            >
              Empieza gratis →
            </button>
          </Link>
          <Link to="/discover" className="no-underline">
            <button className="bg-transparent text-white/55 font-medium px-7 py-3.5 rounded-xl text-sm cursor-pointer transition-all duration-200 hover:text-white hover:border-white/40"
              style={{ border:"1px solid rgba(255,255,255,0.14)" }}
            >
              Explorar tracks
            </button>
          </Link>
        </div>

        {/* stats */}
        <div className="fu fu5 flex gap-10 mt-14 pt-8 flex-wrap"
          style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}
        >
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div className="mono text-2xl font-bold text-white tracking-tight">{value}</div>
              <div className="text-xs text-white/30 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRENDING ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-10 pb-24">
        <div className="flex justify-between items-baseline mb-7">
          <div>
            <p className="mono text-[10px] text-primary uppercase tracking-widest mb-1.5">Ahora mismo</p>
            <h2 className="syne text-3xl font-black tracking-tight">Lo más escuchado</h2>
          </div>
          <Link to="/trending" className="no-underline text-sm text-white/35 hover:text-white transition-colors duration-200">
            Ver todo →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {featured.map(track => (
            <TrackCard key={track.id} track={track} onPlay={handlePlay} isPlaying={playingId === track.id} />
          ))}
        </div>
      </section>

      {/* ── CTA FINAL, especia d footer q incita a registrarse ── */}
      <section className="relative z-10 mx-10 mb-16 rounded-2xl p-14 text-center overflow-hidden"
        style={{ background:"linear-gradient(135deg,#001a18 0%,#0f0f12 50%,#00100e 100%)", border:"1px solid rgba(0,201,177,0.18)" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(0,201,177,0.09) 0%,transparent 70%)" }}
        />
        <p className="mono text-[10px] text-primary uppercase tracking-widest mb-4">Únete a la comunidad</p>
        <h2 className="syne font-black tracking-tight mb-4"
          style={{ fontSize:"clamp(1.6rem,4vw,2.8rem)" }}
        >
          Tu próxima canción favorita<br />está a una valoración de distancia.
        </h2>
        <p className="text-white/38 text-base mb-8">
          Únete a 180K oyentes que están definiendo lo que suena mañana.
        </p>
        <Link to="/register" className="no-underline">
          <button
            className="bg-primary text-bg font-bold px-10 py-3.5 rounded-xl text-sm cursor-pointer border-none transition-all duration-200 hover:scale-105"
            style={{ boxShadow:"0 0 36px rgba(0,201,177,0.3)" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow="0 0 56px rgba(0,201,177,0.5)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow="0 0 36px rgba(0,201,177,0.3)"}
          >
            Crear cuenta gratis →
          </button>
        </Link>
      </section>
    </div>
  );
}