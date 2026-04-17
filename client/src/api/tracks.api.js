import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/v1/",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getAllTracks = () => API.get("tracks/");
export const createTrack = (track) => API.post("tracks/", track);