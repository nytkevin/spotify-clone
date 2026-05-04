"use client";

import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import { MdHomeFilled } from "react-icons/md";
import { MdLibraryBooks } from "react-icons/md";
import { useState } from "react";

export default function MobileNavbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    window.dispatchEvent(
      new CustomEvent("toggle-sidebar", { detail: !sidebarOpen }),
    );
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-[#121212]/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.35)]">
        <Link
          href="/"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white"
        >
          <MdHomeFilled className="h-6 w-6 text-black" />
        </Link>

        <Link
          href="/search"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-stone-300 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <FaSearch className="h-4 w-4" />
        </Link>

        <button
          onClick={toggleSidebar}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-stone-300 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <MdLibraryBooks className="h-5 w-5" />
        </button>

        <Link
          href="/login"
          className="rounded-full border border-green-500/40 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500 hover:text-white"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
