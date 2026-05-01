"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  getCurrentPlayingTrack,
  CurrentPlaybackState,
  playTrack,
} from "./webPlaybackSDK";
import { initializePlayerAndTransferPlayback } from "@/app/util/spotify";
import type { SpotifyPlayer } from "@/app/types/spotify";

type PlayerContextType = {
  currentTrack: CurrentPlaybackState | null;
  isLoading: boolean;
  accessToken: string | null;
  deviceId: string | null;
  refreshCurrentTrack: () => Promise<void>;
  playUri: (trackUri: string) => Promise<{ success: boolean; error?: string }>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const TOKEN_ENDPOINT = "/api/spotify/token";
const POLL_INTERVAL_MS = 3000;

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<CurrentPlaybackState | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // Persist the SDK player instance across renders
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = accessToken;

  useEffect(() => {
    let cancelled = false;

    async function fetchToken() {
      try {
        const res = await fetch(TOKEN_ENDPOINT);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.access_token) {
          setAccessToken(data.access_token);
        }
      } catch (err) {
        console.error("Failed to fetch access token:", err);
      }
    }

    fetchToken();
    return () => {
      cancelled = true;
    };
  }, []);

  // Disconnect the SDK player when the provider unmounts
  useEffect(() => {
    return () => {
      playerRef.current?.disconnect();
    };
  }, []);

  const refreshCurrentTrack = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) return;

    setIsLoading(true);
    try {
      const track = await getCurrentPlayingTrack(token);
      setCurrentTrack(track);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    refreshCurrentTrack();
    const interval = setInterval(refreshCurrentTrack, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [accessToken, refreshCurrentTrack]);

  /**
   * Play a URI. Initializes the SDK player on the first call only.
   * On subsequent calls, reuses the existing player + deviceId.
   */
  const playUri = useCallback(
    async (trackUri: string) => {
      const token = tokenRef.current;
      if (!token) return { success: false, error: "No access token" };

      try {
        if (!playerRef.current || !deviceId) {
          const result = await initializePlayerAndTransferPlayback();

          if (!result.success || !result.player || !result.deviceId) {
            return {
              success: false,
              error: result.error ?? "Failed to initialize player",
            };
          }

          playerRef.current = result.player;
          setDeviceId(result.deviceId);

          const playResult = await playTrack({
            trackUri,
            deviceId: result.deviceId,
            accessToken: token,
          });

          await refreshCurrentTrack();
          return playResult;
        }

        const playResult = await playTrack({
          trackUri,
          deviceId,
          accessToken: token,
        });

        await refreshCurrentTrack();
        return playResult;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { success: false, error: message };
      }
    },
    [deviceId, refreshCurrentTrack],
  );

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isLoading,
        accessToken,
        deviceId,
        refreshCurrentTrack,
        playUri,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context)
    throw new Error("usePlayer must be used within a PlayerProvider");
  return context;
}
