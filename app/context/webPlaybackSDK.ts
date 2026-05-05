// webPlaybackSDK.ts
import { initializePlayerAndTransferPlayback } from "@/app/util/spotify";
import type { InitOptions, SpotifyPlayer } from "@/app/types/spotify";

export type PlayTrackOptions = {
  trackUri: string;
  contextUri?: string;
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
    uri: string;
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
};

export type CurrentPlaybackState = {
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: CurrentPlayingTrack | null;
  currently_playing_type: string;
};

/**
 * Play a track or context (playlist/album) on the given device via the Spotify Web API.
 * Supports both individual tracks and full playlists/albums for queue support.
 * Falls back to omitting device_id if the device returns 404
 * (can happen briefly after SDK ready fires).
 */
export async function playTrack(
  options: PlayTrackOptions,
): Promise<PlayTrackResult> {
  const { trackUri, contextUri, deviceId, accessToken } = options;

  if (!deviceId || !accessToken || !trackUri) {
    return { success: false, error: "Missing required parameters" };
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  // Build the request body based on whether we're playing a context or a single track
  // When playing a context (playlist/album), use trackUri to specify which track to start with
  const playBody = contextUri
    ? {
        device_id: deviceId,
        context_uri: contextUri,
        offset: { uri: trackUri },
      }
    : { device_id: deviceId, uris: [trackUri] };

  try {
    const response = await fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers,
      body: JSON.stringify(playBody),
    });

    if (response.ok || response.status === 204) {
      return { success: true };
    }

    const error = await response.json().catch(() => ({}));
    const errorMsg = error?.error?.message || `HTTP ${response.status}`;

    // Device not yet visible to Spotify's backend — retry without device_id
    // so it targets whatever the SDK has made active
    if (response.status === 404) {
      const fallbackBody = contextUri
        ? { context_uri: contextUri, offset: { uri: trackUri } }
        : { uris: [trackUri] };

      const fallback = await fetch(
        "https://api.spotify.com/v1/me/player/play",
        {
          method: "PUT",
          headers,
          body: JSON.stringify(fallbackBody),
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

/**
 * Seek to a position in the current track using the Web Playback SDK.
 * This requires the player instance to be available.
 * @param player The Spotify player instance
 * @param positionMs The position in milliseconds to seek to
 */
export async function seekTrack(
  player: SpotifyPlayer,
  positionMs: number,
): Promise<void> {
  try {
    await player.seek(positionMs);
  } catch (err) {
    console.error("Failed to seek track:", err);
    throw err;
  }
}
