import { useQuery } from "@tanstack/react-query";
import Card from "./card";
import getPlaylists from "../lib/spotify/getPlaylists";
import { PlaylistProp } from "../types/spotify";
import Link from "next/link";

export default function Playlist() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["playlist"],
    queryFn: getPlaylists,
  });

  if (isLoading)
    return (
      <div>
        <li className="space-y-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-2">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </li>
      </div>
    );
  if (error)
    return (
      <div className="w-full h-64 flex items-center justify-center px-4">
        <div className="text-center max-w-xs">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            Failed to Load Playlist
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error.message}
          </p>
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="w-full h-64 flex items-center justify-center px-4">
        <div className="text-center max-w-xs">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Playlists Found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Unable to retrieve playlists data at this time
          </p>
        </div>
      </div>
    );
  return (
    <div>
      <li>
        {data.playlists.items.map((playlist: PlaylistProp) => {
          return (
            <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
              <Card
                label={playlist.name}
                src={playlist.images?.[0]?.url ?? "/fallback.png"}
                alt={playlist.name}
                shape="square"
                width={50}
                height={60}
                layout="row"
                className="justify-start"
              />
            </Link>
          );
        })}
      </li>
    </div>
  );
}
