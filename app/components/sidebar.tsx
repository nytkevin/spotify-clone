"use client";

import Link from "next/link";
import { useState } from "react";
import { TiThMenu } from "react-icons/ti";
import Playlist from "./playlist";
export default function Sidebar() {
  const [open, setOpen] = useState(false);

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
        <div className=" space-x-2 pt-5">
          <Link href="/playlist">
            <button className="bg-blue-400 rounded-2xl w-16">playlist</button>
          </Link>
          <Link href="/artist">
            <button className="bg-blue-400 rounded-2xl w-16">artist</button>
          </Link>
          <Link href="/album">
            <button className="bg-blue-400 rounded-2xl w-16">albums</button>
          </Link>
        </div>

        <Playlist />
      </aside>
    </div>
  );
}
