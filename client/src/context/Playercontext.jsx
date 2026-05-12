import { createContext, useContext, useRef, useState, useCallback } from "react";
import api from "../services/api";

const PlayerContext = createContext(null);

const BASE = import.meta.env.VITE_API_URL;

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [likedTracks, setLikedTracks] = useState({});

  const setTrackLiked = useCallback((trackId, liked, count) => {
    setLikedTracks(prev => ({ ...prev, [trackId]: { liked, count } }));
  }, []);

  const getTrackLike = useCallback((trackId, fallbackLiked, fallbackCount) => {
    return likedTracks[trackId] ?? { liked: fallbackLiked, count: fallbackCount };
  }, [likedTracks]);

  const handlePlay = async (track) => {
    const audio = audioRef.current;

    if (currentTrack?.id === track.id) {
      if (audio.paused) {
        audio.play();
        setPlayingId(track.id);
      } else {
        audio.pause();
        setPlayingId(null);
      }
      return;
    }

    const src = track.audio_file?.startsWith("http")
      ? track.audio_file
      : `${BASE}${track.audio_file}`;

    audio.pause();
    audio.src = src;

    try {
      await audio.play();
      setPlayingId(track.id);
      setCurrentTrack(track);

      let counted = false;
      if (audio._playTimer) clearTimeout(audio._playTimer);

      audio._playTimer = setTimeout(async () => {
        if (!counted) {
          counted = true;
          try {
            await api.post(`tracks/${track.id}/play/`);
          } catch (err) {
            console.error("Play count error:", err);
          }
        }
      }, 15000);

    } catch (err) {
      console.error("Audio error:", err);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!currentTrack) return;
    if (audio.paused) {
      audio.play();
      setPlayingId(currentTrack.id);
    } else {
      audio.pause();
      setPlayingId(null);
    }
  };

  const isTrackActive = (track) => playingId === track.id;

  return (
    <PlayerContext.Provider value={{
      currentTrack, playingId, handlePlay, togglePlay, isTrackActive, audioRef,
      setTrackLiked, getTrackLike,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);