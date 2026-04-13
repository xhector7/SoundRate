import { useState } from "react";
import { createTrack } from "../api/tracks.api";

export default function UploadTrackPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createTrack(form);
    alert("Track subida 🎵");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" onChange={handleChange} placeholder="Title" />
      <textarea name="description" onChange={handleChange} />
      <button>Upload</button>
    </form>
  );
}