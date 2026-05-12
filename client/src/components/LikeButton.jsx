import { useState, useEffect } from "react";
import api from "../services/api";
import { usePlayer } from "../context/PlayerContext";

export default function LikeButton({ trackId, initialLiked, initialCount, onLikeChange, size = "md" }) {
  const { setTrackLiked, getTrackLike } = usePlayer();
  const { liked, count } = getTrackLike(trackId, initialLiked, initialCount);
  const [loading, setLoading] = useState(false);
  const [pop, setPop] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("access");
    if (!token || loading) return;
    setLoading(true);

    try {
      if (liked) {
        await api.delete(`favorites/by-track/${trackId}/`);
        const newCount = count - 1;
        setTrackLiked(trackId, false, newCount);
        onLikeChange?.(false, newCount);
      } else {
        await api.post(`favorites/`, { track_id: parseInt(trackId) });
        const newCount = count + 1;
        setTrackLiked(trackId, true, newCount);
        setPop(true);
        setTimeout(() => setPop(false), 320);
        onLikeChange?.(true, newCount);
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLg = size === "lg";

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      aria-pressed={liked}
      aria-label="favorito"
      style={{
        position: "relative",
        cursor: loading ? "not-allowed" : "pointer",
        border: `1px solid ${liked ? "rgba(255,80,80,0.4)" : "rgba(255,80,80,0.15)"}`,
        borderRadius: isLg ? "50%" : "10px",
        background: liked ? "rgba(255,80,80,0.12)" : "rgba(255,80,80,0)",
        color: liked ? "#ff5050" : "rgba(255,80,80,0.35)",
        width: isLg ? 72 : 36,
        height: isLg ? 72 : 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: isLg ? 28 : 18,
        transition: "all 0.2s",
        transform: pop ? "scale(1.35)" : "scale(1)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {liked ? "♥" : "♡"}
    </button>
  );
}