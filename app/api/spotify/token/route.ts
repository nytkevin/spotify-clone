// return the access token from the browser, refreshing if needed

import { NextResponse } from "next/server";
import { getAccessToken } from "@/app/lib/spotify/access_token";
import { cookies } from "next/headers";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body,
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function GET() {
  const token = await getAccessToken();
  const cookieStore = await cookies();

  // If token exists and seems valid, return it
  if (token) {
    return NextResponse.json({ access_token: token });
  }

  // Try to refresh using refresh token
  const refreshToken = cookieStore.get("spotify_refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ token: null }, { status: 401 });
  }

  const newTokenData = await refreshAccessToken(refreshToken);
  if (!newTokenData?.access_token) {
    return NextResponse.json({ token: null }, { status: 401 });
  }

  // Update the access token cookie
  const res = NextResponse.json({ access_token: newTokenData.access_token });
  res.cookies.set("spotify_access_token", newTokenData.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: newTokenData.expires_in || 3600,
  });

  return res;
}
