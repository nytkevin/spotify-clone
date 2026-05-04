"use client";

import { useState, useEffect } from "react";
import Playlist from "./playlist";
import Artist from "./artist";
import Album from "./album";
export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState<"playlist" | "artist" | "album">(
    "artist",
  );

  useEffect(() => {
    const handleToggleSidebar = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      setOpen(customEvent.detail);
    };

    window.addEventListener("toggle-sidebar", handleToggleSidebar);
    return () =>
      window.removeEventListener("toggle-sidebar", handleToggleSidebar);
  }, []);

  const navItems = [
    { key: "artist", label: "artist" },
    { key: "playlist", label: "playlist" },
    { key: "album", label: "album" },
  ] as const;

  const renderActiveView = () => {
    switch (activeView) {
      case "artist":
        return <Artist />;
      case "album":
        return <Album />;
      default:
        return <Playlist />;
    }
  };

  return (
    <div className="h-full relative flex flex-col bg-[#121212] z-50">
      <div className="md:hidden top-4 left-4 z-50 absolute"></div>
      <aside
        className={`bg-[#121212] w-60 h-full flex flex-col rounded-r-2xl transform transition-transform duration-300 absolute md:relative
    ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex gap-2 px-4 pt-5 bg-[#121212]">
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

        <div className="pt-4 flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {renderActiveView()}
        </div>
      </aside>
    </div>
  );
}
