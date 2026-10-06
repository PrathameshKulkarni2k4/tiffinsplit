"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  async function signIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <Card className="mx-auto mt-20 max-w-[420px] text-center">
      <CardHeader>
        <h1 className="text-2xl font-semibold leading-none tracking-tight">TiffinSplit</h1>
        <CardDescription>Sign in to log and split our mess tiffin bills.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button size="lg" className="w-full" onClick={signIn}>
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  );
}
