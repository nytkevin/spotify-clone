export async function getArtistDetails(id: string) {
  const res = await fetch(`/api/spotify/artist/${id}`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    const details = data.details ? ` (${data.details})` : "";
    throw new Error((data.error || "Failed to fetch artist details") + details);
  }

  return data;
}

export default getArtistDetails;
