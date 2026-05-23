import { NextResponse } from "next/server";
import { getAccessToken } from "../../../lib/spotify/access_token";
import { getUserProfile } from "../../../lib/spotify/getUserProfile";

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const profile = await getUserProfile(accessToken);

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 },
    );
  }
}
