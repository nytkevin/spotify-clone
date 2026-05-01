"use client";

import Card from "@/app/components/card";
import getArtistDetails from "@/app/lib/spotify/getArtistDetails";
import { usePlayer } from "@/app/context/playerContext";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FaCirclePlay } from "react-icons/fa6";

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

function formatDuration(durationMs: number) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

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
      <p className="p-6 text-sm text-neutral-400">Fetching artist details...</p>
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
                  className="group flex items-center gap-3 rounded-xl bg-neutral-900 p-3 transition hover:bg-neutral-800"
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

                  <button
                    onClick={() => handlePlayTrack(song.uri, song.id)}
                    disabled={!accessToken || !!loadingTrackId}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-black opacity-0 transition hover:scale-105 hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50 group-hover:opacity-100"
                    title={isPlaying ? "Now playing" : "Play"}
                  >
                    {isTrackLoading ? (
                      <span className="animate-spin text-lg">⟳</span>
                    ) : (
                      <FaCirclePlay className="h-4 w-4" />
                    )}
                  </button>

                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-neutral-800">
                    <Image
                      src={song.album.image ?? "/fallback.png"}
                      alt={song.album.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
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

                  <p className="shrink-0 text-xs text-neutral-400">
                    {formatDuration(song.duration_ms)}
                  </p>
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
