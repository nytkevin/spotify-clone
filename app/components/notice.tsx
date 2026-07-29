"use client";

import { useEffect, useState } from "react";
import {
  FiMusic,
  FiUsers,
  FiLock,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

export default function Notice() {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("spotify-resrtictions-notice");

    if (!hasSeen) {
      setShowNotice(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("spotify-resrtictions-notice", "true");
    setShowNotice(false);
  };

  if (!showNotice) return null;

  return (
    <section
      className={`fixed top-40 left-1/2 z-9999 w-[min(900px,calc(100vw-2rem))] -translate-x-1/2 transition-transform duration-500 ease-out ${
        showNotice ? "translate-y-0" : "-translate-y-[150%]"
      }`}
    >
      <div className="max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-gray-900 p-8 shadow-[0_18px_40px_rgba(0,0,0,0.5)] md:p-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-400">
            <FiAlertCircle size={20} />
          </span>
          <span className="font-mono text-xs tracking-[0.18em] text-green-400">
            SPOTIFY PROJECT NOTICE
          </span>
        </div>

        <h2 className="mb-4 font-serif text-3xl leading-tight text-white md:text-4xl">
          This website uses the Spotify API with limitations.
        </h2>

        <p className="mb-8 font-sans text-base leading-relaxed text-gray-400">
          This Spotify clone was created as a frontend portfolio project to
          demonstrate UI development, API integration, and authentication flows.
          Since it relies on Spotify's free Web API, a few real limitations
          apply to how it can be used.
        </p>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/3 p-5 transition duration-300 hover:border-green-500/40 hover:bg-white/5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/15 text-green-400">
              <FiMusic size={18} />
            </div>
            <h3 className="mb-1.5 font-sans text-sm font-semibold text-white">
              No Full Playback
            </h3>
            <p className="font-sans text-sm leading-relaxed text-gray-400">
              Free Spotify accounts cannot stream full songs through this app —
              Spotify restricts full playback to Premium accounts via the Web
              API.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/3 p-5 transition duration-300 hover:border-green-500/40 hover:bg-white/5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/15 text-green-400">
              <FiLock size={18} />
            </div>
            <h3 className="mb-1.5 font-sans text-sm font-semibold text-white">
              Limited Data Access
            </h3>
            <p className="font-sans text-sm leading-relaxed text-gray-400">
              Some features, such as full artist experiences and extended
              catalog data, are restricted by Spotify's developer terms.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/3 p-5 transition duration-300 hover:border-green-500/40 hover:bg-white/5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/15 text-green-400">
              <FiUsers size={18} />
            </div>
            <h3 className="mb-1.5 font-sans text-sm font-semibold text-white">
              Manual User Approval
            </h3>
            <p className="font-sans text-sm leading-relaxed text-gray-400">
              Testers must have their Spotify email and name manually added to
              my developer dashboard before they can log in.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/3 p-5 transition duration-300 hover:border-green-500/40 hover:bg-white/5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/15 text-green-400">
              <FiCheckCircle size={18} />
            </div>
            <h3 className="mb-1.5 font-sans text-sm font-semibold text-white">
              5 Test Users Max
            </h3>
            <p className="font-sans text-sm leading-relaxed text-gray-400">
              Spotify's development mode currently caps this application at 5
              approved test accounts.
            </p>
          </div>
        </div>

        <button
          className="w-full rounded-full bg-green-500 px-7 py-3.5 font-sans font-semibold text-gray-950 transition duration-300 hover:-translate-y-0.5 hover:bg-green-400 md:w-auto cursor-pointer"
          onClick={handleClose}
        >
          I Understand
        </button>
      </div>
    </section>
  );
}
