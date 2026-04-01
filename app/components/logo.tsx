import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/">
      <Image
        alt="spotify logo"
        src="/spotify_Logo.png"
        width={30}
        height={30}
      />
    </Link>
  );
}
