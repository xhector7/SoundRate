import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Upload() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [genres, setGenres] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    genre: "",
    is_public: true,
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [audioName, setAudioName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!token) navigate("/login");
  }, []);

  useEffect(() => {
    api.get("genres/").then(res => setGenres(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAudio = (file) => {
    if (!file) return;
    setAudioFile(file);
    setAudioName(file.name);
  };

  const handleCover = (file) => {
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("audio/")) handleAudio(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) { setError("El audio es obligatorio"); return; }
    if (!form.title.trim()) { setError("El título es obligatorio"); return; }

    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append("title", form.title);
    data.append("description", form.description);
    data.append("is_public", form.is_public);
    data.append("audio_file", audioFile);
    if (form.genre) data.append("genre", form.genre);
    if (coverFile) data.append("cover_image", coverFile);

    try {
      
      await api.post("tracks/", data, { headers: { "Content-Type": "multipart/form-data" } });
      console.log("Upload payload:", Object.fromEntries(data));
      navigate(`/artist/${JSON.parse(localStorage.getItem("user"))?.username}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al subir el track");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    outline: "none",
    color: "#fff",
    width: "100%",
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    transition: "border-color 0.2s",
  };
  const focusInput = (e) => e.target.style.borderColor = "rgba(0,201,177,0.5)";
  const blurInput  = (e) => e.target.style.borderColor = "rgba(255,255,255,0.08)";

  return (
    <div className="min-h-screen bg-bg text-white px-6 md:px-10 py-28 max-w-3xl mx-auto">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .mono { font-family: 'Space Mono', monospace; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .fu1{animation-delay:0.05s}.fu2{animation-delay:0.15s}.fu3{animation-delay:0.25s}
        select option { background: #1a1a22; color: #fff; }
      `}</style>

      {/* HEADER */}
      <div className="fu fu1 mb-10">
        <p className="mono text-[10px] text-primary uppercase tracking-widest mb-2">Nueva subida</p>
        <h1 className="syne text-4xl font-black tracking-tight">Sube tu track</h1>
        <p className="text-sm text-muted mt-2">Comparte tu música con la comunidad</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">

        {/* ZONA DE AUDIO — drag & drop */}
        <div className="fu fu1">
          <label className="mono text-[10px] uppercase tracking-widest text-muted block mb-3">
            Archivo de audio *
          </label>
          <div
            onClick={() => audioInputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className="w-full rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 py-12"
            style={{
              border: `2px dashed ${dragOver ? "#00c9b1" : audioFile ? "rgba(0,201,177,0.4)" : "rgba(255,255,255,0.1)"}`,
              background: dragOver ? "rgba(0,201,177,0.04)" : audioFile ? "rgba(0,201,177,0.03)" : "rgba(255,255,255,0.02)",
            }}
          >
            {audioFile ? (
              <>
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-bg text-xl">♪</div>
                <p className="text-sm font-semibold text-white truncate max-w-xs">{audioName}</p>
                <p className="mono text-[10px] text-primary uppercase tracking-widest">Cambiar archivo</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl text-white/20"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}>↑</div>
                <p className="text-sm text-white/50">Arrastra tu audio aquí o <span className="text-primary">selecciona</span></p>
                <p className="mono text-[10px] text-white/20 uppercase tracking-widest">MP3, WAV, FLAC, AAC</p>
              </>
            )}
          </div>
          <input ref={audioInputRef} type="file" accept="audio/*" className="hidden"
            onChange={e => handleAudio(e.target.files[0])} />
        </div>

        {/* DOS COLUMNAS — cover + campos */}
        <div className="fu fu2 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-6">

          {/* COVER */}
          <div>
            <label className="mono text-[10px] uppercase tracking-widest text-muted block mb-3">Cover</label>
            <div
              onClick={() => coverInputRef.current.click()}
              className="w-full aspect-square rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 relative"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: coverPreview ? "transparent" : "rgba(255,255,255,0.02)",
              }}
            >
              {coverPreview ? (
                <img src={coverPreview} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/20">
                  <span className="text-3xl">🖼</span>
                  <span className="mono text-[9px] uppercase tracking-widest">Añadir</span>
                </div>
              )}
              {coverPreview && (
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="mono text-[10px] text-white uppercase tracking-widest">Cambiar</span>
                </div>
              )}
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleCover(e.target.files[0])} />
          </div>

          {/* CAMPOS */}
          <div className="flex flex-col gap-4">

            <div>
              <label className="mono text-[10px] uppercase tracking-widest text-muted block mb-2">Título *</label>
              <input
                name="title" value={form.title} onChange={handleChange}
                placeholder="Nombre del track"
                style={inputStyle} onFocus={focusInput} onBlur={blurInput}
              />
            </div>

            <div>
              <label className="mono text-[10px] uppercase tracking-widest text-muted block mb-2">Género</label>
              <select
                name="genre" value={form.genre} onChange={handleChange}
                style={inputStyle} onFocus={focusInput} onBlur={blurInput}
              >
                <option value="">Sin género</option>
                {genres.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* toggle público */}
            <div className="flex items-center gap-3 mt-1">
              <div
                onClick={() => setForm(f => ({ ...f, is_public: !f.is_public }))}
                className="w-11 h-6 rounded-full cursor-pointer transition-all duration-200 relative flex-shrink-0"
                style={{ background: form.is_public ? "#00c9b1" : "rgba(255,255,255,0.1)" }}
              >
                <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                  style={{ left: form.is_public ? "24px" : "4px" }}
                />
              </div>
              <span className="text-sm text-white/60">
                {form.is_public ? "Público" : "Privado"}
              </span>
            </div>
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div className="fu fu3">
          <label className="mono text-[10px] uppercase tracking-widest text-muted block mb-3">Descripción</label>
          <textarea
            name="description" value={form.description} onChange={handleChange}
            placeholder="Cuéntanos algo sobre este track..."
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
            onFocus={focusInput} onBlur={blurInput}
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm px-1">{error}</p>
        )}

        {/* BOTONES */}
        <div className="fu fu3 flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
          >
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="px-8 py-3 rounded-xl text-sm font-bold cursor-pointer border-none transition-all duration-200 disabled:opacity-50"
            style={{ background: "#00c9b1", color: "#0f0f12", boxShadow: "0 0 28px rgba(0,201,177,0.3)" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 44px rgba(0,201,177,0.5)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 28px rgba(0,201,177,0.3)"}
          >
            {loading ? "Subiendo..." : "Publicar track →"}
          </button>
        </div>
      </form>
    </div>
  );
}