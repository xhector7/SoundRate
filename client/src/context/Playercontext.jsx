import { createContext, useContext, useRef, useState } from "react";
import axios from "axios";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playingId, setPlayingId] = useState(null);

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
    : `http://127.0.0.1:8000${track.audio_file}`;

  audio.pause();
  audio.currentTime = 0;
  audio.src = src;

  try {
    await audio.play();

    setPlayingId(track.id);
    setCurrentTrack(track);

    // RESET
    let counted = false;

    // limpia anterior timer si existía
    if (audio._playTimer) {
      clearTimeout(audio._playTimer);
    }

    // mejor: trigger a los 15-20s reales
    audio._playTimer = setTimeout(async () => {
      if (!counted) {
        counted = true;

        try {
          const res = await axios.post(
            `http://127.0.0.1:8000/api/v1/tracks/${track.id}/play/`
          );

          console.log("PLAY COUNT UPDATED:", res.data);
        } catch (err) {
          console.error("Play count error:", err);
        }
      }
    }, 15000); // 15s mínimo play válido

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
    <PlayerContext.Provider value={{ currentTrack, playingId, handlePlay, togglePlay, isTrackActive, audioRef }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);