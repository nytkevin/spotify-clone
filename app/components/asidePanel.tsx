"use client";

import { usePlayer } from "@/app/context/playerContext";
import Image from "next/image";
import { useState } from "react";
import { IoMdPlay } from "react-icons/io";

export default function AsidePanel() {
  const { queue, currentTrack, recentlyPlayed, playUri } = usePlayer();
  const [activeTab, setActiveTab] = useState<"queue" | "recent">("queue");

  return (
    <div className="flex flex-col h-full bg-[#121212] overflow-hidden">
      {currentTrack?.item && (
        <div className="p-4">
          <p className="text-xs text-gray-400 mb-3">Now Playing</p>
          <div className="flex flex-col gap-3">
            <div className="relative w-60 h-70 mx-auto">
              {currentTrack.item.album?.images &&
                currentTrack.item.album.images.length > 0 && (
                  <Image
                    src={currentTrack.item.album.images[0].url}
                    alt={currentTrack.item.name}
                    fill
                    className="rounded-lg object-cover shadow-lg"
                  />
                )}
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-white truncate">
                {currentTrack.item.name}
              </p>
              <p className="text-sm text-gray-400 truncate">
                {currentTrack.item.artists?.map((a) => a.name).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("queue")}
            className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "queue"
                ? "text-green-500 border-green-500"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab("recent")}
            className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "recent"
                ? "text-green-500 border-green-500"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            Recently Played ({recentlyPlayed.length})
          </button>
        </div>
      </div>

      {activeTab === "queue" && (
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {queue.length === 0 ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 20 }).map((_, index) => (
                <div
                  key={index}
                  className="group p-3 rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 shrink-0 bg-gray-700 rounded animate-pulse" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4" />
                      <div className="h-2 bg-gray-700 rounded animate-pulse w-1/2" />
                      <div className="h-2 bg-gray-700 rounded animate-pulse w-2/3" />
                    </div>
                    <div className="w-10 h-3 bg-gray-700 rounded animate-pulse shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {queue.map((track, index) => (
                <div
                  key={track.id || index}
                  onClick={() => playUri(track.uri)}
                  className="group p-3 rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  <div className="flex gap-3">
                    <div className="relative w-12 h-12 shrink-0 group">
                      {track.album?.images && track.album.images.length > 0 ? (
                        <>
                          <Image
                            src={track.album.images[0].url}
                            alt={track.name}
                            fill
                            className="rounded object-cover"
                          />
                          <button
                            className="absolute inset-0 flex items-center justify-center rounded bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              playUri(track.uri);
                            }}
                          >
                            <IoMdPlay fill="green" className="text-sm" />
                          </button>
                        </>
                      ) : (
                        <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-400">
                            {index + 1}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-green-500 transition-colors">
                        {track.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {track.artists?.map((a) => a.name).join(", ")}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {track.album?.name}
                      </p>
                    </div>

                    <div className="text-xs text-gray-400 shrink-0">
                      {Math.floor(track.duration_ms / 60000)}:
                      {String(
                        Math.floor((track.duration_ms % 60000) / 1000),
                      ).padStart(2, "0")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "recent" && (
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {recentlyPlayed.length === 0 ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 20 }).map((_, index) => (
                <div
                  key={index}
                  className="group p-3 rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 shrink-0 bg-gray-700 rounded animate-pulse" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4" />
                      <div className="h-2 bg-gray-700 rounded animate-pulse w-1/2" />
                      <div className="h-2 bg-gray-700 rounded animate-pulse w-2/3" />
                    </div>
                    <div className="w-12 h-2 bg-gray-700 rounded animate-pulse shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {recentlyPlayed.map((item, index) => {
                const track = item.track;
                const playedDate = new Date(item.played_at);
                const now = new Date();
                const diffMs = now.getTime() - playedDate.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMins / 60);
                const diffDays = Math.floor(diffHours / 24);

                let timeString = "";
                if (diffMins < 1) timeString = "just now";
                else if (diffMins < 60) timeString = `${diffMins}m ago`;
                else if (diffHours < 24) timeString = `${diffHours}h ago`;
                else if (diffDays < 7) timeString = `${diffDays}d ago`;
                else timeString = playedDate.toLocaleDateString();

                return (
                  <div
                    key={`${track.id}-${index}`}
                    onClick={() => playUri(track.uri)}
                    className="group p-3 rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <div className="relative w-12 h-12 shrink-0 group">
                        {track.album?.images &&
                        track.album.images.length > 0 ? (
                          <>
                            <Image
                              src={track.album.images[0].url}
                              alt={track.name}
                              fill
                              className="rounded object-cover"
                            />
                            <button
                              className="absolute inset-0 flex items-center justify-center rounded bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                playUri(track.uri);
                              }}
                            >
                              <IoMdPlay fill="green" className="text-sm" />
                            </button>
                          </>
                        ) : (
                          <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-400">
                              {index + 1}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-green-500 transition-colors">
                          {track.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {track.artists?.map((a) => a.name).join(", ")}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {track.album?.name}
                        </p>
                      </div>

                      <div className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
                        {timeString}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
