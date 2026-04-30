import { getAccessToken } from "@/app/lib/spotify/access_token";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json(
      { error: "Missing access token. User not authenticated." },
      { status: 401 },
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing album id" }, { status: 400 });
  }

  const res = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
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
  return NextResponse.json({ album: data });
}
