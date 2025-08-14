import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hls from "hls.js";
import { Search, Play, Clock, Tag, X, Film, Filter, Download } from "lucide-react";
import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom";

const videos = [
  { id: "v1", title: "Sample Video 1", src: "https://example.com/video1.mp4" },
  { id: "v2", title: "Sample Video 2", src: "https://example.com/video2.mp4" }
];

function ArchiveHome() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Video Archive</h1>
      <div className="grid grid-cols-2 gap-4">
        {videos.map(v => (
          <Link key={v.id} to={`/video/${v.id}`} className="p-4 border rounded hover:bg-gray-100">
            {v.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

function VideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const video = videos.find(v => v.id === id);

  if (!video) return <p>Video not found</p>;

  return (
    <div className="p-4">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-500">← Back</button>
      <h1 className="text-xl font-bold mb-2">{video.title}</h1>
      <video controls className="w-full" src={video.src}></video>
    </div>
  );
}

/*
  ✅ What this is
  ----------------
  A single-file React app for a public, stream-only video archive. 
  - Manual curation: you add/update the VIDEOS array below (or fetch it from /videos.json later).
  - Streaming only: supports MP4 and HLS (.m3u8) via <video> + hls.js.
  - Free hosting ready: deploy on Vercel, Netlify, or GitHub Pages.
  - No backend required.

  🚀 How to use
  -------------
  1) Replace sample entries in VIDEOS with your own (Archive.org, public S3, Cloudflare R2, or any direct file/playlist URLs).
     - Prefer HLS (.m3u8) for adaptive streaming; MP4 also works.
     - For Archive.org MP4 direct links, use the file URL from the "Download Options" box.
  2) Optional: Move the VIDEOS data to /public/videos.json and fetch it (sample code included, commented out).
  3) Deploy with one click to Vercel/Netlify (instructions in the chat message).

  ⚠️ IMPORTANT
  -------------
  - This app intentionally hides any download action by default (stream-only). The video element can still be downloaded by advanced users; to discourage this, we do not render a visible download button and set controlsList="nodownload". True DRM requires paid services (beyond scope of a free static site).

  🧱 Tech
  -------
  - Tailwind utility classes for styling (works even if Tailwind isn’t configured — they’ll just act like class names; to fully style, add Tailwind in your build).
  - shadcn/ui style isn’t required; to keep this single-file portable, we stick to standard elements + icons.
  - framer-motion for sweet micro-animations.
*/

// ---------------------------
// Sample data: replace these
// ---------------------------
export type VideoSource = {
  label: string;           // e.g., "720p MP4" or "Auto (HLS)"
  type: "mp4" | "hls";     // source type
  src: string;             // public URL
};

export type VideoItem = {
  id: string;
  title: string;
  description?: string;
  date?: string;           // ISO date string
  duration?: string;       // e.g., "12:34"
  tags?: string[];
  thumbnail?: string;      // poster image URL
  sources: VideoSource[];  // one or more sources/qualities
};

const VIDEOS: VideoItem[] = [
  {
    id: "ex-001",
    title: "Sample Archival Clip — MP4",
    description: "Example MP4 stream hosted publicly. Replace this with your own.",
    date: "2024-01-03",
    duration: "03:21",
    tags: ["sample", "mp4"],
    thumbnail:
      "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?w=1200&auto=format&fit=crop&q=60",
    sources: [
      {
        label: "720p MP4",
        type: "mp4",
        src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      },
    ],
  },
  {
    id: "ex-002",
    title: "Sample Archival Stream — HLS",
    description: "Adaptive HLS example using hls.js.",
    date: "2024-06-14",
    duration: "01:00:00",
    tags: ["sample", "hls", "adaptive"],
    thumbnail:
      "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=1200&auto=format&fit=crop&q=60",
    sources: [
      {
        label: "Auto (HLS)",
        type: "hls",
        src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      },
    ],
  },
];

// If you want to load from /videos.json instead of hardcoding:
// const [videos, setVideos] = useState<VideoItem[]>([]);
// useEffect(() => {
//   fetch("/videos.json").then(r => r.json()).then(setVideos).catch(console.error);
// }, []);

function classNames(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

function useFilteredVideos(all: VideoItem[], q: string, activeTag: string | null) {
  return useMemo(() => {
    const query = q.trim().toLowerCase();
    const bySearch = !query
      ? all
      : all.filter((v) =>
          [v.title, v.description, v.tags?.join(" ")]
            .filter(Boolean)
            .some((txt) => (txt as string).toLowerCase().includes(query))
        );
    const byTag = !activeTag ? bySearch : bySearch.filter((v) => v.tags?.includes(activeTag));
    return byTag;
  }, [all, q, activeTag]);
}

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function UniqueTags({ videos, onPick, active }: { videos: VideoItem[]; onPick: (t: string | null) => void; active: string | null }) {
  const set = new Set<string>();
  videos.forEach((v) => v.tags?.forEach((t) => set.add(t)));
  const tags = Array.from(set).sort();
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className={classNames(
          "px-3 py-1 rounded-full text-sm border",
          active === null ? "bg-black text-white" : "bg-white hover:bg-gray-50"
        )}
        onClick={() => onPick(null)}
        title="Show all"
      >
        All
      </button>
      {tags.map((t) => (
        <button
          key={t}
          className={classNames(
            "px-3 py-1 rounded-full text-sm border",
            active === t ? "bg-black text-white" : "bg-white hover:bg-gray-50"
          )}
          onClick={() => onPick(t)}
          title={`Filter: ${t}`}
        >
          #{t}
        </button>
      ))}
    </div>
  );
}

function VideoCard({ v, onOpen }: { v: VideoItem; onOpen: (v: VideoItem) => void }) {
  return (
    <motion.button
      layout
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onOpen(v)}
      className="group text-left bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition w-full border"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={v.thumbnail || "https://placehold.co/1280x720?text=No+Thumbnail"}
          alt={v.title}
          className="h-full w-full object-cover group-hover:scale-105 transition"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded bg-black/70 text-white flex items-center gap-1">
          <Clock className="w-3 h-3" /> {v.duration || ""}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-base leading-snug line-clamp-2">{v.title}</h3>
        </div>
        {v.description && (
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{v.description}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {v.tags?.slice(0, 3).map((t) => (
            <span key={t} className="text-xs px-2 py-1 rounded-full bg-gray-100 border flex items-center gap-1">
              <Tag className="w-3 h-3" /> {t}
            </span>
          ))}
          <span className="ml-auto text-xs text-gray-500">{formatDate(v.date)}</span>
        </div>
      </div>
    </motion.button>
  );
}

function SourceSelector({
  sources,
  current,
  onSelect,
}: {
  sources: VideoSource[];
  current: VideoSource;
  onSelect: (s: VideoSource) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sources.map((s) => (
        <button
          key={s.label + s.src}
          onClick={() => onSelect(s)}
          className={classNames(
            "px-3 py-1 rounded-full border text-sm",
            s.src === current.src ? "bg-black text-white" : "bg-white hover:bg-gray-50"
          )}
          title={`Switch to ${s.label}`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function VideoPlayer({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  const [active, setActive] = useState<VideoSource>(video.sources[0]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [canPlay, setCanPlay] = useState(false);

  // Attach HLS when needed
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    let hls: Hls | null = null;

    if (active.type === "hls") {
      if (Hls.isSupported()) {
        hls = new Hls({ maxBufferLength: 60 });
        hls.loadSource(active.src);
        hls.attachMedia(el);
        hls.on(Hls.Events.MANIFEST_PARSED, () => setCanPlay(true));
      } else if (el.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari
        el.src = active.src;
        setCanPlay(true);
      } else {
        setCanPlay(false);
      }
    } else {
      // MP4
      el.src = active.src;
      setCanPlay(true);
    }

    return () => {
      if (hls) hls.destroy();
      if (el) {
        el.pause();
        el.removeAttribute("src");
        el.load();
      }
    };
  }, [active]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl border">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5" />
            <div className="flex flex-col">
              <h2 className="font-semibold leading-tight">{video.title}</h2>
              <span className="text-xs text-gray-500">{formatDate(video.date)} {video.duration ? `• ${video.duration}` : ""}</span>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100" onClick={onClose} title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-black">
          <video
            ref={videoRef}
            className="w-full h-auto aspect-video"
            controls
            playsInline
            controlsList="nodownload"
            poster={video.thumbnail}
          />
        </div>

        <div className="p-4 flex flex-col gap-3">
          <SourceSelector
            sources={video.sources}
            current={active}
            onSelect={(s) => setActive(s)}
          />

          {video.description && (
            <p className="text-sm text-gray-700 leading-relaxed">{video.description}</p>
          )}

          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {video.tags.map((t) => (
                <span key={t} className="text-xs px-2 py-1 rounded-full bg-gray-100 border flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {t}
                </span>
              ))}
            </div>
          )}

          {/* Hidden/disabled download affordance (stream-only UX) */}
          <div className="opacity-50 pointer-events-none select-none inline-flex items-center gap-2 text-xs text-gray-400">
            <Download className="w-3 h-3" /> Downloads disabled
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // For now, we use the constants above. Swap to state if fetching JSON.
  const [videos] = useState<VideoItem[]>(VIDEOS);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [open, setOpen] = useState<VideoItem | null>(null);

  const filtered = useFilteredVideos(videos, query, activeTag);

  return (
    <>
      <Routes>
        <Route path="/" element={<ArchiveHome />} />
        <Route path="/video/:id" element={<VideoPage />} />
      </Routes>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <Play className="w-6 h-6" />
            <h1 className="text-lg sm:text-xl font-semibold">Archived Videos</h1>
            <span className="ml-auto hidden sm:inline text-xs text-gray-500">
              Public • Stream-only
            </span>
          </div>
        </header>

        {/* Toolbar */}
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, description, tags…"
                className="w-full pl-10 pr-3 py-2 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter by tag:</span>
            </div>
            <UniqueTags videos={videos} onPick={setActiveTag} active={activeTag} />
          </div>

          <p className="text-xs text-gray-500">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Grid */}
        <main className="max-w-6xl mx-auto px-4 pb-16">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              No videos match your search.
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence initial={false}>
                {filtered.map((v) => (
                  <motion.div key={v.id} layout>
                    <VideoCard v={v} onOpen={setOpen} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>

        {/* Player Modal */}
        <AnimatePresence>
          {open && <VideoPlayer video={open} onClose={() => setOpen(null)} />}
        </AnimatePresence>

        {/* Footer */}
        <footer className="border-t bg-white/60">
          <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-gray-500">
            <p>
              © {new Date().getFullYear()} Your Archive. Streaming only. Add/curate videos
              manually in code or via a JSON manifest.
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer">How do I add my own videos?</summary>
              <div className="mt-2 space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Replace the <code>VIDEOS</code> array with your entries. Each item supports
                    multiple sources (e.g., HLS + MP4 fallback).
                  </li>
                  <li>
                    For Archive.org: open your item, find the file under <em>Download Options</em>,
                    copy the direct URL, and use it as a source.
                  </li>
                  <li>
                    (Optional) Move data to <code>/public/videos.json</code> and fetch it. Keep
                    this app static.
                  </li>
                  <li>Deploy on Vercel/Netlify for free.</li>
                </ol>
                <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto">{`
{
  "id": "my-001",
  "title": "My Archived Talk",
  "description": "Conference 2023, Room A",
  "date": "2023-09-18",
  "duration": "45:12",
  "tags": ["talk", "conference"],
  "thumbnail": "https://.../thumb.jpg",
  "sources": [
    { "label": "Auto (HLS)", "type": "hls", "src": "https://.../playlist.m3u8" },
    { "label": "720p MP4", "type": "mp4", "src": "https://.../video-720.mp4" }
  ]
}
`}</pre>
              </div>
            </details>
          </div>
        </footer>
      </div>
    </>
  );
}

