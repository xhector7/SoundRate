import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/v1/",
});

export const getAllTracks = () => API.get("tracks/");
export const createTrack = (track) => API.post("tracks/", track);