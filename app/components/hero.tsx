"use client";

import {
  FiAlertCircle,
  FiMusic,
  FiUsers,
  FiLock,
  FiDisc,
  FiX,
} from "react-icons/fi";
import { useState } from "react";

const cards = [
  {
    icon: <FiDisc />,
    title: "Free API is Practically Useless",
    body: "We can only fetch ONE artist, ONE playlist, and ONE album at a time. This severely limits what data we can display and makes building any real music application almost impossible.",
  },
  {
    icon: <FiUsers />,
    title: "Manual User Registration Only",
    body: "Maximum 5 users allowed. Each user's full name and emails must be manually registered by hand. This is not scalable or presentable for any real application.",
  },
  {
    icon: <FiMusic />,
    title: "Non-Premium Users Cannot Play Tracks",
    body: "Users without Spotify Premium can only VIEW their top artists, albums, and playlists. They can NEVER actually play any music. This defeats the entire purpose of a music app.",
  },
  {
    icon: <FiLock />,
    title: "Premium Users Only",
    body: "Only Spotify Premium subscribers can access full playback controls and streaming features. Free tier users are locked out of the core functionality.",
  },
];

export default function SpotifyLimitationsHero() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-300 bg-black/70 backdrop-blur-sm flex items-center justify-center px-3 sm:px-4">
      <div className="relative w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-white/10 bg-[#121212] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white transition"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-4 sm:px-8 pt-6 sm:pt-10 pb-4 sm:pb-6 text-center">
          <div className="mx-auto mb-3 sm:mb-4 flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-full bg-[#1DB954]/15 text-[#1DB954]">
            <FiAlertCircle className="w-6 sm:w-7 h-6 sm:h-7" />
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-white">
            Sptify free api limitations
          </h1>

          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            The free Spotify API is practically useless for a real application.
            With severe limitations on data fetching, manual user registration
            capped at 5 users, and non-premium users unable to play any tracks,
            this project is unsuitable for production or public release.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 px-4 sm:px-8 pb-6 sm:pb-8">
          {cards.map((card, i) => (
            <div
              key={i}
              className="rounded-xl sm:rounded-2xl border border-white/5 bg-white/3 p-4 sm:p-5 hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <div className="flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-[#1DB954]/10 text-[#1DB954] shrink-0">
                  {card.icon}
                </div>

                <h2 className="text-white font-semibold text-sm sm:text-lg">
                  {card.title}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                {card.body}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-neutral-500 text-center sm:text-left">
            This is a demonstration project only.
          </p>

          <button
            onClick={() => setVisible(false)}
            className="rounded-lg sm:rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base transition whitespace-nowrap"
          >
            Continue to App
          </button>
        </div>
      </div>
    </div>
  );
}
