import { useMemo } from "react";

type VideoItem = {
  id: string;
  title: string;
  src: string;
  tags?: string[];
};

export function useFilteredVideos(
  videos: VideoItem[],
  query: string,
  activeTag: string | null
) {
  return useMemo(() => {
    let list = videos;

    // Search filter
    if (query.trim()) {
      const lower = query.toLowerCase();
      list = list.filter((v) => v.title.toLowerCase().includes(lower));
    }

    // Tag filter
    if (activeTag) {
      list = list.filter((v) => v.tags?.includes(activeTag));
    }

    return list;
  }, [videos, query, activeTag]);
}
