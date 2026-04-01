import Logo from "./logo";
import Navbar from "./navbar";

export default function Header() {
  return (
    <div className="flex flex-row h-14 py-4 bg-blue-700  rounded-b-2xl">
      <div className="px-2">
        <Logo />
      </div>
      <div className="flex items-center justify-center w-full">
        <Navbar />
      </div>
    </div>
  );
}
