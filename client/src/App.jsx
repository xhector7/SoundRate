import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import { PlayerProvider } from "./context/PlayerContext";

function App() {
  console.log(import.meta.env.VITE_API_URL)
  return (
    <BrowserRouter>
      <PlayerProvider>
        <AppRouter />
      </PlayerProvider>
    </BrowserRouter>
  );
}

export default App;