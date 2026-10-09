import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMesses, getMembers } from "@/lib/data";
import { groupsFromOrders, type LoggedOrder, type TodayGroup } from "@/lib/split";
import TodayForm from "./TodayForm";
import { Card } from "@/components/ui/card";

export default async function TodayPage() {
  const [messes, members] = await Promise.all([getMesses(true), getMembers()]);

  if (messes.length === 0) {
    return (
      <Card className="px-5 py-[18px]">
        <p className="m-0">
          No messes yet. <Link href="/messes" className="underline">Add a mess first.</Link>
        </p>
      </Card>
    );
  }

  // Which (date, mess) pairs already have orders? Used to warn about
  // double-logging for whatever date is being entered, not just today.
  // The Today form lets you pick any date, and the server-side guard refuses
  // for any date, so the warning has to match - otherwise a past date with
  // existing orders is refused with no way to override it.
  const supabase = createClient();
  const { data } = await supabase.from("orders").select("order_date, mess_id");
  const loggedMessesByDate: Record<string, string[]> = {};
  for (const o of data ?? []) {
    const d = o.order_date as string;
    const m = o.mess_id as string;
    if (!loggedMessesByDate[d]) loggedMessesByDate[d] = [];
    loggedMessesByDate[d].push(m);
  }

  // Who usually eats from each mess, and how that day split - taken from that
  // mess's most recent batch, so the form opens ready to confirm rather than
  // needing the crowd re-picked and the half re-assigned every day.
  //
  // groupsFromOrders rebuilds the whole group, not just the people: it infers
  // the split mode and works out who took the half alone. Carrying only the
  // names across was the bug - it lost all-half, and lost whoever had the half.
  const { data: recent } = await supabase
    .from("orders")
    .select("mess_id, batch_id, tiffin_type, created_at, order_shares(user_id)")
    .order("created_at", { ascending: false })
    .limit(300);

  const newestBatchForMess: Record<string, string> = {};
  const ordersByMess: Record<string, LoggedOrder[]> = {};
  for (const o of recent ?? []) {
    const m = o.mess_id as string;
    const b = (o.batch_id as string | null) ?? "";
    if (!(m in newestBatchForMess)) {
      newestBatchForMess[m] = b;
      ordersByMess[m] = [];
    }
    if (newestBatchForMess[m] !== b) continue; // an older batch for this mess
    ordersByMess[m].push({
      mess_id: m,
      tiffin_type: o.tiffin_type as "full" | "half",
      order_shares: (o.order_shares ?? []) as { user_id: string }[],
    });
  }

  const usualByMess: Record<string, TodayGroup> = {};
  for (const [m, orders] of Object.entries(ordersByMess)) {
    const rebuilt = groupsFromOrders(orders)[0];
    if (rebuilt) usualByMess[m] = rebuilt;
  }

  return (
    <>
      <h1>Today</h1>
      <TodayForm
        messes={messes}
        members={members}
        loggedMessesByDate={loggedMessesByDate}
        usualByMess={usualByMess}
      />
    </>
  );
}
