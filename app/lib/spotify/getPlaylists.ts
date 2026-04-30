export async function getPlaylists() {
  const res = await fetch("/api/spotify/playlist", {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch playlists");
  }
  return data;
}
export default getPlaylists;
