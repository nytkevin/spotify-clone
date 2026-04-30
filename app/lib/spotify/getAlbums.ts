export async function getAlbums() {
  const res = await fetch("/api/spotify/album", {
    credentials: "include",
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fexth albums");
  }

  return data;
}
export default getAlbums;
