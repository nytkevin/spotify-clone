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
    images?: Array<{ url: string; height: number; width: number }>;
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

export type QueueTrack = {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album?: {
    uri: string;
    name: string;
    images?: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  uri: string;
};

export type QueueState = {
  currently_playing: QueueTrack | null;
  queue: QueueTrack[];
};

export type Device = {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
  supports_volume: boolean;
};

export type RepeatMode = "off" | "context" | "track";

export type DeviceListResponse = {
  devices: Device[];
};

export type RecentlyPlayedTrack = {
  track: {
    id: string;
    name: string;
    uri: string;
    artists: Array<{ name: string }>;
    album: {
      uri: string;
      name: string;
      images?: Array<{ url: string; height: number; width: number }>;
    };
    duration_ms: number;
  };
  played_at: string;
};

export type RecentlyPlayedResponse = {
  href: string;
  limit: number;
  next: string | null;
  cursors: {
    after: string;
    before: string;
  };
  total: number;
  items: RecentlyPlayedTrack[];
};

/**
 * Raw Spotify API Artist object
 */
type SpotifyArtist = {
  id: string;
  name: string;
  external_urls?: { spotify: string };
  href?: string;
  type?: string;
  uri?: string;
};

/**
 * Raw Spotify API Album object
 */
type SpotifyAlbum = {
  id: string;
  name: string;
  uri: string;
  album_type?: string;
  images?: Array<{ url: string; height: number; width: number }>;
  release_date?: string;
  external_urls?: { spotify: string };
  href?: string;
  type?: string;
  artists?: SpotifyArtist[];
};

/**
 * Raw Spotify API Track object (as returned from /me/player/queue)
 */
type SpotifyTrackResponse = {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  explicit?: boolean;
  popularity?: number;
  external_urls?: { spotify: string };
  href?: string;
  is_playable?: boolean;
  preview_url?: string | null;
  track_number?: number;
  type?: string;
};

/**
 * Raw Spotify API Queue response structure
 */
type SpotifyQueueResponse = {
  currently_playing: SpotifyTrackResponse | null;
  queue: SpotifyTrackResponse[];
};

/**
 * Raw Spotify API Device response structure
 */
type SpotifyDevicesResponse = {
  devices: SpotifyDevice[];
};

type SpotifyDevice = {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
  supports_volume: boolean;
};

/**
 * Raw Spotify API Recently Played response structure
 */
type SpotifyRecentlyPlayedResponse = {
  href: string;
  limit: number;
  next: string | null;
  cursors: {
    after: string;
    before: string;
  };
  total: number;
  items: Array<{
    track: SpotifyTrackResponse;
    played_at: string;
    context: {
      type: string;
      href: string;
      external_urls: { spotify: string };
      uri: string;
    } | null;
  }>;
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

/**
 * Get the current queue from Spotify.
 * Returns the currently playing track and the queue of upcoming tracks.
 */
export async function getQueue(
  accessToken: string,
): Promise<QueueState | null> {
  try {
    const response = await fetch("https://api.spotify.com/v1/me/player/queue", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as SpotifyQueueResponse;

    const mapTrack = (track: SpotifyTrackResponse): QueueTrack => ({
      id: track.id,
      name: track.name,
      artists: track.artists || [],
      album: track.album,
      duration_ms: track.duration_ms,
      uri: track.uri,
    });

    return {
      currently_playing: data.currently_playing
        ? mapTrack(data.currently_playing)
        : null,
      queue: (data.queue || []).map(mapTrack),
    };
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
 * Get available Spotify Connect devices.
 * Returns a list of all devices the user has available.
 */
export async function getAvailableDevices(
  accessToken: string,
): Promise<Device[] | null> {
  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/devices",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as SpotifyDevicesResponse;

    return data.devices.map(
      (device: SpotifyDevice): Device => ({
        id: device.id,
        is_active: device.is_active,
        is_private_session: device.is_private_session,
        is_restricted: device.is_restricted,
        name: device.name,
        type: device.type,
        volume_percent: device.volume_percent,
        supports_volume: device.supports_volume,
      }),
    );
  } catch {
    return null;
  }
}

/**
 * Transfer playback to a different device.
 * @param deviceId The ID of the device to transfer to
 * @param accessToken The user's access token
 * @param play Whether to start playing on the new device
 */
export async function transferPlayback(
  deviceId: string,
  accessToken: string,
  play: boolean = true,
): Promise<PlayTrackResult> {
  try {
    const response = await fetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        play,
      }),
    });

    if (response.ok || response.status === 204) {
      return { success: true };
    }

    return { success: false, error: `HTTP ${response.status}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

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

/**
 * Set the repeat mode for the user's playback.
 * @param mode "track" to repeat current track, "context" to repeat playlist/album, "off" to disable repeat
 * @param accessToken The user's access token
 * @param deviceId Optional device ID (uses currently active device if not provided)
 */
export async function setRepeatMode(
  mode: RepeatMode,
  accessToken: string,
  deviceId?: string,
): Promise<PlayTrackResult> {
  try {
    const url = new URL("https://api.spotify.com/v1/me/player/repeat");
    url.searchParams.append("state", mode);
    if (deviceId) {
      url.searchParams.append("device_id", deviceId);
    }

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok || response.status === 204) {
      return { success: true };
    }

    return { success: false, error: `HTTP ${response.status}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * Toggle shuffle on or off for the user's playback.
 * @param shuffle true to enable shuffle, false to disable
 * @param accessToken The user's access token
 * @param deviceId Optional device ID (uses currently active device if not provided)
 */
export async function setShuffle(
  shuffle: boolean,
  accessToken: string,
  deviceId?: string,
): Promise<PlayTrackResult> {
  try {
    const url = new URL("https://api.spotify.com/v1/me/player/shuffle");
    url.searchParams.append("state", shuffle ? "true" : "false");
    if (deviceId) {
      url.searchParams.append("device_id", deviceId);
    }

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok || response.status === 204) {
      return { success: true };
    }

    return { success: false, error: `HTTP ${response.status}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * Get the user's recently played tracks.
 * @param accessToken The user's access token
 * @param limit The maximum number of items to return (1-50, default 20)
 */
export async function getRecentlyPlayedTracks(
  accessToken: string,
  limit: number = 20,
): Promise<RecentlyPlayedTrack[] | null> {
  try {
    const url = new URL("https://api.spotify.com/v1/me/player/recently-played");
    url.searchParams.append(
      "limit",
      Math.min(50, Math.max(1, limit)).toString(),
    );

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as SpotifyRecentlyPlayedResponse;

    return data.items.map(
      (item): RecentlyPlayedTrack => ({
        track: {
          id: item.track.id,
          name: item.track.name,
          uri: item.track.uri,
          artists: item.track.artists || [],
          album: item.track.album,
          duration_ms: item.track.duration_ms,
        },
        played_at: item.played_at,
      }),
    );
  } catch {
    return null;
  }
}

/**
 * Add a track to the user's queue.
 * @param trackUri The URI of the track to add
 * @param accessToken The user's access token
 * @param deviceId Optional device ID
 */
export async function addToQueue(
  trackUri: string,
  accessToken: string,
  deviceId?: string,
): Promise<PlayTrackResult> {
  try {
    const url = new URL("https://api.spotify.com/v1/me/player/queue");
    url.searchParams.append("uri", trackUri);
    if (deviceId) {
      url.searchParams.append("device_id", deviceId);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok || response.status === 204) {
      return { success: true };
    }

    return { success: false, error: `HTTP ${response.status}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

type SpotifyRecommendationsResponse = {
  seeds: Array<{
    id: string;
    initialPoolSize: number;
    afterFilteringSize: number;
    afterRelinkingSize: number;
    href: string | null;
    type: string;
  }>;
  tracks: SpotifyTrackResponse[];
};

/**
 * Get track recommendations based on seed tracks.
 * @param seedTrackId The ID of the track to base recommendations on
 * @param accessToken The user's access token
 * @param limit Number of recommendations to fetch (1-100, default 5)
 */
export async function getRecommendations(
  seedTrackId: string,
  accessToken: string,
  limit: number = 5,
): Promise<QueueTrack[] | null> {
  try {
    const url = new URL("https://api.spotify.com/v1/recommendations");
    url.searchParams.append("seed_tracks", seedTrackId);
    url.searchParams.append(
      "limit",
      Math.min(100, Math.max(1, limit)).toString(),
    );

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as SpotifyRecommendationsResponse;

    return (data.tracks || []).map(
      (track: SpotifyTrackResponse): QueueTrack => ({
        id: track.id,
        name: track.name,
        artists: track.artists || [],
        album: track.album,
        duration_ms: track.duration_ms,
        uri: track.uri,
      }),
    );
  } catch {
    return null;
  }
}
