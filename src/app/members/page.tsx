import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { prettyDate } from "@/lib/format";
import { setActive, setRole } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Avatar from "@/components/Avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Members" };

export default async function MembersPage() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin" || !profile.is_active) redirect("/");

  const supabase = createClient();
  const { data: users } = await supabase
    .from("users")
    .select("id, email, full_name, role, is_active, created_at")
    .order("created_at", { ascending: true });

  const list = users ?? [];
  const pending = list.filter((u) => !u.is_active);
  const active = list.filter((u) => u.is_active);

  return (
    <>
      <h1>Members</h1>
      <p className="mb-5 text-muted-foreground">Approve new sign-ins and manage roles.</p>

      <h2>Pending approval ({pending.length})</h2>
      {pending.length === 0 ? (
        <Card className="px-5 py-[18px]">
          <p className="m-0 text-sm text-muted-foreground">No one is waiting to be approved.</p>
        </Card>
      ) : (
        <>
          {/* Desktop: table */}
          <Card className="hidden overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <span className="inline-flex items-center gap-2.5">
                        <Avatar name={u.full_name ?? "?"} size="sm" />
                        {u.full_name ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {prettyDate(u.created_at.slice(0, 10))}
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={setActive}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="is_active" value="true" />
                        <Button type="submit" size="sm">
                          Approve
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile: cards — a four-column table can't fit a phone */}
          <div className="md:hidden">
            {pending.map((u) => (
              <Card key={u.id} className="mb-[18px] px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2.5 font-semibold">
                    <Avatar name={u.full_name ?? "?"} size="sm" />
                    {u.full_name ?? "—"}
                  </span>
                  <Badge variant="warn">pending</Badge>
                </div>
                <div className="mt-1 break-all text-sm text-muted-foreground">{u.email}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Requested {prettyDate(u.created_at.slice(0, 10))}
                </div>
                <form action={setActive} className="mt-3">
                  <input type="hidden" name="id" value={u.id} />
                  <input type="hidden" name="is_active" value="true" />
                  <Button type="submit" className="w-full">
                    Approve
                  </Button>
                </form>
              </Card>
            ))}
          </div>
        </>
      )}

      <h2>Active members ({active.length})</h2>

      {/* Desktop: table */}
      <Card className="hidden overflow-hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead />
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {active.map((u) => {
              const isMe = u.id === profile.id;
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <span className="inline-flex items-center gap-2.5">
                      <Avatar name={u.full_name ?? "?"} size="sm" />
                      <span>
                        {u.full_name ?? "—"}
                        {isMe ? " (you)" : ""}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{u.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={setRole}>
                      <input type="hidden" name="id" value={u.id} />
                      <input
                        type="hidden"
                        name="role"
                        value={u.role === "admin" ? "member" : "admin"}
                      />
                      <Button type="submit" variant="outline" size="sm" disabled={isMe}>
                        {u.role === "admin" ? "Make member" : "Make admin"}
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={setActive}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="is_active" value="false" />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        disabled={isMe}
                        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        Deactivate
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile: cards */}
      <div className="md:hidden">
        {active.map((u) => {
          const isMe = u.id === profile.id;
          return (
            <Card key={u.id} className="mb-[18px] px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-semibold">
                  {u.full_name ?? "—"}
                  {isMe ? " (you)" : ""}
                </span>
                <Badge variant="secondary">{u.role}</Badge>
              </div>
              <div className="mt-1 break-all text-sm text-muted-foreground">{u.email}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={setRole} className="flex-1">
                  <input type="hidden" name="id" value={u.id} />
                  <input
                    type="hidden"
                    name="role"
                    value={u.role === "admin" ? "member" : "admin"}
                  />
                  <Button type="submit" variant="outline" className="w-full" disabled={isMe}>
                    {u.role === "admin" ? "Make member" : "Make admin"}
                  </Button>
                </form>
                <form action={setActive} className="flex-1">
                  <input type="hidden" name="id" value={u.id} />
                  <input type="hidden" name="is_active" value="false" />
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isMe}
                    className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    Deactivate
                  </Button>
                </form>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
