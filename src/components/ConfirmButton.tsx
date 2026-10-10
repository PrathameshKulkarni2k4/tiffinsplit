"use client";

import { useEffect, useRef, useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A destructive submit button that needs a second tap.
 *
 * The first tap arms it and relabels; the second submits. It disarms itself
 * after a few seconds so a stray tap can't leave it primed. Deliberately no
 * dialog dependency — this is the smallest thing that stops a one-tap delete.
 */
export default function ConfirmButton({
  children,
  confirmLabel = "Tap again",
  className,
  ...props
}: ButtonProps & { confirmLabel?: string }) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return (
    <Button
      {...props}
      type={armed ? "submit" : "button"}
      aria-live="polite"
      className={cn(
        className,
        // Armed state has to be unmistakable. It was a tint before, which on a
        // small button read as "hovered" rather than "will delete on the next
        // tap" - and a stray tap on a phone is exactly what this guards.
        armed && "border-destructive bg-destructive text-destructive-foreground ring-2 ring-destructive/30",
      )}
      onClick={(e) => {
        if (armed) return; // second tap: let the submit through
        e.preventDefault();
        setArmed(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setArmed(false), 4000);
      }}
    >
      {armed ? confirmLabel : children}
    </Button>
  );
}
