// return the access token from the browser

import { NextResponse } from "next/server";
import { getAccessToken } from "@/app/lib/spotify/access_token";

export async function GET() {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ token: null }, { status: 401 });
  }
  return NextResponse.json({ access_token: token });
}
