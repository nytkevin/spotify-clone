"use client";
import Link from "next/link";
import Logo from "./logo";
import Navbar from "./navbar";

export default function Header() {
  return (
    <div className="flex flex-row h-14 py-4 bg-[#121212]  rounded-b-2xl">
      <div className="px-2">
        <Link href="/" className="hidden md:block">
          <Logo width={30} height={30} />
        </Link>
      </div>
      <div className="flex items-center justify-center w-full">
        <Navbar />
      </div>
    </div>
  );
}
