import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Comments({ trackId }) {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await api.get(`comments/?track=${trackId}`);
        setComments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [trackId]);

  const handleComment = async () => {
    if (!token || !newComment.trim()) return;
    try {
      const res = await api.post(`comments/`, { track: trackId, content: newComment });
      setComments((prev) => [res.data, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`comments/${id}/`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <p className="mono text-[10px] text-white/30 uppercase tracking-widest mb-5">
        Comentarios · {comments.length}
      </p>

      {token ? (
        <div className="flex gap-3 mb-6">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
            placeholder="Escribe un comentario..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-all duration-200"
            style={{ fontFamily: "inherit" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(0,201,177,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
          />
          <button
            onClick={handleComment}
            className="px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer border-none transition-all duration-200"
            style={{ background: "#00c9b1", color: "#0f0f12" }}
          >
            →
          </button>
        </div>
      ) : (
        <p className="text-sm text-white/30 mb-6">
          <span
            onClick={() => navigate("/login")}
            className="text-primary cursor-pointer hover:underline"
          >
            Inicia sesión
          </span>{" "}
          para comentar
        </p>
      )}

      <div className="space-y-4">
        {loading && (
          <p className="mono text-[10px] text-white/20 uppercase tracking-widest">Cargando...</p>
        )}
        {!loading && comments.length === 0 && (
          <p className="text-sm text-white/20">Sin comentarios todavía.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3 group">
            <div
              className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden"
              style={{ background: "#00c9b1" }}
            >
              {c.user?.avatar ? (
                <img src={c.user.avatar} alt={c.user.username} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-[10px] font-black"
                  style={{ color: "#0f0f12" }}
                >
                  {c.user?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <Link
                  to={`/artist/${c.user?.username}`}
                  className="text-xs text-white/40 mb-0.5 hover:text-primary transition-colors no-underline block"
                >
                  @{c.user?.username}
                </Link>
                {c.user?.username === currentUser.username && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-transparent border-none p-1 rounded"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ff5050")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
                    title="Eliminar comentario"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-sm text-white/80">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}