import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Track from "../pages/Track";
import Profile from "../pages/Profile";
import Discover from "../pages/Discover";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="track/:id" element={<Track />} />
        <Route path="profile/:id" element={<Profile />} />
        <Route path="discover" element={<Discover />} />
      </Route>
    </Routes>
  );
}