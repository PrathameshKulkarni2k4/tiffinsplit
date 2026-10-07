"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A submit button that disables itself while the form is in flight, so a
 * double-tap can never log the same day twice.
 */
export default function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className,
  disabled = false,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="lg"
      className={cn("w-full", className)}
      disabled={pending || disabled}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
