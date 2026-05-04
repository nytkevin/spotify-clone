"use client";

import { useQuery } from "@tanstack/react-query";
import getAlbums from "../lib/spotify/getAlbums";
import Card from "../components/card";
import { AlbumResponceProp } from "../types/spotify";
import Link from "next/link";

type SavedAlbumItem = {
  album: AlbumResponceProp;
};

export default function AlbumPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["album"],
    queryFn: getAlbums,
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="p-4 text-center text-2xl font-extrabold tracking-wide text-white md:text-3xl">
          Your Albums
        </h1>
        <section className="grid grid-cols-2 items-stretch gap-4 rounded-2xl bg-black/90 p-4 md:grid-cols-4 md:gap-6 md:p-6">
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
      </div>
    );
  }
  if (error)
    return (
      <div className="flex flex-col items-center h-screen justify-center rounded-2xl px-6 py-12">
        <h3 className="mb-2 text-lg font-semibold text-red-400">
          Failed to Load Albums
        </h3>
        <p className="mb-4 text-center text-sm text-neutral-400">
          {error.message}
        </p>
      </div>
    );
  if (!data)
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl  px-6 py-12">
        <h3 className="mb-2 text-lg font-semibold text-neutral-300">
          No Albums Found
        </h3>
        <p className="text-center text-sm text-neutral-500">
          We can not retrieve your top albums. Check back later!
        </p>
      </div>
    );

  const albumItems: SavedAlbumItem[] = data.albums?.items ?? [];

  return (
    <div>
      <h1 className="p-4 text-center bg-black text-2xl font-extrabold tracking-wide text-white md:text-3xl">
        Your Albums
      </h1>
      <section className="grid grid-cols-2 items-stretch gap-4 rounded-2xl bg-black/90 p-4 md:grid-cols-4 md:gap-6 md:p-6">
        {albumItems.map((item: SavedAlbumItem) => {
          const album = item.album;

          return (
            <Link key={album.id} href={`/album/${album.id}`}>
              <Card
                //? optional chaining if artist.images exists then read [0]
                src={album.images?.[0]?.url ?? "/fallback.png"}
                width={340}
                height={240}
                shape="square"
                label={album.name}
                desc={album.album_type}
              />
            </Link>
          );
        })}
      </section>
    </div>
  );
}
