import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password1: "",  // Cambiado de "password" a "password1"
    password2: "",  // Nuevo campo para confirmar contraseña
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Para mensaje de éxito

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validar que las contraseñas coincidan
    if (form.password1 !== form.password2) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      // Usar el endpoint de dj_rest_auth para registro
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/registration/`,
        {
          username: form.username,
          email: form.email,
          password1: form.password1,
          password2: form.password2,
        }
      );

      // Mostrar mensaje de éxito
      setSuccess("✅ ¡Registro exitoso! Revisa tu correo para verificar tu cuenta.");
      
      // Limpiar formulario
      setForm({
        username: "",
        email: "",
        password1: "",
        password2: "",
      });

      // Opcional: redirigir después de 3 segundos a la página de login
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      const response = err.response?.data;

      if (!response) {
        setError("Error de conexión con el servidor");
      } else if (typeof response === "string") {
        setError(response);
      } else {
        // Manejo de errores específicos de dj_rest_auth
        if (response.email) {
          setError("Email: " + response.email[0]);
        } else if (response.username) {
          setError("Usuario: " + response.username[0]);
        } else if (response.password1) {
          setError("Contraseña: " + response.password1[0]);
        } else if (response.non_field_errors) {
          setError(response.non_field_errors[0]);
        } else {
          const firstKey = Object.keys(response)[0];
          setError(response[firstKey]?.[0] || "Error al registrar usuario");
        }
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
    { name: "password1", type: "password", label: "Contraseña", placeholder: "••••••••" },
    { name: "password2", type: "password", label: "Confirmar contraseña", placeholder: "••••••••" },
  ];

  return (
    <div className="min-h-screen bg-bg text-white flex items-center justify-center px-4 py-8 overflow-auto relative">
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

          {success && (
            <p className="text-green-400 text-xs">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="fu fu5 mt-1 w-full py-3 rounded-xl text-sm font-bold text-bg bg-primary border-none cursor-pointer transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ boxShadow:"0 0 28px rgba(0,201,177,0.25)" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow="0 0 44px rgba(0,201,177,0.45)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow="0 0 28px rgba(0,201,177,0.25)"}
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