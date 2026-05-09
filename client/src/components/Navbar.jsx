import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    setUser(stored ? JSON.parse(stored) : null);
  }, [location.pathname]);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  const links = [
    { to: "/discover", label: "Descubrir" },
    { to: "/trending", label: "Tendencias" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 h-16 border-b border-white/5"
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

      {/* LINKS */}
      <div className="flex gap-8 items-center">
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

      {/* RIGHT */}
      <div className="flex gap-3 items-center">
        {user ? (
          <>
            <Link to="/profile" className="no-underline flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,201,177,0.4)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
            >
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-bg text-[10px] font-black">
                {user.username?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-white font-medium">{user.username}</span>
            </Link>
            <button
              onClick={logout}
              className="text-xs text-white/35 hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none"
            >
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
    </nav>
  );
}
