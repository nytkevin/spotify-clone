import { SearchResponceProp } from "@/app/types/spotify";

export async function getSearch({
  q,
  type = "track",
  limit = 20,
  market = "US",
}: {
  q: string;
  type?: string;
  limit?: number;
  market?: string;
}): Promise<SearchResponceProp | { error: string; details?: string }> {
  if (!q) {
    return { error: "Missing search query (q)" };
  }
  const params = new URLSearchParams({
    q,
    type,
    limit: limit.toString(),
    market,
  });
  const res = await fetch(`/api/spotify/search?${params.toString()}`);
  if (!res.ok) {
    let details = undefined;
    try {
      details = await res.text();
    } catch {}
    return { error: "Search API request failed", details };
  }
  return res.json();
}
