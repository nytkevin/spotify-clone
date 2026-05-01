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
  );
}
