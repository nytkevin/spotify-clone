// an API endpoint handler nextjs expexts a responce or NextResponce (HTTP handler.) this is to access the token cause js can not access the token direclyt from the browser
// This route is the middleman between the client and Spotify.
// It grabs the access token from a secure HTTP-only cookie,
// calls Spotify on behalf of the user, and sends the data back
// without ever exposing the token to the browser.
import { NextResponse } from "next/server";
import { getAccessToken } from "@/app/lib/spotify/access_token";

export async function GET(request: Request) {
  const token = await getAccessToken();

  const { searchParams } = new URL(request.url);
  const requestedLimit = Number(searchParams.get("limit") ?? "50");
  const requestedOffset = Number(searchParams.get("offset") ?? "0");
  const timeRange = searchParams.get("time_range") ?? "medium_term";

  // Spotify allows limit 1-50 on this endpoint.
  const limit = Math.min(50, Math.max(1, requestedLimit));
  const offset = Math.max(0, requestedOffset);

  if (!token) {
    return NextResponse.json(
      { error: "Missing access token. User not authenticated." },
      { status: 401 },
    );
  }

  const spotifyUrl = new URL("https://api.spotify.com/v1/me/top/artists");
  spotifyUrl.searchParams.set("limit", String(limit));
  spotifyUrl.searchParams.set("offset", String(offset));
  spotifyUrl.searchParams.set("time_range", timeRange);

  const res = await fetch(spotifyUrl.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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

  return NextResponse.json({ artists: data }); // return HTTP repsonce with data as artists can you even call it data
}
