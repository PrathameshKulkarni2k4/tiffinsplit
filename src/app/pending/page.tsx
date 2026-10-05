import { getProfile, getSessionUser } from "@/lib/auth";

export default async function PendingPage() {
  const user = await getSessionUser();
  const profile = await getProfile();
  const name = profile?.full_name || user?.email || "there";

  return (
    <div className="card center">
      <h1>Almost there</h1>
      <p>Hi {name}, your account is waiting for approval.</p>
      <p className="muted">
        An admin needs to activate you before you can see the bills. Ask them to approve you from
        the Members page, then refresh this page.
      </p>
      <form action="/auth/signout" method="post">
        <button className="btn" type="submit">
          Sign out
        </button>
      </form>
    </div>
  );
}
