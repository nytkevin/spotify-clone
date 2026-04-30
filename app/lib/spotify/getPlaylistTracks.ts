export async function getPlaylistTracks(id: string) {
  const res = await fetch(`/api/spotify/playlist/tracks?id=${id}`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch playlist tracks");
  }
  return data;
}
export default getPlaylistTracks;
