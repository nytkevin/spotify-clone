export async function getAlbumDetails(id: string) {
  const res = await fetch(`/api/spotify/album/${id}`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch album details");
  }

  return data;
}

export default getAlbumDetails;
