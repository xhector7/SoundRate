export default function TrackCard({ track }) {
  return (
    <div>
      <h3>{track.title}</h3>
      <p>{track.description}</p>
    </div>
  );
}