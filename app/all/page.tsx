"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import getArtists from "@/app/lib/spotify/getArtists";
import getAlbums from "@/app/lib/spotify/getAlbums";
import getPlaylists from "@/app/lib/spotify/getPlaylists";
import Card from "@/app/components/card";
import type {
  ArtistResponceProp,
  AlbumResponceProp,
  PlaylistProp,
} from "@/app/types/spotify";

type SavedAlbumItem = {
  album: AlbumResponceProp;
};

export default function AllPage() {
  // Fetch artists
  const {
    data: artistsData,
    isLoading: artistsLoading,
    error: artistsError,
  } = useQuery({
    queryKey: ["artists"],
    queryFn: () =>
      getArtists({ limit: 12, offset: 0, timeRange: "medium_term" }),
  });

  // Fetch albums
  const {
    data: albumsData,
    isLoading: albumsLoading,
    error: albumsError,
  } = useQuery({
    queryKey: ["albums"],
    queryFn: () => getAlbums(),
  });

  // Fetch playlists
  const {
    data: playlistsData,
    isLoading: playlistsLoading,
    error: playlistsError,
  } = useQuery({
    queryKey: ["playlists"],
    queryFn: () => getPlaylists(),
  });

  // IF ANY OF THESE ARE TRUE IS LOADIN BECOmES TRUE
  const isLoading = artistsLoading || albumsLoading || playlistsLoading;
  const hasError = artistsError || albumsError || playlistsError;

  if (isLoading) {
    return (
      <div className="space-y-12 py-8">
        {/* Artists Loading */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">
            Your Top Artists
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="animate-pulse space-y-3">
                <div className="aspect-square w-full rounded-full bg-neutral-800/60" />
                <div className="h-4 rounded bg-neutral-800/60" />
              </div>
            ))}
          </div>
        </section>

        {/* Albums Loading */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Your Albums</h2>
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
        </section>

        {/* Playlists Loading */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Your Playlists</h2>
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
        </section>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            Failed to Load Content
          </h2>
          <p className="text-neutral-400">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-8">
      {/* Artists Section */}
      {artistsData?.artists?.items && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">
            Your Top Artists
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artistsData.artists.items.map((artist: ArtistResponceProp) => (
              <Link key={artist.id} href={`/artist/${artist.id}`}>
                <Card
                  label={artist.name}
                  src={artist.images?.[0]?.url || "/fallback.png"}
                  width={240}
                  height={240}
                  shape="circle"
                  className="group border border-white/5 bg-neutral-950/80 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-neutral-900"
                  imageClassName="aspect-square w-full max-w-[180px] ring-1 ring-white/10"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Albums Section */}
      {albumsData?.albums?.items && albumsData.albums.items.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Your Albums</h2>
          <section className="grid grid-cols-2 items-stretch gap-4 rounded-2xl bg-black/90 p-4 md:grid-cols-4 md:gap-6 md:p-6">
            {albumsData.albums.items.map((item: SavedAlbumItem) => {
              const album = item.album;

              return (
                <Link key={album.id} href={`/album/${album.id}`}>
                  <Card
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
        </section>
      )}
      {/* Playlists Section */}
      {playlistsData?.playlists?.items &&
        playlistsData.playlists.items.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">
              Your Playlists
            </h2>
            <section className="grid grid-cols-2 items-stretch gap-4 rounded-2xl bg-black/90 p-4 md:grid-cols-4 md:gap-6 md:p-6">
              {playlistsData.playlists.items.map((playlist: PlaylistProp) => {
                return (
                  <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                    <Card
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
          </section>
        )}
    </div>
  );
}
