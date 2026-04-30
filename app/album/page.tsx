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

  if (isLoading)
    return <p className="p-6 text-sm text-neutral-400">Fetching albumns...</p>;
  if (error)
    return <p className="p-6 text-sm text-red-400">Error: {error.message}</p>;
  if (!data)
    return (
      <p className="p-6 text-sm text-neutral-400">
        No Album data returned from API.
      </p>
    );

  const albumItems: SavedAlbumItem[] = data.albums?.items ?? [];

  return (
    <div>
      <h1 className="p-4 text-center bg-black text-2xl font-extrabold tracking-wide text-white md:text-3xl">
        Your Top Albumns
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
