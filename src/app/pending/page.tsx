import { createClient } from "@/lib/supabase/server";

export default async function PendingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = user?.email ?? "there";
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    name = profile?.full_name || user.email || "there";
  }

  return (
    <div className="card center">
      <h1>Almost there</h1>
      <p>
        Hi {name}, your account is waiting for approval.
      </p>
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
