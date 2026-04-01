"use client";

import { useState } from "react";
import { TiThMenu } from "react-icons/ti";
export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setOpen(!open)}>
          <TiThMenu size={28} />
        </button>
      </div>
      <aside
        className={`fixed top-0 left-0 h-screen bg-green-500 w-60 rounded-r-2xl transform transition-transform duration-300
    ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className=" space-x-2">
          <button className="bg-blue-400 rounded-2xl w-16">playlist</button>
          <button className="bg-blue-400 rounded-2xl w-16">artist</button>
          <button className="bg-blue-400 rounded-2xl w-16">albums</button>
        </div>
      </aside>
    </>
  );
}
