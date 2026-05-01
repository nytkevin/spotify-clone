"use client";

import { usePlayer } from "@/app/context/playerContext";
import getPlaylistTracks from "@/app/lib/spotify/getPlaylistTracks";
import type { PlaylistTrackItemProp } from "@/app/types/spotify";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FaCirclePlay } from "react-icons/fa6";
import Card from "@/app/components/card";

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function PlaylistDetailsPage() {
  const params = useParams();
  const idParam = params.id;
  const playlistId = Array.isArray(idParam) ? idParam[0] : (idParam ?? "");

  // Token and current playback come from context — no local fetch needed
  const { accessToken, currentTrack, refreshCurrentTrack, playUri } =
    usePlayer();

  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  const handlePlayTrack = async (trackUri: string, trackId: string) => {
    if (loadingTrackId) return; // prevent double-click while initializing

    setLoadingTrackId(trackId);
    setPlayError(null);

    const result = await playUri(trackUri);

    if (!result.success) {
      setPlayError(result.error ?? "Failed to play track");
    } else {
      // Immediately refresh context so the UI reflects the new track
      await refreshCurrentTrack();
    }

    setLoadingTrackId(null);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["playlist-tracks", playlistId],
    queryFn: () => getPlaylistTracks(playlistId),
    enabled: !!playlistId,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold text-white">Playlist Songs</h1>
        <ul className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="flex items-center gap-4 rounded-xl bg-neutral-900 p-3"
            >
              <div className="h-14 w-14 shrink-0 rounded-md bg-neutral-800 animate-pulse" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-3/5 rounded bg-neutral-800 animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-neutral-800 animate-pulse" />
              </div>
              <div className="h-3 w-12 rounded bg-neutral-800 animate-pulse" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <p className="p-6 text-3xl text-red-400 text-center font-extrabold">
        Error: {error.message}
      </p>
    );
  }

  if (!data) {
    return (
      <p className="p-6 text-sm text-neutral-400">
        No playlist tracks returned from API.
      </p>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-white">Playlist Songs</h1>

      {playError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {playError}
        </div>
      )}

      <ul className="space-y-3">
        {data.tracks?.items?.map(
          (
            playlistItem: PlaylistTrackItemProp & {
              item?: PlaylistTrackItemProp["track"];
            },
            index: number,
          ) => {
            const track = playlistItem.item || playlistItem.track;

            if (!track) return null;

            const isLoading = loadingTrackId === track.id;
            const isPlaying =
              currentTrack?.item?.id === track.id && currentTrack.is_playing;

            return (
              <li
                key={track.id}
                className="group flex h-18 items-center gap-2 rounded-xl bg-neutral-900 p-3 text-sm text-neutral-200 transition hover:bg-neutral-800"
              >
                <p className="w-8 shrink-0 text-right text-xs text-neutral-500">
                  {isPlaying ? (
                    <span className="inline-flex gap-px items-end h-4">
                      {[1, 2, 3].map((b) => (
                        <span
                          key={b}
                          className="w-0.75 bg-green-400 rounded-sm animate-bounce"
                          style={{
                            animationDelay: `${b * 100}ms`,
                            height: `${(b % 3) * 4 + 4}px`,
                          }}
                        />
                      ))}
                    </span>
                  ) : (
                    index + 1
                  )}
                </p>

                <button
                  onClick={() => handlePlayTrack(track.uri, track.id)}
                  disabled={!accessToken || !!loadingTrackId}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500 text-black opacity-0 transition hover:scale-105 hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50 group-hover:opacity-100"
                  title={isPlaying ? "Now playing" : "Play track"}
                >
                  {isLoading ? (
                    <span className="animate-spin text-lg">⟳</span>
                  ) : (
                    <FaCirclePlay className="h-5 w-5" />
                  )}
                </button>

                <div className="flex-1">
                  <Card
                    src={track.album.images?.[0]?.url ?? "/fallback.png"}
                    alt={track.album.name}
                    shape="square"
                    layout="row"
                    label={track.name}
                    desc={track.artists.map((a) => a.name).join(", ")}
                    className="w-full bg-transparent p-0 hover:bg-transparent"
                    imageClassName="h-14 w-14 rounded-md object-cover"
                  />
                </div>

                <p className="shrink-0pr-4 text-xs text-neutral-400">
                  {formatDuration(track.duration_ms)}
                </p>
              </li>
            );
          },
        )}
      </ul>
    </div>
  );
}
