"use client";
{
  /** fix when a user clicks on a playlist that is not theirs */
}

import getPlaylistTracks from "@/app/lib/spotify/getPlaylistTracks";
import type {
  PlaylistTrackItemProp,
  PlaylistTracksProp,
} from "@/app/types/spotify";
import { useQuery } from "@tanstack/react-query";
import Card from "@/app/components/card";
import { useParams } from "next/navigation";

function formatDuration(durationMs: number) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function PlaylistDetailsPage() {
  const params = useParams();
  //optional chaining If params exists, give me params.id
  const idParam = params.id;
  // check if id param in an Array
  const playlistId = Array.isArray(idParam) ? idParam[0] : (idParam ?? "");

  const { data, isLoading, error } = useQuery({
    queryKey: ["playlist-tracks", playlistId],
    queryFn: () => getPlaylistTracks(playlistId),
    //Don’t fetch playlist data until we actually have a valid playlist ID.
    enabled: !!playlistId,
  });

  if (isLoading)
    return (
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold text-white">Playlist Songs</h1>
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

  //Was this object created from this class (or constructor)?
  if (error instanceof Error)
    return (
      <p className="p-6 text-3xl text-red-400 text-center font-extrabold">
        Error: {error.message}
      </p>
    );

  if (!data)
    return (
      <p className="p-6 text-sm text-neutral-400">
        No playlist tracks returned from API.
      </p>
    );

  // Make the spotify responce look like playlisttracksprop
  const tracksData = data as { tracks: PlaylistTracksProp };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-white">Playlist Songs</h1>
      <ul className="space-y-3">
        {tracksData.tracks.items.map((item: PlaylistTrackItemProp, index) => {
          const track = (
            item as unknown as { item?: PlaylistTrackItemProp["track"] }
          ).item;

          if (!track) return null;

          return (
            <li
              key={track.id}
              className="flex items-center gap-2 rounded-xl bg-neutral-900 p-3 text-sm text-neutral-200 h-18"
            >
              <p className="w-8 shrink-0 text-right text-xs text-neutral-500">
                {index + 1}
              </p>
              <div className="flex-1">
                <Card
                  src={track.album.images?.[0]?.url ?? "/fallback.png"}
                  alt={track.album.name}
                  shape="square"
                  layout="row"
                  label={track.name}
                  desc={track.artists.map((artist) => artist.name).join(", ")}
                  className="p-0 bg-transparent hover:bg-transparent w-full"
                  imageClassName="h-14 w-14 rounded-md object-cover"
                />
              </div>
              <p className="shrink-0 text-xs text-neutral-400 pr-4">
                {formatDuration(track.duration_ms)}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
