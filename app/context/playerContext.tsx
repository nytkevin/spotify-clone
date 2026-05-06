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
  seekTrack,
  nextTrack,
  getQueue,
  getAvailableDevices,
  transferPlayback,
  setRepeatMode,
  setShuffle,
  getRecentlyPlayedTracks,
  type QueueTrack,
  type Device,
  type RepeatMode,
  type RecentlyPlayedTrack,
} from "./webPlaybackSDK";
import { initializePlayerAndTransferPlayback } from "@/app/util/spotify";
import type { SpotifyPlayer } from "@/app/types/spotify";

type PlayerContextType = {
  currentTrack: CurrentPlaybackState | null;
  isLoading: boolean;
  accessToken: string | null;
  deviceId: string | null;
  volume: number;
  autoplay: boolean;
  queue: QueueTrack[];
  devices: Device[];
  repeatMode: RepeatMode;
  shuffle: boolean;
  recentlyPlayed: RecentlyPlayedTrack[];
  refreshCurrentTrack: () => Promise<void>;
  playUri: (
    trackUri: string,
    contextUri?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  setVolume: (volume: number) => Promise<void>;
  getVolume: () => Promise<number | null>;
  seek: (positionMs: number) => Promise<void>;
  toggleAutoplay: () => void;
  fetchDevices: () => Promise<void>;
  switchDevice: (deviceId: string) => Promise<void>;
  cycleRepeatMode: () => Promise<void>;
  toggleShuffle: () => Promise<void>;
  fetchRecentlyPlayed: () => Promise<void>;
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
  const [volume, setVolumeState] = useState<number>(0.5);
  const [autoplay, setAutoplay] = useState(true);
  const [queue, setQueue] = useState<QueueTrack[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>("off");
  const [shuffle, setShuffleState] = useState<boolean>(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedTrack[]>(
    [],
  );

  // Persist the SDK player instance across renders
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = accessToken;

  // Track previous state to detect track end
  const previousProgressRef = useRef<number>(0);

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

  // Initialize the SDK player as soon as we get an access token
  useEffect(() => {
    if (!accessToken || playerRef.current) return;

    let cancelled = false;

    async function initSDK() {
      try {
        const result = await initializePlayerAndTransferPlayback();
        if (!cancelled && result.player && result.deviceId) {
          playerRef.current = result.player;
          setDeviceId(result.deviceId);
        }
      } catch (err) {
        console.error("Failed to initialize SDK player:", err);
      }
    }

    initSDK();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

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

      // Handle autoplay: detect when track ends
      if (
        autoplay &&
        track &&
        track.is_playing &&
        track.item &&
        track.progress_ms !== null
      ) {
        const currentProgress = track.progress_ms;
        const duration = track.item.duration_ms;
        const previousProgress = previousProgressRef.current;

        // Track has ended if progress went backwards or is near the end and was previously higher
        // This handles the case where the track naturally ends
        if (
          currentProgress < previousProgress - 100 ||
          currentProgress >= duration - 500
        ) {
          // Only auto-skip once per track by checking if we're at the end
          if (currentProgress >= duration - 500) {
            previousProgressRef.current = 0;
            // Auto-skip to next track
            await nextTrack(token);
            // Wait a moment for the next track to load
            setTimeout(() => refreshCurrentTrack(), 1000);
            return;
          }
        }

        previousProgressRef.current = currentProgress;
      } else {
        previousProgressRef.current = 0;
      }
    } finally {
      setIsLoading(false);
    }
  }, [autoplay]);

  useEffect(() => {
    if (!accessToken) return;
    refreshCurrentTrack();
    const interval = setInterval(refreshCurrentTrack, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [accessToken, refreshCurrentTrack]);

  // Fetch queue whenever current track changes
  useEffect(() => {
    const token = tokenRef.current;
    if (!token) return;

    async function fetchQueue(accessToken: string) {
      const queueData = await getQueue(accessToken);
      if (queueData) {
        setQueue(queueData.queue);
      }
    }

    fetchQueue(token);
  }, [currentTrack?.item?.id]);

  /**
   * Play a URI. Requires the SDK player to be initialized and device ID to be available.
   * Supports both single track (trackUri) and context (playlist/album via contextUri).
   * When contextUri is provided, it plays the full context.
   */
  const playUri = useCallback(
    async (trackUri: string, contextUri?: string) => {
      const token = tokenRef.current;
      if (!token) return { success: false, error: "No access token" };
      if (!deviceId)
        return { success: false, error: "Device ID not yet available" };

      try {
        const playResult = await playTrack({
          trackUri,
          contextUri,
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

  /**
   * Set the volume for the Web Playback SDK player.
   * Volume should be between 0 and 1.
   */
  const setVolume = useCallback(async (newVolume: number) => {
    if (!playerRef.current) return;

    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, newVolume));

    try {
      await playerRef.current.setVolume(clampedVolume);
      setVolumeState(clampedVolume);
    } catch (err) {
      console.error("Failed to set volume:", err);
    }
  }, []);

  /**
   * Get the current volume from the Web Playback SDK player.
   */
  const getVolume = useCallback(async (): Promise<number | null> => {
    if (!playerRef.current) return null;

    try {
      const currentVolume = await playerRef.current.getVolume();
      setVolumeState(currentVolume);
      return currentVolume;
    } catch (err) {
      console.error("Failed to get volume:", err);
      return null;
    }
  }, []);

  /**
   * Seek to a position in the current track.
   * @param positionMs Position in milliseconds
   */
  const seek = useCallback(
    async (positionMs: number) => {
      if (!playerRef.current) return;

      try {
        await seekTrack(playerRef.current, positionMs);
        // Refresh the track position after seeking
        await refreshCurrentTrack();
      } catch (err) {
        console.error("Failed to seek track:", err);
      }
    },
    [refreshCurrentTrack],
  );

  /**
   * Toggle autoplay on/off
   */
  const toggleAutoplay = useCallback(() => {
    setAutoplay((prev) => !prev);
  }, []);

  /**
   * Fetch available devices from Spotify
   */
  const fetchDevices = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) return;

    try {
      const availableDevices = await getAvailableDevices(token);
      if (availableDevices) {
        setDevices(availableDevices);
      }
    } catch (err) {
      console.error("Failed to fetch devices:", err);
    }
  }, []);

  /**
   * Switch playback to a different device
   */
  const switchDevice = useCallback(
    async (newDeviceId: string) => {
      const token = tokenRef.current;
      if (!token) return;

      try {
        const result = await transferPlayback(newDeviceId, token, true);

        if (result.success) {
          setDeviceId(newDeviceId);
          // Refresh devices to show the new active device
          await fetchDevices();
        }
      } catch (err) {
        console.error("Failed to switch device:", err);
      }
    },
    [fetchDevices],
  );

  /**
   * Fetch recently played tracks from Spotify
   */
  const fetchRecentlyPlayed = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) return;

    try {
      const tracks = await getRecentlyPlayedTracks(token, 10);
      if (tracks) {
        setRecentlyPlayed(tracks);
      }
    } catch (err) {
      console.error("Failed to fetch recently played tracks:", err);
    }
  }, []);

  // Fetch devices whenever access token changes
  useEffect(() => {
    if (!accessToken) return;
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [accessToken, fetchDevices]);

  // Fetch recently played tracks whenever access token changes
  useEffect(() => {
    if (!accessToken) return;
    fetchRecentlyPlayed();
    const interval = setInterval(fetchRecentlyPlayed, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [accessToken, fetchRecentlyPlayed]);

  /**
   * Cycle through repeat modes: off → context → track → off
   */
  const cycleRepeatMode = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) return;

    const modeSequence: RepeatMode[] = ["off", "context", "track"];
    const currentIndex = modeSequence.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modeSequence.length;
    const nextMode = modeSequence[nextIndex];

    try {
      const result = await setRepeatMode(
        nextMode,
        token,
        deviceId || undefined,
      );
      if (result.success) {
        setRepeatModeState(nextMode);
      }
    } catch (err) {
      console.error("Failed to set repeat mode:", err);
    }
  }, [repeatMode, deviceId]);

  /**
   * Toggle shuffle on/off
   */
  const toggleShuffle = useCallback(async () => {
    const token = tokenRef.current;
    if (!token) return;

    try {
      const result = await setShuffle(!shuffle, token, deviceId || undefined);
      if (result.success) {
        setShuffleState(!shuffle);
      }
    } catch (err) {
      console.error("Failed to toggle shuffle:", err);
    }
  }, [shuffle, deviceId]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isLoading,
        accessToken,
        deviceId,
        volume,
        autoplay,
        queue,
        devices,
        repeatMode,
        shuffle,
        recentlyPlayed,
        refreshCurrentTrack,
        playUri,
        setVolume,
        getVolume,
        seek,
        toggleAutoplay,
        fetchDevices,
        switchDevice,
        cycleRepeatMode,
        toggleShuffle,
        fetchRecentlyPlayed,
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
