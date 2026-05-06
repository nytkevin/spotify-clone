"use client";

import {
  FaBackwardStep,
  FaCirclePlay,
  FaForwardStep,
  FaShuffle,
  FaRepeat,
  FaVolumeHigh,
  FaHeart,
  FaListUl,
  FaPause,
} from "react-icons/fa6";
import { usePlayer } from "@/app/context/playerContext";
import {
  pausePlayback,
  resumePlayback,
  nextTrack,
  previousTrack,
} from "@/app/context/webPlaybackSDK";
import { useState, useEffect } from "react";
import Image from "next/image";
import DeviceSelector from "./device-selector";

type ControlAction = "play" | "next" | "prev" | null;

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function AudioPlayer() {
  const {
    currentTrack,
    accessToken,
    refreshCurrentTrack,
    volume,
    setVolume,
    getVolume,
    seek,
    autoplay,
    toggleAutoplay,
    repeatMode,
    cycleRepeatMode,
    shuffle,
    toggleShuffle,
  } = usePlayer();
  const [loadingControl, setLoadingControl] = useState<ControlAction>(null);
  const [isVolumeHovered, setIsVolumeHovered] = useState(false);

  const handlePlayPause = async () => {
    if (!accessToken) return;
    setLoadingControl("play");
    if (currentTrack?.is_playing) {
      await pausePlayback(accessToken);
    } else {
      await resumePlayback(accessToken);
    }
    await refreshCurrentTrack();
    setLoadingControl(null);
  };

  const handleNext = async () => {
    if (!accessToken) return;
    setLoadingControl("next");
    await nextTrack(accessToken);
    await refreshCurrentTrack();
    setLoadingControl(null);
  };

  const handlePrevious = async () => {
    if (!accessToken) return;
    setLoadingControl("prev");
    await previousTrack(accessToken);
    await refreshCurrentTrack();
    setLoadingControl(null);
  };

  // Fetch initial volume when component mounts or player is ready
  useEffect(() => {
    const fetchVolume = async () => {
      const vol = await getVolume();
      if (vol !== null) {
        // Volume is already set in state by getVolume
      }
    };
    fetchVolume();
  }, [getVolume]);

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    await setVolume(newVolume);
  };

  const handleSeek = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentTrack?.item) return;

    const duration = currentTrack.item.duration_ms;
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const positionMs = Math.max(0, Math.min(duration, percent * duration));

    await seek(positionMs);
  };

  const track = currentTrack?.item;
  const progress = currentTrack?.progress_ms ?? 0;
  const duration = track?.duration_ms ?? 0;
  const progressPercent = duration ? (progress / duration) * 100 : 0;
  const isDisabled = !!loadingControl || !accessToken;

  return (
    <div className="h-15 border-t border-neutral-800 rounded-t-xl bg-[#181818] px-4 text-white shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
      <div className="mx-auto grid h-full grid-cols-[minmax(180px,1.2fr)_minmax(240px,1.5fr)_minmax(180px,1fr)] items-center gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-neutral-700 shadow-inner">
            {track?.album.images?.[0]?.url ? (
              <Image
                src={track.album.images[0].url}
                alt={track.album.name}
                width={30}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-neutral-700" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {track?.name ?? "No song playing"}
            </p>
            <p className="truncate text-xs text-neutral-400">
              {track?.artists.map((a) => a.name).join(", ") ?? "Spotify Clone"}
            </p>
          </div>
          <button
            type="button"
            className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Like"
          >
            <FaHeart className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-0.5 pt-1.5">
          <div className="flex items-center gap-3 text-neutral-300">
            <button
              type="button"
              onClick={toggleShuffle}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                shuffle
                  ? "bg-green-500 text-black hover:bg-green-400"
                  : "text-neutral-400 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Shuffle"
              title={shuffle ? "Shuffle enabled" : "Shuffle disabled"}
            >
              <FaShuffle className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous"
              onClick={handlePrevious}
              disabled={isDisabled}
            >
              {loadingControl === "prev" ? (
                <span className="animate-spin text-sm">⟳</span>
              ) : (
                <FaBackwardStep className="h-5 w-5" />
              )}
            </button>

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={currentTrack?.is_playing ? "Pause" : "Play"}
              onClick={handlePlayPause}
              disabled={isDisabled}
            >
              {loadingControl === "play" ? (
                <span className="animate-spin text-sm text-black">⟳</span>
              ) : currentTrack?.is_playing ? (
                <FaPause className="h-4 w-4" />
              ) : (
                <FaCirclePlay className="h-5 w-5" />
              )}
            </button>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next"
              onClick={handleNext}
              disabled={isDisabled}
            >
              {loadingControl === "next" ? (
                <span className="animate-spin text-sm">⟳</span>
              ) : (
                <FaForwardStep className="h-5 w-5" />
              )}
            </button>

            <button
              type="button"
              onClick={cycleRepeatMode}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition ${
                repeatMode === "off"
                  ? "text-neutral-400 hover:text-white hover:bg-white/10"
                  : "bg-green-500 text-black hover:bg-green-400"
              }`}
              aria-label="Repeat mode"
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === "track" ? (
                <span className="text-xs">1</span>
              ) : (
                <FaRepeat className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleAutoplay}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition ${
                autoplay
                  ? "bg-green-500 text-black hover:bg-green-400"
                  : "text-neutral-400 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Autoplay"
              title={autoplay ? "Autoplay enabled" : "Autoplay disabled"}
            >
              A
            </button>
          </div>

          <div className="flex w-full items-center gap-2 text-[11px] text-neutral-400">
            <span className="tabular-nums">{formatTime(progress)}</span>
            <div
              className="group h-1 flex-1 cursor-pointer rounded-full bg-neutral-700 transition-all hover:h-2"
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-300 group-hover:shadow-lg"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 text-neutral-300">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white"
            aria-label="Queue"
          >
            <FaListUl className="h-4 w-4" />
          </button>
          <DeviceSelector />
          <div
            className="flex items-center gap-2"
            onMouseEnter={() => setIsVolumeHovered(true)}
            onMouseLeave={() => setIsVolumeHovered(false)}
          >
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white"
              aria-label="Volume"
            >
              <FaVolumeHigh className="h-4 w-4" />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                isVolumeHovered ? "w-24" : "w-0"
              }`}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-neutral-700 accent-white"
                aria-label="Volume control"
                style={{
                  background: `linear-gradient(to right, white 0%, white ${
                    volume * 100
                  }%, rgb(55, 65, 81) ${volume * 100}%, rgb(55, 65, 81) 100%)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
