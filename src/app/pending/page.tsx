import { getProfile, getSessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Avatar from "@/components/Avatar";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = { title: "Waiting for approval" };

/**
 * The screen a new member sits on until an admin lets them in.
 *
 * It used to be a cold card that mostly explained the problem. But this is the
 * first thing someone sees after signing in, and the only thing they can do
 * here is wait - so it should say who they are, what happens next, and who to
 * nudge, in that order.
 */
export default async function PendingPage() {
  const user = await getSessionUser();
  const profile = await getProfile();
  const name = profile?.full_name || user?.email || "there";

  return (
    <div className="mx-auto flex min-h-[78vh] max-w-[400px] flex-col justify-center px-1">
      <div className="mb-6 flex items-start justify-between">
        <Avatar name={name} size="lg" />
        <ThemeToggle />
      </div>

      <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-tight">
        You&apos;re almost in
      </h1>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
        Hi {name} — an admin needs to approve your account before the bills open up.
      </p>

      <ol className="mt-7 space-y-3">
        {[
          "Your account is created and waiting.",
          "An admin approves you from the Members page.",
          "Refresh here, and the mess opens up.",
        ].map((step, i) => (
          <li key={step} className="flex items-start gap-3 text-sm leading-relaxed">
            <span
              className={
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.68rem] font-bold " +
                (i === 0 ? "bg-good/15 text-good" : "bg-muted text-muted-foreground")
              }
            >
              {i + 1}
            </span>
            <span className={i === 0 ? "text-foreground" : "text-muted-foreground"}>{step}</span>
          </li>
        ))}
      </ol>

      {/* A full reload rather than a client-side navigation, because the point
          is to ask the server again whether an admin has approved this yet. */}
      <Button asChild size="lg" className="mt-8 w-full">
        <a href="/pending">Check again</a>
      </Button>

      <form action="/auth/signout" method="post" className="mt-3 text-center">
        <button
          type="submit"
          className="cursor-pointer border-0 bg-transparent p-0 text-[0.85rem] font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
