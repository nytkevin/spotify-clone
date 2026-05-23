"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserProfile } from "@/app/types/spotify";
import { getClientUserProfile } from "@/app/lib/spotify/getUserProfile";
import Image from "next/image";

export default function UserProfileButton() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: getClientUserProfile,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="mr-4 flex h-8 items-center rounded-xl border px-3 text-gray-400">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mr-4 flex h-8 items-center rounded-xl border px-3 text-green-400 hover:bg-green-500 hover:text-white">
        <Link href="/login">Login</Link>
      </div>
    );
  }

  return (
    <div className="relative mr-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 h-8 px-3 rounded-xl border border-white/20 hover:border-white/40 transition-colors"
      >
        {profile.images && profile.images.length > 0 && (
          <Image
            src={profile.images[0].url}
            alt={profile.display_name || "User"}
            width={6}
            height={6}
            className="h-6 w-6 rounded-full object-cover"
          />
        )}
        <span className="text-sm text-white truncate">
          {profile.display_name || profile.id}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mb-2 bottom-full md:mt-2 md:bottom-auto md:mb-0 w-56 bg-neutral-900 rounded-lg border border-white/10 shadow-lg z-50">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              {profile.images && profile.images.length > 0 && (
                <Image
                  src={profile.images[0].url}
                  alt={profile.display_name || "User"}
                  className="h-12 w-12 rounded-full object-cover"
                  width={12}
                  height={12}
                />
              )}
              <div>
                <p className="font-semibold text-white">
                  {profile.display_name || "User"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <a
              href={profile.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors"
            >
              View on Spotify
            </a>
            <button
              onClick={async () => {
                // Call the logout API endpoint to clear httpOnly cookies
                await fetch("/api/spotify/logout", { method: "POST" });
                // Clear the query cache to prevent automatic re-fetch
                queryClient.clear();
                // Redirect to login
                window.location.href = "/login";
              }}
              className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
