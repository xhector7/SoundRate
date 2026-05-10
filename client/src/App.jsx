import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import { PlayerProvider } from "./context/PlayerContext";

function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <AppRouter />
      </PlayerProvider>
    </BrowserRouter>
  );
}

export default App;