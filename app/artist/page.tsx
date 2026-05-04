"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import getArtists from "../lib/spotify/getArtists";
import Card from "../components/card";
import { ArtistResponceProp } from "../types/spotify";

export default function ArtistPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["artist"],
    queryFn: () =>
      getArtists({ limit: 50, offset: 0, timeRange: "medium_term" }),
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="p-4 text-center text-2xl font-extrabold tracking-wide text-white md:text-3xl">
          Your Top Artists
        </h1>
        <section className="grid grid-cols-2 items-stretch gap-4 rounded-2xl bg-black/90 p-4 md:grid-cols-4 md:gap-6 md:p-6">
          {Array.from({ length: 50 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse flex flex-col items-center space-y-3"
            >
              <div className="aspect-square w-full max-w-55 rounded-full bg-neutral-800/60" />
              <div className="h-4 w-24 rounded bg-neutral-800/60" />
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
          Failed to Load Artists
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
          No Artists Found
        </h3>
        <p className="text-center text-sm text-neutral-500">
          We can not retrieve your top artists. Check back later!
        </p>
      </div>
    );

  return (
    <div>
      <h1 className="p-4 text-center text-2xl font-extrabold tracking-wide text-white md:text-3xl">
        Your Top Artists
      </h1>
      <section className="grid grid-cols-2 items-stretch gap-4 rounded-2xl bg-black/90 p-4 md:grid-cols-4 md:gap-6 md:p-6">
        {data.artists.items.map((artist: ArtistResponceProp) => {
          {
            /** [0] is just to select the highest image quality */
          }

          return (
            <Link key={artist.id} href={`/artist/${artist.id}`}>
              <Card
                src={artist.images?.[0]?.url ?? "/fallback.png"}
                alt={artist.name}
                label={artist.name}
                width={320}
                height={320}
                shape="circle"
                className="group border border-white/5 bg-neutral-950/80 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-neutral-900"
                imageClassName="aspect-square w-full max-w-[220px] ring-1 ring-white/10"
              />
            </Link>
          );
        })}
      </section>
    </div>
  );
}
