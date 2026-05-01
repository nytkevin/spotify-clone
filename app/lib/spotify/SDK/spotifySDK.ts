import {
  InitOptions,
  SpotifySDK,
  SpotifyPlayer,
  SpotifyPlayerInitResult,
} from "@/app/types/spotify";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: SpotifySDK;
  }
}

async function ensureSpotifySDKLoaded(): Promise<void> {
  if (typeof window === "undefined")
    throw new Error("Spotify SDK must be loaded on the client");

  if (window.Spotify && window.Spotify.Player) return;

  await new Promise<void>((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = () => resolve();

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.onerror = () =>
      reject(new Error("Failed to load Spotify Web Playback SDK"));
    document.head.appendChild(script);
  });
}

async function fetchAccessToken(endpoint = "/api/spotify/token") {
  const res = await fetch(endpoint);
  if (!res.ok) return null;
  try {
    const json = await res.json();
    return json?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function initSpotifyPlayer(
  opts: InitOptions = {},
): Promise<SpotifyPlayerInitResult> {
  const {
    name = "Web Playback SDK Player",
    getTokenEndpoint = "/api/spotify/token",
    volume = 0.5,
    timeoutMs = 10000,
    onReady,
    onNotReady,
    onError,
  } = opts;

  await ensureSpotifySDKLoaded();

  const PlayerClass = window.Spotify?.Player;
  if (!PlayerClass)
    throw new Error("Spotify Player class not available after SDK load");

  let resolveReady: (val: SpotifyPlayerInitResult) => void;
  let rejectReady: (err: unknown) => void;

  const readyPromise = new Promise<SpotifyPlayerInitResult>(
    (resolve, reject) => {
      resolveReady = resolve;
      rejectReady = reject;
    },
  );

  const player = new PlayerClass({
    name,
    getOAuthToken: (cb: (token: string) => void) => {
      // fetch latest token from our server endpoint and call the SDK callback
      fetchAccessToken(getTokenEndpoint)
        .then((token) => {
          if (token) cb(token);
          else {
            const err = new Error("No access token available for Spotify SDK");
            onError?.(err);
            console.error(err);
          }
        })
        .catch((e) => {
          onError?.(e);
          console.error(e);
        });
    },
    volume,
  });

  // listeners
  player.addListener("ready", ({ device_id }: { device_id: string }) => {
    onReady?.(device_id);
    resolveReady({ player, deviceId: device_id });
  });

  player.addListener("not_ready", ({ device_id }: { device_id: string }) => {
    onNotReady?.(device_id);
    console.warn("Spotify device went offline", device_id);
  });

  player.addListener(
    "initialization_error",
    ({ message }: { message: string }) => {
      const err = new Error(message);
      onError?.(err);
      console.error(message);
      rejectReady(err);
    },
  );

  player.addListener(
    "authentication_error",
    ({ message }: { message: string }) => {
      const err = new Error(message);
      onError?.(err);
      console.error("Authentication error", message);
      rejectReady(err);
    },
  );

  player.addListener("account_error", ({ message }: { message: string }) => {
    const err = new Error(message);
    onError?.(err);
    console.error("Account error", message);
    rejectReady(err);
  });

  const connected = await player.connect();
  if (!connected) {
    const err = new Error("Failed to connect Spotify player");
    onError?.(err);
    throw err;
  }

  // enforce timeout in case 'ready' never fires
  const timeoutId = setTimeout(() => {
    const err = new Error(
      "Timed out waiting for Spotify Player to become ready",
    );
    onError?.(err);
    rejectReady(err);
  }, timeoutMs);

  try {
    const result = await readyPromise;
    clearTimeout(timeoutId);
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    player.disconnect();
    throw err;
  }
}

export async function disconnectSpotifyPlayer(player: SpotifyPlayer) {
  try {
    if (player && typeof player.disconnect === "function")
      await player.disconnect();
  } catch (e) {
    console.warn("Error disconnecting Spotify player", e);
  }
}
