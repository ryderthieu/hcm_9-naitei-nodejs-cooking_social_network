import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

interface HeartIconProps {
  filled?: boolean;
  className?: string;
  size?: number;
}

export default function HeartIcon({ filled = false, className = "" }: HeartIconProps) {
  return filled ? (
    <HeartSolid className={`text-yellow-500 ${className}`} />
  ) : (
    <HeartOutline className={`text-yellow-500 ${className}`} />
  );
}
