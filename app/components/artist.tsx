import { useQuery } from "@tanstack/react-query";
import getArtists from "../lib/spotify/getArtists";
import getJamendoArtists from "../lib/jamendo/getArtist";
import { ArtistResponceProp } from "../types/spotify";
import Card from "./card";
import Link from "next/link";
import { usePlayer } from "../context/playerContext";
import { ArtistJamendoResponse } from "../types/jamendo";

type NormalizedArtist = {
  id: string;
  name: string;
  image: string;
  source: "spotify" | "jamendo";
};

export default function Artist() {
  const { accessToken } = usePlayer();

  const { data, isLoading, error } = useQuery({
    queryKey: ["artist", accessToken ? "spotify" : "jamendo"],
    queryFn: async (): Promise<NormalizedArtist[]> => {
      if (accessToken) {
        const res = await getArtists();
        return res.map((artist: ArtistResponceProp) => ({
          id: `spotify-${artist.id}`,
          name: artist.name,
          image: artist.images?.[0]?.url ?? "",
          source: "spotify",
        }));
      }

      const jamendoArtists = await getJamendoArtists();
      return jamendoArtists.map((artist: ArtistJamendoResponse) => ({
        id: `jamendo-${artist.id}`,
        name: artist.name,
        image: artist.image,
        source: "jamendo",
      }));
    },
  });

  if (isLoading)
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

  if (!data || data.length === 0)
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
        {data.map((artist) => (
          <Link key={artist.id} href={`/artist/${artist.id}`}>
            <Card
              label={artist.name}
              src={artist.image}
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
