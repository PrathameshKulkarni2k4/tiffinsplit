import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMesses, getMembers } from "@/lib/data";
import { todayISO } from "@/lib/format";
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
