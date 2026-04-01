import Link from "next/link";
import { MdHomeFilled } from "react-icons/md";
import { FaSearch } from "react-icons/fa";

export default function Navbar() {
  return (
    <div className="flex flex-row space-x-3">
      <Link
        href="/"
        className="border rounded-full p-1 bg-white border-neutral-950"
      >
        <MdHomeFilled className="fill-black w-7 h-7" />
      </Link>
      <div className="flex flec-row relative">
        <FaSearch className="top-2 w-5 h-5 absolute left-2" />
        <div>
          <input
            placeholder="What do you want to play?"
            className="bg-stone-800 rounded-2xl border-stone-800 hover:border-white text-white w-80 h-10 pl-8 placeholder:leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
