"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  async function signIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="card center">
      <h1>TiffinSplit</h1>
      <p className="subtitle">Sign in to log and split our mess tiffin bills.</p>
      <button className="btn primary" onClick={signIn}>
        Sign in with Google
      </button>
    </div>
  );
}
