"use client";

import getAlbumDetails from "@/app/lib/spotify/getAlbumDetails";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { AlbumDetailsResponseProp } from "@/app/types/spotify";
import { useState } from "react";
import { usePlayer } from "@/app/context/playerContext";
import { IoMdPlay } from "react-icons/io";
import Image from "next/image";
import formatDuration from "@/app/lib/time";

// AlbumDetailsPage - Displays all tracks in an album with play controls and animations
// Features:
// - Track list with album artwork
// - Play button overlay on hover
// - Animated equalizer bars when track is playing
// - Loading spinner during playback initialization
// - Click anywhere on track row to play
export default function AlbumDetailsPage() {
  const params = useParams();
  const idParam = params?.id;
  const albumId = Array.isArray(idParam) ? idParam[0] : (idParam ?? "");

  // Get Spotify player controls and current playback state from context
  // accessToken: required to authenticate with Spotify Web API
  // currentTrack: object containing current playing track info, polled every 3s
  // playUri: function to initiate playback via Spotify Web Playback SDK
  const { accessToken, currentTrack, playUri } = usePlayer();

  // Track ID of the currently loading track (prevents double-clicks)
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  // Error message displayed if track playback fails
  const [playError, setPlayError] = useState<string | null>(null);

  // Handle track playback - initializes player, plays track within album context
  const handlePlayTrack = async (trackUri: string, trackId: string) => {
    // Prevent double-click while SDK is initializing or a track is loading
    if (loadingTrackId) return;

    setLoadingTrackId(trackId);
    setPlayError(null);

    // Pass the album context so next/previous buttons work with the full queue
    const albumContextUri = `spotify:album:${albumId}`;
    const result = await playUri(trackUri, albumContextUri);

    if (!result.success) {
      setPlayError(result.error ?? "Failed to play track");
    }

    setLoadingTrackId(null);
  };

  // Fetch album details using React Query with caching
  // Fetch album details using React Query with caching
  const { data, isLoading, error } = useQuery({
    queryKey: ["album-details", albumId],
    queryFn: () => getAlbumDetails(albumId),
    // Don't fetch until we have a valid album ID from the route params
    enabled: !!albumId,
  });

  // Loading state - shows skeleton placeholders while fetching album tracks
  if (isLoading) {
    return (
      <div className="p-6 bg-[#121212]">
        <h1 className="mb-4 text-2xl font-bold text-white">Album Songs</h1>
        {/* Skeleton loaders matching track row layout */}
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

  // Error state - displays error message if query fails
  if (error) {
    return <p className="p-6 text-sm text-red-400">Error: {error.message}</p>;
  }

  // No data state - returned when API response is empty
  if (!data) {
    return (
      <p className="p-6 text-sm text-neutral-400">
        No album details returned from API.
      </p>
    );
  }

  const albumData = data as AlbumDetailsResponseProp;
  const album = albumData.album;

  // Main render - display album tracks
  return (
    <div className="p-6 bg-[#121212]">
      <h1 className="mb-4 text-2xl font-bold text-white">Album Songs</h1>

      {/* Error notification for failed playback attempts */}
      {playError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {playError}
        </div>
      )}

      {/* Track list container */}
      <div className="space-y-2">
        {/* Map through album tracks and render each as an interactive row */}
        {album.tracks.items.map((track, index) => {
          // Determine if this track is currently loading or playing
          const isTrackLoading = loadingTrackId === track.id;

          const isPlaying =
            currentTrack?.item?.id === track.id && currentTrack.is_playing;

          // Format artist names for display
          const artistNames =
            track.artists
              ?.filter((a) => a !== null && a !== undefined)
              .map((a) => a.name)
              .filter(Boolean)
              .join(", ") || "";

          // Track row container - clickable anywhere to play
          return (
            <div
              key={track.id}
              onClick={() => {
                if (!loadingTrackId) {
                  handlePlayTrack(track.uri, track.id);
                }
              }}
              className="flex items-center gap-4 p-3 rounded-lg bg-neutral-900/40 hover:bg-neutral-700 transition-colors cursor-pointer group"
            >
              {/* Track number (1, 2, 3...) OR animated equalizer bars when playing */}
              <p className="w-8 shrink-0 text-right text-xs text-neutral-500">
                {isPlaying ? (
                  // Animated equalizer - 3 bars with staggered bounce animation
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
                  (track.track_number ?? index + 1)
                )}
              </p>

              {/* Album artwork with play button overlay on hover */}
              <div className="relative shrink-0">
                <Image
                  src={album.images?.[0]?.url || "/placeholder-track.png"}
                  alt={track.name}
                  width={48}
                  height={48}
                  className="rounded-md object-cover"
                />
                {/* Overlay play button - appears on hover and shows loading state */}
                <button
                  disabled={!accessToken || !!loadingTrackId}
                  className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!loadingTrackId) {
                      handlePlayTrack(track.uri, track.id);
                    }
                  }}
                >
                  <IoMdPlay fill="green" />
                </button>
              </div>

              {/* Track name and artist names */}
              <div className="grow min-w-0">
                <p className="text-white font-medium truncate">{track.name}</p>
                <p className="text-neutral-400 text-sm truncate">
                  {artistNames}
                </p>
              </div>

              {/* Duration and loading indicator spinner */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-neutral-400 text-sm">
                  {formatDuration(track.duration_ms)}
                </span>
                {/* Animated spinner appears during track initialization */}
                {isTrackLoading && (
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
