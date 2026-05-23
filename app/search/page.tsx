"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getSearch } from "@/app/lib/spotify/getSearch";
import Card from "@/app/components/card";
import type { SearchResponceProp } from "@/app/types/spotify";
import { usePlayer } from "../context/playerContext";
import formatDuration from "../lib/time";
import { CgDanger } from "react-icons/cg";
import { IoMdPlay } from "react-icons/io";
import { FaSearch } from "react-icons/fa";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { accessToken, refreshCurrentTrack, playUri } = usePlayer();

  // Track ID of the currently playing/loading track
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  // Error message state for track playback failures
  const [playError, setPlayError] = useState<string | null>(null);

  // Handle track playback with loading state and error handling
  const handlePlayTrack = async (trackUri: string, trackId: string) => {
    // Prevent multiple simultaneous requests
    if (loadingTrackId) return;
    setLoadingTrackId(trackId);
    setPlayError(null);

    // Attempt to play the track via Spotify API
    const result = await playUri(trackUri);

    // Handle success/error response
    if (!result.success) {
      setPlayError(result.error ?? "Failed to play track");
    } else {
      // Refresh player state after successful playback
      await refreshCurrentTrack();
    }
    setLoadingTrackId(null);
  };

  // Listen for custom search events from navbar components
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail && typeof customEvent.detail === "string") {
        setQuery(customEvent.detail);
      }
    };
    window.addEventListener("spotify-search", handler);
    // Cleanup event listener on unmount
    return () => window.removeEventListener("spotify-search", handler);
  }, []);

  const {
    data: results,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["search", query],
    // Only fetch when query is not empty
    queryFn: () =>
      query
        ? getSearch({ q: query, type: "artist,track", limit: 8 })
        : Promise.resolve(null),
    enabled: !!query,
    refetchOnWindowFocus: false,
  });

  // Type-safe search results, excluding error responses
  const searchResults =
    results && !("error" in results) ? (results as SearchResponceProp) : null;

  return (
    <div className="max-full mx-auto px-4 py-8 bg-[#121212] min-h-screen">
      {/* Search input field - only visible on mobile (md:hidden) */}
      <input
        type="text"
        placeholder="Search artists, tracks, albums..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="md:hidden w-full mb-6 px-4 py-2 rounded-lg bg-neutral-800 text-white placeholder-neutral-400 border border-neutral-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
      />
      <h1 className="text-2xl font-bold mb-6 text-white">Search Results</h1>

      {/* Loading state - shows spinner while fetching results */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-12 rounded-lg bg-neutral-900/40">
          <div className="w-9 h-9 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-neutral-300">Searching...</span>
        </div>
      )}

      {/* Error state - displays error message if search fails */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <CgDanger className="w-9 h-9 text-red-400 shrink-0" />

          <span className="text-red-400 text-sm">
            Search failed. Please try again.
          </span>
        </div>
      )}

      {/* Playback error state - shows error if track fails to play */}
      {playError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {playError}
        </div>
      )}
      {/* Search results display section */}
      {!loading && !error && searchResults && (
        <div>
          {/*---------------------------------------- Artists-------------------------- section */}
          {searchResults.artists?.items && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-2">Artists</h2>
              <div className="grid grid-cols-2 items-stretch md:grid-cols-4 gap-4 rounded-2xl">
                {searchResults.artists.items.map((artist) => (
                  <Link key={artist.id} href={`/artist/${artist.id}`}>
                    <Card
                      label={artist.name}
                      src={artist.images?.[0]?.url || "/fallback.png"}
                      width={320}
                      height={320}
                      shape="circle"
                      className="group bg-neutral-950/80 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:bg-neutral-900"
                      imageClassName="aspect-square w-full max-w-[220px] ring-1 ring-white/10"
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/*------------------------------------ Tracks --------------------------------section */}
          {searchResults.tracks?.items && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Tracks</h2>
              <div className="space-y-2">
                {searchResults.tracks.items.map((track) => {
                  // Extract and format artist names from track data
                  const artistNames = track.artists
                    ? track.artists
                        .filter((a) => a !== null && a !== undefined)
                        .map((a) => a.name)
                        .filter(Boolean)
                        .join(", ")
                    : "";

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        if (!loadingTrackId) {
                          handlePlayTrack(track.uri, track.id);
                        }
                      }}
                      className="flex items-center gap-4 p-3 rounded-lg bg-neutral-900/40 hover:bg-neutral-900/70 transition-colors cursor-pointer group"
                    >
                      {/* Album artwork with play button overlay */}
                      <div className="relative shrink-0">
                        <Image
                          src={
                            track.album?.images?.[0]?.url ||
                            "/placeholder-track.png"
                          }
                          alt={track.name}
                          width={48}
                          height={48}
                          className="rounded-md object-cover"
                        />
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
                      {/* Track info - name and artists */}
                      <div className="grow min-w-0">
                        <p className="text-white font-medium truncate">
                          {track.name}
                        </p>
                        <p className="text-neutral-400 text-sm truncate">
                          {artistNames}
                        </p>
                      </div>

                      {/* Track duration and loading indicator */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-neutral-400 text-sm">
                          {track.duration_ms
                            ? formatDuration(track.duration_ms)
                            : "0:00"}
                        </span>
                        {loadingTrackId === track.id && (
                          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state - shown when search returns no results */}
      {!loading &&
        !error &&
        searchResults &&
        !searchResults.artists?.items?.length &&
        !searchResults.tracks?.items?.length && (
          <div className="flex flex-col items-center justify-center rounded-lg bg-neutral-900/40 py-12 px-6">
            <FaSearch />
            <h3 className="text-lg font-semibold text-neutral-300 mb-2">
              No results found
            </h3>
            <p className="text-center text-neutral-500 text-sm">
              We couldn&apos;t find any artists or tracks matching your search.
              Try a different query.
            </p>
          </div>
        )}
      {/* Initial state - shown when no search query has been entered */}
      {!loading && !error && !results && (
        <div className="text-stone-400">
          Type in the search bar to find artists, tracks.
        </div>
      )}
    </div>
  );
}
