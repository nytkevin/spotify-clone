import { useQuery } from "@tanstack/react-query";
import { AlbumResponceProp } from "../types/spotify";
import Card from "./card";
import getAlbums from "../lib/spotify/getAlbums";

type SavedAlbumItem = {
  album: AlbumResponceProp;
};

export default function Album() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["album"],
    queryFn: getAlbums,
  });

  if (isLoading) return <p> fetching the albums</p>;
  if (error) return <p> the error is {error.message}</p>;
  if (!data) return <p>no data being retured from API</p>;
  return (
    <div>
      <li>
        {data.albums.items.map((item: SavedAlbumItem, index: number) => {
          const album = item.album;

          return (
            <Card
              key={album.id || `${album.name}-${index}`}
              label={album.name}
              src={album.images?.[0]?.url ?? "/fallback.png"}
              alt={album.name ?? "fallback"}
              shape="square"
              width={50}
              height={50}
              layout="row"
              className="justify-start"
            />
          );
        })}
      </li>
    </div>
  );
}
