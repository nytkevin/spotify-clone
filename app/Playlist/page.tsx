"use client";

import { useQuery } from "@tanstack/react-query";
import Card from "../components/card";
import { PlaylistProp } from "../types/spotify";
import getPlaylists from "../lib/spotify/getPlaylists";
import Link from "next/link";

export default function AlbumPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["playlist"],
    queryFn: getPlaylists,
  });

  if (isLoading)
    return (
      <p className="p-6 text-sm text-neutral-400">Fetching Playlists...</p>
    );
  if (error)
    return <p className="p-6 text-sm text-red-400">Error: {error.message}</p>;
  if (!data)
    return (
      <p className="p-6 text-sm text-neutral-400">
        No Playlist data returned from API.
      </p>
    );

  return (
    <div>
      <h1 className="p-4 text-center bg-black text-2xl font-extrabold tracking-wide text-white md:text-3xl">
        Your Top Playlist
      </h1>
      <section className="grid grid-cols-2 items-stretch gap-4 rounded-2xl bg-black/90 p-4 md:grid-cols-4 md:gap-6 md:p-6">
        {data.playlists.items.map((playlist: PlaylistProp) => {
          return (
            <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
              <Card
                //? optional chaining if artist.images exists then read [0]
                src={playlist.images?.[0]?.url ?? "/fallback.png"}
                width={340}
                height={240}
                shape="square"
                label={playlist.name}
              />
            </Link>
          );
        })}
      </section>
    </div>
  );
}
