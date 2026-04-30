"use client";

import { useState } from "react";
import { TiThMenu } from "react-icons/ti";
import Playlist from "./playlist";
import Artist from "./artist";
import Album from "./albums";
export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState<"playlist" | "artist" | "album">(
    "artist",
  );

  const navItems = [
    { key: "artist", label: "artist" },
    { key: "playlist", label: "playlist" },
    { key: "album", label: "album" },
  ] as const;

  const renderActiveView = () => {
    switch (activeView) {
      case "artist":
        return <Playlist />;
      case "album":
        return <Album />;
      default:
        return <Artist />;
    }
  };

  return (
    <div>
      <div className="md:hidden top-4 left-4 z-50">
        <button onClick={() => setOpen(!open)}>
          <TiThMenu size={28} />
        </button>
      </div>
      <aside
        className={`bg-gray-900 w-60 h-full rounded-r-2xl transform transition-transform duration-300
    ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex gap-2 px-4 pt-5">
          {navItems.map((item) => {
            const isActive = activeView === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveView(item.key)}
                className={`rounded-2xl px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  isActive
                    ? "bg-green-500 text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="pt-4">{renderActiveView()}</div>
      </aside>
    </div>
  );
}
