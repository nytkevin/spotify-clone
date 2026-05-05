export type ArtistResponceProp = {
  id: string;
  followers?: {
    href: string | null;
    total: number;
  };
  genres?: string[];
  href?: string;
  images?: {
    url: string;
    height: number;
    width: number;
  }[];
  name: string;
  popularity?: number;
  type?: string;
  uri?: string;
};

export type PlaylistProp = {
  collaborative: boolean;
  description: string;
  href: string;
  id: string;
  images: { url: string; height: number; width: number }[];
  name: string;
  public: boolean;
  type: string;
  uri: string;
};

export type AlbumResponceProp = {
  album_type: string;
  total_tracks: number;
  href: string;
  id: string;
  name: string;
  images?: { url: string; height: number; width: number }[];
  release_date: string;
  type: string;
};

export type TrackArtistProp = {
  id: string;
  name: string;
};

export type ArtistTrackArtistProp = {
  id: string;
  name: string;
  href: string;
  uri: string;
  type: string;
  external_urls: {
    spotify: string;
  };
};

export type ArtistTrackAlbumProp = {
  id: string;
  name: string;
  href: string;
  uri: string;
  type: string;
  release_date: string;
  total_tracks: number;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
  external_urls: {
    spotify: string;
  };
};

export type ArtistTracksProp = {
  id: string;
  name: string;
  href: string;
  uri: string;
  type: string;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  disc_number: number;
  is_playable: boolean;
  is_local: boolean;
  external_urls: {
    spotify: string;
  };
  album: ArtistTrackAlbumProp;
  artists: ArtistTrackArtistProp[];
};

export type PlaylistTrackItemProp = {
  added_at: string;
  track: {
    id: string;
    name: string;
    uri: string;
    duration_ms: number;
    track_number: number;
    explicit: boolean;
    artists: TrackArtistProp[];
    album: {
      id: string;
      name: string;

      images: {
        url: string;
        height: number;
        width: number;
      }[];
    };
  } | null;
};

export type PlaylistTracksProp = {
  href: string;
  items: PlaylistTrackItemProp[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
};

export type AlbumTrackProp = {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  track_number: number;
  artists: TrackArtistProp[];
};

export type AlbumDetailsResponseProp = {
  album: {
    id: string;
    name: string;
    release_date: string;
    total_tracks: number;
    images: {
      url: string;
      height: number;
      width: number;
    }[];
    artists: TrackArtistProp[];
    tracks: {
      items: AlbumTrackProp[];
    };
  };
};

export type SpotifyArtistTrackArtistProp = TrackArtistProp;

export type SpotifyArtistTrackProp = {
  id: string;
  name: string;
  duration_ms: number;
  track_number: number;
  artists: TrackArtistProp[];
};

export type SpotifyArtistAlbumProp = {
  id: string;
  name: string;
  release_date: string;
  total_tracks: number;
  album_type: string;
  images?: {
    url: string;
    height: number;
    width: number;
  }[];
  tracks?: SpotifyArtistTrackProp[];
};

export type SpotifyArtistSongProp = {
  id: string;
  name: string;
  duration_ms: number;
  track_number: number;
  artists: TrackArtistProp[];
  album: {
    id: string;
    name: string;
    image: string | null;
  };
};

export type SpotifyArtistDetailsResponseProp = {
  artist: ArtistResponceProp;
  songs: SpotifyArtistSongProp[];
  discography: SpotifyArtistAlbumProp[];
};

export type SpotifyTrack = {
  id: string;
  name: string;
  duration_ms: number;
  uri: string;
  track_number: number;
  artists: TrackArtistProp[];
  album?: {
    images?: {
      url: string;
      height: number;
      width: number;
    }[];
  };
};

export type PaginatedResponseProp<T> = {
  href: string;
  items: T[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
};

export type SearchResponceProp = {
  tracks?: PaginatedResponseProp<SpotifyTrack>;
  artists?: PaginatedResponseProp<ArtistResponceProp>;
  albums?: PaginatedResponseProp<AlbumResponceProp>;
  playlists?: PaginatedResponseProp<PlaylistProp>;
};

export type InitOptions = {
  name?: string;
  getTokenEndpoint?: string;
  volume?: number;
  timeoutMs?: number;
  onReady?: (deviceId: string) => void;
  onNotReady?: (deviceId: string) => void;
  onError?: (err: unknown) => void;
};

export type SpotifyPlayerListener =
  | "ready"
  | "not_ready"
  | "initialization_error"
  | "authentication_error"
  | "account_error"
  | "playback_error";

export type SpotifyPlayerReadyPayload = {
  device_id: string;
};

export type SpotifyPlayerNotReadyPayload = {
  device_id: string;
};

export type SpotifyPlayerErrorPayload = {
  message: string;
};

export type SpotifyPlayerListenerCallback<T extends SpotifyPlayerListener> =
  T extends "ready" | "not_ready"
    ? (
        payload: T extends "ready"
          ? SpotifyPlayerReadyPayload
          : SpotifyPlayerNotReadyPayload,
      ) => void
    : (payload: SpotifyPlayerErrorPayload) => void;

export interface SpotifyPlayer {
  addListener<T extends SpotifyPlayerListener>(
    eventName: T,
    callback: SpotifyPlayerListenerCallback<T>,
  ): boolean;
  removeListener(eventName: string): boolean;
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  getCurrentState(): Promise<Record<string, unknown> | null>;
  setName(name: string): Promise<void>;
  getVolume(): Promise<number>;
  setVolume(volume: number): Promise<void>;
  seek(positionMs: number): Promise<void>;
}

export interface SpotifySDK {
  Player: new (options: {
    name: string;
    getOAuthToken: (callback: (token: string) => void) => void;
    volume?: number;
  }) => SpotifyPlayer;
}

export type SpotifyPlayerInitResult = {
  player: SpotifyPlayer;
  deviceId: string;
};

export type PlayTrackOptions = {
  trackUri: string;
  deviceId: string;
  accessToken: string;
};

export type PlayTrackResult = {
  success: boolean;
  error?: string;
};

export type CurrentPlayingTrack = {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  uri: string;
};

export type CurrentPlaybackState = {
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: CurrentPlayingTrack | null;
  currently_playing_type: string;
};
