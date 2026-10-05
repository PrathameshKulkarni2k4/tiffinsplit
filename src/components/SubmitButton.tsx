"use client";

import { useFormStatus } from "react-dom";

/**
 * A submit button that disables itself while the form is in flight, so a
 * double-tap can never log the same day twice.
 */
export default function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className = "btn primary big",
  disabled = false,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending || disabled}>
      {pending ? pendingLabel : children}
    </button>
  );
}
