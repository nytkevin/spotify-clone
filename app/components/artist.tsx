import { useQuery } from "@tanstack/react-query";
import getArtists from "../lib/spotify/getArtists";
import { ArtistResponceProp } from "../types/spotify";
import Card from "./card";

export default function Artist() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["artist"],
    queryFn: () => getArtists(),
  });

  if (isLoading) return <p> fetching the artists</p>;
  if (error) return <p> the error is {error.message}</p>;
  if (!data) return <p>no data being retured from API</p>;
  return (
    <div>
      <li>
        {data.artists.items.map((artist: ArtistResponceProp) => (
          <Card
            key={artist.id}
            label={artist.name}
            src={artist.images?.[0]?.url ?? "/fallback.png"}
            alt={artist.name}
            shape="circle"
            width={50}
            height={50}
            layout="row"
            className="justify-start"
          />
        ))}
      </li>
    </div>
  );
}
