import { useQuery } from "@tanstack/react-query";
import getArtists from "../lib/spotify/getArtists";
import { ArtistResponceProp } from "../types/spotify";
import Card from "./card";
import Link from "next/link";
import { usePlayer } from "../context/playerContext";

export default function Artist() {
  const { accessToken } = usePlayer();
  const { data, isLoading, error } = useQuery({
    queryKey: ["artist"],
    queryFn: () => getArtists(),
    enabled: !!accessToken,
  });

  if (isLoading || !accessToken)
    return (
      <div>
        <li className="space-y-4">
          {Array.from({ length: 30 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-2">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse" />
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
            Failed to Load Artists
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
            No Artists Found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Unable to retrieve artist data at this time
          </p>
        </div>
      </div>
    );
  return (
    <div>
      <li>
        {data.artists.items.map((artist: ArtistResponceProp) => (
          <Link key={artist.id} href={`/artist/${artist.id}`}>
            <Card
              label={artist.name}
              src={artist.images?.[0]?.url ?? "/fallback.png"}
              alt={artist.name}
              shape="circle"
              width={50}
              height={50}
              layout="row"
              className="justify-start"
            />
          </Link>
        ))}
      </li>
    </div>
  );
}
