import { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import api from "../services/api";

const PlayerContext = createContext(null);
const BASE = import.meta.env.VITE_API_URL;

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [likedTracks, setLikedTracks] = useState({});
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);

  const queueRef = useRef([]);
  const queueIndexRef = useRef(0);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { queueIndexRef.current = queueIndex; }, [queueIndex]);

  const setTrackLiked = useCallback((trackId, liked, count) => {
    setLikedTracks(prev => ({ ...prev, [trackId]: { liked, count } }));
  }, []);

  const getTrackLike = useCallback((trackId, fallbackLiked, fallbackCount) => {
    return likedTracks[trackId] ?? { liked: fallbackLiked, count: fallbackCount };
  }, [likedTracks]);

  const playTrack = useCallback(async (track, trackList = [], index = 0) => {
    const audio = audioRef.current;
    const src = track.audio_file?.startsWith("http")
      ? track.audio_file
      : `${BASE}${track.audio_file}`;

    audio.pause();
    audio.src = src;

    try {
      await audio.play();
      setPlayingId(track.id);
      setCurrentTrack(track);
      setQueue(trackList);
      setQueueIndex(index);
      queueRef.current = trackList;
      queueIndexRef.current = index;

      let counted = false;
      if (audio._playTimer) clearTimeout(audio._playTimer);
      audio._playTimer = setTimeout(async () => {
        if (!counted) {
          counted = true;
          try { await api.post(`tracks/${track.id}/play/`); } catch {}
        }
      }, 15000);
    } catch (err) {
      console.error("Audio error:", err);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const onEnded = () => {
      const nextIndex = queueIndexRef.current + 1;
      const next = queueRef.current[nextIndex];
      if (next) {
        playTrack(next, queueRef.current, nextIndex);
      } else {
        setPlayingId(null);
      }
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [playTrack]);

  const handlePlay = async (track, trackList = []) => {
    const audio = audioRef.current;
    if (currentTrack?.id === track.id) {
      if (audio.paused) { audio.play(); setPlayingId(track.id); }
      else { audio.pause(); setPlayingId(null); }
      return;
    }
    const index = trackList.findIndex(t => t.id === track.id);
    await playTrack(track, trackList, index === -1 ? 0 : index);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!currentTrack) return;
    if (audio.paused) { audio.play(); setPlayingId(currentTrack.id); }
    else { audio.pause(); setPlayingId(null); }
  };

  const nextTrack = useCallback(() => {
    const nextIndex = queueIndexRef.current + 1;
    const next = queueRef.current[nextIndex];
    if (next) playTrack(next, queueRef.current, nextIndex);
  }, [playTrack]);

  const prevTrack = useCallback(() => {
    const prevIndex = queueIndexRef.current - 1;
    const prev = queueRef.current[prevIndex];
    if (prev) playTrack(prev, queueRef.current, prevIndex);
  }, [playTrack]);

  const isTrackActive = (track) => playingId === track.id;

  return (
    <PlayerContext.Provider value={{
      currentTrack, playingId, handlePlay, togglePlay, isTrackActive, audioRef,
      setTrackLiked, getTrackLike, nextTrack, prevTrack,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);