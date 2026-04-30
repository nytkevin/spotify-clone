import { getAccessToken } from "@/app/lib/spotify/access_token";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json(
      { error: "Missing access token. User not authenticated." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const playlistId = searchParams.get("playlist_id") ?? searchParams.get("id");

  if (!playlistId) {
    return NextResponse.json({ error: "Missing playlist id" }, { status: 400 });
  }

  const spotifySearchParams = new URLSearchParams();

  for (const [key, value] of searchParams.entries()) {
    if (key === "id" || key === "playlist_id") continue;
    spotifySearchParams.set(key, value);
  }

  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/items${
      spotifySearchParams.toString() ? `?${spotifySearchParams.toString()}` : ""
    }`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.log("Spotify error:", errorText);

    return NextResponse.json(
      {
        error: "Spotify API request failed",
        details: errorText,
      },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json({ tracks: data });
}
