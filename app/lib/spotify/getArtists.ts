// Ask our API route for artists instead of Spotify directly.

type GetArtistsOptions = {
  limit?: number;
  offset?: number;
  timeRange?: "short_term" | "medium_term" | "long_term";
};

async function getArtists(options: GetArtistsOptions = {}) {
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;
  const timeRange = options.timeRange ?? "medium_term";

  //URLSearchParams mainly handles the query parameters after the ?
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    time_range: timeRange,
  });

  const res = await fetch(`/api/spotify/artist?${params}`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    // of the data sed it truthy do no render the right side
    throw new Error(data.error || "Failed to fetch artists");
  }

  return data;
}
export default getArtists;
