import { BrowserRouter, Routes, Route } from "react-router-dom";
import TracksPage from "./pages/TracksPage";
import UploadTrackPage from "./pages/UploadTrackPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TracksPage />} />
        <Route path="/upload" element={<UploadTrackPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;