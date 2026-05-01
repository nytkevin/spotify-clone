// webPlaybackSDK.ts
import { initializePlayerAndTransferPlayback } from "@/app/util/spotify";
import type { InitOptions, SpotifyPlayer } from "@/app/types/spotify";

export type PlayTrackOptions = {
  trackUri: string;
  deviceId: string;
  accessToken: string;
};

export type PlayTrackResult = {
  success: boolean;
  error?: string;
};

export type CurrentPlayingTrack = {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  uri: string;
};

export type CurrentPlaybackState = {
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: CurrentPlayingTrack | null;
  currently_playing_type: string;
};

/**
 * Play a track on the given device via the Spotify Web API.
 * Falls back to omitting device_id if the device returns 404
 * (can happen briefly after SDK ready fires).
 */
export async function playTrack(
  options: PlayTrackOptions,
): Promise<PlayTrackResult> {
  const { trackUri, deviceId, accessToken } = options;

  if (!trackUri || !deviceId || !accessToken) {
    return { success: false, error: "Missing required parameters" };
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers,
      body: JSON.stringify({ device_id: deviceId, uris: [trackUri] }),
    });

    if (response.ok || response.status === 204) {
      return { success: true };
    }

    const error = await response.json().catch(() => ({}));
    const errorMsg = error?.error?.message || `HTTP ${response.status}`;

    // Device not yet visible to Spotify's backend — retry without device_id
    // so it targets whatever the SDK has made active
    if (response.status === 404) {
      const fallback = await fetch(
        "https://api.spotify.com/v1/me/player/play",
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ uris: [trackUri] }),
        },
      );

      if (fallback.ok || fallback.status === 204) return { success: true };
    }

    return { success: false, error: errorMsg };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * Initializes the SDK player, transfers playback, then plays a track.
 * Token is fetched internally — do not pass one in.
 */
export async function initializeAndPlayTrack(
  trackUri: string,
  opts?: InitOptions,
): Promise<PlayTrackResult & { player?: SpotifyPlayer; deviceId?: string }> {
  try {
    const initResult = await initializePlayerAndTransferPlayback(opts);

    if (!initResult.success || !initResult.deviceId || !initResult.player) {
      return {
        success: false,
        error: initResult.error || "Failed to initialize player",
      };
    }

    const { deviceId, player } = initResult;

    // Fetch a fresh token for the play call — same endpoint the SDK used
    const tokenEndpoint = opts?.getTokenEndpoint ?? "/api/spotify/token";
    const tokenRes = await fetch(tokenEndpoint);
    const { access_token: accessToken } = await tokenRes.json();

    const playResult = await playTrack({ trackUri, deviceId, accessToken });

    if (!playResult.success) {
      return { success: false, error: playResult.error };
    }

    return { success: true, player, deviceId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getCurrentPlayingTrack(
  accessToken: string,
): Promise<CurrentPlaybackState | null> {
  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (response.status === 204) return null; // nothing playing
    if (!response.ok) return null;

    return (await response.json()) as CurrentPlaybackState;
  } catch {
    return null;
  }
}

async function playerAction(
  accessToken: string,
  path: string,
  method: "PUT" | "POST" = "PUT",
): Promise<PlayTrackResult> {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/player${path}`,
      {
        method,
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (response.ok || response.status === 204) return { success: true };
    return { success: false, error: `HTTP ${response.status}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export const pausePlayback = (t: string) => playerAction(t, "/pause");
export const resumePlayback = (t: string) => playerAction(t, "/play");
export const nextTrack = (t: string) => playerAction(t, "/next", "POST");
export const previousTrack = (t: string) =>
  playerAction(t, "/previous", "POST");
