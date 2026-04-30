import { getAccessToken } from "@/app/lib/spotify/access_token";
import { NextResponse } from "next/server";

export async function GET() {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json(
      { error: "Missing access token. User not authenticated." },
      { status: 401 },
    );
  }

  const res = await fetch("https://api.spotify.com/v1/me/playlists/", {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.log("Spotify error:", errorText);

    return NextResponse.json({
      error: "Spotify API request failed",
      details: errorText,
    });
  }
  const data = await res.json();

  return NextResponse.json({ playlists: data });
}
