"use client";

import {
  FaBackwardStep,
  FaCirclePlay,
  FaForwardStep,
  FaShuffle,
  FaRepeat,
  FaVolumeHigh,
  FaHeart,
  FaDesktop,
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
import { useState } from "react";
import Image from "next/image";

type ControlAction = "play" | "next" | "prev" | null;

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function AudioPlayer() {
  const { currentTrack, accessToken, refreshCurrentTrack } = usePlayer();
  const [loadingControl, setLoadingControl] = useState<ControlAction>(null);

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
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white"
              aria-label="Shuffle"
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
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white"
              aria-label="Repeat"
            >
              <FaRepeat className="h-4 w-4" />
            </button>
          </div>

          <div className="flex w-full items-center gap-2 text-[11px] text-neutral-400">
            <span className="tabular-nums">{formatTime(progress)}</span>
            <div className="h-1 flex-1 rounded-full bg-neutral-700">
              <div
                className="h-1 rounded-full bg-green-500 transition-all duration-300"
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
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white"
            aria-label="Device"
          >
            <FaDesktop className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white"
            aria-label="Volume"
          >
            <FaVolumeHigh className="h-4 w-4" />
          </button>
          <div className="w-24">
            <div className="h-1 rounded-full bg-neutral-700">
              <div className="h-1 w-3/5 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
