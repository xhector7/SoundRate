import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import PlayerBar from "../components/PlayerBar";
import { usePlayer } from "../context/PlayerContext";

export default function MainLayout() {
  const { currentTrack, playingId, togglePlay, audioRef } = usePlayer();
  const isPlaying = !!playingId && !!currentTrack;
 

  return (
    <>
      <Navbar />
      <Outlet />
      <PlayerBar
        track={currentTrack}
        audioRef={audioRef}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
      />
    </>
  );
}