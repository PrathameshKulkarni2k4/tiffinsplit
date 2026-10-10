"use client";

import { Moon, Sun } from "lucide-react";

const KEY = "tiffinsplit-theme";

/**
 * Light/dark switch.
 *
 * Which icon shows is decided in CSS (`dark:hidden` / `dark:block`) rather
 * than in React state. That matters: reading the theme into state would mean
 * the server renders one icon and the client another, and React would complain
 * about a hydration mismatch on every load. Letting CSS read the class that is
 * already on <html> keeps this component stateless and immune to that.
 *
 * The class itself is applied before first paint by the inline script in the
 * root layout, so there is no flash of the wrong theme.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      // Private mode, or storage disabled. The theme still applies for this
      // visit; it just will not be remembered. Not worth interrupting anyone.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      // The label is generic on purpose: it names the control, not the state,
      // so it does not have to be kept in sync with a value React cannot see.
      aria-label="Switch between light and dark"
      title="Switch between light and dark"
      className={`grid h-9 w-9 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground ${className}`}
    >
      <Sun className="hidden h-[18px] w-[18px] dark:block" aria-hidden="true" />
      <Moon className="h-[18px] w-[18px] dark:hidden" aria-hidden="true" />
    </button>
  );
}
