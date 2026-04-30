import { getAccessToken } from "@/app/lib/spotify/access_token";
import { NextResponse } from "next/server";
import { AlbumResponceProp, SpotifyTrack } from "@/app/types/spotify";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: RouteContext) {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json(
      { error: "Missing access token. User not authenticated." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const artistId = (id ?? "").trim();

  if (!artistId) {
    return NextResponse.json({ error: "Missing artist id" }, { status: 400 });
  }

  // handle any special characters that may ruin the url
  const artistRes = await fetch(
    `https://api.spotify.com/v1/artists/${encodeURIComponent(artistId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!artistRes.ok) {
    const errorText = await artistRes.text();
    return NextResponse.json(
      {
        error: "Spotify artist request failed",
        details: errorText,
      },
      { status: artistRes.status },
    );
  }

  const artist = await artistRes.json();

  const albumsUrl = new URL(
    `https://api.spotify.com/v1/artists/${encodeURIComponent(artistId)}/albums`,
  );
  // Request a broad set of album groups and a larger page to reduce empty results
  albumsUrl.searchParams.set(
    "include_groups",
    "album,single,appears_on,compilation",
  );
  albumsUrl.searchParams.set("market", "US");
  albumsUrl.searchParams.set("limit", "50");

  const albumsRes = await fetch(albumsUrl.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let discography: AlbumResponceProp[] = [];

  if (albumsRes.ok) {
    const albumsData = await albumsRes.json();
    discography = albumsData.items ?? [];
  }

  // get tracks from he first 4 albums limit it to 5
  const TopTracks = await Promise.all(
    discography.slice(0, 4).map(async (album) => {
      const albumTracksRes = await fetch(
        `https://api.spotify.com/v1/albums/${album.id}/tracks?market=US&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!albumTracksRes.ok) return [];

      const albumTracksData = await albumTracksRes.json();
      const tracks: SpotifyTrack[] = albumTracksData.items ?? [];

      return tracks.map((track) => ({
        id: track.id,
        name: track.name,
        duration_ms: track.duration_ms,
        track_number: track.track_number,
        artists: track.artists,
        album: {
          id: album.id,
          name: album.name,
          image: album.images?.[0]?.url ?? null,
        },
      }));
    }),
  );

  const songs: Array<{
    id: string;
    name: string;
    duration_ms: number;
    track_number: number;
    artists: { id: string; name: string }[];
    album: { id: string; name: string; image: string | null };
  }> = [];

  const seen = new Set<string>();

  for (const group of TopTracks) {
    for (const song of group) {
      if (!song.id || seen.has(song.id)) continue;
      seen.add(song.id);
      songs.push(song);
      if (songs.length >= 10) break;
    }
    if (songs.length >= 10) break;
  }

  // Fallback song sampling when album-track expansion produced no tracks.
  if (songs.length === 0) {
    const fallbackTracksUrl = new URL("https://api.spotify.com/v1/search");
    fallbackTracksUrl.searchParams.set("q", `artist:${artist.name}`);
    fallbackTracksUrl.searchParams.set("type", "track");
    fallbackTracksUrl.searchParams.set("market", "US");
    fallbackTracksUrl.searchParams.set("limit", "10");

    const fallbackTracksRes = await fetch(fallbackTracksUrl.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (fallbackTracksRes.ok) {
      const fallbackTracksData = await fallbackTracksRes.json();
      const fallbackTracks: Array<{
        id: string;
        name: string;
        duration_ms: number;
        track_number: number;
        artists: { id: string; name: string }[];
        album: {
          id: string;
          name: string;
          images?: { url: string; height: number; width: number }[];
        };
      }> = fallbackTracksData.tracks?.items ?? [];

      const seenTrackIds = new Set<string>();

      for (const track of fallbackTracks) {
        if (!track.id || seenTrackIds.has(track.id)) continue;
        seenTrackIds.add(track.id);

        songs.push({
          id: track.id,
          name: track.name,
          duration_ms: track.duration_ms,
          track_number: track.track_number,
          artists: track.artists,
          album: {
            id: track.album.id,
            name: track.album.name,
            image: track.album.images?.[0]?.url ?? null,
          },
        });
      }
    }
  }

  return NextResponse.json({
    artist,
    songs,
    discography,
  });
}
