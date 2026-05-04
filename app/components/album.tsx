import { useQuery } from "@tanstack/react-query";
import { AlbumResponceProp } from "../types/spotify";
import Card from "./card";
import getAlbums from "../lib/spotify/getAlbums";
import Link from "next/link";

type SavedAlbumItem = {
  album: AlbumResponceProp;
};

export default function Album() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["album"],
    queryFn: getAlbums,
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
            Failed to Load Albums
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
            No Albums Found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Unable to retrieve album data at this time
          </p>
        </div>
      </div>
    );
  return (
    <div>
      <li>
        {data.albums.items.map((item: SavedAlbumItem) => {
          const album = item.album as AlbumResponceProp;

          return (
            <Link key={album.id} href={`/album/${album.id}`}>
              <Card
                label={album.name}
                src={album.images?.[0]?.url ?? "/fallback.png"}
                alt={album.name ?? "fallback"}
                shape="square"
                width={50}
                height={50}
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
