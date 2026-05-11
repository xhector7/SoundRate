import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Comments({ trackId }) {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://127.0.0.1:8000/api/v1/comments/?track=${trackId}`,
          { headers }
        );
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
      const res = await axios.post(
        `http://127.0.0.1:8000/api/v1/comments/`,
        { track: trackId, text: newComment },
        { headers }
      );
      setComments((prev) => [res.data, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <p className="mono text-[10px] text-white/30 uppercase tracking-widest mb-5">
        Comentarios · {comments.length}
      </p>

      {/* INPUT */}
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

      {/* LISTA */}
      <div className="space-y-4">
        {loading && (
          <p className="mono text-[10px] text-white/20 uppercase tracking-widest">
            Cargando...
          </p>
        )}
        {!loading && comments.length === 0 && (
          <p className="text-sm text-white/20">Sin comentarios todavía.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div
              className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black"
              style={{ background: "#00c9b1", color: "#0f0f12" }}
            >
              {c.user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-white/40 mb-0.5">@{c.user?.username}</p>
              <p className="text-sm text-white/80">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}