"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getTracks } from "../lib/jamendo/getTracks";
import getJamendoArtists from "../lib/jamendo/getArtist";
import { ArtistJamendoResponse, TrackJamendoResponse } from "../types/jamendo";

import { FaUserCircle } from "react-icons/fa";

export default function ExplorePage() {
  const { data: tracks, isLoading: tracksLoading } = useQuery({
    queryKey: ["jamendo-tracks"],
    queryFn: getTracks,
  });

  const { data: artists, isLoading: artistsLoading } = useQuery({
    queryKey: ["jamendo-artists"],
    queryFn: getJamendoArtists,
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-6 py-10">
      {/* Header */}
      <section className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Explore Music </h1>

        <p className="mt-2 text-zinc-400">
          Discover independent artists and tracks before connecting Spotify.
        </p>
      </section>

      {/* Artists */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold">Popular Artists</h2>
        </div>

        {artistsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-xl bg-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {artists?.map((artist: ArtistJamendoResponse) => (
              <div
                key={artist.id}
                className="
                  group rounded-xl bg-zinc-900 p-4
                  hover:bg-zinc-800 transition
                  cursor-pointer
                "
              >
                <div className="relative aspect-square overflow-hidden rounded-full bg-zinc-800 flex items-center justify-center">
                  {artist.image?.trim() ? (
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <FaUserCircle className="h-full w-full text-zinc-500 p-2" />
                  )}
                </div>
                <h3 className="mt-4 font-medium truncate">{artist.name}</h3>
                <p className="text-sm text-zinc-500">Artist</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tracks */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold">Featured Tracks</h2>

          <span className="text-sm text-zinc-500">Free previews</span>
        </div>

        {tracksLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {tracks?.map((track: TrackJamendoResponse) => (
              <div
                key={track.id}
                className="
                  flex items-center gap-4
                  rounded-xl bg-zinc-900
                  p-3 hover:bg-zinc-800
                  transition cursor-pointer
                "
              >
                <div className="relative h-14 w-14 rounded-lg overflow-hidden">
                  <Image
                    src={track.album_image}
                    alt={track.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{track.name}</h3>

                  <p className="text-sm text-zinc-400 truncate">
                    {track.artist_name}
                  </p>
                </div>

                <button
                  className="
                    rounded-full bg-white text-black
                    px-4 py-2 text-sm
                    hover:bg-zinc-200 transition
                  "
                >
                  ▶ Play
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
