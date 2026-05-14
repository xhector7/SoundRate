import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/login/`, { username, password });
      
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/profiles/me/`, {
        headers: { Authorization: `Bearer ${res.data.access}` }
      });

      localStorage.setItem("user", JSON.stringify({
        username,
        avatar: profileRes.data.avatar
      }));

      navigate("/discover");
    } catch (err) {
      
      if (err.response?.status === 403) {
        setError(err.response.data.detail);
      } else {
        setError("Credenciales incorrectas");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-white flex items-center justify-center px-4 py-8 overflow-auto relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'Space Mono', monospace; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation: fadeUp 0.6s ease forwards; opacity: 0; }
        .fu1 { animation-delay: 0.05s } .fu2 { animation-delay: 0.15s }
        .fu3 { animation-delay: 0.25s } .fu4 { animation-delay: 0.35s }
        .fu5 { animation-delay: 0.45s }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #1a1a22 inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full" style={{ top:"10%", left:"5%", width:"400px", height:"400px", background:"radial-gradient(circle,rgba(0,201,177,0.07) 0%,transparent 70%)" }} />
        <div className="absolute rounded-full" style={{ bottom:"10%", right:"5%", width:"350px", height:"350px", background:"radial-gradient(circle,rgba(124,92,255,0.06) 0%,transparent 70%)" }} />
      </div>

      <div className="fu fu1 relative z-10 w-full max-w-sm rounded-2xl p-8 flex flex-col gap-6"
        style={{ background:"rgba(26,26,34,0.85)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)" }}
      >
        <div className="fu fu1 flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="#0f0f12" strokeWidth="1.8"/>
              <circle cx="9" cy="9" r="3" fill="#0f0f12"/>
            </svg>
          </div>
          <span className="mono text-sm font-bold text-white">
            Sound<span className="text-primary">Rate</span>
          </span>
        </div>

        <div className="fu fu2">
          <h1 className="syne text-2xl font-black tracking-tight mb-1">Bienvenido de nuevo</h1>
          <p className="text-sm text-muted">Inicia sesión para seguir escuchando</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="fu fu3 flex flex-col gap-1">
            <label className="mono text-[10px] uppercase tracking-widest text-muted">Usuario</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}
              placeholder="tu_usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onFocus={e => e.target.style.border="1px solid rgba(0,201,177,0.5)"}
              onBlur={e => e.target.style.border="1px solid rgba(255,255,255,0.08)"}
              required
            />
          </div>

          <div className="fu fu4 flex flex-col gap-1">
            <label className="mono text-[10px] uppercase tracking-widest text-muted">Contraseña</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200"
              style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={e => e.target.style.border="1px solid rgba(0,201,177,0.5)"}
              onBlur={e => e.target.style.border="1px solid rgba(255,255,255,0.08)"}
              required
            />
          </div>

          {error && <p className="text-red-400 text-xs px-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="fu fu5 mt-1 w-full py-3 rounded-xl text-sm font-bold text-bg bg-primary border-none cursor-pointer transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ boxShadow:"0 0 28px rgba(0,201,177,0.25)" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow="0 0 44px rgba(0,201,177,0.45)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow="0 0 28px rgba(0,201,177,0.25)"}
          >
            {loading ? "Entrando..." : "Entrar →"}
          </button>
        </form>

        <p className="fu fu5 text-center text-sm text-muted">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-primary font-semibold no-underline hover:underline">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}