import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names, letting later classes win over earlier ones.
 * Standard shadcn helper — it is what lets a component's own classes be
 * overridden from the call site.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
