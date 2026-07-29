async function getTracks() {
  const res = await fetch("/api/jamendo/tracks");

  if (!res.ok) {
    throw new Error("Failed to fetch Tracks from server");
  }

  const tracks = await res.json();

  return tracks;
}

export { getTracks };
