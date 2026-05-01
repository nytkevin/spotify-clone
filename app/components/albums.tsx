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

  if (isLoading) return <p> fetching the albums</p>;
  if (error) return <p> the error is {error.message}</p>;
  if (!data) return <p>no data being retured from API</p>;
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
