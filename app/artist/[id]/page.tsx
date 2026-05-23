"use client";

import Card from "@/app/components/card";
import getArtistDetails from "@/app/lib/spotify/getArtistDetails";
import { usePlayer } from "@/app/context/playerContext";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { IoMdPlay } from "react-icons/io";
import formatDuration from "@/app/lib/time";

type ArtistDetailsResponse = {
  artist: {
    id: string;
    name: string;
    genres?: string[];
    images?: {
      url: string;
      height: number;
      width: number;
    }[];
  };
  songs: {
    id: string;
    name: string;
    uri: string;
    duration_ms: number;
    artists: {
      id: string;
      name: string;
    }[];
    album: {
      id: string;
      name: string;
      image: string | null;
    };
  }[];
  discography: {
    id: string;
    name: string;
    album_type: string;
    release_date: string;
    images?: {
      url: string;
      height: number;
      width: number;
    }[];
  }[];
};

export default function ArtistDetailsPage() {
  const params = useParams<{ id: string }>();
  const artistId = params.id;

  const { accessToken, currentTrack, playUri } = usePlayer();
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  const handlePlayTrack = async (trackUri: string, trackId: string) => {
    if (loadingTrackId) return;
    setLoadingTrackId(trackId);
    setPlayError(null);
    const result = await playUri(trackUri);
    if (!result.success) setPlayError(result.error ?? "Failed to play track");
    setLoadingTrackId(null);
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["artist-details", artistId],
    queryFn: () => getArtistDetails(artistId),
    enabled: !!artistId,
  });

  if (isLoading)
    return (
      <div className="p-6">
        {/* Hero skeleton */}
        <section className="relative mb-8 overflow-hidden rounded-2xl bg-neutral-950 min-h-72">
          <div className="relative z-10 max-w-6xl ml-7 px-1 pt-16">
            <div className="flex flex-col md:flex-row md:items-end gap-8 mb-12">
              {/* Artist image skeleton */}
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl ring-4 ring-black/50 bg-neutral-800 animate-pulse" />
              {/* Artist name skeleton */}
              <div className="text-center md:text-left">
                <div className="h-16 w-64 bg-neutral-800 rounded-lg animate-pulse mb-4" />
                <div className="h-4 w-48 bg-neutral-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Popular songs skeleton */}
        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">Popular songs</h2>
          <ul className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl bg-neutral-900 p-3"
              >
                <div className="w-6 h-4 bg-neutral-800 rounded animate-pulse" />
                <div className="h-12 w-12 rounded-md bg-neutral-800 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-40 bg-neutral-800 rounded animate-pulse mb-2" />
                  <div className="h-3 w-32 bg-neutral-800 rounded animate-pulse" />
                </div>
                <div className="h-4 w-10 bg-neutral-800 rounded animate-pulse" />
              </li>
            ))}
          </ul>
        </section>

        {/* Discography skeleton */}
        <section>
          <h2 className="mb-4 text-xl font-bold">Discography</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-neutral-800 rounded-lg animate-pulse" />
                <div className="h-4 bg-neutral-800 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-neutral-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  if (error)
    return <p className="p-6 text-sm text-red-400">Error: {error.message}</p>;
  if (!data)
    return (
      <p className="p-6 text-sm text-neutral-400">
        No artist data returned from API.
      </p>
    );

  const artistData = data as ArtistDetailsResponse;
  const artist = artistData.artist;
  const artistImage = artist.images?.[0]?.url ?? "/fallback.png";
  const backdropImage =
    artistData.discography?.[0]?.images?.[0]?.url ?? artistImage;
  const artistImages = artist.images ?? [];

  return (
    <div className="p-6 text-white">
      {/* ── Hero banner ── */}
      <section className="relative mb-8 overflow-hidden rounded-2xl bg-neutral-950 min-h-72">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={backdropImage}
            alt={artist.name}
            fill
            className="object-cover opacity-100 blur-sm scale-110 transform transition-transform duration-700 ease-out"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black via-black/80 to-black/40" />
          <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-6xl ml-7 px-1 pt-16">
          <div className="flex flex-col md:flex-row md:items-end gap-8 mb-12">
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl ring-4 ring-black/50">
              <Image
                src={
                  artistImages.length > 0 ? artistImages[0].url : artistImage
                }
                alt={artist.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-2">
                {artist.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular songs ── */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">Popular songs</h2>

        {playError && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {playError}
          </div>
        )}

        {artistData.songs.length === 0 ? (
          <p className="text-sm text-neutral-400">No songs available.</p>
        ) : (
          <ul className="space-y-2">
            {artistData.songs.map((song, index) => {
              const isTrackLoading = loadingTrackId === song.id;
              const isPlaying =
                currentTrack?.item?.id === song.id && currentTrack.is_playing;

              return (
                <li
                  key={song.id}
                  onClick={() => handlePlayTrack(song.uri, song.id)}
                  className="group flex items-center gap-3 rounded-xl bg-neutral-900 p-3 transition hover:bg-neutral-800 cursor-pointer"
                >
                  <div className="w-6 shrink-0 text-right text-xs text-neutral-500">
                    {isPlaying ? (
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
                      index + 1
                    )}
                  </div>

                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-neutral-800">
                    <Image
                      src={song.album.image ?? "/fallback.png"}
                      alt={song.album.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayTrack(song.uri, song.id);
                      }}
                      disabled={!accessToken || !!loadingTrackId}
                      className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      title={isPlaying ? "Now playing" : "Play"}
                    >
                      <IoMdPlay fill="green" className="text-lg" />
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate font-medium ${isPlaying ? "text-green-400" : "text-white"}`}
                    >
                      {song.name}
                    </p>
                    <p className="truncate text-xs text-neutral-400">
                      {song.artists.map((a) => a.name).join(", ")}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-neutral-400 flex items-center">
                    {isTrackLoading ? (
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      formatDuration(song.duration_ms)
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Discography ── */}
      <section>
        <h2 className="mb-3 text-xl font-bold">Discography</h2>
        {artistData.discography.length === 0 ? (
          <p className="text-sm text-neutral-400">No albums available.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {artistData.discography.map((album) => (
              <Link key={album.id} href={`/album/${album.id}`}>
                <Card
                  src={album.images?.[0]?.url ?? "/fallback.png"}
                  alt={album.name}
                  label={album.name}
                  desc={`${album.album_type} • ${album.release_date.slice(0, 4)}`}
                  width={280}
                  height={280}
                  shape="square"
                  className="h-full border border-white/10 bg-neutral-950/80"
                  imageClassName="aspect-square w-full"
                />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
