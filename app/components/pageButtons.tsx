"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PageButtons() {
  const pathname = usePathname();

  const navItems = [
    { href: "/all", label: "All" },
    { href: "/artist", label: "Artist" },
    { href: "/playlist", label: "Playlist" },
    { href: "/album", label: "Album" },
  ];

  return (
    <div>
      <div className="flex gap-2 px-4 pt-5 justify-center ">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                isActive
                  ? "bg-green-500 text-black"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
