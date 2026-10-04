import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prettyDate } from "@/lib/format";
import { setActive, setRole } from "./actions";

export default async function MembersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("users").select("role, is_active").eq("id", user.id).single();
  if (!me || me.role !== "admin" || !me.is_active) redirect("/");

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
      <p className="subtitle">Approve new sign-ins and manage roles.</p>

      <h2>Pending approval ({pending.length})</h2>
      {pending.length === 0 ? (
        <div className="card">
          <p className="muted">No one is waiting to be approved.</p>
        </div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Requested</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name ?? "—"}</td>
                  <td>{u.email}</td>
                  <td className="muted">{prettyDate(u.created_at.slice(0, 10))}</td>
                  <td className="num">
                    <form action={setActive}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="is_active" value="true" />
                      <button className="btn small primary" type="submit">
                        Approve
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Active members ({active.length})</h2>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {active.map((u) => {
              const isMe = u.id === user.id;
              return (
                <tr key={u.id}>
                  <td>
                    {u.full_name ?? "—"}
                    {isMe ? " (you)" : ""}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="pill">{u.role}</span>
                  </td>
                  <td className="num">
                    <form action={setRole}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="role" value={u.role === "admin" ? "member" : "admin"} />
                      <button className="btn small" type="submit" disabled={isMe}>
                        {u.role === "admin" ? "Make member" : "Make admin"}
                      </button>
                    </form>
                  </td>
                  <td className="num">
                    <form action={setActive}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="is_active" value="false" />
                      <button className="btn small danger" type="submit" disabled={isMe}>
                        Deactivate
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
