async function getArtists() {
  const res = await fetch("/api/jamendo/artists");

  if (!res.ok) {
    throw new Error("Failed to fetch Artists from server");
  }

  const artists = await res.json();

  return artists;
}

export { getArtists };
