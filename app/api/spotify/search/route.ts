import { NextResponse, type NextRequest } from "next/server";
import { getAccessToken } from "@/app/lib/spotify/access_token";
import { SearchResponceProp } from "@/app/types/spotify";

export async function GET(req: NextRequest) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json(
      { error: "Missing access token. User not authenticated." },
      { status: 401 },
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("q");
  const type = searchParams.get("type") || "track";
  const limit = searchParams.get("limit") || "30";
  const market = searchParams.get("market") || "US";

  if (!query) {
    return NextResponse.json(
      { error: "Missing query parameter 'q'" },
      { status: 400 },
    );
  }

  const searchUrl = new URL("https://api.spotify.com/v1/search");
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("type", type);
  searchUrl.searchParams.set("limit", limit);
  searchUrl.searchParams.set("market", market);

  const res = await fetch(searchUrl.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    return NextResponse.json(
      {
        error: "Spotify search request failed",
        details: errorText,
      },
      { status: res.status },
    );
  }

  const data: SearchResponceProp = await res.json();

  return NextResponse.json(data);
}
