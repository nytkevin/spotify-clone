import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?client_id=${process.env.JAMENDO_CLIENT_ID}&format=json&limit=20`,
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch tracks" },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(data.results);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
