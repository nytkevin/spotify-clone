export type ArtistJamendoResponse = {
  id: string;
  name: string;
  website: string;
  joindate: string;
  image: string;
  shorturl: string;
  shareurl: string;
};

export type TrackJamendoResponse = {
  id: string;
  name: string;
  duration: number;
  artist_id: string;
  artist_name: string;
  album_name: string;
  album_image: string;
  audio: string;
  audiodownload: string;
  shareurl: string;
};
