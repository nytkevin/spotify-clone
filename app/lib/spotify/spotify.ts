const scope =
  "user-read-private " +
  "user-read-email " +
  "user-follow-read " +
  "user-top-read " +
  "user-read-recently-played " +
  "playlist-read-private " +
  "playlist-read-collaborative " +
  "playlist-modify-public " +
  "playlist-modify-private " +
  "user-library-read " +
  "user-library-modify " +
  "user-read-currently-playing " +
  "user-read-playback-state " +
  "user-modify-playback-state";

export function getLoginUrl(): string {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = `${process.env.BASE_URL}/api/spotify/callback`;

  if (!clientId) {
    throw new Error("Missing SPOTIFY_CLIENT_ID");
  }

  if (!process.env.BASE_URL) {
    throw new Error("Missing BASE_URL");
  }

  return (
    `https://accounts.spotify.com/authorize?` +
    new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope,
      redirect_uri: redirectUri,
    }).toString()
  );
}
