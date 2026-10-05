import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMesses, getMembers } from "@/lib/data";
import { todayISO } from "@/lib/format";
import TodayForm from "./TodayForm";

export default async function TodayPage() {
  const [messes, members] = await Promise.all([getMesses(true), getMembers()]);

  if (messes.length === 0) {
    return (
      <div className="card">
        <p>
          No messes yet. <Link href="/messes">Add a mess first.</Link>
        </p>
      </div>
    );
  }

  // Which messes already have orders logged today? Used to warn about double-logging.
  const supabase = createClient();
  const { data } = await supabase.from("orders").select("mess_id").eq("order_date", todayISO());
  const todayMesses = Array.from(new Set((data ?? []).map((o) => o.mess_id as string)));

  return (
    <>
      <h1>Today</h1>
      <TodayForm messes={messes} members={members} todayMesses={todayMesses} />
    </>
  );
}
