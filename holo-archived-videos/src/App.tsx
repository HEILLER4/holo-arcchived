import { Routes, Route, Link, useParams } from "react-router-dom";

const videos = [
  { id: "1", title: "First Video", description: "This is the first archived video." },
  { id: "2", title: "Second Video", description: "This is the second archived video." }
];

function ArchiveHome() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Video Archive</h1>
      <ul>
        {videos.map((v) => (
          <li key={v.id}>
            <Link to={`/video/${v.id}`}>{v.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const video = videos.find((v) => v.id === id);

  if (!video) return <h2>Video not found</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{video.title}</h1>
      <p>{video.description}</p>
      <Link to="/">⬅ Back</Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ArchiveHome />} />
      <Route path="/video/:id" element={<VideoPage />} />
    </Routes>
  );
}
