import { cn } from "@/lib/utils";

/**
 * A person's initials on a tinted disc.
 *
 * Nobody in this app has a photo, so every list of people was a column of
 * undifferentiated text. Initials give each person a shape you can find again
 * by eye, which is most of what an avatar does in a small group where you
 * already know everyone's name.
 *
 * The tint is derived from the name itself, so it is stable: the same person
 * gets the same colour on every screen and after every reload, without storing
 * anything. Deliberately desaturated - these sit beside money, and a row of
 * vivid discs would pull attention away from the figures.
 */
const TINTS = [
  "bg-[#e7f0ee] text-[#0f766e] dark:bg-[#12332d] dark:text-[#7fd8c6]",
  "bg-[#f2ece1] text-[#8a6d1f] dark:bg-[#332c12] dark:text-[#e2c56a]",
  "bg-[#ece8f2] text-[#5b4a86] dark:bg-[#2a2436] dark:text-[#b9a8e0]",
  "bg-[#f2e8e8] text-[#8a4a4a] dark:bg-[#362424] dark:text-[#e0a8a8]",
  "bg-[#e6eef2] text-[#3f6478] dark:bg-[#1e2c33] dark:text-[#8fc0d6]",
  "bg-[#eaf0e6] text-[#4d6b3f] dark:bg-[#242e1e] dark:text-[#a3c48f]",
];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function tintOf(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}

const SIZES = {
  sm: "h-6 w-6 text-[0.62rem]",
  md: "h-8 w-8 text-[0.72rem]",
  lg: "h-10 w-10 text-[0.85rem]",
} as const;

export default function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      // Decorative: the name is always written beside it, so announcing the
      // initials too would just be read out twice.
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-bold tracking-tight",
        SIZES[size],
        tintOf(name),
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
