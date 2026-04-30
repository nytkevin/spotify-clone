import { NextRequest, NextResponse } from "next/server";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const baseUrl = process.env.BASE_URL;
const redirectUri = `${baseUrl}/api/spotify/callback`;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  if (!clientId) {
    throw new Error("Missing SPOTIFY_CLIENT_ID ");
  }

  if (!clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID ");
  }

  if (!baseUrl) {
    throw new Error("Missing BASE_URL ");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  }).toString();

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

  const data = await response.json();

  if (!data.access_token) {
    return NextResponse.json({ error: "Failed to get access token", data });
  }

  const res = NextResponse.redirect(`${baseUrl}/`);

  res.cookies.set("spotify_access_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: data.expires_in || 3600,
  });

  return res;
}
