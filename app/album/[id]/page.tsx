"use client";

import getAlbumDetails from "@/app/lib/spotify/getAlbumDetails";
import Card from "@/app/components/card";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { AlbumDetailsResponseProp } from "@/app/types/spotify";
import { useState } from "react";
import { usePlayer } from "@/app/context/playerContext";
import { FaCirclePlay } from "react-icons/fa6";

function formatDuration(durationMs: number) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function AlbumDetailsPage() {
  const params = useParams();
  const idParam = params?.id;
  const albumId = Array.isArray(idParam) ? idParam[0] : (idParam ?? "");

  // playUri: init SDK on first call, reuse player on subsequent calls
  // currentTrack: polled every 3s from Spotify — source of truth for playing state
  const { accessToken, currentTrack, playUri } = usePlayer();

  // Track which row's play button is in the loading/init state
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  const handlePlayTrack = async (trackUri: string, trackId: string) => {
    // Prevent double-click while SDK is initializing or a track is loading
    if (loadingTrackId) return;

    setLoadingTrackId(trackId);
    setPlayError(null);

    // Pass the album context so next/previous work with the full queue
    const albumContextUri = `spotify:album:${albumId}`;
    const result = await playUri(trackUri, albumContextUri);

    if (!result.success) {
      setPlayError(result.error ?? "Failed to play track");
    }

    setLoadingTrackId(null);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["album-details", albumId],
    queryFn: () => getAlbumDetails(albumId),
    // Don't fetch until we have a valid album ID from the route params
    enabled: !!albumId,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold text-white">Album Songs</h1>
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

  if (error) {
    return <p className="p-6 text-sm text-red-400">Error: {error.message}</p>;
  }

  if (!data) {
    return (
      <p className="p-6 text-sm text-neutral-400">
        No album details returned from API.
      </p>
    );
  }

  const albumData = data as AlbumDetailsResponseProp;
  const album = albumData.album;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-white">Album Songs</h1>

      {playError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {playError}
        </div>
      )}

      <ul className="space-y-3">
        {album.tracks.items.map((track, index) => {
          const isTrackLoading = loadingTrackId === track.id;

          const isPlaying =
            currentTrack?.item?.id === track.id && currentTrack.is_playing;

          return (
            <li
              key={track.id}
              className="group flex items-center gap-4 rounded-xl bg-neutral-900 p-3 text-sm text-neutral-200 transition hover:bg-neutral-800 h-18"
            >
              <div className="w-8 shrink-0 text-right text-xs text-neutral-500">
                {isPlaying ? (
                  // Animated equalizer bars — visible only on the active track
                  <span className="inline-flex items-end gap-px h-4">
                    {[1, 2, 3].map((b) => (
                      <span
                        key={b}
                        className="w-0.75 rounded-sm bg-green-400 animate-bounce"
                        style={{
                          animationDelay: `${b * 100}ms`,
                          height: `${(b % 3) * 4 + 4}px`,
                        }}
                      />
                    ))}
                  </span>
                ) : (
                  (track.track_number ?? index + 1)
                )}
              </div>

              <button
                onClick={() => handlePlayTrack(track.uri, track.id)}
                // Disable all buttons while any track is loading to avoid
                disabled={!accessToken || !!loadingTrackId}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500 text-black opacity-0 transition hover:scale-105 hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50 group-hover:opacity-100"
                title={isPlaying ? "Now playing" : "Play track"}
              >
                {isTrackLoading ? (
                  <span className="animate-spin text-lg">⟳</span>
                ) : (
                  <FaCirclePlay className="h-5 w-5" />
                )}
              </button>

              <Card
                src={album.images?.[0]?.url ?? "/fallback.png"}
                alt={track.name}
                width={56}
                height={56}
                shape="square"
                className="shrink-0 cursor-default rounded-md bg-transparent p-0 hover:bg-transparent"
                imageClassName="h-14 w-14 rounded-md object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{track.name}</p>
                <p className="truncate text-xs text-neutral-400">
                  {track.artists.map((a) => a.name).join(", ")}
                </p>
              </div>

              <p className="shrink-0 pr-4 text-xs text-neutral-400">
                {formatDuration(track.duration_ms)}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
