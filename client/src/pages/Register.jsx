import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/register/`,
        form
      );

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/discover");
    } catch (err) {
      // 🔥 manejo real de errores DRF
      const response = err.response?.data;

      if (!response) {
        setError("Error de conexión con el servidor");
      } else if (typeof response === "string") {
        setError(response);
      } else {
        const firstKey = Object.keys(response)[0];
        setError(response[firstKey]?.[0] || "Error al registrar usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  const inputFocus = (e) =>
    (e.target.style.border = "1px solid rgba(0,201,177,0.5)");
  const inputBlur = (e) =>
    (e.target.style.border = "1px solid rgba(255,255,255,0.08)");

  const fields = [
    { name: "username", type: "text", label: "Usuario", placeholder: "tu_usuario" },
    { name: "email", type: "email", label: "Email", placeholder: "tu@email.com" },
    { name: "password", type: "password", label: "Contraseña", placeholder: "••••••••" },
  ];

  return (
    <div className="min-h-screen bg-bg text-white flex items-center justify-center px-4 overflow-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'Space Mono', monospace; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fu  { animation: fadeUp 0.6s ease forwards; opacity: 0; }
        .fu1 { animation-delay: 0.05s } .fu2 { animation-delay: 0.15s }
        .fu3 { animation-delay: 0.25s } .fu4 { animation-delay: 0.35s }
        .fu5 { animation-delay: 0.45s } .fu6 { animation-delay: 0.55s }
      `}</style>

      {/* ORBS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full" style={{ top:"10%", right:"5%", width:"400px", height:"400px", background:"radial-gradient(circle,rgba(0,201,177,0.07) 0%,transparent 70%)" }} />
        <div className="absolute rounded-full" style={{ bottom:"10%", left:"5%", width:"350px", height:"350px", background:"radial-gradient(circle,rgba(124,92,255,0.06) 0%,transparent 70%)" }} />
      </div>

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md rounded-2xl p-8 flex flex-col gap-5"
        style={{
          background: "rgba(26,26,34,0.85)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* logo */}
        <div className="fu fu1 flex items-center gap-2">
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
        {/* título */}
        <div className="fu fu2">
          <h1 className="syne text-2xl font-black tracking-tight mb-1">Crea tu cuenta</h1>
          <p className="text-sm text-muted">Empieza a descubrir y valorar música</p>
        </div>

       

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {fields.map((f, i) => (
            <div key={f.name} className={`fu fu${i + 1} flex flex-col gap-1`}>
              <label className="mono text-[10px] uppercase text-muted">
                {f.label}
              </label>
              <input
                name={f.name}
                type={f.type}
                value={form[f.name]}
                onChange={handleChange}
                onFocus={inputFocus}
                onBlur={inputBlur}
                placeholder={f.placeholder}
                required
                className="px-4 py-3 rounded-xl text-sm text-white outline-none"
                style={inputStyle}
              />
            </div>
          ))}

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 rounded-xl font-bold bg-primary text-black"
          >
            {loading ? "Creando..." : "Crear cuenta →"}
          </button>
        </form>

        <p className="text-sm text-center text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-primary">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}