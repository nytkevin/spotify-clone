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

  if (isLoading) return <p> fetching the playlists</p>;
  if (error) return <p> the error is {error.message}</p>;
  if (!data) return <p>no data being retured from API</p>;
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
