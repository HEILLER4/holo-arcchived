import { useState } from "react";
import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { useFilteredVideos } from "./hooks/useFilteredVideos";

// Example type
type VideoItem = {
  id: string;
  title: string;
  src: string;
  tags?: string[];
};

// Example video list
const VIDEOS: VideoItem[] = [
  { id: "v1", title: "Sample Video 1", src: "https://www.w3schools.com/html/mov_bbb.mp4", tags: ["funny", "short"] },
  { id: "v2", title: "Sample Video 2", src: "https://www.w3schools.com/html/movie.mp4", tags: ["music", "live"] }
];

// Home page
function ArchiveHome({
  videos,
  query,
  setQuery,
  activeTag,
  setActiveTag
}: {
  videos: VideoItem[];
  query: string;
  setQuery: (q: string) => void;
  activeTag: string | null;
  setActiveTag: (t: string | null) => void;
}) {
  const tags = Array.from(new Set(videos.flatMap(v => v.tags || [])));

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Video Archive</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search videos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border px-2 py-1 mb-4 w-full"
      />

      {/* Tags */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          className={`px-2 py-1 border ${activeTag === null ? "bg-gray-200" : ""}`}
          onClick={() => setActiveTag(null)}
        >
          All
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            className={`px-2 py-1 border ${activeTag === tag ? "bg-gray-200" : ""}`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Videos */}
      <div className="grid grid-cols-2 gap-4">
        {videos.map((v) => (
          <Link
            key={v.id}
            to={`/video/${v.id}`}
            className="p-4 border rounded hover:bg-gray-100 block"
          >
            {v.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

// Video page
function VideoPage({ videos }: { videos: VideoItem[] }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const video = videos.find((v) => v.id === id);

  if (!video) return <p className="p-4">Video not found</p>;

  return (
    <div className="p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-500 hover:underline"
      >
        ← Back
      </button>
      <h1 className="text-xl font-bold mb-2">{video.title}</h1>
      <video controls className="w-full" src={video.src}></video>
    </div>
  );
}

export default function App() {
  const [videos] = useState<VideoItem[]>(VIDEOS);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = useFilteredVideos(videos, query, activeTag);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ArchiveHome
            videos={filtered}
            query={query}
            setQuery={setQuery}
            activeTag={activeTag}
            setActiveTag={setActiveTag}
          />
        }
      />
      <Route
        path="/video/:id"
        element={<VideoPage videos={videos} />}
      />
    </Routes>
  );
}
