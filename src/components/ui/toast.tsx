"use client";

import * as React from "react";
import { AlertTriangle, Check, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

type Variant = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  variant: Variant;
  /** Optional control rendered beside the message - an Undo, usually. */
  action?: React.ReactNode;
};

type Push = (
  message: string,
  opts?: { variant?: Variant; action?: React.ReactNode },
) => void;

const ToastContext = React.createContext<ToastApi>({
  push: () => {},
  clear: () => {},
});

type ToastApi = { push: Push; clear: () => void };

/** Read the toast API from anywhere below the provider. */
export function useToast() {
  return React.useContext(ToastContext);
}

const ICON = { success: Check, error: AlertTriangle, info: Info } as const;

/**
 * How long a toast stays. Long enough to read a short sentence, short enough
 * that it is gone before it becomes furniture. Errors are the exception - they
 * get dismissed by hand, because a message about something that failed should
 * not disappear on its own.
 */
const LIFETIME = 4000;

/** A toast with an action gets longer, because the reader may want to use it. */
const ACTION_LIFETIME = 12000;

/**
 * Toasts.
 *
 * Hand-rolled rather than pulled in, because the whole thing is one provider
 * and one list, and a dependency would be larger than the code it replaces.
 *
 * The container is `aria-live="polite"` and permanently mounted, so a screen
 * reader announces each message as it arrives. Toasts are additive only - they
 * never carry information that is not also on the page - so nothing is lost if
 * someone misses one.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = React.useCallback<Push>((message, opts = {}) => {
    const { variant = "success", action } = opts;
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, variant, action }]);
    // A toast carrying a control lives longer, but not forever - an Undo that
    // outlives its own action is worse than one that expires.
    setTimeout(() => dismiss(id), action ? ACTION_LIFETIME : LIFETIME);
  }, [dismiss]);

  const clear = React.useCallback(() => setToasts([]), []);

  const api = React.useMemo(() => ({ push, clear }), [push, clear]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4 pb-[calc(84px+env(safe-area-inset-bottom,0px))] md:pb-6"
      >
        {toasts.map((t) => (
          <ToastRow key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastRow({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const Icon = ICON[toast.variant];

  return (
    <div
      role="status"
      className={cn(
        "toast-in pointer-events-auto flex w-full max-w-[420px] items-center gap-3 rounded-xl border px-4 py-3 shadow-lift",
        toast.variant === "error"
          ? "border-destructive/30 bg-card text-foreground"
          : "border-border bg-card text-foreground",
      )}
    >
      <span
        className={cn(
          "grid h-6 w-6 shrink-0 place-items-center rounded-full",
          toast.variant === "success" && "bg-good/15 text-good",
          toast.variant === "error" && "bg-destructive/15 text-destructive",
          toast.variant === "info" && "bg-accent text-accent-foreground",
        )}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <p className="min-w-0 flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      {toast.action}
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="-mr-1 grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
