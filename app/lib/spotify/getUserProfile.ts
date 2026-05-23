import { UserProfile } from "../../types/spotify";

export async function getUserProfile(
  accessToken: string,
): Promise<UserProfile> {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch user profile: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data as UserProfile;
}

// Client-side version that calls the API endpoint
export async function getClientUserProfile(): Promise<UserProfile> {
  const response = await fetch("/api/spotify/me");

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Not authenticated");
    }
    throw new Error("Failed to fetch user profile");
  }

  return response.json();
}
