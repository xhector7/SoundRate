import { useEffect, useState } from "react";
import { getAllTracks } from "../api/tracks.api";
import TrackCard from "./TrackCard";

export default function TrackList() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    const res = await getAllTracks();
    setTracks(res.data);
  };

  return (
    <div>
      {tracks.map((t) => (
        <TrackCard key={t.id} track={t} />
      ))}
    </div>
  );
}