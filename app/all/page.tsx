"use client";

// This is a client-side Next.js page component that displays user's Spotify content
// including top artists, recently played tracks, albums, and playlists

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRef, useState } from "react";
import getArtists from "@/app/lib/spotify/getArtists";
import getAlbums from "@/app/lib/spotify/getAlbums";
import getPlaylists from "@/app/lib/spotify/getPlaylists";
import Card from "@/app/components/card";
import { usePlayer } from "@/app/context/playerContext";
import { FaChevronLeft } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa";
import type {
  ArtistResponceProp,
  AlbumResponceProp,
  PlaylistProp,
} from "@/app/types/spotify";
import Image from "next/image";

// Type definition for saved albums from Spotify API
type SavedAlbumItem = {
  album: AlbumResponceProp;
};

/**
 * AllPage Component
 *
 * Main page displaying user's Spotify library with:
 * - Top 12 artists
 * - Recently played tracks
 * - Saved albums
 * - Playlists
 *
 * All sections feature horizontal scrolling with navigation buttons
 */
export default function AllPage() {
  // Get recently played tracks from player context
  const { recentlyPlayed } = usePlayer();

  // Refs for managing horizontal scroll containers
  const artistsScrollRef = useRef<HTMLDivElement>(null);
  const albumsScrollRef = useRef<HTMLDivElement>(null);
  const playlistsScrollRef = useRef<HTMLDivElement>(null);

  // State for tracking scroll button visibility on each section
  // Artists section scroll buttons
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  // Albums section scroll buttons
  const [canAlbumsScrollLeft, setCanAlbumsScrollLeft] = useState(false);
  const [canAlbumsScrollRight, setCanAlbumsScrollRight] = useState(true);
  // Playlists section scroll buttons
  const [canPlaylistsScrollLeft, setCanPlaylistsScrollLeft] = useState(false);
  const [canPlaylistsScrollRight, setCanPlaylistsScrollRight] = useState(true);

  /**
   * Handles horizontal scrolling for carousel sections
   * Smoothly scrolls the container and updates button visibility
   *
   * @param direction - Direction to scroll: 'left' or 'right'
   * @param ref - Reference to the scrollable container
   * @param setCanLeft - Function to update left button state
   * @param setCanRight - Function to update right button state
   */
  const handleScroll = (
    direction: "left" | "right",
    ref: React.RefObject<HTMLDivElement | null>,
    setCanLeft: React.Dispatch<React.SetStateAction<boolean>>,
    setCanRight: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    if (!ref.current) return;

    const scrollAmount = 300; // Amount to scroll per click
    const newScrollPosition =
      ref.current.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);

    // Smoothly scroll to new position
    ref.current.scrollTo({
      left: newScrollPosition,
      behavior: "smooth",
    });

    // Update scroll button visibility after animation completes
    setTimeout(() => {
      if (ref.current) {
        // Show left button if we can scroll left
        setCanLeft(ref.current.scrollLeft > 0);
        // Show right button if we can scroll right (with 10px buffer)
        setCanRight(
          ref.current.scrollLeft <
            ref.current.scrollWidth - ref.current.clientWidth - 10,
        );
      }
    }, 300); // Match scroll animation duration
  };

  // Fetch user's top artists from Spotify API
  // Cached with React Query to avoid unnecessary API calls
  const {
    data: artistsData,
    isLoading: artistsLoading,
    error: artistsError,
  } = useQuery({
    queryKey: ["artists"],
    queryFn: () =>
      getArtists({ limit: 12, offset: 0, timeRange: "medium_term" }),
  });

  // Fetch user's saved albums from Spotify API
  const {
    data: albumsData,
    isLoading: albumsLoading,
    error: albumsError,
  } = useQuery({
    queryKey: ["albums"],
    queryFn: () => getAlbums(),
  });

  // Fetch user's playlists from Spotify API
  const {
    data: playlistsData,
    isLoading: playlistsLoading,
    error: playlistsError,
  } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => getPlaylists(),
  });

  // Combine loading states: show loading if any data is still fetching
  const isLoading = artistsLoading || albumsLoading || playlistsLoading;
  // Combine error states: show error if any query failed
  const hasError = artistsError || albumsError || playlistsError;

  // Loading state: Display skeleton loaders while data is being fetched
  if (isLoading) {
    return (
      <div className="space-y-12 py-8">
        {/* Artists Loading Skeleton */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">
            Your Top Artists
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="animate-pulse space-y-3">
                <div className="aspect-square w-full rounded-full bg-neutral-800/60" />
                <div className="h-4 rounded bg-neutral-800/60" />
              </div>
            ))}
          </div>
        </section>

        {/* Albums Loading Skeleton */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Your Albums</h2>
          <section className="grid grid-cols-2 items-stretch gap-4 rounded-2xl bg-black/90 p-4 md:grid-cols-4 md:gap-6 md:p-6">
            {/* Generate 20 skeleton cards while loading */}
            {Array.from({ length: 20 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse space-y-3 rounded-xl bg-neutral-900/50 p-4"
              >
                <div className="aspect-square w-full rounded-lg bg-neutral-800/60" />
                <div className="h-4 rounded bg-neutral-800/60" />
                <div className="h-3 w-3/4 rounded bg-neutral-800/60" />
              </div>
            ))}
          </section>
        </section>

        {/* Playlists Loading Skeleton */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Your Playlists</h2>
          <section className="grid grid-cols-2 items-stretch gap-4 rounded-2xl bg-black/90 p-4 md:grid-cols-4 md:gap-6 md:p-6">
            {/* Generate 20 skeleton cards while loading */}
            {Array.from({ length: 20 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse space-y-3 rounded-xl bg-neutral-900/50 p-4"
              >
                <div className="aspect-square w-full rounded-lg bg-neutral-800/60" />
                <div className="h-4 rounded bg-neutral-800/60" />
                <div className="h-3 w-3/4 rounded bg-neutral-800/60" />
              </div>
            ))}
          </section>
        </section>
      </div>
    );
  }

  // Error state: Display error message if any data fetch failed
  if (hasError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            Failed to Load Content
          </h2>
          <p className="text-neutral-400">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  // Main render: Display loaded content with horizontal scroll carousels
  return (
    <div className="space-y-12 py-8">
      {/* Artists Section - Displays user's top artists in a scrollable carousel */}
      {artistsData?.artists?.items && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">
            Your Top Artists
          </h2>
          <div className="relative group">
            {/* Left scroll button - appears on hover */}
            <button
              onClick={() =>
                handleScroll(
                  "left",
                  artistsScrollRef,
                  setCanScrollLeft,
                  setCanScrollRight,
                )
              }
              disabled={!canScrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed text-white w-10 h-10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <FaChevronLeft className="text-lg" />
            </button>

            {/* Scrollable container with artists */}
            <div
              ref={artistsScrollRef}
              className="flex gap-4 overflow-x-hidden pb-4 px-12"
            >
              {/* Map through artists and create clickable cards */}
              {artistsData.artists.items.map((artist: ArtistResponceProp) => (
                <Link
                  key={artist.id}
                  href={`/artist/${artist.id}`}
                  className="shrink-0"
                >
                  <Card
                    label={artist.name}
                    src={artist.images?.[0]?.url || "/fallback.png"}
                    width={150}
                    height={150}
                    shape="circle"
                    className="group border border-white/5 bg-neutral-950/80 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-neutral-900"
                    imageClassName="aspect-square w-full max-w-[120px] ring-1 ring-white/10"
                  />
                </Link>
              ))}
            </div>

            {/* Right scroll button - appears on hover */}
            <button
              onClick={() =>
                handleScroll(
                  "right",
                  artistsScrollRef,
                  setCanScrollLeft,
                  setCanScrollRight,
                )
              }
              disabled={!canScrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed text-white w-10 h-10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <FaChevronRight className="text-lg" />
            </button>
          </div>
        </section>
      )}

      {/* Recently Played Section - Displays latest 10 tracks user has played */}
      {recentlyPlayed && recentlyPlayed.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">
            Recently Played
          </h2>
          {/* Grid layout for recently played tracks */}
          <div className="grid grid-cols-2 gap-4">
            {/* Limit to 10 most recent tracks */}
            {recentlyPlayed.slice(0, 10).map((item) => (
              <Link
                key={`${item.track.id}-${item.played_at}`}
                href={`/search?q=${encodeURIComponent(item.track.name)}`}
                className="flex gap-4 p-3 rounded-lg hover:bg-neutral-900/50 transition-colors cursor-pointer group"
              >
                {/* Album cover image */}
                <div className="relative w-12 h-12 shrink-0">
                  {item.track.album?.images?.[0]?.url && (
                    <Image
                      src={item.track.album.images[0].url}
                      width={30}
                      height={30}
                      alt={item.track.name}
                      className="w-full h-full rounded object-cover"
                    />
                  )}
                </div>
                {/* Track details: name, artist, and album */}
                <div className="flex-1 min-w-0">
                  {/* Track name - highlights green on hover */}
                  <p className="text-sm font-medium text-white truncate group-hover:text-green-500 transition-colors">
                    {item.track.name}
                  </p>
                  {/* Artist names */}
                  <p className="text-xs text-gray-400 truncate">
                    {item.track.artists?.map((a) => a.name).join(", ")}
                  </p>
                  {/* Album name */}
                  <p className="text-xs text-gray-500 truncate">
                    {item.track.album?.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Albums Section - Displays user's saved albums in scrollable carousel */}
      {albumsData?.albums?.items && albumsData.albums.items.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Your Albums</h2>
          <div className="relative group">
            {/* Left scroll button - appears on hover */}
            <button
              onClick={() =>
                handleScroll(
                  "left",
                  albumsScrollRef,
                  setCanAlbumsScrollLeft,
                  setCanAlbumsScrollRight,
                )
              }
              disabled={!canAlbumsScrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed text-white w-10 h-10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <FaChevronLeft className="text-lg" />
            </button>

            {/* Scrollable container with albums */}
            <div
              ref={albumsScrollRef}
              className="flex gap-4 overflow-x-hidden pb-4 px-12"
            >
              {/* Map through saved albums and create clickable cards */}
              {albumsData.albums.items.map((item: SavedAlbumItem) => {
                const album = item.album;
                return (
                  <Link
                    key={album.id}
                    href={`/album/${album.id}`}
                    className="shrink-0"
                  >
                    <Card
                      src={album.images?.[0]?.url ?? "/fallback.png"}
                      width={200}
                      height={200}
                      shape="square"
                      label={album.name}
                      desc={album.album_type}
                      className="group border border-white/5 bg-neutral-950/80 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-neutral-900"
                      imageClassName="aspect-square w-full max-w-[170px]"
                    />
                  </Link>
                );
              })}
            </div>

            {/* Right scroll button - appears on hover */}
            <button
              onClick={() =>
                handleScroll(
                  "right",
                  albumsScrollRef,
                  setCanAlbumsScrollLeft,
                  setCanAlbumsScrollRight,
                )
              }
              disabled={!canAlbumsScrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed text-white w-10 h-10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <FaChevronRight className="text-lg" />
            </button>
          </div>
        </section>
      )}
      {/* Playlists Section - Displays user's playlists in scrollable carousel */}
      {playlistsData?.playlists?.items &&
        playlistsData.playlists.items.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">
              Your Playlists
            </h2>
            <div className="relative group">
              {/* Left scroll button - appears on hover */}
              <button
                onClick={() =>
                  handleScroll(
                    "left",
                    playlistsScrollRef,
                    setCanPlaylistsScrollLeft,
                    setCanPlaylistsScrollRight,
                  )
                }
                disabled={!canPlaylistsScrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed text-white w-10 h-10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                <FaChevronLeft className="text-lg" />
              </button>

              {/* Scrollable container with playlists */}
              <div
                ref={playlistsScrollRef}
                className="flex gap-4 overflow-x-hidden pb-4 px-12"
              >
                {/* Map through playlists and create clickable cards */}
                {playlistsData.playlists.items.map((playlist: PlaylistProp) => {
                  return (
                    <Link
                      key={playlist.id}
                      href={`/playlist/${playlist.id}`}
                      className="shrink-0"
                    >
                      <Card
                        src={playlist.images?.[0]?.url ?? "/fallback.png"}
                        width={200}
                        height={200}
                        shape="square"
                        label={playlist.name}
                        className="group border border-white/5 bg-neutral-950/80 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-neutral-900"
                        imageClassName="aspect-square w-full max-w-[170px]"
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Right scroll button - appears on hover */}
              <button
                onClick={() =>
                  handleScroll(
                    "right",
                    playlistsScrollRef,
                    setCanPlaylistsScrollLeft,
                    setCanPlaylistsScrollRight,
                  )
                }
                disabled={!canPlaylistsScrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed text-white w-10 h-10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                <FaChevronRight className="text-lg" />
              </button>
            </div>
          </section>
        )}
    </div>
  );
}
