"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdHomeFilled } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    router.push("/search");
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("spotify-search", { detail: query }),
      );
    }, 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(searchQuery);
    }
  };

  return (
    <>
      <div className="hidden md:flex flex-row items-center w-full">
        <div className="flex flex-1 justify-center space-x-2">
          <Link
            href="/"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-950 bg-white mt-1.5"
          >
            <MdHomeFilled className="h-6 w-6 text-black" />
          </Link>

          <div className="relative">
            <FaSearch className="top-3 w-4 h-4 absolute left-3 fill-stone-400" />
            <input
              placeholder="What do you want to play?"
              className="bg-stone-800 rounded-full text-white w-72 h-10 pl-9 pr-4 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-white/20"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>

        <div className="mr-4 flex h-8 items-center rounded-xl border px-3 text-green-400 hover:bg-green-500 hover:text-white">
          <Link href="/login">Login</Link>
        </div>
      </div>

      {/** --------------------------------Mobile layput ---------------------------------------------------------- */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-[#121212]/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.35)]">
          <Link
            href="/"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <MdHomeFilled className="h-6 w-6 text-black" />
          </Link>

          <Link
            href="/Search"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-stone-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <FaSearch className="h-4 w-4" />
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-green-500/40 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500 hover:text-white"
          >
            Login
          </Link>
        </div>
      </div>
    </>
  );
}
