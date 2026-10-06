import { getProfile, getSessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export default async function PendingPage() {
  const user = await getSessionUser();
  const profile = await getProfile();
  const name = profile?.full_name || user?.email || "there";

  return (
    <Card className="mx-auto mt-20 max-w-[420px] text-center">
      <CardHeader>
        <h1 className="text-2xl font-semibold leading-none tracking-tight">Almost there</h1>
        <CardDescription>Hi {name}, your account is waiting for approval.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          An admin needs to activate you before you can see the bills. Ask them to approve you from
          the Members page, then refresh this page.
        </p>
        <form action="/auth/signout" method="post">
          <Button variant="outline" type="submit">
            Sign out
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
