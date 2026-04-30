"use client";

import getAlbumDetails from "@/app/lib/spotify/getAlbumDetails";
import Card from "@/app/components/card";
import { useQuery } from "@tanstack/react-query";
// import Image from "next/image";
import { useParams } from "next/navigation";

import { AlbumDetailsResponseProp } from "@/app/types/spotify";

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

  const { data, isLoading, error } = useQuery({
    queryKey: ["album-details", albumId],
    queryFn: () => getAlbumDetails(albumId),
    enabled: !!albumId,
  });

  if (isLoading)
    return (
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold text-white">Album Songs</h1>
        <ul className="space-y-3">
          {/**Generate an array of 6 items to render placeholder UI elements during loading */}
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="flex items-center gap-4 rounded-xl bg-neutral-900 p-3 text-sm"
            >
              <div className="h-14 w-14 shrink-0 rounded-md bg-neutral-800 animate-pulse" />
              <div className="min-w-0 flex-1">
                <div className="mb-2 h-4 w-3/5 rounded bg-neutral-800 animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-neutral-800 animate-pulse" />
              </div>
              <div className="h-3 w-12 rounded bg-neutral-800 animate-pulse" />
            </li>
          ))}
        </ul>
      </div>
    );
  if (error)
    return <p className="p-6 text-sm text-red-400">Error: {error.message}</p>;
  if (!data)
    return (
      <p className="p-6 text-sm text-neutral-400">
        No album details returned from API.
      </p>
    );

  const albumData = data as AlbumDetailsResponseProp;
  const album = albumData.album;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-white">Album Songs</h1>

      {/* <div className="mb-6 flex items-center gap-4 rounded-xl bg-neutral-900 p-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-800">
          <Image
            src={album.images?.[0]?.url ?? "/fallback.png"}
            alt={album.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-white">
            {album.name}
          </p>
          <p className="truncate text-sm text-neutral-400">
            {album.artists.map((artist) => artist.name).join(", ")}
          </p>
          <p className="text-xs text-neutral-500">
            {album.release_date} - {album.total_tracks} songs
          </p>
        </div>
      </div> */}

      <ul className="space-y-3">
        {album.tracks.items.map((track) => (
          <li
            key={track.id}
            className="flex items-center gap-4 rounded-xl bg-neutral-900 p-3 text-sm text-neutral-200 h-18"
          >
            <p className="w-8 shrink-0 text-right text-xs text-neutral-500">
              {track.track_number}
            </p>

            <Card
              src={album.images?.[0]?.url ?? "/fallback.png"}
              alt={track.name}
              width={56}
              height={56}
              shape="square"
              className="shrink-0 cursor-default rounded-md bg-transparent p-0 hover:bg-transparent"
              imageClassName="h-14 w-14 rounded-md"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white">{track.name}</p>
              <p className="truncate text-xs text-neutral-400">
                {track.artists.map((artist) => artist.name).join(", ")}
              </p>
            </div>

            <p className="shrink-0 text-xs text-neutral-400 pr-4">
              {formatDuration(track.duration_ms)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
