import Image from "next/image";

export default function Logo({
  height = 26,
  className = "",
  priority = false,
}: {
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt="Frank"
      width={1254}
      height={1254}
      className={className}
      style={{ height, width: "auto" }}
      priority={priority}
    />
  );
}