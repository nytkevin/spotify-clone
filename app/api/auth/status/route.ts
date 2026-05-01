import { getAccessToken } from "../../../lib/spotify/access_token";

export async function GET() {
  const token = await getAccessToken();
  return Response.json({ isAuthenticated: !!token });
}
