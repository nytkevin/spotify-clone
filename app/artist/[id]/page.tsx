"use client";

import Card from "@/app/components/card";
import getArtistDetails from "@/app/lib/spotify/getArtistDetails";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

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

        <div className="relative z-10 max-w-6xl ml-7 px-1 pt-16 ">
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

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold">Popular songs</h2>
        {artistData.songs.length === 0 ? (
          <p className="text-sm text-neutral-400">No songs available.</p>
        ) : (
          <ul className="space-y-2">
            {artistData.songs.map((song, index) => (
              <li
                key={song.id}
                className="flex items-center gap-3 rounded-xl bg-neutral-900 p-3"
              >
                <p className="w-6 shrink-0 text-right text-xs text-neutral-500">
                  {index + 1}
                </p>
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
                  <p className="truncate font-medium">{song.name}</p>
                  <p className="truncate text-xs text-neutral-400">
                    {song.artists
                      .map((artistItem) => artistItem.name)
                      .join(", ")}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-neutral-400">
                  {formatDuration(song.duration_ms)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

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
