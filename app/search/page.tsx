"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getSearch } from "@/app/lib/spotify/getSearch";
import Card from "@/app/components/card";
import type { SearchResponceProp } from "@/app/types/spotify";
import { usePlayer } from "../context/playerContext";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { refreshCurrentTrack, playUri } = usePlayer();

  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayTrack = async (trackUri: string, trackId: string) => {
    if (loadingTrackId) return;

    setLoadingTrackId(trackId);
    setPlayError(null);

    const result = await playUri(trackUri);

    if (!result.success) {
      setPlayError(result.error ?? "Failed to play track");
    } else {
      await refreshCurrentTrack();
    }

    setLoadingTrackId(null);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail && typeof customEvent.detail === "string") {
        setQuery(customEvent.detail);
      }
    };
    window.addEventListener("spotify-search", handler);
    return () => window.removeEventListener("spotify-search", handler);
  }, []);

  const {
    data: results,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["search", query],
    queryFn: () =>
      query
        ? getSearch({ q: query, type: "artist,album,track,playlist", limit: 8 })
        : Promise.resolve(null),
    enabled: !!query,
    refetchOnWindowFocus: false,
  });

  const searchResults =
    results && !("error" in results) ? (results as SearchResponceProp) : null;

  return (
    <div className="max-full mx-auto px-4 py-8">
      <input
        type="text"
        placeholder="Search artists, tracks, albums..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="md:hidden w-full mb-6 px-4 py-2 rounded-lg bg-neutral-800 text-white placeholder-neutral-400 border border-neutral-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
      />
      <h1 className="text-2xl font-bold mb-6 text-white">Search Results</h1>
      {loading && (
        <div className="flex items-center justify-center gap-3 py-12 rounded-lg bg-neutral-900/40">
          <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-neutral-300">Searching...</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <svg
            className="w-5 h-5 text-red-400 shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span className="text-red-400 text-sm">
            Search failed. Please try again.
          </span>
        </div>
      )}
      {playError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {playError}
        </div>
      )}
      {!loading && !error && searchResults && (
        <div>
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
                      className="group border border-white/5 bg-neutral-950/80 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-neutral-900"
                      imageClassName="aspect-square w-full max-w-[220px] ring-1 ring-white/10"
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}
          {searchResults.tracks?.items && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Tracks</h2>
              <div className="space-y-2">
                {searchResults.tracks.items.map((track) => {
                  const artistNames =
                    track.artists && Array.isArray(track.artists)
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
                          className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!loadingTrackId) {
                              handlePlayTrack(track.uri, track.id);
                            }
                          }}
                        >
                          <svg
                            className="w-6 h-6 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </div>
                      <div className="grow min-w-0">
                        <p className="text-white font-medium truncate">
                          {track.name}
                        </p>
                        <p className="text-neutral-400 text-sm truncate">
                          {artistNames}
                        </p>
                      </div>
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
      {!loading &&
        !error &&
        searchResults &&
        !searchResults.artists?.items?.length &&
        !searchResults.tracks?.items?.length && (
          <div className="flex flex-col items-center justify-center rounded-lg bg-neutral-900/40 py-12 px-6">
            <svg
              className="w-12 h-12 text-neutral-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-neutral-300 mb-2">
              No results found
            </h3>
            <p className="text-center text-neutral-500 text-sm">
              We couldn&apos;t find any artists or tracks matching your search.
              Try a different query.
            </p>
          </div>
        )}
      {!loading && !error && !results && (
        <div className="text-stone-400">
          Type in the search bar to find artists, albums, tracks, or playlists.
        </div>
      )}
    </div>
  );
}
