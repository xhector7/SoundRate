import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Track from "../pages/Track";
import Artist from "../pages/Artist";
import Discover from "../pages/Discover";
import Upload from "../pages/Upload";


export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="track/:id" element={<Track />} />
        <Route path="artist/:username" element={<Artist />} />
        <Route path="discover" element={<Discover />} />
        <Route path="upload" element={<Upload />} />
      </Route>
    </Routes>
  );
}