"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
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
      <h1 className="text-2xl font-bold mb-6 text-white">Search Results</h1>
      {loading && <div className="text-white">Loading...</div>}
      {error && <div className="text-red-400">Search failed</div>}
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
              <h2 className="text-lg font-semibold text-white mb-2">Tracks</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {searchResults.tracks.items.map((track) => {
                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        if (!loadingTrackId) {
                          handlePlayTrack(track.uri, track.id);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <Card
                        label={track.name}
                        desc={
                          track.artists && Array.isArray(track.artists)
                            ? track.artists
                                .filter((a) => a !== null && a !== undefined)
                                .map((a) => a.name)
                                .filter(Boolean)
                                .join(", ")
                            : ""
                        }
                        src={
                          track.album?.images?.[0]?.url ||
                          "/placeholder-track.png"
                        }
                        shape="square"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
