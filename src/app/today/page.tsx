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

  // The most recently logged batch, so the form can offer "same as last time".
  // Two small queries rather than one clever one: find the newest batch id, then
  // read that batch's orders with their sharers.
  const { data: lastBatch } = await supabase
    .from("orders")
    .select("batch_id")
    .not("batch_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1);
  const lastBatchId = (lastBatch?.[0]?.batch_id as string | undefined) ?? null;

  let lastGroups: TodayGroup[] = [];
  if (lastBatchId) {
    const { data: lastOrders } = await supabase
      .from("orders")
      .select("mess_id, tiffin_type, order_shares(user_id)")
      .eq("batch_id", lastBatchId)
      .order("created_at", { ascending: true });
    lastGroups = groupsFromOrders((lastOrders ?? []) as LoggedOrder[]);
  }

  return (
    <>
      <h1>Today</h1>
      <TodayForm
        messes={messes}
        members={members}
        loggedMessesByDate={loggedMessesByDate}
        lastGroups={lastGroups}
      />
    </>
  );
}
