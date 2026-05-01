import {
  initSpotifyPlayer,
  disconnectSpotifyPlayer,
} from "@/app/lib/spotify/SDK/spotifySDK";
import type { InitOptions, SpotifyPlayer } from "@/app/types/spotify";

export interface TransferResult {
  success: boolean;
  error?: string;
}

export interface PlayerInitResult {
  success: boolean;
  deviceId?: string;
  player?: SpotifyPlayer;
  error?: string;
}

export interface TransferOptions {
  // Resume playback immediately after transfer. Defaults to true.
  autoPlay?: boolean;
  // Number of retry attempts if the device isn't visible yet. Defaults to 3.
  retryAttempts?: number;
  // Delay in ms between retries. Defaults to 500.
  retryDelayMs?: number;
}

async function fetchToken(endpoint: string): Promise<string> {
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`Token endpoint responded with ${res.status}`);
  const json = await res.json();
  const token = json?.access_token;
  if (!token) throw new Error("No access_token in token endpoint response");
  return token;
}

export async function transferPlayback(
  token: string,
  deviceId: string,
  opts: TransferOptions = {},
): Promise<TransferResult> {
  if (!token || !deviceId) {
    return { success: false, error: "Missing token or deviceId" };
  }

  const { autoPlay = true } = opts;

  try {
    const res = await fetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_ids: [deviceId],
        play: autoPlay,
      }),
    });

    if (res.ok || res.status === 204) {
      return { success: true };
    }

    const errorData = await res.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.error?.message || `Transfer failed (${res.status})`,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { success: false, error: message };
  }
}

async function transferWithRetry(
  token: string,
  deviceId: string,
  opts: TransferOptions = {},
): Promise<TransferResult> {
  const { retryAttempts = 3, retryDelayMs = 500 } = opts;

  let lastError: string | undefined;

  for (let attempt = 0; attempt < retryAttempts; attempt++) {
    const result = await transferPlayback(token, deviceId, opts);

    if (result.success) return result;

    lastError = result.error;

    if (attempt < retryAttempts - 1) {
      await new Promise((r) => setTimeout(r, retryDelayMs));
    }
  }

  return {
    success: false,
    error: `Transfer failed after ${retryAttempts} attempts. Last error: ${lastError}`,
  };
}

export async function initializePlayerAndTransferPlayback(
  opts?: InitOptions & TransferOptions,
): Promise<PlayerInitResult> {
  const tokenEndpoint = opts?.getTokenEndpoint ?? "/api/spotify/token";

  let player: SpotifyPlayer | undefined;

  try {
    const token = await fetchToken(tokenEndpoint);

    const initResult = await initSpotifyPlayer({
      ...opts,
      getTokenEndpoint: tokenEndpoint,
    });

    player = initResult.player;
    const { deviceId } = initResult;

    const transferResult = await transferWithRetry(token, deviceId, opts);

    if (!transferResult.success) {
      await disconnectSpotifyPlayer(player);
      return { success: false, error: transferResult.error };
    }

    return { success: true, deviceId, player };
  } catch (e) {
    if (player) await disconnectSpotifyPlayer(player);

    const message = e instanceof Error ? e.message : "Unknown error";
    return { success: false, error: message };
  }
}
