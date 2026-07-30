import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clientId = process.env.JAMENDO_CLIENT_ID;

    if (!clientId) {
      return NextResponse.json(
        { error: "Missing Jamendo client ID" },
        { status: 500 },
      );
    }

    const response = await fetch(
      `https://api.jamendo.com/v3.0/artists/?client_id=${clientId}&format=json&limit=20`,
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch artists" },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(data.results);
  } catch (error) {
    console.error("Jamendo API error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
