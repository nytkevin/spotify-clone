import Image from "next/image";

type CardProps = {
  label?: string;
  desc?: string;
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  shape: "circle" | "square";
  layout?: "row" | "col";
  className?: string;
  imageClassName?: string;
};

export default function Card({
  label,
  desc,
  src,
  alt,
  width,
  height,
  shape,
  layout = "col",
  className,
  imageClassName,
}: CardProps) {
  const imageWidth = width ?? 300;
  const imageHeight = height ?? 300;
  const shapeStyle = shape === "circle" ? "rounded-full" : "rounded-lg";
  const imageAlt = alt?.trim() || label?.trim() || "Spotify item image";
  const layoutStyle =
    layout === "row"
      ? "flex-row items-center text-left"
      : "flex-col items-center text-center";

  return (
    <div
      className={`flex ${layoutStyle} gap-2 p-4 bg-[#121212] cursor-pointer transition-colors duration-200 ease-in-out hover:bg-neutral-700 ${className ?? ""}`}
    >
      <Image
        src={src}
        alt={imageAlt}
        width={imageWidth}
        height={imageHeight}
        className={`${shapeStyle} object-cover ${imageClassName ?? ""}`}
      />

      <div className={`${layout === "row" ? "min-w-0 flex-1" : "w-full"}`}>
        {label && (
          <h2
            className={`truncate text-sm font-semibold text-white ${layout === "row" ? "text-left" : "w-full text-center"}`}
            title={label}
          >
            {label}
          </h2>
        )}
        {desc && (
          <p
            className={`text-gray-400 text-xs ${layout === "row" ? "text-left" : ""}`}
          >
            {desc}
          </p>
        )}
      </div>
    </div>
  );
}
