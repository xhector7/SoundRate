import { Link } from "react-router-dom";

export default function Home() {
  const tracks = [
    { id: 1, title: "Midnight Waves", artist: "Luna Sky" },
    { id: 2, title: "Neon Dreams", artist: "Kairo" },
    { id: 3, title: "Lost Frequencies", artist: "EchoMind" },
    { id: 4, title: "Digital Rain", artist: "Nova Pulse" },
  ];

  return (
    <div className="min-h-screen bg-bg text-text px-10 py-12">
      
      {/* HERO */}
      <section className="mb-16">
        <h1 className="text-5xl font-bold leading-tight">
          Discover. Listen. Connect.
        </h1>

        <p className="mt-4 text-muted max-w-xl text-lg">
          Discover your next obsession, or become someone else’s.
          A community where music and people meet.
        </p>

        <div className="mt-6 flex gap-4">
          <Link to="/login">
            <button className="px-5 py-2 bg-primary text-black font-semibold rounded-lg hover:opacity-80 transition">
              Login
            </button>
          </Link>

          <Link to="/register">
            <button className="px-5 py-2 border border-border rounded-lg hover:bg-card transition">
              Register
            </button>
          </Link>
        </div>
      </section>

      {/* TRACKS */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Trending Tracks</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="bg-card border border-border rounded-xl p-4 hover:scale-105 transition"
            >
              <h3 className="font-semibold">{track.title}</h3>
              <p className="text-muted text-sm">{track.artist}</p>

              <Link to={`/track/${track.id}`}>
                <button className="mt-4 w-full py-2 bg-secondary rounded-lg hover:opacity-80 transition">
                  Open
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}