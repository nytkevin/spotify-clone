"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function PageButtons() {
  const pathname = usePathname();
  const router = useRouter();

  const hiddenRoute = "/explore";

  if (hiddenRoute.startsWith(pathname)) {
    return null;
  }

  const navItems = [
    { href: "/all", label: "All" },
    { href: "/artist", label: "Artist" },
    { href: "/playlist", label: "Playlist" },
    { href: "/album", label: "Album" },
  ];

  return (
    <div>
      <div className="flex gap-2 px-4 py-3 items-center bg-[#121212]">
        {/* Back and Forward Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-full bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
            title="Go back"
          >
            <FaChevronLeft className="text-sm" />
          </button>
          <button
            onClick={() => router.forward()}
            className="p-2.5 rounded-full bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
            title="Go forward"
          >
            <FaChevronRight className="text-sm" />
          </button>
        </div>

        {/* Center Navigation Items */}
        <div className="flex gap-2 justify-center flex-1">
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
    </div>
  );
}
