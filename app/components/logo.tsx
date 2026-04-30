import Image from "next/image";

type LogoProps = {
  width: number;
  height: number;
};

export default function Logo({ width = 40, height = 40 }: LogoProps) {
  return (
    <Image
      alt="spotify logo"
      src="/spotify_Logo.png"
      width={width}
      height={height}
    />
  );
}
