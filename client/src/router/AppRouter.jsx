import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import TrackDetail from "../pages/TrackDetail";
import Profile from "../pages/Profile";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="track/:id" element={<TrackDetail />} />
        <Route path="profile/:id" element={<Profile />} />
      </Route>
    </Routes>
  );
}